import React from 'react';
import Avatar from './Avatar';
import Pill from './Pill';
import Button from './Button';
import CompatibilityRing from './CompatibilityRing';
import RatingStars from './RatingStars';
import { ArrowLeftRight, Sparkles, MapPin } from 'lucide-react';

export default function SwapCard({
  currentUser,
  partnerUser,
  compatibilityScore = 85,
  isReciprocal = false,
  youCanTeach = [],
  theyCanTeach = [],
  onProposeSwap,
  onViewProfile,
  isBestMatch = false,
  className = '',
}) {
  if (!partnerUser) return null;

  const currentUserName = currentUser?.name || 'You';
  const partnerName = partnerUser?.name || 'SkillSwapper';
  const partnerBio = partnerUser?.bio || partnerUser?.headline;
  const partnerRating = partnerUser?.averageRating || 5.0;
  const partnerReviews = partnerUser?.totalReviews || 0;

  // Fallback skills if not explicitly passed
  const teachList =
    youCanTeach.length > 0
      ? youCanTeach
      : (currentUser?.skillsOffered || []).map((s) => (typeof s === 'object' ? s.name : s)).slice(0, 3);

  const learnList =
    theyCanTeach.length > 0
      ? theyCanTeach
      : (partnerUser?.skillsOffered || []).map((s) => (typeof s === 'object' ? s.name : s)).slice(0, 3);

  return (
    <div
      className={`bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft transition-all duration-150 hover:border-canvas-border-dark relative flex flex-col justify-between ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {isBestMatch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold bg-brand-coral-tint text-brand-coral border border-[#FED7CE]">
              <Sparkles className="w-3 h-3" />
              Best Match
            </span>
          )}
          {isReciprocal && !isBestMatch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold bg-teach-bg text-teach-text border border-teach-border">
              100% Reciprocal
            </span>
          )}
        </div>

        <CompatibilityRing score={compatibilityScore} size={44} />
      </div>

      {/* Hero Exchange Visual: Left Avatar <===> Right Avatar */}
      <div className="bg-canvas-subtle/70 border border-canvas-border/80 rounded-card p-4 mb-4">
        <div className="flex items-center justify-between gap-2">
          {/* User A (You) */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={currentUser?.avatar}
              name={currentUserName}
              id={currentUser?._id}
              size="md"
            />
            <div className="min-w-0">
              <div className="text-xs text-ink-muted">You</div>
              <div className="font-heading font-semibold text-sm text-ink-primary truncate">
                {currentUserName}
              </div>
            </div>
          </div>

          {/* Central Two-Way Swap Arrow Motif */}
          <div className="w-9 h-9 rounded-full bg-white border border-canvas-border flex items-center justify-center flex-shrink-0 shadow-soft text-brand-teal">
            <ArrowLeftRight className="w-4 h-4 text-brand-teal" strokeWidth={2} />
          </div>

          {/* User B (Partner) */}
          <div className="flex items-center gap-2.5 min-w-0 text-right justify-end">
            <div className="min-w-0">
              <div className="text-xs text-ink-muted truncate">
                {partnerUser.experienceLevel || 'Partner'}
              </div>
              <div className="font-heading font-semibold text-sm text-ink-primary truncate">
                {partnerName}
              </div>
            </div>
            <Avatar
              src={partnerUser?.avatar}
              name={partnerName}
              id={partnerUser?._id}
              size="md"
            />
          </div>
        </div>

        {/* Two-Column Teach / Learn Pill Breakdown */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-canvas-border/60 text-xs">
          {/* Left Column: What you teach */}
          <div>
            <div className="text-[11px] font-heading font-semibold text-teach-text uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teach-text" />
              You teach:
            </div>
            <div className="flex flex-wrap gap-1">
              {teachList.length > 0 ? (
                teachList.slice(0, 2).map((sk, idx) => (
                  <Pill key={idx} variant="teach" size="xs">
                    {sk}
                  </Pill>
                ))
              ) : (
                <span className="text-xs text-ink-muted italic">Any of your skills</span>
              )}
            </div>
          </div>

          {/* Right Column: What they teach */}
          <div>
            <div className="text-[11px] font-heading font-semibold text-learn-text uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-learn-text" />
              They teach:
            </div>
            <div className="flex flex-wrap gap-1">
              {learnList.length > 0 ? (
                learnList.slice(0, 2).map((sk, idx) => (
                  <Pill key={idx} variant="learn" size="xs">
                    {sk}
                  </Pill>
                ))
              ) : (
                <span className="text-xs text-ink-muted italic">Skills on profile</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Partner Info Details & Bio */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-ink-secondary mb-1.5">
          <RatingStars rating={partnerRating} count={partnerReviews} size="xs" showScore />
          {partnerUser.location && (
            <span className="inline-flex items-center gap-1 text-ink-muted text-[11px]">
              <MapPin className="w-3 h-3" />
              {partnerUser.location}
            </span>
          )}
        </div>
        {partnerBio && (
          <p className="text-xs text-ink-secondary line-clamp-2">
            {partnerBio}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-canvas-border">
        {onViewProfile && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewProfile(partnerUser)}
            className="flex-1"
          >
            Profile
          </Button>
        )}
        {onProposeSwap && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onProposeSwap(partnerUser)}
            className="flex-1"
          >
            Propose Swap
          </Button>
        )}
      </div>
    </div>
  );
}

