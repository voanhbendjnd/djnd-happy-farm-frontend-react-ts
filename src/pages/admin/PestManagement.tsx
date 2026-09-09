import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Table, Button, Input, Modal, Card, Form, message, Row, Col, Select, Tag,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {Pest, PestDTO, PestSymptom, PestSymptomOption} from '../../types';
import { pestService } from '../../services/pest.service.ts';
import { pestSymptomService } from '../../services/pest.symptom.service.ts';
import PestDiseaseSection from "../../pages/admin/PestDiseaseSection.tsx";
import ErrorBoundary from '../../components/ErrorBoundary.tsx';
const { TextArea } = Input;
const { Option } = Select;

const NAME_MAX_LENGTH = 150;
const DESCRIPTION_MAX_LENGTH = 1000;

// Form chỉ giữ mảng id triệu chứng, khớp UX với growthStageIds bên Fertilizer.
interface PestFormValues {
    name: string;
    description?: string;
    pestSymptomIds?: number[] ;
}

const PestManagement: React.FC = () => {
    const [pests, setPests] = useState<Pest[]>([]);
    const [symptomOptions, setSymptomOptions] = useState<PestSymptomOption[]>([]);
    const [symptomSearching, setSymptomSearching] = useState(false);
    const symptomFetchIdRef = useRef(0); // chống race-condition khi kết quả trả về không đúng thứ tự

    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<PestFormValues>();
    // Lưu record đang edit để set vào form sau khi Modal mở xong
    const pendingEditRecord = useRef<Pest | null>(null);

    const fetchPests = async (q = searchName, p = page, s = pageSize) => {
        setLoading(true);
        try {
            const res = await pestService.fetchAll(q || undefined, p, s);
            setPests(res.result ?? []);
            setTotal(res.meta?.total ?? 0);
        } catch {
            message.error('Cannot loading pest list');
        } finally {
            setLoading(false);
        }
    };

    // debounce thủ công, không phụ thuộc lodash
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const searchSymptoms = useCallback((keyword: string) => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(async () => {
            const fetchId = ++symptomFetchIdRef.current;
            setSymptomSearching(true);
            try {
                const res = await pestSymptomService.fetchLikeName(keyword || undefined, 1, 20);
                // chỉ set nếu đây vẫn là lần gọi mới nhất (tránh kết quả cũ ghi đè kết quả mới)
                if (fetchId === symptomFetchIdRef.current) {
                    setSymptomOptions((res.result ?? []) as PestSymptomOption[]);
                }
            } catch {
                if (fetchId === symptomFetchIdRef.current) setSymptomOptions([]);
            } finally {
                if (fetchId === symptomFetchIdRef.current) setSymptomSearching(false);
            }
        }, 500); // 400ms debounce
    }, []);

    // Load sẵn 1 ít gợi ý mặc định khi mở modal (không cần gõ mới thấy option)
    useEffect(() => {
        if (isModalOpen) {
            searchSymptoms('');
        }
    }, [isModalOpen, searchSymptoms]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);




    useEffect(() => {
        fetchPests(searchName, page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleSearch = () => {
        setPage(1);
        fetchPests(searchName, 1, pageSize);
    };

    const handleClearSearch = () => {
        setSearchName('');
        setPage(1);
        fetchPests('', 1, pageSize);
    };

    const openCreateModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record: Pest) => {
        pendingEditRecord.current = record;
        setEditingId(record.id);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleAfterOpenChange = (open: boolean) => {
        if (open && pendingEditRecord.current) {
            const record = pendingEditRecord.current;
            const existingSymptoms = record.pestSymptoms ?? [];

            // Gộp các symptom đã gán sẵn vào options để Select hiển thị đúng tên,
            // kể cả khi chưa search trùng khớp chúng.
            if (existingSymptoms.length > 0) {
                setSymptomOptions((prev) => {
                    const merged = [...prev];
                    existingSymptoms.forEach((s) => {
                        if (!merged.some((m) => m.id === s.id)) {
                            merged.push({ id: s.id, name: s.name });
                        }
                    });
                    return merged;
                });
            }

            form.setFieldsValue({
                name: record.name,
                description: record.description,
                pestSymptomIds: existingSymptoms.map((s) => s.id),
            });
        }
        if (!open) {
            pendingEditRecord.current = null;
        }
    };
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            const payload: PestDTO = {
                name: values.name.trim(),
                description: values.description?.trim() || undefined,
                pestSymptoms: (values.pestSymptomIds ?? []).map((id) => ({ id })),
            };

            if (editingId == null) {
                await pestService.create(payload);
                message.success(`Created pest "${payload.name}" success`);
            } else {
                await pestService.update({ ...payload, id: editingId });
                message.success(`Updated pest "${payload.name}" success`);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchPests();
        } catch (err: any) {
            if (err?.errorFields) return; // lỗi validate form, đã hiển thị inline
            message.error(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Save pest failure'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: ColumnsType<Pest> = [
        { title: 'Create new pest', dataIndex: 'name', key: 'name', render: (t: string) => <strong>{t}</strong> },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (t?: string) => t || '-',
        },
        {
            title: 'Pest symptoms',
            dataIndex: 'pestSymptoms',
            key: 'pestSymptoms',
            render: (symptoms: PestSymptom[] = []) => (
                <>
                    {symptoms.length === 0
                        ? '-'
                        : symptoms.map((s) => (
                            <Tag key={s.id} color="volcano">{s.name}</Tag>
                        ))}
                </>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Button icon={<EditOutlined />} onClick={() => openEditModal(record)} />
            ),
        },
    ];

    return (
        <div>
            <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12}>
                        <Input
                            placeholder="Find with pest name..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button
                            type="primary"
                            onClick={handleSearch}
                            style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                        >
                            Filter
                        </Button>
                        <Button onClick={handleClearSearch}>Reset</Button>
                    </Col>
                </Row>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                    onClick={openCreateModal}
                >
                    Add new
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={pests}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page, pageSize, total, showSizeChanger: true,
                    onChange: (p, s) => { setPage(p); setPageSize(s); },
                }}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}
            />

            <Modal
                title={editingId == null ? 'Add new' : 'Update'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingId(null);
                }}
                afterOpenChange={handleAfterOpenChange}
                onOk={handleSubmit}
                confirmLoading={submitLoading}
                okText={editingId == null ? 'Add new' : 'Update'}
                width={560}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
                    <Form.Item
                        name="name"
                        label="Pest name"
                        rules={[
                            { required: true, message: 'Please input pest name' },
                            {
                                validator: (_, value) => {
                                    if (value && !value.trim()) {
                                        return Promise.reject('Pest name cannot be empty');
                                    }
                                    return Promise.resolve();
                                },
                            },
                            { max: NAME_MAX_LENGTH, message: `Name limit at ${NAME_MAX_LENGTH} characters` },
                        ]}
                    >
                        <Input placeholder="EX: Bug, spider,..." maxLength={NAME_MAX_LENGTH} showCount />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { max: DESCRIPTION_MAX_LENGTH, message: `Description limit at ${DESCRIPTION_MAX_LENGTH} characters` },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Description chararistic pest..."
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item name="pestSymptomIds" label="Pest symptoms">
                        <Select
                            mode="multiple"
                            placeholder="Input name pest symptom..."
                            showSearch
                            filterOption={false} // tắt filter client vì đã filter ở server
                            onSearch={searchSymptoms}
                            loading={symptomSearching}
                            notFoundContent={symptomSearching ? 'Finding...' : 'Not found'}
                            allowClear
                        >
                            {symptomOptions.map((s) => (
                                <Option key={s.id} value={s.id}>{s.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
                {editingId != null && (
                    <>
                        <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }} />
                        <ErrorBoundary>
                            <PestDiseaseSection pestId={editingId} />
                        </ErrorBoundary>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default PestManagement;