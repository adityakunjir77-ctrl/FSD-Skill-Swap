import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { createReview } from '../services/reviewService';
import { Star, X, Loader2, Award } from 'lucide-react';

const ReviewModal = ({ exchange, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const partner = exchange?.sender?._id === exchange?.receiver?._id
    ? exchange?.sender
    : exchange?.receiver;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      return showNotification('Please select a star rating.', 'error');
    }
    if (!feedback.trim() || feedback.trim().length < 5) {
      return showNotification('Please provide feedback (at least 5 characters).', 'error');
    }

    setLoading(true);
    try {
      const res = await createReview({
        exchangeId: exchange._id,
        rating,
        feedback: feedback.trim(),
      });

      if (res.success) {
        showNotification('Thank you! Review submitted successfully.', 'success');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
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

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Rate & Review {partner?.name}</h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Share feedback on your skill exchange session ({exchange?.offeredSkill} ⇄ {exchange?.wantedSkill}).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Interactive Star Picker */}
          <div className="flex flex-col items-center space-y-2">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Rating Score</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600">
              {rating === 5 && 'Outstanding Exchange! (5 Stars)'}
              {rating === 4 && 'Great Session! (4 Stars)'}
              {rating === 3 && 'Average Session (3 Stars)'}
              {rating === 2 && 'Below Expectations (2 Stars)'}
              {rating === 1 && 'Poor Experience (1 Star)'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Feedback / Review</label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What did you learn? How was your mentor's communication and teaching style?"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
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
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-100 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              Submit Peer Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
