import React, { useState, useEffect } from 'react';
import { getUserSessions, updateSessionStatus } from '../services/sessionService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Calendar, Clock, CheckCircle, XCircle, User, Loader2, BookOpen } from 'lucide-react';

const SessionsPage = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
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
      showNotification('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (sessionId, status) => {
    try {
      const res = await updateSessionStatus(sessionId, status);
      if (res.success) {
        showNotification(`Session status updated to ${status}!`, 'success');
        fetchSessions();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update session', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-indigo-600" /> Scheduled Exchange Sessions
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View proposed times, confirm appointments, and track completed peer learning sessions.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Loading scheduled sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Scheduled Sessions</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Accept a skill exchange request to propose and schedule a live exchange session!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => {
            const isProposer = session.proposer?._id === currentUser?._id;
            const partner = isProposer ? session.partner : session.proposer;

            return (
              <div
                key={session._id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        session.status === 'Proposed'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : session.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : session.status === 'Completed'
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {isProposer ? 'Proposed by You' : `Proposed by ${partner?.name}`}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-lg">{session.topic}</h3>

                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-indigo-600">
                      <Calendar className="w-4 h-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center">
                      {partner?.name ? partner.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{partner?.name}</p>
                      <p className="text-[11px] text-gray-500">{partner?.email}</p>
                    </div>
                  </div>

                  {session.message && (
                    <p className="text-xs text-gray-600 italic bg-slate-50 p-3 rounded-xl">
                      "{session.message}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  {!isProposer && session.status === 'Proposed' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(session._id, 'Rejected')}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-bold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(session._id, 'Accepted')}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
                      >
                        Confirm Session
                      </button>
                    </>
                  )}

                  {session.status === 'Accepted' && (
                    <button
                      onClick={() => handleStatusChange(session._id, 'Completed')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
