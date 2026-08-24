import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await login(values.username, values.password);
      message.success(`Welcome back, ${user.name || user.login}!`);
      if (user.authorities?.includes('ROLE_ADMIN')) {
        navigate('/admin/habitats');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.title;
      setErrorMsg(detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#e8f5e9',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '1000px',
          maxWidth: '100%',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '550px' }}>
          {/* Left branding panel */}
          <div
            style={{
              flex: '1 1 450px',
              background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
              color: '#ffffff',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '72px', marginBottom: '16px' }}>🌳</span>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Happy Farm
            </Title>
            <Text
              style={{
                color: '#e8f5e9',
                fontSize: '16px',
                marginTop: '12px',
                display: 'block',
                maxWidth: '300px',
              }}
            >
              Explore and manage the rich diversity of the tree ecosystem. Grow knowledge, connect
              habitats.
            </Text>
            <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                style={{ color: '#e8f5e9' }}
                onClick={() => navigate('/')}
              >
                Back to main page
              </Button>
            </div>
          </div>

          {/* Right form panel */}
          <div
            style={{
              flex: '1 1 450px',
              padding: '50px 40px',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ marginBottom: '32px' }}>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1b5e20' }}>
                Sign In
              </Title>
              <Text type="secondary">Access your Happy Farm account</Text>
            </div>

            {errorMsg && (
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                style={{ marginBottom: '24px', borderRadius: '8px' }}
              />
            )}

            <Form
              name="login_form"
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Please enter your username!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Username"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                  { min: 4, message: 'Password must be at least 4 characters!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Password"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    backgroundColor: '#2e7d32',
                    borderColor: '#2e7d32',
                    height: '46px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Text type="secondary">Don't have an account? </Text>
                <Link to="/register" style={{ color: '#2e7d32', fontWeight: 600 }}>
                  Register here
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
