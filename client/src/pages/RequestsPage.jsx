import React, { useState, useEffect } from 'react';
import { getUserExchanges, updateExchangeStatus } from '../services/exchangeService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import ScheduleSessionModal from '../components/ScheduleSessionModal';
import ReviewModal from '../components/ReviewModal';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Calendar, 
  ArrowRightLeft, 
  CheckCircle, 
  Loader2,
  User,
  Star
} from 'lucide-react';

const RequestsPage = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent' | 'accepted' | 'completed'

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
      showNotification('Failed to fetch exchange requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (exchangeId, newStatus) => {
    try {
      const res = await updateExchangeStatus(exchangeId, newStatus);
      if (res.success) {
        showNotification(`Exchange request marked as ${newStatus}!`, 'success');
        fetchRequests();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update request status', 'error');
    }
  };

  const filteredRequests = requests.filter((r) => {
    const isReceiver = r.receiver?._id === currentUser?._id;
    const isSender = r.sender?._id === currentUser?._id;

    if (activeTab === 'received') return isReceiver && r.status === 'Pending';
    if (activeTab === 'sent') return isSender && r.status === 'Pending';
    if (activeTab === 'accepted') return (r.status === 'Accepted' || r.status === 'In Progress') && (isReceiver || isSender);
    if (activeTab === 'completed') return r.status === 'Completed' && (isReceiver || isSender);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Send className="w-7 h-7 text-indigo-600" /> Exchange Requests & Workflow
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage pending proposals, accept incoming peer requests, and complete active skill exchanges.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        {[
          { key: 'received', label: 'Received Requests', icon: Clock },
          { key: 'sent', label: 'Sent Proposals', icon: Send },
          { key: 'accepted', label: 'Active / Accepted', icon: CheckCircle2 },
          { key: 'completed', label: 'Completed Exchanges', icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Loading your skill exchange requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <Send className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Requests Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-relaxed">
            {activeTab === 'received' && 'You have no pending incoming exchange requests.'}
            {activeTab === 'sent' && 'You have not sent any pending exchange requests.'}
            {activeTab === 'accepted' && 'No active or accepted skill exchanges at the moment.'}
            {activeTab === 'completed' && 'No completed skill exchanges logged yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRequests.map((item) => {
            const isReceiver = item.receiver?._id === currentUser?._id;
            const partner = isReceiver ? item.sender : item.receiver;

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Status Pill & Role Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : item.status === 'Accepted' || item.status === 'In Progress'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : item.status === 'Completed'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      Status: {item.status}
                    </span>

                    <span className="text-xs text-gray-400 font-medium">
                      {isReceiver ? 'Received Proposal' : 'Sent Proposal'}
                    </span>
                  </div>

                  {/* Partner Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-base flex items-center justify-center border-2 border-white shadow-md">
                      {partner?.name ? partner.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{partner?.name}</h3>
                      <p className="text-xs text-gray-500">{partner?.location || 'Remote'}</p>
                    </div>
                  </div>

                  {/* Skills Exchange Box */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                        Offered Skill:
                      </span>
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold inline-block">
                        {item.offeredSkill}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-1">
                        Wanted Skill:
                      </span>
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold inline-block">
                        {item.wantedSkill}
                      </span>
                    </div>
                  </div>

                  {item.message && (
                    <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100 italic">
                      "{item.message}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
                  {/* Actions for Pending Received */}
                  {isReceiver && item.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(item._id, 'Rejected')}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleStatusChange(item._id, 'Accepted')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-colors"
                      >
                        Accept Exchange
                      </button>
                    </>
                  )}

                  {/* Actions for Pending Sent */}
                  {!isReceiver && item.status === 'Pending' && (
                    <button
                      onClick={() => handleStatusChange(item._id, 'Cancelled')}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-semibold"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* Actions for Accepted / In Progress */}
                  {(item.status === 'Accepted' || item.status === 'In Progress') && (
                    <>
                      <Link
                        to="/messages"
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </Link>

                      <button
                        onClick={() => setSchedulingExchange(item)}
                        className="px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Schedule Session
                      </button>

                      <button
                        onClick={() => handleStatusChange(item._id, 'Completed')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-100 flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    </>
                  )}

                  {/* Actions for Completed Exchange */}
                  {item.status === 'Completed' && (
                    <button
                      onClick={() => setReviewingExchange(item)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-100 flex items-center gap-1 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" /> Rate & Review Partner
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Session Modal */}
      {schedulingExchange && (
        <ScheduleSessionModal
          exchange={schedulingExchange}
          onClose={() => setSchedulingExchange(null)}
          onSuccess={() => {
            fetchRequests();
            navigate('/sessions');
          }}
        />
      )}

      {/* Review Modal */}
      {reviewingExchange && (
        <ReviewModal
          exchange={reviewingExchange}
          onClose={() => setReviewingExchange(null)}
          onSuccess={() => fetchRequests()}
        />
      )}

    </div>
  );
};

export default RequestsPage;
