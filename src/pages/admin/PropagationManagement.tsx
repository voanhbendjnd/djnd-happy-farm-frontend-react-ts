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
    { value: 'EASY', label: 'Easy', color: 'green' },
    { value: 'MEDIUM', label: 'Medium', color: 'gold' },
    { value: 'HARD', label: 'Hard', color: 'red' },
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
            message.error('Cannot loading list propagation plan');
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
                message.success(`Created propagation "${payload.method}" successfully`);
            } else {
                await propagationService.update({ ...payload, id: editingId });
                message.success(`Updated propagation "${payload.method}" successfully`);
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
                'Save propagation failed'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: ColumnsType<Propagation> = [
        { title: 'Method', dataIndex: 'method', key: 'method', render: (t: string) => <strong>{t}</strong> },
        {
            title: 'Difficulty',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (d?: string) => {
                const meta = difficultyMeta(d);
                return meta ? <Tag color={meta.color}>{meta.label}</Tag> : '-';
            },
        },
        {
            title: 'Description',
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
                            placeholder="Find with method name..."
                            value={filter.method}
                            onChange={(e) => setFilter((f) => ({ ...f, method: e.target.value }))}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Filter by difficulty..."
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
                    Add propagation
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
                title={editingId == null ? 'Add new propagation' : 'Update propagation'}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                    setEditingId(null);
                }}
                onOk={handleSubmit}
                confirmLoading={submitLoading}
                okText={editingId == null ? 'Create' : 'Update'}
                destroyOnClose
                width={520}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
                    <Form.Item
                        name="method"
                        label="Method propagation"
                        rules={[
                            { required: true, message: 'Please input propagation' },
                            {
                                validator: (_, value) => {
                                    if (value && !value.trim()) {
                                        return Promise.reject('Method cannot be empty');
                                    }
                                    return Promise.resolve();
                                },
                            },
                            { max: METHOD_MAX_LENGTH, message: `Method limit at ${METHOD_MAX_LENGTH} characters` },
                        ]}
                    >
                        <Input placeholder="VD: Giâm cành, Chiết cành, Gieo hạt..." maxLength={METHOD_MAX_LENGTH} showCount />
                    </Form.Item>

                    <Form.Item name="difficulty" label="Difficutly">
                        <Select placeholder="Chọn độ khó" allowClear>
                            {DIFFICULTY_OPTIONS.map((d) => (
                                <Option key={d.value} value={d.value}>{d.label}</Option>
                            ))}
                        </Select>
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