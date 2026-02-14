import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-[var(--color-notebook-bg)] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <h1 className="text-lg font-medium text-[var(--color-notebook-text)] mb-2">Something went wrong</h1>
            <p className="text-sm text-[var(--color-notebook-muted)] mb-4">
              An unexpected error occurred. Your data is safe in local storage.
            </p>
            <button
              className="px-4 py-2 text-sm bg-[var(--color-notebook-accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
