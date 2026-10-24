import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { createExchange } from '../services/exchangeService';
import { Send, X, BookOpen, Sparkles, Loader2 } from 'lucide-react';

const SendExchangeModal = ({ partner, onClose, onSuccess }) => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const [offeredSkill, setOfferedSkill] = useState(
    currentUser?.skillsOffered?.length
      ? typeof currentUser.skillsOffered[0] === 'object'
        ? currentUser.skillsOffered[0].name
        : currentUser.skillsOffered[0]
      : ''
  );

  const [wantedSkill, setWantedSkill] = useState(
    partner?.skillsOffered?.length
      ? typeof partner.skillsOffered[0] === 'object'
        ? partner.skillsOffered[0].name
        : partner.skillsOffered[0]
      : ''
  );

  const [message, setMessage] = useState(
    `Hi ${partner.name}, I noticed your profile on SkillSwap and would love to exchange skills with you!`
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!offeredSkill || !wantedSkill) {
      return showNotification('Please select both offered and wanted skills.', 'error');
    }

    setLoading(true);
    try {
      const res = await createExchange({
        receiverId: partner._id,
        offeredSkill,
        wantedSkill,
        message,
      });

      if (res.success) {
        showNotification(`Exchange request sent to ${partner.name}!`, 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send exchange request.';
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
          className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
            New Skill Exchange
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-2">Send Request to {partner.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">Specify what you can teach and what you want to learn in return.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Skill Offered Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Skill You Offer to Teach
            </label>
            {currentUser?.skillsOffered?.length ? (
              <select
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {currentUser.skillsOffered.map((sk, idx) => {
                  const name = typeof sk === 'object' ? sk.name : sk;
                  return (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type="text"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                placeholder="Type skill name (e.g. React)..."
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Skill Wanted Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Skill You Want to Learn ({partner.name}'s Offer)
            </label>
            {partner?.skillsOffered?.length ? (
              <select
                value={wantedSkill}
                onChange={(e) => setWantedSkill(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {partner.skillsOffered.map((sk, idx) => {
                  const name = typeof sk === 'object' ? sk.name : sk;
                  return (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input
                type="text"
                value={wantedSkill}
                onChange={(e) => setWantedSkill(e.target.value)}
                placeholder="Type skill name (e.g. UI/UX)..."
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          </div>

          {/* Introductory Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Introductory Message</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Exchange Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendExchangeModal;
