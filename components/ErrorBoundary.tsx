import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
                    <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-red-100 dark:border-red-900/30">
                        <div className="bg-red-500 p-6 flex items-center space-x-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-white">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <div>
                                <h1 className="text-xl font-bold text-white">Application Error</h1>
                                <p className="text-red-100 text-sm">Something went wrong in the application UI.</p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-slate-100 dark:bg-black/30 p-4 rounded-lg overflow-auto max-h-60 border border-slate-200 dark:border-slate-700">
                                <code className="text-red-600 dark:text-red-400 font-mono text-sm block mb-2">
                                    {this.state.error && this.state.error.toString()}
                                </code>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-mono">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
