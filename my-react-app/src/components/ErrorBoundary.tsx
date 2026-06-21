import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// กันทั้งแอปจอขาวถ้า component ใด throw — แสดง fallback แทน
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-main p-6 text-center text-text-main">
          <h1 className="text-2xl font-extrabold">เกิดข้อผิดพลาดบางอย่าง</h1>
          <p className="text-text-muted">ขออภัยในความไม่สะดวก กรุณาลองโหลดหน้าใหม่อีกครั้ง</p>
          <button
            onClick={this.handleReload}
            className="cursor-pointer rounded-lg border-0 bg-accent px-6 py-2.5 font-bold text-black transition-opacity hover:opacity-90"
          >
            โหลดหน้าใหม่
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
