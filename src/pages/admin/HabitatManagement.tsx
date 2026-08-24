import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Form, Space, Card, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { habitatService } from '../../services/habitat.service';
import type { Habitat } from '../../types';

const { TextArea } = Input;

const HabitatManagement: React.FC = () => {
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabitat, setEditingHabitat] = useState<Habitat | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchHabitats = async (q = searchText, p = page, s = pageSize) => {
    setLoading(true);
    try {
      const data = await habitatService.fetchAll(q, p, s);
      const list = data.result ?? [];
      const totalCount = data.meta?.total ?? 0;
      setHabitats(list);
      setTotal(totalCount);
    } catch {
      message.error('Failed to load habitats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitats(searchText, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchHabitats(searchText, 1, pageSize);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setPage(1);
    fetchHabitats('', 1, pageSize);
  };

  const handleCreateSubmit = async (values: { name: string; description?: string }) => {
    try {
      await habitatService.create({ name: values.name.trim(), description: values.description?.trim() || '' });
      message.success('Habitat created successfully!');
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchHabitats();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to create habitat'
      );
    }
  };

  const handleEditClick = (habitat: Habitat) => {
    setEditingHabitat(habitat);
    editForm.setFieldsValue({ description: habitat.description });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: { description?: string }) => {
    if (!editingHabitat) return;
    try {
      await habitatService.update({ name: editingHabitat.name, description: values.description?.trim() || '' });
      message.success('Habitat updated successfully!');
      setIsEditModalOpen(false);
      setEditingHabitat(null);
      fetchHabitats();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to update habitat'
      );
    }
  };

  const columns: ColumnsType<Habitat> = [
    {
      title: 'Habitat Name',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text: string) => <strong style={{ color: '#2e7d32' }}>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '60%',
      render: (text: string) =>
        text || <span style={{ color: '#d9d9d9', fontStyle: 'italic' }}>No description</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '15%',
      render: (_: unknown, record: Habitat) => (
        <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEditClick(record)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <Space>
            <Input
              placeholder="Search by name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ width: '260px', borderRadius: '6px' }}
            />
            <Button
              type="primary"
              onClick={handleSearch}
              style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
            >
              Search
            </Button>
            {searchText && <Button onClick={handleClearSearch}>Clear</Button>}
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Habitat
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={habitats}
        rowKey="name"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
          },
        }}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}
      />

      {/* Create Modal */}
      <Modal
        title="Create New Habitat"
        open={isCreateModalOpen}
        onCancel={() => { setIsCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateSubmit} style={{ marginTop: '16px' }}>
          <Form.Item
            name="name"
            label="Habitat Name"
            rules={[{ required: true, message: 'Please enter the habitat name!' }]}
          >
            <Input placeholder="e.g. Tropical Rainforest" style={{ borderRadius: '6px' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Describe the climate, location, and key species..." style={{ borderRadius: '6px' }} />
          </Form.Item>
          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0, marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Habitat Details"
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); setEditingHabitat(null); editForm.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit} style={{ marginTop: '16px' }}>
          <Form.Item label="Habitat Name (ID)" tooltip="Name acts as the identifier and cannot be changed.">
            <Input value={editingHabitat?.name} disabled style={{ borderRadius: '6px' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Describe the climate, location..." style={{ borderRadius: '6px' }} />
          </Form.Item>
          <Form.Item style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0, marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}>
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HabitatManagement;
