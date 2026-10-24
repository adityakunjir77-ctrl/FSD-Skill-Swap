import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { createSession } from '../services/sessionService';
import { Calendar, Clock, X, Loader2, BookOpen } from 'lucide-react';

const ScheduleSessionModal = ({ exchange, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    topic: exchange ? `${exchange.offeredSkill} & ${exchange.wantedSkill} Peer Session` : '',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    message: 'Looking forward to our scheduled skill exchange session!',
  });

  const partner = exchange?.sender?._id === exchange?.receiver?._id
    ? exchange?.sender
    : exchange?.receiver;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic || !formData.date || !formData.time) {
      return showNotification('Topic, date, and time are required.', 'error');
    }

    setLoading(true);
    try {
      const res = await createSession({
        exchangeId: exchange._id,
        partnerId: partner._id,
        topic: formData.topic,
        date: formData.date,
        time: formData.time,
        message: formData.message,
      });

      if (res.success) {
        showNotification('Exchange session proposed successfully!', 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule session.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Exchange Session Scheduler
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-2">Propose Exchange Appointment</h2>
          <p className="text-xs text-gray-500 mt-0.5">Schedule a date and time to exchange skills with your accepted partner.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Session Topic / Focus</label>
            <input
              type="text"
              name="topic"
              required
              value={formData.topic}
              onChange={handleChange}
              placeholder="e.g. React Hooks & UI/UX Figma Feedback"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-600" /> Time
              </label>
              <input
                type="time"
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Session Note / Agenda</label>
            <textarea
              name="message"
              rows={3}
              value={formData.message}
              onChange={handleChange}
              placeholder="Add any preparation notes or link for the session..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              Propose Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleSessionModal;
