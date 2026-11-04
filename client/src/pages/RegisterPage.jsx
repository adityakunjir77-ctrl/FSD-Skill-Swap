import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import API from '../services/api';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

const POPULAR_SUGGESTIONS = [
  'React',
  'JavaScript',
  'Python',
  'UI/UX Design',
  'Node.js',
  'Figma',
  'TypeScript',
  'Spanish',
  'French',
  'Photography',
  'Public Speaking',
  'Machine Learning',
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [currentTeachInput, setCurrentTeachInput] = useState('');
  const [currentLearnInput, setCurrentLearnInput] = useState('');
  const [catalogSkills, setCatalogSkills] = useState(POPULAR_SUGGESTIONS);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { loginState } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Load skills catalog suggestions
  useEffect(() => {
    API.get('/skills')
      .then((res) => {
        if (res.data?.data) {
          const names = res.data.data.map((s) => s.name);
          if (names.length > 0) setCatalogSkills(names);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setErrorMsg('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Next = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMsg('Please complete all account fields.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const addTeachSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skillsOffered.includes(trimmed)) {
      setSkillsOffered([...skillsOffered, trimmed]);
      setCurrentTeachInput('');
    }
  };

  const removeTeachSkill = (skill) => {
    setSkillsOffered(skillsOffered.filter((s) => s !== skill));
  };

  const addLearnSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skillsWanted.includes(trimmed)) {
      setSkillsWanted([...skillsWanted, trimmed]);
      setCurrentLearnInput('');
    }
  };

  const removeLearnSkill = (skill) => {
    setSkillsWanted(skillsWanted.filter((s) => s !== skill));
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Register Account
      const regRes = await API.post('/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const token = regRes.data.data.token;
      let finalUser = regRes.data.data.user;

      // Temporarily store token for follow-up profile setup
      localStorage.setItem('token', token);

      // 2. Update profile with offered & wanted skills if provided
      if (skillsOffered.length > 0 || skillsWanted.length > 0) {
        try {
          const profileRes = await API.put(
            '/users/profile',
            {
              skillsOffered,
              skillsWanted,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (profileRes.data?.data) {
            finalUser = profileRes.data.data;
          }
        } catch (profErr) {
          console.warn('[Register] Skills profile update non-fatal error:', profErr);
        }
      }

      loginState(finalUser, token);
      success('Welcome to SkillSwap! Your account is ready.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
      error(msg);
      setStep(1); // Return to first step to fix
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 3-Step Breadcrumb Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 text-sm font-heading font-semibold text-ink-muted mb-2.5">
          <span className={step >= 1 ? 'text-ink-primary' : ''}>1. Account</span>
          <span className={step >= 2 ? 'text-ink-primary' : ''}>2. What I Teach</span>
          <span className={step >= 3 ? 'text-ink-primary' : ''}>3. What I Learn</span>
        </div>
        <div className="h-0.5 w-full bg-canvas-border overflow-hidden">
          <div
            className="h-full bg-brand-teal transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 py-2.5 px-3 bg-status-danger-bg border-l-2 border-status-danger rounded-button text-sm text-status-danger font-medium" role="alert">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Account Credentials */}
      {step === 1 && (
        <div>
          <div className="mb-6">
            <h2 className="font-display font-medium text-display-md tracking-[-0.025em] text-ink-primary">
              Create Your Account
            </h2>
            <p className="text-base text-ink-secondary mt-2">
              Join the reciprocal peer learning community
            </p>
          </div>

          <form onSubmit={handleStep1Next} className="space-y-3.5">
            <div>
              <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-9 pr-3.5 py-3 bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-[15px] text-ink-primary placeholder-ink-muted focus-ring transition-colors"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 chars"
                    className="w-full pl-9 pr-8 py-3 bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-[15px] text-ink-primary placeholder-ink-muted focus-ring transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-ink-muted hover:text-ink-primary absolute right-2 top-1/2 -translate-y-1/2 focus:outline-none"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-9 pr-3.5 py-3 bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-[15px] text-ink-primary placeholder-ink-muted focus-ring transition-colors"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full mt-2"
            >
              Continue to Skills
            </Button>
          </form>

          <div className="mt-6 text-sm text-ink-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="link-accent ml-1"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: What I can teach */}
      {step === 2 && (
        <div>
          <div className="mb-6">
            <h2 className="font-display font-medium text-display-md tracking-[-0.025em] text-ink-primary">
              What can you teach?
            </h2>
            <p className="text-base text-ink-secondary mt-2">
              Add skills you have mastered and are comfortable sharing with peers.
            </p>
          </div>

          {/* Current Selected Tags */}
          <div className="min-h-[52px] p-2.5 bg-canvas-card border border-canvas-border-dark rounded-card mb-4 flex flex-wrap gap-1.5 items-center">
            {skillsOffered.length === 0 ? (
              <span className="text-sm text-ink-muted italic pl-1">
                Select from suggestions below or type custom skills...
              </span>
            ) : (
              skillsOffered.map((sk) => (
                <Pill
                  key={sk}
                  variant="teach"
                  size="sm"
                  onRemove={() => removeTeachSkill(sk)}
                >
                  {sk}
                </Pill>
              ))
            )}
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. Docker, TypeScript, Graphic Design..."
              value={currentTeachInput}
              onChange={(e) => setCurrentTeachInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTeachSkill(currentTeachInput);
                }
              }}
              className="flex-1 min-w-0 px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addTeachSkill(currentTeachInput)}
            >
              Add
            </Button>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <div className="text-sm font-heading font-semibold text-ink-secondary mb-2.5">
              Popular skills to teach:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {catalogSkills.slice(0, 10).map((sk) => {
                const isAdded = skillsOffered.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => (isAdded ? removeTeachSkill(sk) : addTeachSkill(sk))}
                    className={`text-sm px-2.5 py-1 rounded-button border transition-colors flex items-center gap-1.5 ${
                      isAdded
                        ? 'bg-teach-bg text-teach-text border-teach-text font-semibold'
                        : 'bg-transparent text-ink-secondary border-canvas-border-dark hover:border-ink-primary hover:text-ink-primary'
                    }`}
                  >
                    {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{sk}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-ink-primary">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => setStep(3)}
            >
              Next: What I Want to Learn
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: What I want to learn */}
      {step === 3 && (
        <div>
          <div className="mb-6">
            <h2 className="font-display font-medium text-display-md tracking-[-0.025em] text-ink-primary">
              What do you want to learn?
            </h2>
            <p className="text-base text-ink-secondary mt-2">
              Select skills you want community members to teach you.
            </p>
          </div>

          {/* Current Selected Tags */}
          <div className="min-h-[52px] p-2.5 bg-canvas-card border border-canvas-border-dark rounded-card mb-4 flex flex-wrap gap-1.5 items-center">
            {skillsWanted.length === 0 ? (
              <span className="text-sm text-ink-muted italic pl-1">
                Select from suggestions below or type custom skills...
              </span>
            ) : (
              skillsWanted.map((sk) => (
                <Pill
                  key={sk}
                  variant="learn"
                  size="sm"
                  onRemove={() => removeLearnSkill(sk)}
                >
                  {sk}
                </Pill>
              ))
            )}
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. Python, UI Design, Japanese..."
              value={currentLearnInput}
              onChange={(e) => setCurrentLearnInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLearnSkill(currentLearnInput);
                }
              }}
              className="flex-1 min-w-0 px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => addLearnSkill(currentLearnInput)}
            >
              Add
            </Button>
          </div>

          {/* Suggestions */}
          <div className="mb-6">
            <div className="text-sm font-heading font-semibold text-ink-secondary mb-2.5">
              Popular skills to learn:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {catalogSkills.slice(0, 10).map((sk) => {
                const isAdded = skillsWanted.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => (isAdded ? removeLearnSkill(sk) : addLearnSkill(sk))}
                    className={`text-sm px-2.5 py-1 rounded-button border transition-colors flex items-center gap-1.5 ${
                      isAdded
                        ? 'bg-learn-bg text-learn-text border-learn-text font-semibold'
                        : 'bg-transparent text-ink-secondary border-canvas-border-dark hover:border-ink-primary hover:text-ink-primary'
                    }`}
                  >
                    {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span>{sk}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-ink-primary">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setStep(2)}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="coral"
              size="md"
              loading={loading}
              onClick={handleFinalSubmit}
            >
              Complete Registration
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
