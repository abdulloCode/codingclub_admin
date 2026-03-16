import React, { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export class ApiErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console for debugging
    console.error('API Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null }, () => {
      window.location.reload();
    });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} className="text-red-600 dark:text-red-400" />
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Server bilan bog'lanishda xatolik
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                Backend server ishlamayapti yoki ma'lumotlarni yuklashda xatolik yuz berdi.
                Internet bilan bog'lanishingizni tekshiring va qayta urinib ko'ring.
              </p>

              {/* Error Details (for debugging) */}
              {this.state.error && (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    {this.state.error.message || 'Noma\'lum xatolik'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                >
                  <RefreshCw size={18} />
                  Qayta urinish
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-xl font-semibold transition-colors"
                >
                  <Home size={18} />
                  Bosh sahifaga qaytish
                </button>
              </div>

              {/* Additional Help */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Agar muammo davom etsa, administrator bilan bog'laning.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;
