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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-canvas-border">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-teal" />
            Learning Sessions Agenda
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Track scheduled 1-on-1 dates, confirm meeting times, and manage completed sessions.
          </p>
        </div>

        <Link to="/requests">
          <Button variant="secondary" size="sm">
            Schedule via Accepted Swaps
          </Button>
        </Link>
      </div>

      {/* Grid: Main Agenda (8 cols) | Side Calendar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Agenda by Date */}
        <div className="lg:col-span-8 space-y-6">
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
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-brand-teal">
                    {dateLabel}
                  </span>
                  <div className="h-px flex-1 bg-canvas-border" />
                  <span className="text-[11px] text-ink-muted">
                    {items.length} {items.length === 1 ? 'session' : 'sessions'}
                  </span>
                </div>

                <div className="space-y-3">
                  {items.map((session) => {
                    const isProposer = session.proposer?._id === currentUser?._id;
                    const partner = isProposer ? session.partner : session.proposer;

                    return (
                      <div
                        key={session._id}
                        className="bg-canvas-card border border-canvas-border rounded-card p-4 sm:p-5 shadow-soft hover:border-canvas-border-dark transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Time Badge */}
                          <div className="px-3 py-2 rounded-button bg-teach-bg text-teach-text border border-teach-border text-center flex-shrink-0 min-w-[70px]">
                            <div className="text-xs font-heading font-bold">
                              {session.time}
                            </div>
                            <div className="text-[10px] text-ink-secondary mt-0.5">
                              {session.date}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-heading font-bold text-sm text-ink-primary truncate">
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

                            <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-secondary">
                              <Avatar
                                src={partner?.avatar}
                                name={partner?.name}
                                id={partner?._id}
                                size="xs"
                              />
                              <span className="font-medium text-ink-primary">
                                {partner?.name}
                              </span>
                              <span>•</span>
                              <span className="text-ink-muted">
                                {isProposer ? 'You proposed' : 'Proposed to you'}
                              </span>
                            </div>

                            {session.message && (
                              <p className="text-xs text-ink-secondary mt-1.5 italic">
                                "{session.message}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* State-Based Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-canvas-border w-full sm:w-auto justify-end">
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
                            <span className="text-xs text-ink-muted italic">
                              Waiting for {partner?.name?.split(' ')[0]} to confirm
                            </span>
                          )}

                          {session.status === 'Completed' && (
                            <span className="text-xs text-status-success font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Session Concluded
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
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Calendar Widget */}
          <div className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft">
            <div className="flex items-center justify-between pb-3 border-b border-canvas-border mb-3">
              <h2 className="font-heading font-bold text-xs text-ink-primary uppercase tracking-wider">
                {currentMonthName}
              </h2>
              <span className="text-[11px] text-brand-teal font-semibold">
                {totalUpcoming} Upcoming
              </span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-heading font-semibold text-ink-muted mb-2">
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
                    className={`h-7 rounded flex flex-col items-center justify-center relative font-medium ${
                      isToday
                        ? 'bg-brand-teal text-white font-bold'
                        : hasSession
                        ? 'bg-teach-bg text-teach-text font-bold'
                        : 'text-ink-secondary'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasSession && !isToday && (
                      <span className="w-1 h-1 rounded-full bg-brand-coral absolute bottom-0.5" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips / Workflow card */}
          <div className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft space-y-3">
            <h3 className="font-heading font-bold text-xs text-ink-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-coral" />
              Exchange Session Etiquette
            </h3>
            <ul className="text-xs text-ink-secondary space-y-2 list-disc list-inside leading-relaxed">
              <li>Agree on topics beforehand via the exchange chat.</li>
              <li>Keep learning focused and divide time evenly between teaching and learning.</li>
              <li>Mark sessions complete once finished to update your reputation.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
