import React, { useEffect, useState } from 'react';
import {
  Table, Button, Input, Modal, Space, Card, Tag,
  Descriptions, message, Alert, Typography, Row, Col
} from 'antd';
import { PlusOutlined, SearchOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { taxonomyService } from '../../services/taxonomy.service';
import type { Taxonomy, GbifMatchResult } from '../../types';

const { Title, Paragraph } = Typography;

const TaxonomyManagement: React.FC = () => {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState('');
  const [family, setFamily] = useState('');
  const [genus, setGenus] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [speciesName, setSpeciesName] = useState('');
  const [matchedData, setMatchedData] = useState<GbifMatchResult | null>(null);
  const [matchError, setMatchError] = useState('');

  const fetchTaxonomies = async (
    qVal = q, fam = family, gen = genus, p = page, s = pageSize
  ) => {
    setLoading(true);
    try {
      const data = await taxonomyService.fetchAll(qVal, fam, gen, p, s);
      setTaxonomies(data.result ?? []);
      setTotal(data.meta?.total ?? 0);
    } catch {
      message.error('Failed to load taxonomy records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomies(q, family, genus, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchTaxonomies(q, family, genus, 1, pageSize);
  };

  const handleClearSearch = () => {
    setQ(''); setFamily(''); setGenus('');
    setPage(1);
    fetchTaxonomies('', '', '', 1, pageSize);
  };

  const handleMatch = async () => {
    if (!speciesName.trim()) { setMatchError('Please enter a species name'); return; }
    setMatchLoading(true);
    setMatchError('');
    setMatchedData(null);
    try {
      const data = await taxonomyService.match(speciesName.trim());
      if (data?.family) {
        setMatchedData(data);
      } else {
        setMatchError('No matching taxonomy found or family is missing from the GBIF result.');
      }
    } catch (err: any) {
      setMatchError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'No taxonomy match found on GBIF.'
      );
    } finally {
      setMatchLoading(false);
    }
  };

  const handleCreateTaxonomy = async () => {
    if (!matchedData) return;
    setMatchLoading(true);
    try {
      await taxonomyService.create(speciesName.trim());
      message.success(`Successfully saved taxonomy for "${speciesName}"!`);
      setIsModalOpen(false);
      setSpeciesName('');
      setMatchedData(null);
      fetchTaxonomies();
    } catch (err: any) {
      message.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        'Failed to save taxonomy'
      );
    } finally {
      setMatchLoading(false);
    }
  };

  const columns: ColumnsType<Taxonomy> = [
    {
      title: 'Kingdom',
      dataIndex: 'kingdom',
      key: 'kingdom',
      render: (text: string) => <Tag color="green">{text || 'PLANTAE'}</Tag>,
    },
    {
      title: 'Family',
      dataIndex: 'family',
      key: 'family',
      render: (text: string) => <strong>{text}</strong>,
    },
    { title: 'Genus', dataIndex: 'genus', key: 'genus' },
    {
      title: 'Species',
      dataIndex: 'species',
      key: 'species',
      render: (text: string) => <span style={{ fontStyle: 'italic' }}>{text || 'N/A'}</span>,
    },
  ];

  return (
    <div>
      {/* Filter card */}
      <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Input
              placeholder="Search keyword..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              style={{ borderRadius: '6px' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Filter by Family..."
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              style={{ borderRadius: '6px' }}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Input
              placeholder="Filter by Genus..."
              value={genus}
              onChange={(e) => setGenus(e.target.value)}
              style={{ borderRadius: '6px' }}
            />
          </Col>
          <Col xs={24} sm={6} style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
          onClick={() => {
            setMatchError('');
            setMatchedData(null);
            setSpeciesName('');
            setIsModalOpen(true);
          }}
        >
          Match &amp; Add Species
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={taxonomies}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page, pageSize, total, showSizeChanger: true,
          onChange: (p, s) => { setPage(p); setPageSize(s); },
        }}
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px' }}
      />

      {/* GBIF Match Modal */}
      <Modal
        title="Match & Save Taxonomy via GBIF"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSpeciesName('');
          setMatchedData(null);
          setMatchError('');
        }}
        footer={null}
        width={650}
        destroyOnClose
      >
        <div style={{ marginTop: '16px' }}>
          <Alert
            message="GBIF Auto-Matching"
            description="Enter a scientific name (e.g. Pinus sylvestris). The system will query GBIF, pull the approved scientific hierarchy, and prepare the record for cataloging."
            type="info"
            showIcon
            style={{ marginBottom: '20px', borderRadius: '8px' }}
          />

          <Space style={{ width: '100%', marginBottom: '20px' }}>
            <Input
              placeholder="e.g. Quercus robur, Acer rubrum"
              value={speciesName}
              onChange={(e) => setSpeciesName(e.target.value)}
              onPressEnter={handleMatch}
              style={{ width: '400px', borderRadius: '6px' }}
              disabled={matchLoading}
            />
            <Button
              type="primary"
              onClick={handleMatch}
              loading={matchLoading}
              icon={<SyncOutlined spin={matchLoading} />}
              style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
            >
              Match
            </Button>
          </Space>

          {matchError && (
            <Alert
              message="No Match Found"
              description={matchError}
              type="error"
              showIcon
              style={{ marginBottom: '20px', borderRadius: '8px' }}
            />
          )}

          {matchedData && (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>GBIF Match Details</span>
                </Space>
              }
              style={{ borderRadius: '8px', marginBottom: '24px' }}
              styles={{ body: { padding: '16px' } }}
            >
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Scientific Name">
                  <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                    {matchedData.scientificName}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Canonical Name">
                  {matchedData.canonicalName || matchedData.species}
                </Descriptions.Item>
                <Descriptions.Item label="Rank">
                  <Tag color="blue">{matchedData.rank?.toUpperCase()}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Kingdom">{matchedData.kingdom || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Family">
                  <strong>{matchedData.family}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Genus">{matchedData.genus || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Species">
                  <span style={{ fontStyle: 'italic' }}>{matchedData.species || 'N/A'}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={matchedData.status === 'ACCEPTED' ? 'success' : 'warning'}>
                    {matchedData.status || 'N/A'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <Button
                  type="primary"
                  onClick={handleCreateTaxonomy}
                  loading={matchLoading}
                  style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                >
                  Save to Local Database
                </Button>
              </div>
            </Card>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TaxonomyManagement;
