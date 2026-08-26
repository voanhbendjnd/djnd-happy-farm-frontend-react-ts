import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar, Typography } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ClusterOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin/habitats',
      icon: <EnvironmentOutlined />,
      label: 'Habitats',
      onClick: () => navigate('/admin/habitats'),
    },
    {
      key: '/admin/taxonomies',
      icon: <ClusterOutlined />,
      label: 'Taxonomies',
      onClick: () => navigate('/admin/taxonomies'),
    },
      {
          key: '/admin/fertilizers',
          icon: <EnvironmentOutlined />,
          label: 'Fertilizers',
          onClick: () => navigate('/admin/fertilizers'),
      },
  ];

  const userMenuItems = [
    {
      key: 'profile-info',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <strong>{user?.name || user?.login}</strong>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{user?.email}</div>
          <div style={{ fontSize: '10px', color: '#52c41a', marginTop: '4px', fontWeight: 'bold' }}>
            ADMINISTRATOR
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'portal',
      label: 'Go to Home',
      icon: <HomeOutlined />,
      onClick: () => navigate('/'),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ?? '/admin/habitats';
  const pageTitle =
    selectedKey === '/admin/habitats' ? 'Habitat Management' : 'Taxonomy Management';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: '#0a3613' }}>
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingLeft: collapsed ? '0' : '20px',
            borderBottom: '1px solid #144d20',
          }}
        >
          <span style={{ fontSize: '24px', marginRight: collapsed ? 0 : '8px' }}>🌳</span>
          {!collapsed && (
            <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
              Happy Farm Admin
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ background: 'transparent', marginTop: '16px' }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#ffffff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: '64px', height: '64px' }}
            />
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
              {pageTitle}
            </Title>
          </div>

          <Space size="large">
            <Button
              type="dashed"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
              style={{ borderColor: '#2e7d32', color: '#2e7d32' }}
            >
              Client Portal
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#2e7d32' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>{user?.name || user?.login}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#ffffff',
            borderRadius: '8px',
            minHeight: '280px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
