import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Space,
  Button,
  Alert,
  Tag,
  Divider,
  Empty,
} from 'antd';
import {
  EnvironmentOutlined,
  ClusterOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/useAuth';
import { habitatService } from '../services/habitat.service';
import { taxonomyService } from '../services/taxonomy.service';
import type { Habitat, Taxonomy } from '../types';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [stats, setStats] = useState({ habitats: 0, taxonomies: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [habitatData, taxonomyData] = await Promise.all([
          habitatService.fetchAll('', 1, 5),
          taxonomyService.fetchAll('', '', '', 1, 5),
        ]);

        const habitatList = habitatData.result ?? (habitatData as any)?.data?.result ?? [];
        const taxonomyList = taxonomyData.result ?? (taxonomyData as any)?.data?.result ?? [];
        const habitatTotal = habitatData.meta?.total ?? (habitatData as any)?.data?.meta?.total ?? 0;
        const taxonomyTotal = taxonomyData.meta?.total ?? (taxonomyData as any)?.data?.meta?.total ?? 0;

        setHabitats(habitatList);
        setTaxonomies(taxonomyList);
        setStats({ habitats: habitatTotal, taxonomies: taxonomyTotal });
      } catch {
        setError(
          'Could not connect to the backend server. Make sure the Spring Boot application is running.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const habitatColumns: ColumnsType<Habitat> = [
    {
      title: 'Habitat Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong style={{ color: '#2e7d32' }}>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) =>
        desc || <span style={{ color: '#bfbfbf', fontStyle: 'italic' }}>No description</span>,
    },
  ];

  const taxonomyColumns: ColumnsType<Taxonomy> = [
    {
      title: 'Kingdom',
      dataIndex: 'kingdom',
      key: 'kingdom',
      render: (text: string) => <Tag color="green">{text || 'N/A'}</Tag>,
    },
    {
      title: 'Family',
      dataIndex: 'family',
      key: 'family',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Genus',
      dataIndex: 'genus',
      key: 'genus',
    },
    {
      title: 'Species',
      dataIndex: 'species',
      key: 'species',
      render: (text: string) => <span style={{ fontStyle: 'italic' }}>{text || 'N/A'}</span>,
    },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1b5e20 0%, #388e3c 100%)',
          color: '#ffffff',
          padding: '60px 48px',
          boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Tag color="#81c784" style={{ marginBottom: '16px', fontSize: '14px', padding: '4px 8px' }}>
            🌱 Welcome to the Happy Farm Tree Ecosystem
          </Tag>
          <Title
            level={1}
            style={{ color: '#ffffff', margin: 0, fontWeight: 800, fontSize: '42px' }}
          >
            Discover and Catalog Tree Habitats
          </Title>
          <Paragraph
            style={{
              color: '#e8f5e9',
              fontSize: '18px',
              marginTop: '16px',
              maxWidth: '800px',
              lineHeight: '1.6',
            }}
          >
            Our platform allows researchers and nature lovers to record plant taxonomy details and
            study the natural conditions that support diverse forest systems.
          </Paragraph>

          {isAdmin && (
            <div style={{ marginTop: '24px' }}>
              <Button
                type="primary"
                size="large"
                icon={<ClusterOutlined />}
                style={{ backgroundColor: '#ffffff', color: '#1b5e20', border: 'none', fontWeight: 'bold' }}
                onClick={() => navigate('/admin/habitats')}
              >
                Go to Admin Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}>
        {error && (
          <Alert
            message="Server Connection Notice"
            description={error}
            type="warning"
            showIcon
            action={
              <Button size="small" type="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
            style={{ marginBottom: '32px', borderRadius: '8px' }}
          />
        )}

        {/* Stats */}
        <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              style={{ borderRadius: '12px', borderLeft: '5px solid #2e7d32' }}
            >
              <Statistic
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>Active Habitats</span>}
                value={stats.habitats}
                prefix={<EnvironmentOutlined style={{ color: '#2e7d32', marginRight: '8px' }} />}
                valueStyle={{ color: '#1b5e20', fontSize: '36px', fontWeight: 700 }}
                loading={loading}
              />
              <div style={{ marginTop: '12px', color: '#8c8c8c' }}>
                Diverse environments where specific plant kingdoms grow.
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              style={{ borderRadius: '12px', borderLeft: '5px solid #81c784' }}
            >
              <Statistic
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>Taxonomy Records</span>}
                value={stats.taxonomies}
                prefix={<ClusterOutlined style={{ color: '#2e7d32', marginRight: '8px' }} />}
                valueStyle={{ color: '#1b5e20', fontSize: '36px', fontWeight: 700 }}
                loading={loading}
              />
              <div style={{ marginTop: '12px', color: '#8c8c8c' }}>
                Scientific hierarchy matched via GBIF Global Database.
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tables */}
        <Row gutter={[32, 32]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <EnvironmentOutlined style={{ color: '#2e7d32' }} />
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>Featured Habitats</span>
                </Space>
              }
              extra={
                isAdmin && (
                  <Button type="link" onClick={() => navigate('/admin/habitats')}>
                    Manage
                  </Button>
                )
              }
              style={{ borderRadius: '12px' }}
            >
              <Table
                dataSource={habitats}
                columns={habitatColumns}
                rowKey="name"
                pagination={false}
                loading={loading}
                locale={{ emptyText: <Empty description="No habitats found" /> }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <ClusterOutlined style={{ color: '#2e7d32' }} />
                  <span style={{ fontSize: '18px', fontWeight: 700 }}>Recent Taxonomies</span>
                </Space>
              }
              extra={
                isAdmin && (
                  <Button type="link" onClick={() => navigate('/admin/taxonomies')}>
                    Manage
                  </Button>
                )
              }
              style={{ borderRadius: '12px' }}
            >
              <Table
                dataSource={taxonomies}
                columns={taxonomyColumns}
                rowKey="id"
                pagination={false}
                loading={loading}
                locale={{ emptyText: <Empty description="No taxonomies registered" /> }}
              />
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '48px 0' }} />
        <Card
          style={{
            background: '#f1f8e9',
            borderRadius: '12px',
            border: '1px dashed #c8e6c9',
          }}
        >
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} md={4} style={{ textAlign: 'center' }}>
              <InfoCircleOutlined style={{ fontSize: '48px', color: '#2e7d32' }} />
            </Col>
            <Col xs={24} md={20}>
              <Title level={4} style={{ color: '#1b5e20', margin: 0, fontWeight: 700 }}>
                What is GBIF Species Matching?
              </Title>
              <Paragraph style={{ margin: '8px 0 0 0', color: '#33691e', fontSize: '15px' }}>
                GBIF (Global Biodiversity Information Facility) provides open access to data about
                all types of life on Earth. Administrators can query GBIF to find species details
                and save correct biological hierarchies directly to the Happy Farm database.
              </Paragraph>
            </Col>
          </Row>
        </Card>
      </div>
    </MainLayout>
  );
};

export default HomePage;
