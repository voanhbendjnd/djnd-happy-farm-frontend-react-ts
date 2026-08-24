import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import type { RegisterData } from '../types';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: {
    login: string;
    name: string;
    email: string;
    password: string;
    confirm: string;
  }) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const registerData: RegisterData = {
        login: values.login.trim().toLowerCase(),
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        langKey: 'en',
      };
      await register(registerData);
      message.success('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.title;
      setErrorMsg(
        detail || 'Registration failed. Please check if the username or email is already taken.'
      );
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
          {/* Left panel */}
          <div
            style={{
              flex: '1 1 450px',
              background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
              color: '#ffffff',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '72px', marginBottom: '16px' }}>🌱</span>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Join Happy Farm
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
              Create an account to start cataloging species and participating in the ecosystem.
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
              padding: '40px',
              background: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ marginBottom: '24px' }}>
              <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#2e7d32' }}>
                Create Account
              </Title>
              <Text type="secondary">Sign up today and get started</Text>
            </div>

            {errorMsg && (
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                style={{ marginBottom: '20px', borderRadius: '8px' }}
              />
            )}

            <Form name="register_form" layout="vertical" onFinish={onFinish} size="large">
              <Form.Item
                name="login"
                label="Username"
                rules={[
                  { required: true, message: 'Please enter a username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' },
                  {
                    pattern: /^[a-zA-Z0-9_]*$/,
                    message: 'Alphanumeric characters and underscores only!',
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Username"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="name"
                label="Full Name"
                rules={[
                  { required: true, message: 'Please enter your full name!' },
                  { max: 50, message: 'Cannot exceed 50 characters!' },
                ]}
              >
                <Input
                  prefix={<EditOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Full Name"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Email Address"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter a password!' },
                  { min: 4, message: 'Password must be at least 4 characters!' },
                  { max: 100, message: 'Cannot exceed 100 characters!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Password"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                  placeholder="Confirm Password"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: '12px' }}>
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
                  Create Account
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Text type="secondary">Already have an account? </Text>
                <Link to="/login" style={{ color: '#2e7d32', fontWeight: 600 }}>
                  Sign In
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
