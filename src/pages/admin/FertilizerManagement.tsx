import React, {useEffect, useRef, useState} from 'react';
import {
    Table, Button, Input, InputNumber, Modal, Space, Card, Tag,
    Form, message, Row, Col, Select,
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { JSONContent } from '@tiptap/react';
import type { Fertilizer, FertilizerGrowthStageDTO, GrowthStage } from '../../types';
import { fertilizerService } from '../../services/fertilizer.service.ts';
import { growthStageService } from '../../services/growth.stage.service.ts';
import RichTextEditor, {RichTextEditorRef} from "../../components/RickTextEditor.tsx";

const { Option } = Select;

interface FilterState {
    name: string;
    fertilizerType: string;
    growthStageId?: number;
}

const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

const FertilizerManagement: React.FC = () => {
    const [fertilizers, setFertilizers] = useState<Fertilizer[]>([]);
    const [growthStages, setGrowthStages] = useState<GrowthStage[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filter, setFilter] = useState<FilterState>({ name: '', fertilizerType: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<FertilizerGrowthStageDTO>();
    const editorRef = useRef<RichTextEditorRef>(null);
// XÓA: const [descriptionJson, setDescriptionJson] = useState<JSONContent>(EMPTY_DOC);
// Giữ 1 biến thường (không phải state) để pass initial content khi edit:
    const initialDescriptionRef = useRef<JSONContent>(EMPTY_DOC);

    const fetchFertilizers = async (
        f: FilterState = filter, p = page, s = pageSize
    ) => {
        setLoading(true);
        try {
            const res = await fertilizerService.fetchAll(
                {
                    name: f.name || undefined,
                    fertilizerType: f.fertilizerType || undefined,
                    growthStageId: f.growthStageId,
                },
                p,
                s
            );
            setFertilizers(res.result ?? []);
            setTotal(res.meta?.total ?? 0);
        } catch {
            message.error('Cannot find any fertilizer');
        } finally {
            setLoading(false);
        }
    };

    const fetchGrowthStages = async () => {
        try {
            const data = await growthStageService.fetchAll();
            setGrowthStages(data ?? []);
        } catch {
            // không chặn UI nếu load growth stage lỗi
        }
    };

    useEffect(() => {
        fetchGrowthStages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchFertilizers(filter, page, pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize]);

    const handleSearch = () => {
        setPage(1);
        fetchFertilizers(filter, 1, pageSize);
    };

    const handleClearSearch = () => {
        const cleared: FilterState = { name: '', fertilizerType: '' };
        setFilter(cleared);
        setPage(1);
        fetchFertilizers(cleared, 1, pageSize);
    };

    const openCreateModal = () => {
        setEditingId(null);
        form.resetFields();
        initialDescriptionRef.current = EMPTY_DOC;
        setIsModalOpen(true);
    };

    const openEditModal = (record: Fertilizer) => {
        setEditingId(record.id);
        form.setFieldsValue({
            name: record.name,
            type: record.type,
            description: record.description,
            nitrogen: record.nitrogen,
            phosphorus: record.phosphorus,
            potassium: record.potassium,
            growthStageIds: record.growthStages?.map((g) => g.id) ?? [],
        });
        initialDescriptionRef.current = (record.descriptionJson as JSONContent) ?? EMPTY_DOC;
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);
            const descriptionJson = editorRef.current?.getJSON() ?? EMPTY_DOC;
            const payload: FertilizerGrowthStageDTO = { ...values, descriptionJson };
            if (editingId == null) {
                await fertilizerService.create(payload);
                message.success(`Created fertilizer "${values.name}" success`);
            } else {
                await fertilizerService.update({ ...payload, id: editingId });
                message.success(`Updated fertilizer "${values.name}" success`);
            }
            setIsModalOpen(false);
            form.resetFields();
            setEditingId(null);
            fetchFertilizers();
        } catch (err: any) {
            if (err?.errorFields) return; // lỗi validate form, không cần toast
            message.error(
                err?.response?.data?.detail ||
                err?.response?.data?.message ||
                'Lưu phân bón thất bại'
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    const columns: ColumnsType<Fertilizer> = [
        { title: 'Tên', dataIndex: 'name', key: 'name', render: (t: string) => <strong>{t}</strong> },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (t: string) => (t ? <Tag color="geekblue">{t}</Tag> : '-'),
        },
        { title: 'N', dataIndex: 'nitrogen', key: 'nitrogen', width: 80 },
        { title: 'P', dataIndex: 'phosphorus', key: 'phosphorus', width: 80 },
        { title: 'K', dataIndex: 'potassium', key: 'potassium', width: 80 },
        {
            title: 'Growth stage plant',
            dataIndex: 'growthStages',
            key: 'growthStages',
            render: (stages: GrowthStage[] = []) => (
                <>
                    {stages.map((s) => (
                        <Tag key={s.id} color="green">{s.name}</Tag>
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
                    <Col xs={24} sm={6}>
                        <Input
                            placeholder="Find by name..."
                            value={filter.name}
                            onChange={(e) => setFilter((f) => ({ ...f, name: e.target.value }))}
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Input
                            placeholder="Filter by type fertilizer..."
                            value={filter.fertilizerType}
                            onChange={(e) => setFilter((f) => ({ ...f, fertilizerType: e.target.value }))}
                        />
                    </Col>
                    <Col xs={24} sm={6}>
                        <Select
                            placeholder="Filter by growth stage..."
                            allowClear
                            style={{ width: '100%' }}
                            value={filter.growthStageId}
                            onChange={(val) => setFilter((f) => ({ ...f, growthStageId: val }))}
                        >
                            {growthStages.map((g) => (
                                <Option key={g.id} value={g.id}>{g.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={6} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button type="primary" onClick={handleSearch} style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
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
                    Add new fertilizer
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={fertilizers}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: page, pageSize, total, showSizeChanger: true,
                    onChange: (p, s) => { setPage(p); setPageSize(s); },
                }}
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}
            />

            <Modal
                title={editingId == null ? 'Add fertilizer' : 'Update fertilizer'}
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
                width={640}
            >
                <Form form={form} layout="vertical" style={{ marginTop: '16px' }}>
                    <Form.Item name="name" label="Name fertilizer" rules={[{ required: true, message: 'Please enter name fertilizer' }]}>
                        <Input placeholder="VD: NPK 16-16-8" />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="type" label="Type">
                                <Input placeholder="VD: inorganic, organic..." />
                            </Form.Item>
                        </Col>
                        {/*<Col span={12}>*/}
                        {/*    <Form.Item name="npkRatio" label="NPK ratio">*/}
                        {/*        <Input placeholder="VD: 16-16-8" />*/}
                        {/*    </Form.Item>*/}
                        {/*</Col>*/}
                    </Row>

                    <Form.Item label="Description" required={false}>
                        <RichTextEditor
                            ref={editorRef}
                            key={editingId ?? 'new'}
                            initialContent={initialDescriptionRef.current}
                            placeholder="Dùng cho cây con mới phát triển..."
                        />
                    </Form.Item>

                    <Row gutter={12}>
                        <Col span={8}>
                            <Form.Item name="nitrogen" label="Nito (N)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="phosphorus" label="Photpho (P)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="potassium" label="Kali (K)">
                                <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="growthStageIds" label="Growth stage">
                        <Select mode="multiple" placeholder="Choose stage" allowClear>
                            {growthStages.map((g) => (
                                <Option key={g.id} value={g.id}>{g.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default FertilizerManagement;