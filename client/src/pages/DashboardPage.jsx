import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecommendedMatches } from '../services/skillService';
import { getUserSessions } from '../services/sessionService';
import { getUserExchanges } from '../services/exchangeService';
import { Link, useNavigate } from 'react-router-dom';
import SwapCard from '../components/ui/SwapCard';
import StatTile from '../components/ui/StatTile';
import Button from '../components/ui/Button';
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
    <div className="space-y-6">
      {/* 1. GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-canvas-border">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Here is your skill exchange activity and reciprocal matches for today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/discover">
            <Button variant="secondary" size="sm" icon={Compass}>
              Explore Directory
            </Button>
          </Link>
          <Link to="/matches">
            <Button variant="coral" size="sm" icon={Sparkles}>
              Find Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. COMPACT STAT STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Matches & Attention */}
        <div className="lg:col-span-8 space-y-6">
          {/* NEEDS YOUR ATTENTION (if any pending requests) */}
          {pendingRequests.length > 0 && (
            <div className="bg-canvas-card border border-[#FED7CE] rounded-card p-5 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-brand-coral font-heading font-semibold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Needs your reply ({pendingRequests.length})</span>
                </div>
                <Link
                  to="/requests"
                  className="text-xs font-heading font-semibold text-brand-teal hover:underline"
                >
                  View all requests →
                </Link>
              </div>

              <div className="space-y-2.5">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-3 bg-white border border-canvas-border rounded-button flex items-center justify-between gap-3 text-xs"
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

                    <Link to="/requests">
                      <Button variant="primary" size="sm">
                        Respond
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BEST MATCHES */}
          <div className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-canvas-border mb-4">
              <div>
                <h2 className="font-heading font-bold text-base text-ink-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-teal" />
                  Your Best Reciprocal Matches
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Complementary peers paired automatically by your skill preferences.
                </p>
              </div>

              <Link
                to="/matches"
                className="text-xs font-heading font-semibold text-brand-teal hover:text-brand-teal-hover flex items-center gap-1"
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
        <div className="lg:col-span-4 space-y-6">
          {/* UPCOMING SESSIONS */}
          <div className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-canvas-border mb-3">
              <h2 className="font-heading font-bold text-sm text-ink-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-teal" />
                Upcoming Sessions
              </h2>
              <Link
                to="/sessions"
                className="text-xs font-heading font-semibold text-brand-teal hover:underline"
              >
                View Agenda
              </Link>
            </div>

            {loading ? (
              <Skeleton variant="text" count={3} />
            ) : sessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-ink-muted">
                <Calendar className="w-8 h-8 text-canvas-border-dark mx-auto mb-2" strokeWidth={1.5} />
                No learning sessions booked yet.
                <div className="mt-2">
                  <Link
                    to="/requests"
                    className="text-brand-teal font-semibold hover:underline"
                  >
                    Schedule via accepted requests →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((ses) => (
                  <div
                    key={ses._id}
                    className="p-3 bg-canvas-subtle/70 border border-canvas-border rounded-button text-xs"
                  >
                    <div className="font-heading font-semibold text-ink-primary truncate">
                      {ses.topic}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-ink-secondary text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-brand-teal" />
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
          <div className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft">
            <h2 className="font-heading font-bold text-sm text-ink-primary mb-3">
              Quick Shortcuts
            </h2>
            <div className="space-y-2">
              <Link
                to="/discover"
                className="w-full flex items-center justify-between p-2.5 rounded-button bg-canvas-subtle hover:bg-canvas-border/50 text-xs font-heading font-semibold text-ink-primary transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-brand-teal" />
                  <span>Search Skill Catalog</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
              </Link>

              <Link
                to="/matches"
                className="w-full flex items-center justify-between p-2.5 rounded-button bg-canvas-subtle hover:bg-canvas-border/50 text-xs font-heading font-semibold text-ink-primary transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-coral" />
                  <span>Review Compatibility Scores</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
              </Link>

              <Link
                to="/profile"
                className="w-full flex items-center justify-between p-2.5 rounded-button bg-canvas-subtle hover:bg-canvas-border/50 text-xs font-heading font-semibold text-ink-primary transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4 text-brand-teal" />
                  <span>Add Skills to Profile</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
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
