import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { createReview } from '../services/reviewService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import RatingStars from './ui/RatingStars';
import { Star, Award } from 'lucide-react';

export default function ReviewModal({
  exchange,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Accurately resolve partner relative to current logged-in user
  const partner =
    exchange?.sender?._id === currentUser?._id
      ? exchange?.receiver
      : exchange?.sender;

  if (!exchange || !partner) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      error('Please select a star rating.');
      return;
    }
    if (!feedback.trim() || feedback.trim().length < 5) {
      error('Please provide written feedback (at least 5 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await createReview({
        exchangeId: exchange._id,
        rating,
        feedback: feedback.trim(),
      });

      if (res.success) {
        success('Thank you! Your verified review has been submitted.');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review Exchange with ${partner.name}`}
      subtitle={`Rate your experience swapping ${exchange.offeredSkill} ⇄ ${exchange.wantedSkill}.`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="coral"
            size="md"
            loading={loading}
            icon={Star}
            onClick={handleSubmit}
          >
            Submit Review
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Interactive Star Picker */}
        <div className="p-4 bg-canvas-subtle border border-canvas-border rounded-card flex flex-col items-center justify-center space-y-2">
          <span className="text-xs font-heading font-semibold text-ink-muted uppercase tracking-wider">
            Select Rating (1 to 5 Stars)
          </span>

          <RatingStars
            rating={rating}
            size="lg"
            interactive={true}
            onChange={(val) => setRating(val)}
          />

          <span className="text-xs font-heading font-bold text-ink-primary">
            {rating === 5
              ? '5.0 - Exceptional Exchange!'
              : rating === 4
              ? '4.0 - Very Helpful'
              : rating === 3
              ? '3.0 - Good Session'
              : rating === 2
              ? '2.0 - Needs Improvement'
              : '1.0 - Unsatisfactory'}
          </span>
        </div>

        {/* Written Feedback */}
        <div>
          <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
            Written Feedback & Testimonial
          </label>
          <textarea
            rows={4}
            required
            minLength={5}
            maxLength={1000}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`Share what you learned from ${partner.name}, their teaching style, and communication...`}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring leading-relaxed resize-none"
          />
          <div className="flex justify-between text-[11px] text-ink-muted mt-1">
            <span>Minimum 5 characters</span>
            <span>{feedback.length}/1000</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
