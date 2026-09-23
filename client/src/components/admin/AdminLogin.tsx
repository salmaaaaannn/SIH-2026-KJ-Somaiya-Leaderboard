import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../utils/api';

interface AdminLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('admin@somaiya.edu');
  const [password, setPassword] = useState<string>('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let errorMsg = 'Failed to authenticate.';
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status}). Please verify server is running.`);
      }

      if (data?.token && data?.user) {
        login(data.token, data.user);
        onSuccess();
      } else {
        throw new Error('Authentication response was incomplete.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-10 relative overflow-hidden"
      >
        {/* Top Somaiya Accent line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-somaiya-700 via-amber-500 to-somaiya-700" />

        {/* Back Link */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Live Leaderboard</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-somaiya-50 text-somaiya-700 border border-somaiya-200 mx-auto flex items-center justify-center shadow-xs mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight">
            Judge &amp; Admin Portal
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            K J Somaiya Institute of Management — SIH 2026 Control
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Somaiya Institutional Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="judge@somaiya.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-somaiya-600 focus:ring-2 focus:ring-somaiya-100 text-sm outline-none transition-all text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Secure Access Key / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 focus:bg-white rounded-xl border border-gray-200 focus:border-somaiya-600 focus:ring-2 focus:ring-somaiya-100 text-sm outline-none transition-all text-gray-900 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-somaiya-700 hover:bg-somaiya-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying Credentials...
              </span>
            ) : (
              <span>Authenticate &amp; Enter</span>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Pill */}
        <div className="mt-8 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-center">
          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Demo Credentials
          </div>
          <div className="text-xs text-gray-700 font-mono">
            <strong>admin@somaiya.edu</strong> / <strong>admin123</strong>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
