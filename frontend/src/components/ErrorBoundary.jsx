import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Keep the error visible in DevTools too.
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-[50vh] rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-100">
        <h2 className="text-lg font-bold">UI Error</h2>
        <p className="mt-2 text-sm opacity-90">
          The frontend crashed while rendering. The error details are shown below.
        </p>
        <pre className="mt-4 overflow-auto rounded-lg bg-white/70 p-4 text-xs text-red-900 dark:bg-black/30 dark:text-red-100">
          {(this.state.error && this.state.error.toString()) || 'Unknown error'}
          {'\n'}
          {(this.state.errorInfo && this.state.errorInfo.componentStack) || ''}
        </pre>
      </div>
    );
  }
}

export default ErrorBoundary;

