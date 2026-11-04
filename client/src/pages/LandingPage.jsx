import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import SwapCard from '../components/ui/SwapCard';
import {
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  ArrowRightLeft,
  Calendar,
  Star,
  CheckCircle2,
} from 'lucide-react';

const STATIC_CATEGORIES = [
  { name: 'Programming', count: 18 },
  { name: 'UI/UX Design', count: 12 },
  { name: 'Languages', count: 15 },
  { name: 'Web Development', count: 24 },
  { name: 'Machine Learning', count: 9 },
  { name: 'Photography', count: 7 },
  { name: 'Graphic Design', count: 11 },
  { name: 'Music', count: 6 },
  { name: 'Public Speaking', count: 8 },
  { name: 'Mobile Development', count: 10 },
  { name: 'Video Editing', count: 8 },
  { name: 'Business', count: 7 },
];

export default function LandingPage() {
  const [categories, setCategories] = useState(STATIC_CATEGORIES);

  useEffect(() => {
    API.get('/skills/categories')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Demo users for the Hero SwapCard
  const alexUser = {
    _id: 'demo-alex',
    name: 'Alex Morgan',
    headline: 'Frontend Engineer',
    bio: 'Experienced React developer passionate about functional UI components and state machines.',
    experienceLevel: 'Advanced',
    location: 'Remote',
    averageRating: 4.9,
    totalReviews: 8,
    skillsOffered: ['React', 'Node.js'],
  };

  const priyaUser = {
    _id: 'demo-priya',
    name: 'Priya Patel',
    headline: 'AI Researcher',
    bio: 'Specialist in Python, ML workflows, and LLM prompt engineering. Looking to level up frontend skills.',
    experienceLevel: 'Expert',
    location: 'Remote',
    averageRating: 5.0,
    totalReviews: 12,
    skillsOffered: ['Python', 'Machine Learning'],
  };

  return (
    <div className="bg-canvas text-ink-primary overflow-hidden">
      {/* 1. SPLIT HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-canvas-border bg-gradient-to-b from-brand-teal-surface/30 to-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teach-bg text-teach-text border border-teach-border text-xs font-heading font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                <span>Non-monetary reciprocal learning</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-ink-primary tracking-tight leading-[1.12]">
                Teach one thing. <br />
                <span className="text-brand-teal">Learn another.</span>
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary max-w-xl leading-relaxed">
                SkillSwap pairs you with peers for direct 1-on-1 knowledge exchange. Master a new discipline by sharing what you already know best — 100% free.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register">
                  <Button
                    variant="coral"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    Get Started Free
                  </Button>
                </Link>

                <Link to="/discover">
                  <Button variant="secondary" size="lg" icon={Compass}>
                    Browse Skills
                  </Button>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="pt-4 flex items-center gap-6 text-xs text-ink-secondary">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>No credit card needed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" />
                  <span>Verified peer reviews</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive SwapCard Preview */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md relative">
                {/* Visual accent backdrop */}
                <div className="absolute -inset-1.5 rounded-card bg-brand-teal/10 -z-10 rotate-1 transform" />

                <SwapCard
                  currentUser={alexUser}
                  partnerUser={priyaUser}
                  compatibilityScore={100}
                  isReciprocal={true}
                  isBestMatch={true}
                  youCanTeach={['React', 'Node.js']}
                  theyCanTeach={['Python', 'Machine Learning']}
                  onProposeSwap={() => {}}
                  onViewProfile={() => {}}
                />

                <div className="mt-3 text-center text-xs text-ink-muted">
                  Live preview: 100% reciprocal match between complementary skills
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUIET STATS STRIP */}
      <section className="py-8 bg-white border-b border-canvas-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary">
                100%
              </div>
              <div className="text-xs text-ink-muted mt-0.5">Non-Monetary Trade</div>
            </div>
            <div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-brand-teal">
                1-on-1
              </div>
              <div className="text-xs text-ink-muted mt-0.5">Direct Peer Sessions</div>
            </div>
            <div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-brand-coral">
                Socket.io
              </div>
              <div className="text-xs text-ink-muted mt-0.5">Real-Time Chat & Alerts</div>
            </div>
            <div>
              <div className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary">
                Verified
              </div>
              <div className="text-xs text-ink-muted mt-0.5">Community Reputation</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS: Horizontal 4-step path connected by a dotted line */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary">
            How SkillSwap Works
          </h2>
          <p className="text-sm text-ink-secondary mt-2">
            A clear, four-step path designed for reciprocal collaboration.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Dotted Line on Desktop */}
          <div className="hidden lg:block absolute top-8 left-16 right-16 h-0.5 border-t-2 border-dashed border-canvas-border -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {[
              {
                step: '01',
                title: 'Create Profile',
                desc: 'List the skills you have mastered and the skills you are eager to learn.',
                icon: Users,
              },
              {
                step: '02',
                title: 'Get Matched',
                desc: 'Our engine identifies complementary peers who want what you offer and vice versa.',
                icon: ArrowRightLeft,
              },
              {
                step: '03',
                title: 'Swap & Learn',
                desc: 'Schedule 1-on-1 sessions, prepare topics, and chat live in real-time.',
                icon: Calendar,
              },
              {
                step: '04',
                title: 'Rate & Build Trust',
                desc: 'Conclude exchanges, share feedback, and build your verified reputation score.',
                icon: Star,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-canvas-card border border-canvas-border rounded-card p-6 shadow-soft flex flex-col items-center text-center relative"
                >
                  <div className="w-12 h-12 rounded-full bg-teach-bg text-brand-teal border border-teach-border flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-[11px] font-heading font-bold text-brand-coral uppercase tracking-wider mb-1">
                    Step {item.step}
                  </span>
                  <h3 className="font-heading font-semibold text-base text-ink-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CATEGORIES AS AN IRREGULAR CHIP CLOUD */}
      <section className="py-16 bg-white border-t border-canvas-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary">
              Explore Skills by Category
            </h2>
            <p className="text-sm text-ink-secondary mt-1.5">
              From web development to language tutoring, find members ready to trade expertise.
            </p>
          </div>

          {/* Chip Cloud */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
            {categories.map((cat, idx) => (
              <Link
                key={cat.name || idx}
                to={`/discover?category=${encodeURIComponent(cat.name)}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-canvas-border bg-canvas-subtle hover:bg-teach-bg hover:border-teach-border hover:text-teach-text transition-colors duration-150 text-xs sm:text-sm font-heading font-medium text-ink-secondary group"
              >
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white border border-canvas-border text-ink-muted group-hover:border-teach-border group-hover:text-teach-text">
                    {cat.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/discover">
              <Button variant="secondary" size="md">
                Browse Full Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
