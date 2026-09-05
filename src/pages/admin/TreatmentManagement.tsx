import React, { useEffect, useState } from 'react';
import {
    Table, Button, Input, Modal, Card, Form, message, Row, Col,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Treatment, TreatmentDTO } from '../../types';
import { treatmentService } from '../../services/treatment.service.ts';

const { TextArea } = Input;

const METHOD_MAX_LENGTH = 150;
const DESCRIPTION_MAX_LENGTH = 1000;

const TreatmentManagement: React.FC = () => {
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchMethod, setSearchMethod] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<TreatmentDTO>();

    const fetchTreatments = async (q = searchMethod, p = page, s = pageSize) => {
        setLoading(true);
        try {
            const res = await treatmentService.fetchAll(q || undefined, p, s);
            setTreatments(res.result ?? []);
            setTotal(res.meta?.total ?? 0);
        } catch {
            message.error('Cannot loading treatment list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTreatments(searchMethod, page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleSearch = () => {
        setPage(1);
        fetchTreatments(searchMethod, 1, pageSize);
    };

    const handleClearSearch = () => {
        setSearchMethod('');
        setPage(1);
        fetchTreatments('', 1, pageSize);
    };

    const openCreateModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record: Treatment) => {
        setEditingId(record.id);
        form.setFieldsValue({
            method: record.method,
            description: record.description,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            const payload: TreatmentDTO = {
                ...values,
                method: values.method.trim(),
                description: values.description?.trim() || undefined,
            };

            if (editingId == null) {
                await treatmentService.create(payload);
                message.success(`Created treatment "${payload.method}" successfully`);
            } else {
                await treatmentService.update({ ...payload, id: editingId });
                message.success(`Updated treatment "${payload.method}" successfully`);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchTreatments();
        } catch (err: any) {
            if (err?.errorFields) return; // lỗi validate form, đã hiển thị inline
            message.error(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Save treatment failed'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: ColumnsType<Treatment> = [
        { title: 'Method', dataIndex: 'method', key: 'method', render: (t: string) => <strong>{t}</strong> },
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
                    <Col xs={24} sm={12}>
                        <Input
                            placeholder="Find by method name..."
                            value={searchMethod}
                            onChange={(e) => setSearchMethod(e.target.value)}
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
                    Add new treatment
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={treatments}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page, pageSize, total, showSizeChanger: true,
                    onChange: (p, s) => { setPage(p); setPageSize(s); },
                }}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}
            />

            <Modal
                title={editingId == null ? 'Add new treatment' : 'Update treatment'}
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
                width={520}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
                    <Form.Item
                        name="method"
                        label="Methodn treament"
                        rules={[
                            { required: true, message: 'Please input treatment method' },
                            {
                                validator: (_, value) => {
                                    if (value && !value.trim()) {
                                        return Promise.reject('Treatment cannot be empty');
                                    }
                                    return Promise.resolve();
                                },
                            },
                            { max: METHOD_MAX_LENGTH, message: `Method limit at ${METHOD_MAX_LENGTH} characters` },
                        ]}
                    >
                        <Input placeholder="VD: Phun thuốc trừ sâu sinh học, Bẫy pheromone..." maxLength={METHOD_MAX_LENGTH} showCount />
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
                            placeholder="Mô tả cách thực hiện, liều lượng, lưu ý..."
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TreatmentManagement;