import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { createExchange } from '../services/exchangeService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Pill from './ui/Pill';
import { BookOpen, Sparkles, ArrowRightLeft, Send, MessageSquare } from 'lucide-react';

export default function SendExchangeModal({
  partner,
  partnerUser,
  isOpen,
  onClose,
  onSuccess,
}) {
  const targetPartner = partnerUser || partner;
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  // Available skills lists
  const currentOffers = (currentUser?.skillsOffered || []).map((s) =>
    typeof s === 'object' ? s.name : s
  );
  const partnerOffers = (targetPartner?.skillsOffered || []).map((s) =>
    typeof s === 'object' ? s.name : s
  );

  const [offeredSkill, setOfferedSkill] = useState(
    currentOffers.length > 0 ? currentOffers[0] : ''
  );
  const [customOffered, setCustomOffered] = useState('');

  const [wantedSkill, setWantedSkill] = useState(
    partnerOffers.length > 0 ? partnerOffers[0] : ''
  );
  const [customWanted, setCustomWanted] = useState('');

  const [message, setMessage] = useState(
    `Hi ${targetPartner?.name || 'there'}, I would love to exchange skills with you on SkillSwap!`
  );

  if (!targetPartner) return null;

  const resolvedOffered = offeredSkill === '__custom__' ? customOffered.trim() : offeredSkill;
  const resolvedWanted = wantedSkill === '__custom__' ? customWanted.trim() : wantedSkill;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedOffered || !resolvedWanted) {
      error('Please select both offered and wanted skills.');
      return;
    }

    setLoading(true);
    try {
      const res = await createExchange({
        receiverId: targetPartner._id,
        offeredSkill: resolvedOffered,
        wantedSkill: resolvedWanted,
        message: message.trim(),
      });

      if (res.success) {
        success(`Exchange request sent to ${targetPartner.name}!`);
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send exchange request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Propose Skill Swap with ${targetPartner.name}`}
      subtitle="Specify what you can teach and what you want to learn in return."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="coral"
            size="md"
            loading={loading}
            icon={Send}
            onClick={handleSubmit}
          >
            Send Proposal
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mini SwapCard Preview */}
        <div className="p-3.5 bg-canvas-subtle border border-canvas-border rounded-card">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Avatar
                src={currentUser?.avatar}
                name={currentUser?.name}
                id={currentUser?._id}
                size="xs"
              />
              <span className="font-heading font-semibold text-ink-primary">You</span>
            </div>

            <div className="w-6 h-6 rounded-full bg-white border border-canvas-border flex items-center justify-center text-brand-teal">
              <ArrowRightLeft className="w-3 h-3" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-ink-primary">
                {targetPartner.name}
              </span>
              <Avatar
                src={targetPartner.avatar}
                name={targetPartner.name}
                id={targetPartner._id}
                size="xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-canvas-border/80 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-teach-text block mb-1">
                You Teach:
              </span>
              <Pill variant="teach" size="xs">
                {resolvedOffered || 'Select below'}
              </Pill>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-learn-text block mb-1">
                They Teach:
              </span>
              <Pill variant="learn" size="xs">
                {resolvedWanted || 'Select below'}
              </Pill>
            </div>
          </div>
        </div>

        {/* Skill You Offer */}
        <div>
          <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
            Skill You Offer to Teach
          </label>
          <select
            value={offeredSkill}
            onChange={(e) => setOfferedSkill(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
          >
            {currentOffers.map((sk, idx) => (
              <option key={idx} value={sk}>
                {sk}
              </option>
            ))}
            <option value="__custom__">+ Enter another skill...</option>
          </select>

          {offeredSkill === '__custom__' && (
            <input
              type="text"
              placeholder="Type your skill..."
              value={customOffered}
              onChange={(e) => setCustomOffered(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
            />
          )}
        </div>

        {/* Skill You Want */}
        <div>
          <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
            Skill You Want to Learn from {targetPartner.name}
          </label>
          <select
            value={wantedSkill}
            onChange={(e) => setWantedSkill(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
          >
            {partnerOffers.map((sk, idx) => (
              <option key={idx} value={sk}>
                {sk}
              </option>
            ))}
            <option value="__custom__">+ Enter another skill...</option>
          </select>

          {wantedSkill === '__custom__' && (
            <input
              type="text"
              placeholder="Type skill name..."
              value={customWanted}
              onChange={(e) => setCustomWanted(e.target.value)}
              className="mt-2 w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
            />
          )}
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
            Introductory Message
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share why you'd like to swap skills and your goals..."
            className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring leading-relaxed resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
