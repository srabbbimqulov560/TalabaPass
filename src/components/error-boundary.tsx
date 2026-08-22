import { Component, ReactNode } from 'react';
export class ErrorBoundary extends Component<{children: ReactNode, resetKey?: any}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidUpdate(prevProps: any) {
    if (this.props.resetKey !== prevProps.resetKey) this.setState({ hasError: false });
  }
  render() { 
    if (this.state.hasError) return <div>Xatolik yuz berdi. Sahifani yangilang.</div>;
    return this.props.children; 
  }
}