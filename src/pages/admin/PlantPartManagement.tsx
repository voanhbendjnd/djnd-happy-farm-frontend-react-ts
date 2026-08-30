import React, { useEffect, useState } from 'react';
import {
    Table, Button, Input, Modal, Card, Form, message, Row, Col,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {  PlantPartDTO } from '../../types';
import { plantPartService } from '../../services/plant.part.service.ts';

const { TextArea } = Input;

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;


const PlantPartManagement: React.FC = () => {
    const [plantParts, setPlantParts] = useState<PlantPartDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchName, setSearchName] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<PlantPartDTO>();

    const fetchPlantParts = async (q = searchName, p = page, s = pageSize) => {
        setLoading(true);
        try {
            const res = await plantPartService.fetchAll(q || undefined, p, s);
            setPlantParts(res.result ?? []);
            setTotal(res.meta?.total ?? 0);
        } catch {
            message.error('Cannot loading list plant parts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlantParts(searchName, page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleSearch = () => {
        setPage(1);
        fetchPlantParts(searchName, 1, pageSize);
    };

    const handleClearSearch = () => {
        setSearchName('');
        setPage(1);
        fetchPlantParts('', 1, pageSize);
    };

    const openCreateModal = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record: PlantPartDTO) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);

            // Chuẩn hoá name trước khi gửi lên (backend cũng trim + lowercase để check trùng,
            // nhưng trim ở FE giúp tránh gửi khoảng trắng thừa và feedback nhanh hơn)
            const payload: PlantPartDTO = {
                ...values,
                name: values.name.trim(),
                description: values.description?.trim() || undefined,
            };

            if (editingId == null) {
                await plantPartService.create(payload);
                message.success(`Create new plant part "${payload.name}" success`);
            } else {
                await plantPartService.update({ ...payload, id: editingId });
                message.success(`Update plant part "${payload.name}" success`);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchPlantParts();
        } catch (err: any) {
            if (err?.errorFields) return; // lỗi validate form, đã hiển thị inline
            message.error(
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Save failed, please try again',
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: ColumnsType<PlantPartDTO> = [
        { title: 'Name plant part', dataIndex: 'name', key: 'name', render: (t: string) => <strong>{t}</strong> },
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
                            placeholder="Find with name plant part..."
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
                    Add new plant part
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={plantParts}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page, pageSize, total, showSizeChanger: true,
                    onChange: (p, s) => { setPage(p); setPageSize(s); },
                }}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}
            />

            <Modal
                title={editingId == null ? 'Add new plant part' : 'Update plant part'}
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
                        label="Plant part name"
                        rules={[
                            { required: true, message: 'Please enter plant part name' },
                            {
                                validator: (_, value) => {
                                    if (value && !value.trim()) {
                                        return Promise.reject('Name cannot be empty');
                                    }
                                    return Promise.resolve();
                                },
                            },
                            { max: NAME_MAX_LENGTH, message: `Name length limit at ${NAME_MAX_LENGTH} characters` },
                        ]}
                    >
                        <Input placeholder="EX: Leaf, root, stem, folower, fruit..." maxLength={NAME_MAX_LENGTH} showCount />
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
                            placeholder="Short description about this plant part..."
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            showCount
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PlantPartManagement;