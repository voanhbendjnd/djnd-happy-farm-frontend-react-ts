import React, { useEffect, useRef, useState } from 'react';
import {Table, Button, Modal, Form, Select, Input, message, Popconfirm, Tag, Empty, Alert, notification} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { pestDiseaseService } from '../../services/pest.disease.service.ts';
import { diseaseService } from '../../services/disease.service.ts';
import type { Disease, PestDisease, PestDiseaseDTO } from '@/types';
import {getApiErrorMessage} from "@/utils/apiError.ts";

const { Option } = Select;
const { TextArea } = Input;

interface Props {
    pestId: number;
}

const TRANSMISSION_ROLE_OPTIONS = ['Vector', 'Reservoir', 'Carrier', 'Direct damage'];

const PestDiseaseSection: React.FC<Props> = ({ pestId }) => {
    const [relations, setRelations] = useState<PestDisease[]>([]);
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRelationId, setEditingRelationId] = useState<number | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [form] = Form.useForm<{ diseaseId: number; transmissionRole?: string; description?: string }>();
    const [api, contextHolder] = notification.useNotification();

    // Lưu record đang edit để set vào form sau khi Modal inner mở xong
    const pendingRelation = useRef<PestDisease | null>(null);

    const fetchRelations = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const data = await pestDiseaseService.fetchByPest(pestId);
            // Đảm bảo luôn là array dù API trả về bất kỳ dạng nào
            if (Array.isArray(data)) {
                setRelations(data);
            } else if (data && typeof data === 'object') {
                // Một số API wrap trong { data: [...] } hoặc { result: [...] }
                const inner = (data as any).data ?? (data as any).result ?? [];
                setRelations(Array.isArray(inner) ? inner : []);
            } else {
                setRelations([]);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Cannot loading relation list';
            setFetchError(msg);
            console.error('[PestDiseaseSection] fetchRelations error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDiseases = async () => {
        try {
            const res = await diseaseService.fetchAll(undefined, undefined, 1, 200);
            // Xử lý đủ các dạng response
            const list = res?.result ?? res?.data?.result ?? res ?? [];
            setDiseases(Array.isArray(list) ? (list as Disease[]) : []);
        } catch (err) {
            console.error('[PestDiseaseSection] fetchDiseases error:', err);
            // không chặn UI — giữ danh sách rỗng
            setDiseases([]);
        }
    };

    useEffect(() => {
        fetchRelations();
        fetchDiseases();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pestId]);

    const openAddModal = () => {
        pendingRelation.current = null;
        setEditingRelationId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEditModal = (record: PestDisease) => {
        pendingRelation.current = record;
        setEditingRelationId(record.id);
        form.resetFields();
        setIsModalOpen(true);
    };

    // Set values sau khi modal inner đã fully mount (animation done)
    const handleInnerAfterOpenChange = (open: boolean) => {
        if (open && pendingRelation.current) {
            const r = pendingRelation.current;
            form.setFieldsValue({
                diseaseId: r.diseaseId,
                transmissionRole: r.transmissionRole,
                description: r.description,
            });
        }
        if (!open) {
            pendingRelation.current = null;
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitLoading(true);
            const payload: PestDiseaseDTO = { pestId, ...values };
            if (editingRelationId == null) {
                await pestDiseaseService.create(payload);
                message.success('Add disease successfully');
            } else {
                await pestDiseaseService.update({ ...payload, id: editingRelationId });
                message.success('Updated relation successfully');
            }
            setIsModalOpen(false);
            fetchRelations();

        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.title ??
                error?.response?.data?.message ??
                error?.message ??
                'Failed to adding relation';

            api.error({
                message: 'Failed to adding relation',
                description: errorMessage,
                placement: 'topRight',
            });
        }finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await pestDiseaseService.remove(id);
            message.success('Delete relationship successfully');
            fetchRelations();
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? 'Delete failed');
        }
    };

    return (
        <>
            {contextHolder}
            <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <strong>Disease relation (Pest → Disease)</strong>
                    <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={openAddModal}
                        style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32', color: '#fff' }}
                    >
                        Add disease
                    </Button>
                </div>

                {fetchError && (
                    <Alert
                        message={fetchError}
                        type="error"
                        showIcon
                        style={{ marginBottom: 8 }}
                        action={<Button size="small" onClick={fetchRelations}>Try again</Button>}
                    />
                )}

                <Table
                    size="small"
                    rowKey="id"
                    loading={loading}
                    dataSource={relations}
                    pagination={false}
                    locale={{ emptyText: <Empty description="Not yet avaiable disease" /> }}
                    columns={[
                        { title: 'Disease', dataIndex: 'diseaseName', key: 'diseaseName', render: (v) => v || '-' },
                        {
                            title: 'Severity', dataIndex: 'diseaseSeverity', key: 'diseaseSeverity',
                            render: (s?: string) => s ? <Tag>{s}</Tag> : '-',
                        },
                        {
                            title: 'Transmission role', dataIndex: 'transmissionRole', key: 'transmissionRole',
                            render: (v) => v || '-',
                        },
                        {
                            title: '', key: 'actions', width: 90,
                            render: (_, record) => (
                                <>
                                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
                                    <Popconfirm title="Remove this relationship?" onConfirm={() => handleDelete(record.id)}>
                                        <Button size="small" danger icon={<DeleteOutlined />} style={{ marginLeft: 4 }} />
                                    </Popconfirm>
                                </>
                            ),
                        },
                    ]}
                />

                <Modal
                    title={editingRelationId == null ? 'Add disease relationship' : 'Update disease relationship'}
                    open={isModalOpen}
                    onCancel={() => {
                        setIsModalOpen(false);
                        form.resetFields();
                        setEditingRelationId(null);
                    }}
                    afterOpenChange={handleInnerAfterOpenChange}
                    onOk={handleSubmit}
                    confirmLoading={submitLoading}
                    okText={editingRelationId == null ? 'Add' : 'Update'}
                    // KHÔNG dùng destroyOnClose để tránh crash form khi re-mount
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Form.Item
                            name="diseaseId"
                            label="Disease"
                            rules={[{ required: true, message: 'Please select disease' }]}
                        >
                            <Select placeholder="Select disease" showSearch optionFilterProp="children">
                                {diseases.map((d) => (
                                    <Option key={d.id} value={d.id}>{d.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="transmissionRole" label="Tranmission role">
                            <Select placeholder="Select role" allowClear>
                                {TRANSMISSION_ROLE_OPTIONS.map((r) => <Option key={r} value={r}>{r}</Option>)}
                            </Select>
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                            <TextArea rows={3} placeholder="Note detail about mechanic tranmission..." />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>

        </>
    );
};

export default PestDiseaseSection;