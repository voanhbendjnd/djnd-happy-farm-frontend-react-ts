import React, { useEffect, useState } from 'react';
import {
    Table, Button, Input, Modal, Card, Form, message, Row, Col, Select, Tag,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Pest, PestDTO, PestSymptom } from '../../types';
import { pestService } from '../../services/pest.service.ts';
import { pestSymptomService } from '../../services/pest.symptom.service.ts';

const { TextArea } = Input;
const { Option } = Select;

const NAME_MAX_LENGTH = 150;
const DESCRIPTION_MAX_LENGTH = 1000;

// Form chỉ giữ mảng id triệu chứng, khớp UX với growthStageIds bên Fertilizer.
interface PestFormValues {
    name: string;
    description?: string;
    pestSymptomIds?: number[];
}

const PestManagement: React.FC = () => {
    const [pests, setPests] = useState<Pest[]>([]);
    const [pestSymptoms, setPestSymptoms] = useState<PestSymptom[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<PestFormValues>();

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

    const fetchPestSymptoms = async () => {
        try {
            // Lấy hết trong 1 trang lớn để đổ vào Select — chỉnh pageSize nếu số lượng triệu chứng nhiều.
            const res = await pestSymptomService.fetchAll(undefined, 1, 200);
            setPestSymptoms((res.result ?? []) as PestSymptom[]);
        } catch {
            // không chặn UI nếu load symptom lỗi
        }
    };

    useEffect(() => {
        fetchPestSymptoms();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            // @ts-ignore
            pestSymptomIds: record.pestSymptoms?.map((s) => s.id) ?? [],
        });
        setIsModalOpen(true);
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
                onOk={handleSubmit}
                confirmLoading={submitLoading}
                okText={editingId == null ? 'Add new' : 'Update'}
                destroyOnClose
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
                        <Input placeholder="VD: Bug, spider,..." maxLength={NAME_MAX_LENGTH} showCount />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
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
                        <Select mode="multiple" placeholder="Choose symptoms" allowClear>
                            {pestSymptoms.map((s) => (
                                <Option key={s.id} value={s.id}>{s.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PestManagement;