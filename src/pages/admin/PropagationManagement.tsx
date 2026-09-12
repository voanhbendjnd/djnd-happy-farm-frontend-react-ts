import React, { useEffect, useState } from 'react';
import {
    Table, Button, Input, Modal, Card, Form, message, Row, Col, Select, Tag,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Propagation, PropagationDTO, PropagationDifficulty } from '../../types';
import { propagationService } from '../../services/propagation.service.ts';

const { TextArea } = Input;
const { Option } = Select;

const METHOD_MAX_LENGTH = 150;
const DESCRIPTION_MAX_LENGTH = 1000;

// Chỉnh lại đúng theo enum PropagationDifficulty thật ở backend.
const DIFFICULTY_OPTIONS: { value: PropagationDifficulty; label: string; color: string }[] = [
    { value: 'EASY', label: 'Dễ', color: 'green' },
    { value: 'MEDIUM', label: 'Trung bình', color: 'gold' },
    { value: 'HARD', label: 'Khó', color: 'red' },
];

const difficultyMeta = (value?: string) =>
    DIFFICULTY_OPTIONS.find((d) => d.value === value);

interface FilterState {
    method: string;
    difficulty?: PropagationDifficulty;
}

const PropagationManagement: React.FC = () => {
    const [propagations, setPropagations] = useState<Propagation[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState<FilterState>({ method: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<PropagationDTO>();

    const fetchPropagations = async (f: FilterState = filter, p = page, s = pageSize) => {
        setLoading(true);
        try {
            const res = await propagationService.fetchAll(f.method || undefined, f.difficulty, p, s);
            setPropagations(res.result ?? []);
            setTotal(res.meta?.total ?? 0);
        } catch {
            message.error('Không thể tải danh sách phương pháp nhân giống');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPropagations(filter, page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleSearch = () => {
        setPage(1);
        fetchPropagations(filter, 1, pageSize);
    };

    const handleClearSearch = () => {
        const cleared: FilterState = { method: '' };
        setFilter(cleared);
        setPage(1);
        fetchPropagations(cleared, 1, pageSize);
    };

    const openCreateModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record: Propagation) => {
        setEditingId(record.id);
        form.setFieldsValue({
            method: record.method,
            description: record.description,
            difficulty: record.difficulty,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            const payload: PropagationDTO = {
                ...values,
                method: values.method.trim(),
                description: values.description?.trim() || undefined,
            };

            if (editingId == null) {
                await propagationService.create(payload);
                message.success(`Tạo phương pháp "${payload.method}" thành công`);
            } else {
                await propagationService.update({ ...payload, id: editingId });
                message.success(`Cập nhật phương pháp "${payload.method}" thành công`);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchPropagations();
        } catch (err: any) {
            if (err?.errorFields) return; // lỗi validate form, đã hiển thị inline
            message.error(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Lưu phương pháp nhân giống thất bại'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: ColumnsType<Propagation> = [
        { title: 'Phương pháp', dataIndex: 'method', key: 'method', render: (t: string) => <strong>{t}</strong> },
        {
            title: 'Độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (d?: string) => {
                const meta = difficultyMeta(d);
                return meta ? <Tag color={meta.color}>{meta.label}</Tag> : '-';
            },
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            render: (t?: string) => t || '-',
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
                    <Col xs={24} sm={8}>
                        <Input
                            placeholder="Tìm theo phương pháp nhân giống..."
                            value={filter.method}
                            onChange={(e) => setFilter((f) => ({ ...f, method: e.target.value }))}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Lọc theo độ khó..."
                            allowClear
                            style={{ width: '100%' }}
                            value={filter.difficulty}
                            onChange={(val) => setFilter((f) => ({ ...f, difficulty: val }))}
                        >
                            {DIFFICULTY_OPTIONS.map((d) => (
                                <Option key={d.value} value={d.value}>{d.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
                    Thêm phương pháp nhân giống
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={propagations}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page, pageSize, total, showSizeChanger: true,
                    onChange: (p, s) => { setPage(p); setPageSize(s); },
                }}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}
            />

            <Modal
                title={editingId == null ? 'Thêm phương pháp nhân giống' : 'Cập nhật phương pháp nhân giống'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingId(null);
                }}
                onOk={handleSubmit}
                confirmLoading={submitLoading}
                okText={editingId == null ? 'Tạo mới' : 'Cập nhật'}
                destroyOnClose
                width={520}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
                    <Form.Item
                        name="method"
                        label="Phương pháp nhân giống"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phương pháp nhân giống' },
                            {
                                validator: (_, value) => {
                                    if (value && !value.trim()) {
                                        return Promise.reject('Không được chỉ chứa khoảng trắng');
                                    }
                                    return Promise.resolve();
                                },
                            },
                            { max: METHOD_MAX_LENGTH, message: `Không vượt quá ${METHOD_MAX_LENGTH} ký tự` },
                        ]}
                    >
                        <Input placeholder="VD: Giâm cành, Chiết cành, Gieo hạt..." maxLength={METHOD_MAX_LENGTH} showCount />
                    </Form.Item>

                    <Form.Item name="difficulty" label="Độ khó">
                        <Select placeholder="Chọn độ khó" allowClear>
                            {DIFFICULTY_OPTIONS.map((d) => (
                                <Option key={d.value} value={d.value}>{d.label}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[
                            { max: DESCRIPTION_MAX_LENGTH, message: `Mô tả không vượt quá ${DESCRIPTION_MAX_LENGTH} ký tự` },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Mô tả cách thực hiện, điều kiện áp dụng..."
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PropagationManagement;