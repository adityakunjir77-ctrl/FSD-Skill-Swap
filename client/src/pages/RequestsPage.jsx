import React, { useState, useEffect } from 'react';
import { getUserExchanges, updateExchangeStatus } from '../services/exchangeService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import ScheduleSessionModal from '../components/ScheduleSessionModal';
import ReviewModal from '../components/ReviewModal';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import Tabs from '../components/ui/Tabs';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ExchangeProgress from '../components/ui/ExchangeProgress';
import {
  Send,
  Check,
  X,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  ArrowRightLeft,
  Quote,
} from 'lucide-react';

export default function RequestsPage() {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent' | 'active' | 'completed' | 'all'

  // Modals
  const [schedulingExchange, setSchedulingExchange] = useState(null);
  const [reviewingExchange, setReviewingExchange] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getUserExchanges();
      if (res.success) {
        setRequests(res.data.all || []);
      }
    } catch (err) {
      error('Failed to load exchange requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (exchangeId, newStatus) => {
    try {
      const res = await updateExchangeStatus(exchangeId, newStatus);
      if (res.success) {
        success(`Exchange marked as ${newStatus}!`);
        fetchRequests();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update request');
    }
  };

  // Counts for tabs
  const receivedPending = requests.filter(
    (r) => r.receiver?._id === currentUser?._id && r.status === 'Pending'
  );
  const sentPending = requests.filter(
    (r) => r.sender?._id === currentUser?._id && r.status === 'Pending'
  );
  const activeExchanges = requests.filter(
    (r) => r.status === 'Accepted' || r.status === 'In Progress'
  );
  const completedExchanges = requests.filter((r) => r.status === 'Completed');

  const filteredRequests = requests.filter((r) => {
    const isReceiver = r.receiver?._id === currentUser?._id;
    const isSender = r.sender?._id === currentUser?._id;

    if (activeTab === 'received') return isReceiver && r.status === 'Pending';
    if (activeTab === 'sent') return isSender && r.status === 'Pending';
    if (activeTab === 'active') {
      return (r.status === 'Accepted' || r.status === 'In Progress') && (isReceiver || isSender);
    }
    if (activeTab === 'completed') return r.status === 'Completed' && (isReceiver || isSender);
    return true; // 'all'
  });

  const tabItems = [
    { id: 'received', label: 'Received Inbox', count: receivedPending.length },
    { id: 'sent', label: 'Sent Requests', count: sentPending.length },
    { id: 'active', label: 'Active Swaps', count: activeExchanges.length },
    { id: 'completed', label: 'Completed', count: completedExchanges.length },
    { id: 'all', label: 'All History', count: requests.length },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-canvas-border">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary flex items-center gap-2">
          <Send className="w-6 h-6 text-brand-teal" />
          Exchange Requests & Lifecycles
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Review incoming proposals, accept swaps, book study sessions, and finalize completed exchanges.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId)}
      />

      {/* Requests Content */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" count={3} />
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} exchange requests`}
          description={
            activeTab === 'received'
              ? 'You have no pending requests waiting for your reply.'
              : activeTab === 'sent'
              ? 'You have not sent any pending exchange proposals.'
              : activeTab === 'active'
              ? 'No active skill exchanges in progress right now.'
              : activeTab === 'completed'
              ? 'No completed skill exchanges logged yet.'
              : 'No exchange requests in your history yet.'
          }
          actionLabel="Find Peers to Swap With"
          onAction={() => navigate('/matches')}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isReceiver = req.receiver?._id === currentUser?._id;
            const partner = isReceiver ? req.sender : req.receiver;

            // What they offer vs what they want
            const offerText = req.offeredSkill;
            const wantText = req.wantedSkill;

            return (
              <div
                key={req._id}
                className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft hover:border-canvas-border-dark transition-all space-y-4"
              >
                {/* Header: Avatars & Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Both Avatars with Two-way motif */}
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={req.sender?.avatar}
                      name={req.sender?.name}
                      id={req.sender?._id}
                      size="md"
                    />
                    <div className="w-6 h-6 rounded-full bg-canvas-subtle border border-canvas-border flex items-center justify-center text-brand-teal flex-shrink-0">
                      <ArrowRightLeft className="w-3 h-3" />
                    </div>
                    <Avatar
                      src={req.receiver?.avatar}
                      name={req.receiver?.name}
                      id={req.receiver?._id}
                      size="md"
                    />

                    <div className="min-w-0 ml-1">
                      <h3 className="font-heading font-bold text-sm text-ink-primary">
                        {isReceiver ? req.sender?.name : 'You'}{' '}
                        <span className="font-normal text-ink-secondary">
                          offered to teach{' '}
                          <span className="font-semibold text-teach-text">
                            {offerText}
                          </span>{' '}
                          for{' '}
                          <span className="font-semibold text-learn-text">
                            {wantText}
                          </span>
                        </span>
                      </h3>
                      <div className="text-[11px] text-ink-muted mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • {isReceiver ? 'Incoming request' : 'Sent by you'}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="self-start sm:self-auto">
                    <Pill
                      variant={
                        req.status === 'Pending'
                          ? 'warning'
                          : req.status === 'Accepted' || req.status === 'In Progress'
                          ? 'success'
                          : req.status === 'Completed'
                          ? 'teach'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {req.status}
                    </Pill>
                  </div>
                </div>

                {/* Personal Intro Message Quote */}
                {req.message && (
                  <div className="p-3 bg-canvas-subtle/80 border-l-2 border-brand-teal rounded-r-button text-xs text-ink-secondary italic flex items-start gap-2">
                    <Quote className="w-3.5 h-3.5 text-brand-teal flex-shrink-0 mt-0.5 not-italic" />
                    <span>"{req.message}"</span>
                  </div>
                )}

                {/* ExchangeProgress 4-Dot Stepper */}
                <div className="pt-2">
                  <ExchangeProgress status={req.status} />
                </div>

                {/* State-Based Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-canvas-border">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/profile/${partner?._id}`)}
                    >
                      View {partner?.name?.split(' ')[0]}'s Profile
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* For Receiver when Pending: Accept / Decline */}
                    {isReceiver && req.status === 'Pending' && (
                      <>
                        <Button
                          variant="danger-ghost"
                          size="sm"
                          icon={X}
                          onClick={() => handleStatusChange(req._id, 'Rejected')}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Check}
                          onClick={() => handleStatusChange(req._id, 'Accepted')}
                        >
                          Accept Swap
                        </Button>
                      </>
                    )}

                    {/* For Sender when Pending: Cancel Option */}
                    {!isReceiver && req.status === 'Pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(req._id, 'Cancelled')}
                      >
                        Cancel Request
                      </Button>
                    )}

                    {/* When Accepted or In Progress: Schedule, Chat, Mark Completed */}
                    {(req.status === 'Accepted' || req.status === 'In Progress') && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Calendar}
                          onClick={() => setSchedulingExchange(req)}
                        >
                          Schedule Session
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={MessageSquare}
                          onClick={() => navigate('/messages')}
                        >
                          Open Chat
                        </Button>
                        {req.status === 'Accepted' ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStatusChange(req._id, 'In Progress')}
                          >
                            Mark In Progress
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleStatusChange(req._id, 'Completed')}
                          >
                            Mark Completed
                          </Button>
                        )}
                      </>
                    )}

                    {/* When Completed: Leave Review */}
                    {req.status === 'Completed' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={MessageSquare}
                          onClick={() => navigate('/messages')}
                        >
                          Chat History
                        </Button>
                        <Button
                          variant="coral"
                          size="sm"
                          icon={Star}
                          onClick={() => setReviewingExchange(req)}
                        >
                          Leave Review
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Session Modal */}
      {schedulingExchange && (
        <ScheduleSessionModal
          isOpen={Boolean(schedulingExchange)}
          onClose={() => setSchedulingExchange(null)}
          exchange={schedulingExchange}
          onSuccess={() => {
            setSchedulingExchange(null);
            fetchRequests();
          }}
        />
      )}

      {/* Review Modal */}
      {reviewingExchange && (
        <ReviewModal
          isOpen={Boolean(reviewingExchange)}
          onClose={() => setReviewingExchange(null)}
          exchange={reviewingExchange}
          onSuccess={() => {
            setReviewingExchange(null);
            fetchRequests();
          }}
        />
      )}
    </div>
  );
}
