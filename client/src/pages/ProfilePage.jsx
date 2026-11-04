import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { updateProfile, getUserProfile } from '../services/userService';
import { getUserReviews } from '../services/reviewService';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import Modal from '../components/ui/Modal';
import RatingStars from '../components/ui/RatingStars';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import SendExchangeModal from '../components/SendExchangeModal';
import {
  User as UserIcon,
  Mail,
  MapPin,
  Briefcase,
  Clock,
  Star,
  CheckCircle,
  Edit3,
  Plus,
  Send,
  Shield,
  Sparkles,
  Quote,
  ArrowRightLeft,
} from 'lucide-react';

export default function ProfilePage() {
  const { id: paramUserId } = useParams();
  const { user: currentUser, updateUser, refreshProfile } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const isPublicProfile = Boolean(paramUserId && paramUserId !== currentUser?._id);

  const [profileUser, setProfileUser] = useState(isPublicProfile ? null : currentUser);
  const [loading, setLoading] = useState(isPublicProfile);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    bio: '',
    location: '',
    experienceLevel: 'Intermediate',
    availability: '',
    avatar: '',
  });

  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [newOfferedInput, setNewOfferedInput] = useState('');
  const [newWantedInput, setNewWantedInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Propose Swap modal (when viewing public profile)
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);

  useEffect(() => {
    if (isPublicProfile) {
      loadPublicProfile(paramUserId);
    } else if (currentUser) {
      setProfileUser(currentUser);
      populateEditForm(currentUser);
      loadReviews(currentUser._id);
    }
  }, [paramUserId, currentUser]);

  const loadPublicProfile = async (userId) => {
    setLoading(true);
    try {
      const res = await getUserProfile(userId);
      if (res.success) {
        setProfileUser(res.data);
        loadReviews(userId);
      }
    } catch (err) {
      error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (userId) => {
    setLoadingReviews(true);
    try {
      const res = await getUserReviews(userId);
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error('[Profile] Error loading reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const populateEditForm = (usr) => {
    setEditFormData({
      name: usr.name || '',
      bio: usr.bio || '',
      location: usr.location || 'Remote',
      experienceLevel: usr.experienceLevel || 'Intermediate',
      availability: usr.availability || 'Weekends & Evenings',
      avatar: usr.avatar || '',
    });
    setSkillsOffered(usr.skillsOffered || []);
    setSkillsWanted(usr.skillsWanted || []);
  };

  const handleEditInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleAddOfferedSkill = () => {
    const text = newOfferedInput.trim();
    if (!text) return;
    const exists = skillsOffered.some(
      (s) => (typeof s === 'object' ? s.name : s).toLowerCase() === text.toLowerCase()
    );
    if (!exists) {
      setSkillsOffered([...skillsOffered, text]);
      setNewOfferedInput('');
    }
  };

  const handleRemoveOfferedSkill = (index) => {
    setSkillsOffered(skillsOffered.filter((_, idx) => idx !== index));
  };

  const handleAddWantedSkill = () => {
    const text = newWantedInput.trim();
    if (!text) return;
    const exists = skillsWanted.some(
      (s) => (typeof s === 'object' ? s.name : s).toLowerCase() === text.toLowerCase()
    );
    if (!exists) {
      setSkillsWanted([...skillsWanted, text]);
      setNewWantedInput('');
    }
  };

  const handleRemoveWantedSkill = (index) => {
    setSkillsWanted(skillsWanted.filter((_, idx) => idx !== index));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const payload = {
        ...editFormData,
        skillsOffered: skillsOffered.map((s) => (typeof s === 'object' ? s.name : s)),
        skillsWanted: skillsWanted.map((s) => (typeof s === 'object' ? s.name : s)),
      };

      const res = await updateProfile(payload);
      if (res.success) {
        updateUser(res.data);
        setProfileUser(res.data);
        await refreshProfile();
        success('Profile updated successfully!');
        setIsEditModalOpen(false);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" count={2} />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <EmptyState
        title="User profile not found"
        description="The member profile you requested may have been removed or deactivated."
        actionLabel="Back to Directory"
        onAction={() => navigate('/discover')}
      />
    );
  }

  const offers = profileUser.skillsOffered || [];
  const wants = profileUser.skillsWanted || [];

  return (
    <div className="space-y-12">
      {/* 1. PROFILE MASTHEAD */}
      <header className="border-b border-ink-primary pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
          {/* Portrait */}
          <div className="md:col-span-3">
            <div className="inline-block p-1.5 border border-ink-primary bg-canvas-card">
              <Avatar
                src={profileUser.avatar}
                name={profileUser.name}
                id={profileUser._id}
                size="2xl"
                className="[&>*]:w-28 [&>*]:h-28 sm:[&>*]:w-36 sm:[&>*]:h-36 [&>*]:text-5xl"
              />
            </div>
          </div>

          {/* Name, standfirst and action */}
          <div className="md:col-span-9 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <h1 className="font-display font-medium text-display-md sm:text-display-lg tracking-[-0.025em] text-ink-primary">
                  {profileUser.name}
                </h1>
                {profileUser.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-button text-xs font-heading font-semibold border border-ink-primary text-ink-primary">
                    <Shield className="w-3 h-3" strokeWidth={1.75} /> Admin
                  </span>
                )}
              </div>

              {/* Profile Action: Edit Profile (Own) or Propose Swap (Public) */}
              <div className="self-start lg:self-auto flex-shrink-0">
                {!isPublicProfile ? (
                  <Button
                    variant="secondary"
                    size="md"
                    icon={Edit3}
                    onClick={() => {
                      populateEditForm(profileUser);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    variant="coral"
                    size="md"
                    icon={Send}
                    onClick={() => setIsProposeModalOpen(true)}
                  >
                    Propose Skill Swap
                  </Button>
                )}
              </div>
            </div>

            {profileUser.bio && (
              <p className="font-display text-title sm:text-[1.5rem] leading-snug text-ink-secondary max-w-3xl">
                {profileUser.bio}
              </p>
            )}
          </div>
        </div>

        {/* Metrics row */}
        <div className="mt-8 pt-4 border-t border-canvas-border flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-secondary">
          {profileUser.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-teal" strokeWidth={1.75} />
              {profileUser.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-brand-teal" strokeWidth={1.75} />
            {profileUser.experienceLevel || 'Intermediate'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-teal" strokeWidth={1.75} />
            {profileUser.availability || 'Weekends & Evenings'}
          </span>
          <span className="flex items-center gap-1.5 numerals">
            <CheckCircle className="w-4 h-4 text-status-success" strokeWidth={1.75} />
            {profileUser.completedExchanges || 0} completed swaps
          </span>
          <RatingStars
            rating={profileUser.averageRating || 5.0}
            count={reviews.length}
            size="sm"
            showScore
          />
        </div>
      </header>

      {/* 2. THE LEDGER: "I Can Teach" | "I Want to Learn" */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-t-2 border-ink-primary">
        {/* Left Column: I Can Teach */}
        <section className="py-5 md:pr-8 md:border-r border-canvas-border space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display font-medium text-title text-teach-text">
              Skills Offered to Teach <span className="text-ink-muted numerals">({offers.length})</span>
            </h2>
            {!isPublicProfile && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm font-heading font-semibold text-brand-teal hover:underline underline-offset-4"
              >
                Manage
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {offers.length === 0 ? (
              <span className="text-sm text-ink-muted italic">
                No skills listed yet.
              </span>
            ) : (
              offers.map((sk, idx) => (
                <Pill key={idx} variant="teach" size="lg">
                  {typeof sk === 'object' ? sk.name : sk}
                </Pill>
              ))
            )}
          </div>
        </section>

        {/* Right Column: I Want to Learn */}
        <section className="py-5 md:pl-8 border-t md:border-t-0 border-canvas-border space-y-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display font-medium text-title text-learn-text">
              Skills Desired to Learn <span className="text-ink-muted numerals">({wants.length})</span>
            </h2>
            {!isPublicProfile && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-sm font-heading font-semibold text-brand-teal hover:underline underline-offset-4"
              >
                Manage
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {wants.length === 0 ? (
              <span className="text-sm text-ink-muted italic">
                No skills desired listed yet.
              </span>
            ) : (
              wants.map((sk, idx) => (
                <Pill key={idx} variant="learn" size="lg">
                  {typeof sk === 'object' ? sk.name : sk}
                </Pill>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 3. REVIEWS & TESTIMONIALS SECTION */}
      <section className="section-open space-y-6">
        <div>
          <h2 className="font-display font-medium text-display-sm text-ink-primary tracking-[-0.015em]">
            Verified Reviews & Trust Testimonials <span className="text-ink-muted numerals">({reviews.length})</span>
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            Feedback submitted by peers following completed skill exchange sessions.
          </p>
        </div>

        {loadingReviews ? (
          <Skeleton variant="text" count={3} />
        ) : reviews.length === 0 ? (
          <div className="py-8 border-t border-canvas-border text-sm text-ink-muted">
            No peer reviews recorded yet. Reviews are unlocked once an exchange is marked completed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {reviews.map((rev) => (
              <figure
                key={rev._id}
                className="pt-4 border-t border-canvas-border space-y-3"
              >
                <blockquote className="flex items-start gap-2 font-display italic text-title leading-snug text-ink-primary">
                  <Quote className="w-4 h-4 text-brand-teal flex-shrink-0 mt-1.5 not-italic" strokeWidth={1.75} aria-hidden="true" />
                  <span>"{rev.feedback}"</span>
                </blockquote>

                <figcaption className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2.5">
                    <Avatar
                      src={rev.reviewer?.avatar}
                      name={rev.reviewer?.name}
                      id={rev.reviewer?._id}
                      size="xs"
                    />
                    <span className="font-heading font-semibold text-ink-primary">
                      {rev.reviewer?.name}
                    </span>
                    <span className="text-ink-muted numerals">
                      {new Date(rev.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <RatingStars rating={rev.rating} size="xs" />
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* EDIT PROFILE MODAL (When viewing own profile) */}
      {!isPublicProfile && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile & Skill Preferences"
          subtitle="Keep your profile details and learning interests up to date."
          maxWidth="max-w-xl"
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={savingProfile}
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={editFormData.name}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                Bio & Background
              </label>
              <textarea
                rows={3}
                name="bio"
                value={editFormData.bio}
                onChange={handleEditInputChange}
                placeholder="Share your experience and what you're passionate about..."
                className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  placeholder="e.g. Remote, San Francisco"
                  className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={editFormData.experienceLevel}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-heading font-semibold text-ink-primary mb-1.5">
                Availability Notes
              </label>
              <input
                type="text"
                name="availability"
                value={editFormData.availability}
                onChange={handleEditInputChange}
                placeholder="e.g. Weekends & Evenings"
                className="w-full px-3 py-2 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
              />
            </div>

            {/* Manage Offered Skills */}
            <div className="pt-4 border-t border-canvas-border">
              <label className="block text-sm font-heading font-semibold text-teach-text mb-1.5">
                Manage Skills You Teach
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skillsOffered.map((sk, idx) => (
                  <Pill
                    key={idx}
                    variant="teach"
                    size="sm"
                    onRemove={() => handleRemoveOfferedSkill(idx)}
                  >
                    {typeof sk === 'object' ? sk.name : sk}
                  </Pill>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill you teach..."
                  value={newOfferedInput}
                  onChange={(e) => setNewOfferedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOfferedSkill();
                    }
                  }}
                  className="flex-1 min-w-0 px-3 py-2 text-sm bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddOfferedSkill}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Manage Wanted Skills */}
            <div className="pt-4 border-t border-canvas-border">
              <label className="block text-sm font-heading font-semibold text-learn-text mb-1.5">
                Manage Skills You Want to Learn
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skillsWanted.map((sk, idx) => (
                  <Pill
                    key={idx}
                    variant="learn"
                    size="sm"
                    onRemove={() => handleRemoveWantedSkill(idx)}
                  >
                    {typeof sk === 'object' ? sk.name : sk}
                  </Pill>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill you want..."
                  value={newWantedInput}
                  onChange={(e) => setNewWantedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddWantedSkill();
                    }
                  }}
                  className="flex-1 min-w-0 px-3 py-2 text-sm bg-canvas-card border border-canvas-border-dark rounded-input hover:border-ink-muted text-ink-primary focus-ring"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddWantedSkill}
                >
                  Add
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* PROPOSE SWAP MODAL (When viewing public profile) */}
      {isPublicProfile && isProposeModalOpen && (
        <SendExchangeModal
          isOpen={isProposeModalOpen}
          onClose={() => setIsProposeModalOpen(false)}
          partnerUser={profileUser}
          onSuccess={() => {
            setIsProposeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
