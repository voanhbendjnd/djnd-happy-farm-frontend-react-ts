import React from 'react';
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  HomeOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'name',
      label: (
        <div style={{ padding: '4px 8px' }}>
          <strong>{user?.name || user?.login}</strong>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    ...(isAdmin
      ? [
          {
            key: 'admin',
            label: 'Admin Panel',
            icon: <DashboardOutlined />,
            onClick: () => navigate('/admin/habitats'),
          },
        ]
      : []),
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const navItems = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
      icon: <HomeOutlined />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#1b5e20',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <span style={{ fontSize: '24px', marginRight: '8px' }}>🌳</span>
          <span
            style={{
              color: '#ffffff',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            Happy Farm
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0, marginLeft: '32px' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            style={{ background: 'transparent', borderBottom: 'none', fontSize: '15px' }}
          />
        </div>

        <div>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer', color: '#ffffff' }}>
                <Avatar style={{ backgroundColor: '#81c784' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500, color: '#ffffff' }}>
                  {user.name || user.login}
                </span>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="link" style={{ color: '#ffffff' }} onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button
                type="primary"
                style={{ backgroundColor: '#2e7d32', borderColor: '#2e7d32' }}
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </Space>
          )}
        </div>
      </Header>

      <Content style={{ flex: 1, background: '#f1f8e9' }}>
        <div style={{ minHeight: 'calc(100vh - 134px)' }}>{children}</div>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: '#1b5e20',
          color: '#ffffff',
          padding: '20px 50px',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '18px', marginRight: '6px' }}>🌱</span>
          <strong>Happy Farm Tree Ecosystem Management System</strong>
        </div>
        <div style={{ opacity: 0.8, fontSize: '13px' }}>
          ©{new Date().getFullYear()} Happy Farm Corp. Built with React & Ant Design.
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
