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
      className={`bg-canvas-card border border-canvas-border rounded-card p-5 transition-colors duration-150 hover:border-ink-primary/50 relative flex flex-col justify-between ${className}`}
    >
      {/* Top row: match label + compatibility */}
      <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-ink-primary">
        <div className="flex items-center gap-2 min-h-[1.5rem]">
          {isBestMatch && (
            <span className="inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-brand-teal">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
              Best Match
            </span>
          )}
          {isReciprocal && !isBestMatch && (
            <span className="inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-ink-primary">
              100% Reciprocal
            </span>
          )}
        </div>

        <CompatibilityRing score={compatibilityScore} size={44} />
      </div>

      {/* The exchange: you  ⇄  partner */}
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
            <div className="font-display font-medium text-[17px] leading-tight text-ink-primary truncate">
              {currentUserName}
            </div>
          </div>
        </div>

        {/* Central two-way swap motif */}
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 text-brand-teal" aria-hidden="true">
          <ArrowLeftRight className="w-4 h-4" strokeWidth={1.75} />
        </div>

        {/* User B (Partner) */}
        <div className="flex items-center gap-2.5 min-w-0 text-right justify-end">
          <div className="min-w-0">
            <div className="text-xs text-ink-muted truncate">
              {partnerUser.experienceLevel || 'Partner'}
            </div>
            <div className="font-display font-medium text-[17px] leading-tight text-ink-primary truncate">
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

      {/* Ledger: what each side teaches, split by a vertical rule */}
      <div className="grid grid-cols-2 mt-4 mb-4 border-y border-canvas-border text-xs">
        <div className="py-3 pr-3 border-r border-canvas-border">
          <div className="text-[13px] font-heading font-semibold text-teach-text mb-2">
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
              <span className="text-sm text-ink-muted italic">Any of your skills</span>
            )}
          </div>
        </div>

        <div className="py-3 pl-3">
          <div className="text-[13px] font-heading font-semibold text-learn-text mb-2">
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
              <span className="text-sm text-ink-muted italic">Skills on profile</span>
            )}
          </div>
        </div>
      </div>

      {/* Partner details & bio */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 text-xs text-ink-secondary mb-2">
          <RatingStars rating={partnerRating} count={partnerReviews} size="xs" showScore />
          {partnerUser.location && (
            <span className="inline-flex items-center gap-1 text-ink-muted text-xs">
              <MapPin className="w-3 h-3" strokeWidth={1.75} />
              {partnerUser.location}
            </span>
          )}
        </div>
        {partnerBio && (
          <p className="text-sm text-ink-secondary leading-relaxed line-clamp-2">
            {partnerBio}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
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
