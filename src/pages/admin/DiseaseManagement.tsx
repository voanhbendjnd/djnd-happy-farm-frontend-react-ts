import React, { useEffect, useState } from 'react';
import {
    Table, Button, Input, Modal, Card, Form, message, Row, Col, Select, Tag,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Disease, DiseaseDTO, DiseaseSeverity } from '../../types';
import { diseaseService } from '../../services/disease.service.ts';

const { TextArea } = Input;
const { Option } = Select;

const NAME_MAX_LENGTH = 150;
const DESCRIPTION_MAX_LENGTH = 1000;

// Chỉnh lại đúng theo enum DiseaseSeverity thật ở backend.
const SEVERITY_OPTIONS: { value: DiseaseSeverity; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: 'green' },
    { value: 'MEDIUM', label: 'Medium', color: 'gold' },
    { value: 'HIGH', label: 'High', color: 'orange' },
    { value: 'CRITICAL', label: 'Critical', color: 'red' },
];

const severityMeta = (value: string) =>
    SEVERITY_OPTIONS.find((s) => s.value === value);

interface FilterState {
    name: string;
    severity?: DiseaseSeverity;
}

const DiseaseManagement: React.FC = () => {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState<FilterState>({ name: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<DiseaseDTO>();

    const fetchDiseases = async (f: FilterState = filter, p = page, s = pageSize) => {
        setLoading(true);
        try {
            const res = await diseaseService.fetchAll(f.name || undefined, f.severity, p, s);
            setDiseases(res.result ?? []);
            setTotal(res.meta?.total ?? 0);
        } catch {
            message.error('Cannot loading disease list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiseases(filter, page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleSearch = () => {
        setPage(1);
        fetchDiseases(filter, 1, pageSize);
    };

    const handleClearSearch = () => {
        const cleared: FilterState = { name: '' };
        setFilter(cleared);
        setPage(1);
        fetchDiseases(cleared, 1, pageSize);
    };

    const openCreateModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record: Disease) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            severity: record.severity,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            const payload: DiseaseDTO = {
                ...values,
                name: values.name.trim(),
                description: values.description?.trim() || undefined,
            };

            if (editingId == null) {
                await diseaseService.create(payload);
                message.success(`Created disease "${payload.name}" success`);
            } else {
                await diseaseService.update({ ...payload, id: editingId });
                message.success(`Updated disease "${payload.name}" success`);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchDiseases();
        } catch (err: any) {
            if (err?.errorFields) return; // lỗi validate form, đã hiển thị inline
            message.error(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Save disease failure'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: ColumnsType<Disease> = [
        { title: 'Name', dataIndex: 'name', key: 'name', render: (t: string) => <strong>{t}</strong> },
        {
            title: 'Severity',
            dataIndex: 'severity',
            key: 'severity',
            render: (s: string) => {
                const meta = severityMeta(s);
                return meta ? <Tag color={meta.color}>{meta.label}</Tag> : <Tag>{s}</Tag>;
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
                            placeholder="Find by name..."
                            value={filter.name}
                            onChange={(e) => setFilter((f) => ({ ...f, name: e.target.value }))}
                            onPressEnter={handleSearch}
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Select
                            placeholder="Filter by severity..."
                            allowClear
                            style={{ width: '100%' }}
                            value={filter.severity}
                            onChange={(val) => setFilter((f) => ({ ...f, severity: val }))}
                        >
                            {SEVERITY_OPTIONS.map((s) => (
                                <Option key={s.value} value={s.value}>{s.label}</Option>
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
                    Add new disease
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={diseases}
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
                width={520}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[
                            { required: true, message: 'Please input name disease' },
                            {
                                validator: (_, value) => {
                                    if (value && !value.trim()) {
                                        return Promise.reject('Name cannot be empty');
                                    }
                                    return Promise.resolve();
                                },
                            },
                            { max: NAME_MAX_LENGTH, message: `Name limit at ${NAME_MAX_LENGTH} characters` },
                        ]}
                    >
                        <Input placeholder="EX: Đạo ôn, Thán thư, Sương mai..." maxLength={NAME_MAX_LENGTH} showCount />
                    </Form.Item>

                    <Form.Item
                        name="severity"
                        label="Severity"
                        rules={[{ required: true, message: 'Please input severity' }]}
                    >
                        <Select placeholder="Select severity">
                            {SEVERITY_OPTIONS.map((s) => (
                                <Option key={s.value} value={s.value}>{s.label}</Option>
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
                            placeholder="Mô tả triệu chứng, tác nhân gây bệnh, điều kiện phát sinh..."
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DiseaseManagement;