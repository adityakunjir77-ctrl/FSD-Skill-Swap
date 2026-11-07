import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import API from '../services/api';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

// Dev-only shortcuts for the seeded demo users, stripped from production builds
const DEMO_ACCOUNTS = import.meta.env.DEV
  ? [
      {
        name: 'Alex',
        email: 'alex@example.com',
        password: 'password123',
        role: 'Dev (React)',
      },
      {
        name: 'Priya',
        email: 'priya@example.com',
        password: 'password123',
        role: 'AI (Python)',
      },
    ]
  : [];

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginState } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setErrorMsg('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuickFill = (acc) => {
    setErrorMsg('');
    setFormData({ email: acc.email, password: acc.password });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/auth/login', formData);
      loginState(res.data.data.user, res.data.data.token);
      success('Welcome back to SkillSwap!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
      error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-medium text-display-md sm:text-display-lg tracking-[-0.025em] text-ink-primary">
          Sign In
        </h1>
        <p className="text-base text-ink-secondary mt-2">
          Access your skill exchanges, sessions, and messages
        </p>
      </div>

      {/* Demo Account Quick-Fill Avatar Chips */}
      {DEMO_ACCOUNTS.length > 0 && (
        <div className="mb-8 py-3 border-y border-canvas-border">
          <div className="text-sm font-heading font-semibold text-ink-secondary mb-2.5 flex items-center justify-between">
            <span>Try a demo account:</span>
            <span className="text-ink-muted text-xs font-normal">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = formData.email === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className={`flex items-center gap-2 p-1.5 rounded-button border text-left transition-colors ${
                    isSelected
                      ? 'bg-canvas-card border-ink-primary shadow-[inset_0_-2px_0_#0F766E]'
                      : 'bg-transparent border-canvas-border-dark hover:bg-canvas-card hover:border-ink-primary'
                  }`}
                >
                  <Avatar name={acc.name} size="xs" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-heading font-semibold text-ink-primary truncate">
                      {acc.name}
                    </div>
                    <div className="text-xs text-ink-muted truncate">
                      {acc.role}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-5 py-2.5 px-3 bg-status-danger-bg border-l-2 border-status-danger rounded-button text-sm text-status-danger font-medium" role="alert">
          {errorMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="alex@example.com"
              className="w-full pl-9 pr-3.5 py-3 bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-[15px] text-ink-primary placeholder-ink-muted focus-ring transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-heading font-semibold text-ink-primary">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-3 bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-[15px] text-ink-primary placeholder-ink-muted focus-ring transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-ink-muted hover:text-ink-primary absolute right-2.5 top-1/2 -translate-y-1/2 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-sm text-ink-secondary">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="link-accent ml-1"
        >
          Register for free
        </Link>
      </div>
    </div>
  );
}
