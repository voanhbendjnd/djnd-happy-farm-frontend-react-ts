import React, { useState } from 'react';
import {
    Layout,
    Menu,
    Button,
    Dropdown,
    Space,
    Avatar,
    Typography,
} from 'antd';

import {
    UserOutlined,
    LogoutOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    ClusterOutlined,
    ExperimentOutlined,
    BranchesOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    BugOutlined,
    MedicineBoxOutlined,
    SafetyCertificateOutlined,
    DeploymentUnitOutlined,
} from '@ant-design/icons';

import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

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

    // ================================
    // ADMIN MENU
    // ================================
    const menuItems = [
        {
            key: 'plant-management',
            label: 'Plant Management',
            type: 'group' as const,
            children: [
                {
                    key: '/admin/habitats',
                    icon: <EnvironmentOutlined />,
                    label: 'Habitats',
                },
                {
                    key: '/admin/taxonomies',
                    icon: <ClusterOutlined />,
                    label: 'Taxonomies',
                },
                {
                    key: '/admin/plantParts',
                    icon: <BranchesOutlined />,
                    label: 'Plant Parts',
                },
            ],
        },

        {
            key: 'pest-disease',
            label: 'Pest & Disease',
            type: 'group' as const,
            children: [
                {
                    key: '/admin/pests',
                    icon: <BugOutlined />,
                    label: 'Pests',
                },
                {
                    key: '/admin/pestSymptoms',
                    icon: <SafetyCertificateOutlined />,
                    label: 'Pest Symptoms',
                },
                {
                    key: '/admin/diseases',
                    icon: <MedicineBoxOutlined />,
                    label: 'Diseases',
                },
                {
                    key: '/admin/treatments',
                    icon: <ExperimentOutlined />,
                    label: 'Treatments',
                },
            ],
        },

        {
            key: 'plant-care',
            label: 'Plant Care',
            type: 'group' as const,
            children: [
                {
                    key: '/admin/fertilizers',
                    icon: <ExperimentOutlined />,
                    label: 'Fertilizers',
                },
                {
                    key: '/admin/propagations',
                    icon: <DeploymentUnitOutlined />,
                    label: 'Propagations',
                },
            ],
        },
    ];

    // ================================
    // USER MENU
    // ================================
    const userMenuItems = [
        {
            key: 'profile-info',
            label: (
                <div style={{ padding: '4px 8px' }}>
                    <strong>
                        {user?.name || user?.login}
                    </strong>

                    <div
                        style={{
                            fontSize: '12px',
                            color: '#8c8c8c',
                        }}
                    >
                        {user?.email}
                    </div>

                    <div
                        style={{
                            fontSize: '10px',
                            color: '#52c41a',
                            marginTop: '4px',
                            fontWeight: 'bold',
                        }}
                    >
                        ADMINISTRATOR
                    </div>
                </div>
            ),
            disabled: true,
        },

        {
            type: 'divider' as const,
        },

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

    // ================================
    // PAGE TITLES
    // ================================
    const PAGE_TITLES: Record<string, string> = {
        '/admin/habitats': 'Habitat Management',
        '/admin/taxonomies': 'Taxonomy Management',
        '/admin/plantParts': 'Plant Part Management',

        '/admin/pests': 'Pest Management',
        '/admin/pestSymptoms': 'Pest Symptom Management',
        '/admin/diseases': 'Disease Management',
        '/admin/treatments': 'Treatment Management',

        '/admin/fertilizers': 'Fertilizer Management',
        '/admin/propagations': 'Propagation Management',
    };

    // ================================
    // SELECTED MENU
    // ================================
    const selectedKey =
        Object.keys(PAGE_TITLES).find((key) =>
            location.pathname.startsWith(key)
        ) ?? '/admin/habitats';

    const pageTitle =
        PAGE_TITLES[selectedKey] ?? 'Admin';

    // ================================
    // MENU CLICK
    // ================================
    const handleMenuClick = ({
                                 key,
                             }: {
        key: string;
    }) => {
        if (key.startsWith('/admin/')) {
            navigate(key);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>

            {/* =================================
                SIDEBAR
            ================================= */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                style={{
                    background: '#0a3613',
                }}
            >
                {/* LOGO */}
                <div
                    style={{
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed
                            ? 'center'
                            : 'flex-start',
                        paddingLeft: collapsed
                            ? 0
                            : '20px',
                        borderBottom:
                            '1px solid #144d20',
                    }}
                >
                    <span
                        style={{
                            fontSize: '24px',
                            marginRight: collapsed
                                ? 0
                                : '8px',
                        }}
                    >
                        🌳
                    </span>

                    {!collapsed && (
                        <span
                            style={{
                                color: '#ffffff',
                                fontSize: '16px',
                                fontWeight: 'bold',
                            }}
                        >
                            Happy Farm Admin
                        </span>
                    )}
                </div>

                {/* MENU */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        background: 'transparent',
                        marginTop: '8px',
                    }}
                />
            </Sider>

            {/* =================================
                MAIN LAYOUT
            ================================= */}
            <Layout>

                {/* HEADER */}
                <Header
                    style={{
                        background: '#ffffff',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow:
                            '0 1px 4px rgba(0,21,41,0.08)',
                        zIndex: 10,
                    }}
                >
                    {/* LEFT HEADER */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Button
                            type="text"
                            icon={
                                collapsed ? (
                                    <MenuUnfoldOutlined />
                                ) : (
                                    <MenuFoldOutlined />
                                )
                            }
                            onClick={() =>
                                setCollapsed(!collapsed)
                            }
                            style={{
                                fontSize: '16px',
                                width: '64px',
                                height: '64px',
                            }}
                        />

                        <Title
                            level={4}
                            style={{
                                margin: 0,
                                fontWeight: 600,
                            }}
                        >
                            {pageTitle}
                        </Title>
                    </div>

                    {/* RIGHT HEADER */}
                    <Space size="large">

                        <Button
                            type="dashed"
                            icon={<HomeOutlined />}
                            onClick={() => navigate('/')}
                            style={{
                                borderColor: '#2e7d32',
                                color: '#2e7d32',
                            }}
                        >
                            Client Portal
                        </Button>

                        <Dropdown
                            menu={{
                                items: userMenuItems,
                            }}
                            placement="bottomRight"
                            arrow
                        >
                            <Space
                                style={{
                                    cursor: 'pointer',
                                }}
                            >
                                <Avatar
                                    style={{
                                        backgroundColor:
                                            '#2e7d32',
                                    }}
                                    icon={
                                        <UserOutlined />
                                    }
                                />

                                <span
                                    style={{
                                        fontWeight: 500,
                                    }}
                                >
                                    {user?.name ||
                                        user?.login}
                                </span>
                            </Space>
                        </Dropdown>

                    </Space>
                </Header>

                {/* =================================
                    CONTENT
                ================================= */}
                <Content
                    style={{
                        margin: '24px',
                        padding: '24px',
                        background: '#ffffff',
                        borderRadius: '8px',
                        minHeight: '280px',
                        boxShadow:
                            '0 2px 8px rgba(0,0,0,0.05)',
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