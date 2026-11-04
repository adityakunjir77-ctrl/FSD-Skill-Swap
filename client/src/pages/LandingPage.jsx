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
      {/* 1. HERO: the swap, set as type */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-ink-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-8 md:mb-10">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" strokeWidth={1.75} />
              <span>Non-monetary reciprocal learning</span>
            </span>
          </p>

          <h1 className="font-display font-medium text-display-xl text-ink-primary tracking-[-0.035em]">
            <span className="block motion-safe:animate-swap-left">Teach one thing.</span>
            <span className="block pl-[12%] md:pl-[30%] motion-safe:animate-swap-right">
              Learn another.
            </span>
          </h1>

          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 border-t border-canvas-border pt-10">
            {/* Left Column: Standfirst & CTAs */}
            <div className="lg:col-span-5 space-y-7 text-left">
              <p className="font-display text-title sm:text-[1.5rem] leading-snug text-ink-secondary max-w-xl">
                SkillSwap pairs you with peers for direct 1-on-1 knowledge exchange. Master a new discipline by sharing what you already know best — 100% free.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-button bg-ink-primary border border-ink-primary text-white text-base font-heading font-semibold hover:bg-brand-teal-dark hover:border-brand-teal-dark transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </Link>
                <Link
                  to="/discover"
                  className="inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-button border border-ink-primary text-ink-primary text-base font-heading font-semibold hover:bg-ink-primary hover:text-white transition-colors"
                >
                  <Compass className="w-4 h-4" strokeWidth={1.75} />
                  Browse Skills
                </Link>
              </div>

              {/* Trust signals */}
              <div className="pt-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-secondary">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" strokeWidth={1.75} />
                  <span>No credit card needed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-teal" strokeWidth={1.75} />
                  <span>Verified peer reviews</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live SwapCard preview, set as a captioned figure */}
            <figure className="lg:col-span-6 lg:col-start-7">
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
                className="max-w-xl"
              />
              <figcaption className="mt-3 pt-2 border-t border-canvas-border max-w-xl text-sm text-ink-muted font-display italic">
                Live preview: 100% reciprocal match between complementary skills
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 2. QUIET STATS STRIP */}
      <section className="border-b border-canvas-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: '100%', label: 'Non-Monetary Trade' },
              { value: '1-on-1', label: 'Direct Peer Sessions' },
              { value: 'Socket.io', label: 'Real-Time Chat & Alerts' },
              { value: 'Verified', label: 'Community Reputation' },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className={`py-7 px-4 sm:px-6 ${idx % 2 === 1 ? 'border-l' : ''} ${
                  idx > 0 ? 'md:border-l' : ''
                } ${idx > 1 ? 'border-t md:border-t-0' : ''} border-canvas-border`}
              >
                <dd className="font-display font-medium text-display-sm sm:text-display-md text-ink-primary tracking-[-0.02em]">
                  {stat.value}
                </dd>
                <dt className="text-sm text-ink-muted mt-1">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3. HOW IT WORKS: a real four-step sequence */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <h2 className="font-display font-medium text-display-md sm:text-display-lg text-ink-primary tracking-[-0.025em]">
                How SkillSwap Works
              </h2>
              <p className="text-base text-ink-secondary mt-4 max-w-sm leading-relaxed">
                A clear, four-step path designed for reciprocal collaboration.
              </p>
            </div>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6 border-t border-ink-primary">
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
            ].map((item) => (
              <li
                key={item.step}
                className="grid grid-cols-[4.5rem_1fr] sm:grid-cols-[6rem_1fr] gap-4 py-7 border-b border-canvas-border"
              >
                <span className="chapter-num text-display-md leading-none" aria-hidden="true">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-display font-medium text-display-sm text-ink-primary">
                    <span className="sr-only">Step {item.step}: </span>
                    {item.title}
                  </h3>
                  <p className="text-base text-ink-secondary mt-2 leading-relaxed max-w-lg">
                    {item.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. CATEGORIES: an index of disciplines */}
      <section className="py-16 sm:py-20 border-t border-ink-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10">
            <h2 className="lg:col-span-6 font-display font-medium text-display-md sm:text-display-lg text-ink-primary tracking-[-0.025em]">
              Explore Skills by Category
            </h2>
            <p className="lg:col-span-5 lg:col-start-8 self-end text-base text-ink-secondary leading-relaxed">
              From web development to language tutoring, find members ready to trade expertise.
            </p>
          </div>

          {/* Category index */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-canvas-border">
            {categories.map((cat, idx) => (
              <li key={cat.name || idx} className="border-b border-canvas-border">
                <Link
                  to={`/discover?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-baseline justify-between gap-4 py-4 pr-4 sm:pr-8 font-display text-title text-ink-primary hover:text-brand-teal transition-colors"
                >
                  <span className="group-hover:underline decoration-1 underline-offset-4">{cat.name}</span>
                  {cat.count !== undefined && (
                    <span className="font-heading text-sm text-ink-muted numerals">
                      {cat.count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Link
              to="/discover"
              className="inline-flex items-center justify-center h-10 px-5 rounded-button border border-ink-primary text-ink-primary text-sm font-heading font-semibold hover:bg-ink-primary hover:text-white transition-colors"
            >
              Browse Full Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
