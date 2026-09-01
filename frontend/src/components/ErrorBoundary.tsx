'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to error reporting service (Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Une erreur est survenue
            </h1>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-600 mb-6">
              Désolé, quelque chose s'est mal passé. Nos équipes ont été notifiées et travaillent sur une solution.
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-2">
                  Détails techniques
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-auto max-h-40 text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="flex-1"
              >
                Réessayer
              </Button>
              <Button
                variant="primary"
                onClick={this.handleReload}
                className="flex-1"
              >
                Recharger la page
              </Button>
            </div>

            {/* Support Link */}
            <p className="mt-6 text-xs text-gray-500 dark:text-gray-500">
              Si le problème persiste, contactez le support technique.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
