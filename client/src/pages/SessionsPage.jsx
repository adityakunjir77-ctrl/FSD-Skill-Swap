import React, { useState, useEffect } from 'react';
import { getUserSessions, updateSessionStatus } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';

export default function SessionsPage() {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getUserSessions();
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      error('Failed to load scheduled sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      const res = await updateSessionStatus(sessionId, newStatus);
      if (res.success) {
        success(`Session marked as ${newStatus}!`);
        fetchSessions();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update session');
    }
  };

  // Group sessions by date relative to today
  const groupSessionsByDate = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const groups = {};

    sessions.forEach((ses) => {
      let groupKey = ses.date;
      if (ses.date === todayStr) {
        groupKey = 'Today';
      } else if (ses.date === tomorrowStr) {
        groupKey = 'Tomorrow';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(ses);
    });

    return groups;
  };

  const groupedSessions = groupSessionsByDate();
  const totalUpcoming = sessions.filter(
    (s) => s.status === 'Accepted' || s.status === 'Proposed'
  ).length;

  // Mini Calendar Helper for current month
  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Find which days have sessions
  const sessionDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.date);
      return d.getMonth() === currentDate.getMonth() ? d.getDate() : null;
    }).filter(Boolean)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 border-b border-ink-primary">
        <div>
          <div className="flex items-baseline gap-3 sm:gap-4">
            <span className="chapter-num text-display-sm sm:text-display-md leading-none" aria-hidden="true">5</span>
            <h1 className="font-display font-medium text-display-sm sm:text-display-md tracking-[-0.02em] text-ink-primary">
              Learning Sessions Agenda
            </h1>
          </div>
          <p className="text-base text-ink-secondary mt-2 max-w-2xl">
            Track scheduled 1-on-1 dates, confirm meeting times, and manage completed sessions.
          </p>
        </div>

        <Link to="/requests" className="btn btn-secondary self-start md:self-auto">
          Schedule via Accepted Swaps
        </Link>
      </div>

      {/* Grid: Main Agenda (8 cols) | Side Calendar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
        {/* Left: Agenda by Date */}
        <div className="lg:col-span-8 space-y-10">
          {loading ? (
            <div className="space-y-4">
              <Skeleton variant="card" count={3} />
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              title="No learning sessions scheduled"
              description="Coordinate with your accepted exchange partners to book your first 1-on-1 study appointment."
              actionLabel="Go to Accepted Requests"
              onAction={() => navigate('/requests')}
            />
          ) : (
            Object.entries(groupedSessions).map(([dateLabel, items]) => (
              <div key={dateLabel} className="space-y-3">
                <div className="flex items-baseline gap-3 pb-2 border-b-2 border-ink-primary">
                  <h2 className="font-display font-medium text-title text-ink-primary">
                    {dateLabel}
                  </h2>
                  <span className="ml-auto text-sm text-ink-muted numerals">
                    {items.length} {items.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                <div className="divide-y divide-canvas-border">
                  {items.map((session) => {
                    const isProposer = session.proposer?._id === currentUser?._id;
                    const partner = isProposer ? session.partner : session.proposer;

                    return (
                      <div
                        key={session._id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Time Badge */}
                          <div className="pr-4 border-r border-canvas-border text-left flex-shrink-0 min-w-[84px]">
                            <div className="font-display font-medium text-title leading-none text-ink-primary numerals">
                              {session.time}
                            </div>
                            <div className="text-xs text-ink-muted mt-1.5 numerals">
                              {session.date}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display font-medium text-lg leading-snug text-ink-primary">
                                {session.topic}
                              </h3>
                              <Pill
                                variant={
                                  session.status === 'Accepted'
                                    ? 'success'
                                    : session.status === 'Proposed'
                                    ? 'warning'
                                    : session.status === 'Completed'
                                    ? 'teach'
                                    : 'danger'
                                }
                                size="xs"
                              >
                                {session.status}
                              </Pill>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-ink-secondary">
                              <Avatar
                                src={partner?.avatar}
                                name={partner?.name}
                                id={partner?._id}
                                size="xs"
                              />
                              <span className="font-medium text-ink-primary">
                                {partner?.name}
                              </span>
                              <span className="text-ink-faint" aria-hidden="true">/</span>
                              <span className="text-ink-muted">
                                {isProposer ? 'You proposed' : 'Proposed to you'}
                              </span>
                            </div>

                            {session.message && (
                              <p className="font-display text-base text-ink-secondary mt-2 italic">
                                "{session.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* State-Based Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center flex-shrink-0 w-full sm:w-auto justify-end">
                          {/* When Proposed to user */}
                          {!isProposer && session.status === 'Proposed' && (
                            <>
                              <Button
                                variant="danger-ghost"
                                size="sm"
                                icon={X}
                                onClick={() => handleStatusChange(session._id, 'Rejected')}
                              >
                                Decline
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={Check}
                                onClick={() => handleStatusChange(session._id, 'Accepted')}
                              >
                                Accept
                              </Button>
                            </>
                          )}

                          {/* When Accepted */}
                          {session.status === 'Accepted' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(session._id, 'Cancelled')}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={CheckCircle2}
                                onClick={() => handleStatusChange(session._id, 'Completed')}
                              >
                                Mark Done
                              </Button>
                            </>
                          )}

                          {/* When Proposed by user */}
                          {isProposer && session.status === 'Proposed' && (
                            <span className="text-sm text-ink-muted italic">
                              Waiting for {partner?.name?.split(' ')[0]} to confirm
                            </span>
                          )}

                          {session.status === 'Completed' && (
                            <span className="text-sm text-status-success font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} /> Session Concluded
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Month Calendar Widget & Overview */}
        <div className="lg:col-span-4 space-y-10">
          {/* Mini Calendar Widget */}
          <div className="section-open">
            <div className="flex items-baseline justify-between pb-3 mb-3">
              <h2 className="font-display font-medium text-title text-ink-primary">
                {currentMonthName}
              </h2>
              <span className="text-sm text-brand-teal font-semibold numerals">
                {totalUpcoming} Upcoming
              </span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-heading font-semibold text-ink-muted mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-7" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === currentDate.getDate();
                const hasSession = sessionDays.has(dayNum);

                return (
                  <div
                    key={dayNum}
                    className={`h-8 flex flex-col items-center justify-center relative font-medium numerals ${
                      isToday
                        ? 'bg-ink-primary text-white font-semibold'
                        : hasSession
                        ? 'text-brand-teal font-semibold shadow-[inset_0_-2px_0_#0F766E]'
                        : 'text-ink-secondary'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasSession && !isToday && (
                      <span className="sr-only"> (session scheduled)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips / Workflow card */}
          <aside className="section-open space-y-3">
            <h3 className="font-display font-medium text-title text-ink-primary">
              Exchange Session Etiquette
            </h3>
            <ul className="text-[15px] text-ink-secondary space-y-2.5 leading-relaxed list-none pl-0 [&>li]:pl-4 [&>li]:border-l [&>li]:border-canvas-border-dark">
              <li>Agree on topics beforehand via the exchange chat.</li>
              <li>Keep learning focused and divide time evenly between teaching and learning.</li>
              <li>Mark sessions complete once finished to update your reputation.</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
