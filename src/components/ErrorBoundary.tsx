import React, { Component, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <Result
                    status="error"
                    title="Đã xảy ra lỗi"
                    subTitle={this.state.error?.message ?? 'Unknown error'}
                    extra={
                        <Button onClick={this.handleReset}>Thử lại</Button>
                    }
                />
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
