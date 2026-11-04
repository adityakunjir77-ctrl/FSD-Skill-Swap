import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { createSession } from '../services/sessionService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { Calendar, Clock, BookOpen, Send } from 'lucide-react';

export default function ScheduleSessionModal({
  exchange,
  isOpen,
  onClose,
  onSuccess,
}) {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    topic: exchange
      ? `${exchange.offeredSkill} ⇄ ${exchange.wantedSkill} Peer Session`
      : '',
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    message: 'Looking forward to our scheduled skill exchange session!',
  });

  // Accurately resolve partner relative to current logged-in user
  const partner =
    exchange?.sender?._id === currentUser?._id
      ? exchange?.receiver
      : exchange?.sender;

  if (!exchange || !partner) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic || !formData.date || !formData.time) {
      error('Topic, date, and time are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await createSession({
        exchangeId: exchange._id,
        partnerId: partner._id,
        topic: formData.topic.trim(),
        date: formData.date,
        time: formData.time,
        message: formData.message.trim(),
      });

      if (res.success) {
        success('Exchange session proposed successfully!');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to schedule session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Propose Exchange Appointment"
      subtitle={`Schedule a 1-on-1 learning session with ${partner.name}.`}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={loading}
            icon={Calendar}
            onClick={handleSubmit}
          >
            Propose Date & Time
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
            Session Topic or Focus
          </label>
          <input
            type="text"
            name="topic"
            required
            value={formData.topic}
            onChange={handleChange}
            placeholder="e.g. React Hooks Deep-Dive & Python Basics"
            className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
              Date
            </label>
            <input
              type="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
              Time
            </label>
            <input
              type="time"
              name="time"
              required
              value={formData.time}
              onChange={handleChange}
              className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
            Notes / Agenda
          </label>
          <textarea
            rows={3}
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Mention any links, preparation materials or goals for the session..."
            className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring leading-relaxed resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
