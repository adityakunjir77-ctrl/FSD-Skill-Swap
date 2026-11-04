import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecommendedMatches } from '../services/skillService';
import { getUserSessions } from '../services/sessionService';
import { getUserExchanges } from '../services/exchangeService';
import { Link, useNavigate } from 'react-router-dom';
import SwapCard from '../components/ui/SwapCard';
import StatTile from '../components/ui/StatTile';
import Pill from '../components/ui/Pill';
import Avatar from '../components/ui/Avatar';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import SendExchangeModal from '../components/SendExchangeModal';
import {
  Sparkles,
  ArrowRightLeft,
  Calendar,
  Send,
  Star,
  CheckCircle,
  Clock,
  Compass,
  ArrowRight,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [exchangePartnerModal, setExchangePartnerModal] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [matchesRes, sessionsRes, requestsRes] = await Promise.all([
        getRecommendedMatches(),
        getUserSessions(),
        getUserExchanges(),
      ]);

      if (matchesRes.success) {
        setMatches(matchesRes.data.slice(0, 3));
      }
      if (sessionsRes.success) {
        setSessions(sessionsRes.data.slice(0, 4));
      }
      if (requestsRes.success) {
        // Pending received requests waiting for user's action
        const pending = (requestsRes.data.received || []).filter(
          (r) => r.status === 'Pending'
        );
        setPendingRequests(pending.slice(0, 3));
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const completedExchanges = user?.completedExchanges || 0;
  const ratingValue = user?.averageRating ? user.averageRating.toFixed(1) : '5.0';

  return (
    <div className="space-y-10">
      {/* 1. GREETING HEADER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 border-b border-ink-primary">
        <div>
          <h1 className="font-display font-medium text-display-sm sm:text-display-md tracking-[-0.02em] text-ink-primary">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}
          </h1>
          <p className="text-base text-ink-secondary mt-2">
            Here is your skill exchange activity and reciprocal matches for today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/discover" className="btn btn-secondary">
            <Compass className="w-4 h-4" strokeWidth={1.75} />
            Explore Directory
          </Link>
          <Link to="/matches" className="btn btn-primary">
            <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            Find Matches
          </Link>
        </div>
      </div>

      {/* 2. COMPACT STAT STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-6">
        <StatTile
          label="Skills Offered"
          value={user?.skillsOffered?.length || 0}
          icon={ArrowRightLeft}
          variant="default"
          onClick={() => navigate('/profile')}
        />
        <StatTile
          label="Skills Wanted"
          value={user?.skillsWanted?.length || 0}
          icon={Sparkles}
          variant="amber"
          onClick={() => navigate('/profile')}
        />
        <StatTile
          label="Pending Inbox"
          value={pendingRequests.length}
          icon={Send}
          variant={pendingRequests.length > 0 ? 'coral' : 'default'}
          onClick={() => navigate('/requests')}
        />
        <StatTile
          label="Completed Swaps"
          value={completedExchanges}
          icon={CheckCircle}
          variant="success"
        />
        <StatTile
          label="Reputation"
          value={`${ratingValue} ★`}
          icon={Star}
          variant="amber"
          subtext={`(${user?.totalReviews || 0} reviews)`}
        />
      </div>

      {/* 3. MAIN DASHBOARD SPLIT GRID: Left (Matches + Attention) | Right (Sessions + Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
        {/* Left Column (8 cols): Matches & Attention */}
        <div className="lg:col-span-8 space-y-10">
          {/* NEEDS YOUR ATTENTION (if any pending requests) */}
          {pendingRequests.length > 0 && (
            <div className="border-l-2 border-brand-teal bg-canvas-card pl-5 pr-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 text-ink-primary font-heading font-semibold text-[15px]">
                  <AlertCircle className="w-4 h-4 text-brand-teal" strokeWidth={1.75} />
                  <span>Needs your reply ({pendingRequests.length})</span>
                </div>
                <Link
                  to="/requests"
                  className="text-sm font-heading font-semibold text-brand-teal hover:underline underline-offset-4"
                >
                  View all requests →
                </Link>
              </div>

              <div className="divide-y divide-canvas-border border-t border-canvas-border">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        src={req.sender?.avatar}
                        name={req.sender?.name}
                        id={req.sender?._id}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <span className="font-semibold text-ink-primary">
                          {req.sender?.name}
                        </span>{' '}
                        <span className="text-ink-secondary">
                          wants to swap{' '}
                          <span className="font-medium text-teach-text">
                            {req.offeredSkill}
                          </span>{' '}
                          for your{' '}
                          <span className="font-medium text-learn-text">
                            {req.wantedSkill}
                          </span>
                        </span>
                      </div>
                    </div>

                    <Link to="/requests" className="btn btn-sm btn-primary self-start sm:self-auto">
                      Respond
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BEST MATCHES */}
          <div className="section-open">
            <div className="flex flex-wrap items-end justify-between gap-3 pb-4 mb-5">
              <div>
                <h2 className="font-display font-medium text-display-sm text-ink-primary tracking-[-0.015em]">
                  Your Best Reciprocal Matches
                </h2>
                <p className="text-sm text-ink-secondary mt-1">
                  Complementary peers paired automatically by your skill preferences.
                </p>
              </div>

              <Link
                to="/matches"
                className="text-sm font-heading font-semibold text-brand-teal hover:underline underline-offset-4 flex items-center gap-1"
              >
                All Matches <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton variant="card" count={2} />
              </div>
            ) : matches.length === 0 ? (
              <EmptyState
                title="No direct matches calculated yet"
                description="Add the skills you offer and want to learn on your profile to unlock instant reciprocal pairings."
                actionLabel="Update My Skills Profile"
                onAction={() => navigate('/profile')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matches.slice(0, 2).map((item, idx) => (
                  <SwapCard
                    key={item.user?._id || idx}
                    currentUser={user}
                    partnerUser={item.user}
                    compatibilityScore={item.score}
                    isReciprocal={item.isReciprocal}
                    isBestMatch={idx === 0}
                    youCanTeach={item.youCanTeach}
                    theyCanTeach={item.theyCanTeach}
                    onProposeSwap={(partner) => setExchangePartnerModal(partner)}
                    onViewProfile={(partner) => navigate(`/profile/${partner._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Upcoming Sessions & Quick Actions */}
        <div className="lg:col-span-4 space-y-10">
          {/* UPCOMING SESSIONS */}
          <div className="section-open">
            <div className="flex items-baseline justify-between gap-3 pb-3">
              <h2 className="font-display font-medium text-title text-ink-primary">
                Upcoming Sessions
              </h2>
              <Link
                to="/sessions"
                className="text-sm font-heading font-semibold text-brand-teal hover:underline underline-offset-4"
              >
                View Agenda
              </Link>
            </div>

            {loading ? (
              <Skeleton variant="text" count={3} />
            ) : sessions.length === 0 ? (
              <div className="py-5 border-t border-canvas-border text-sm text-ink-muted">
                <Calendar className="w-6 h-6 text-ink-faint mb-2" strokeWidth={1.5} />
                No learning sessions booked yet.
                <div className="mt-2">
                  <Link
                    to="/requests"
                    className="link-accent"
                  >
                    Schedule via accepted requests →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-canvas-border border-t border-canvas-border">
                {sessions.map((ses) => (
                  <div
                    key={ses._id}
                    className="py-3 text-sm"
                  >
                    <div className="font-display font-medium text-[17px] leading-snug text-ink-primary">
                      {ses.topic}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1.5 text-ink-secondary text-xs numerals">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-teal" strokeWidth={1.75} />
                        {ses.date} at {ses.time}
                      </span>
                      <Pill
                        variant={ses.status === 'Accepted' ? 'success' : 'neutral'}
                        size="xs"
                      >
                        {ses.status}
                      </Pill>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QUICK ACTIONS CARD */}
          <div className="section-open">
            <h2 className="font-display font-medium text-title text-ink-primary mb-2">
              Quick Shortcuts
            </h2>
            <div className="divide-y divide-canvas-border border-t border-canvas-border">
              <Link
                to="/discover"
                className="group w-full flex items-center justify-between py-3 text-[15px] font-heading font-semibold text-ink-primary hover:text-brand-teal transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-brand-teal" />
                  <span>Search Skill Catalog</span>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
              </Link>

              <Link
                to="/matches"
                className="group w-full flex items-center justify-between py-3 text-[15px] font-heading font-semibold text-ink-primary hover:text-brand-teal transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-teal" strokeWidth={1.75} />
                  <span>Review Compatibility Scores</span>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
              </Link>

              <Link
                to="/profile"
                className="group w-full flex items-center justify-between py-3 text-[15px] font-heading font-semibold text-ink-primary hover:text-brand-teal transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-brand-teal" />
                  <span>Add Skills to Profile</span>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-brand-teal group-hover:translate-x-0.5 transition-transform" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Propose Swap Modal */}
      {exchangePartnerModal && (
        <SendExchangeModal
          isOpen={Boolean(exchangePartnerModal)}
          onClose={() => setExchangePartnerModal(null)}
          partnerUser={exchangePartnerModal}
          onSuccess={() => {
            setExchangePartnerModal(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
