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
    <div className="space-y-6">
      {/* 1. HEADER CARD (No cover photo, subtle brand pattern strip instead) */}
      <div className="bg-canvas-card border border-canvas-border rounded-card shadow-soft overflow-hidden">
        {/* Subtle Brand Pattern Strip */}
        <div
          className="h-16 w-full border-b border-canvas-border relative overflow-hidden"
          style={{
            backgroundColor: '#F0FDFA',
            backgroundImage: `radial-gradient(#0F766E 0.75px, transparent 0.75px)`,
            backgroundSize: '12px 12px',
          }}
        />

        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-10 mb-5">
            {/* Large Avatar */}
            <div className="ring-4 ring-white rounded-full bg-white shadow-soft">
              <Avatar
                src={profileUser.avatar}
                name={profileUser.name}
                id={profileUser._id}
                size="2xl"
              />
            </div>

            {/* Profile Action: Edit Profile (Own) or Propose Swap (Public) */}
            <div className="self-center sm:self-auto">
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

          {/* User Bio and Meta Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary">
                {profileUser.name}
              </h1>
              {profileUser.role === 'admin' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-semibold bg-brand-coral-tint text-brand-coral border border-[#FED7CE]">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>

            {profileUser.bio && (
              <p className="text-sm text-ink-secondary max-w-3xl leading-relaxed">
                {profileUser.bio}
              </p>
            )}

            {/* Badges / Metrics Strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-secondary pt-2 border-t border-canvas-border">
              {profileUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                  {profileUser.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-brand-teal" />
                {profileUser.experienceLevel || 'Intermediate'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-teal" />
                {profileUser.availability || 'Weekends & Evenings'}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-status-success" />
                {profileUser.completedExchanges || 0} completed swaps
              </span>
              <RatingStars
                rating={profileUser.averageRating || 5.0}
                count={reviews.length}
                size="sm"
                showScore
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO PROMINENT COLUMNS: "I Can Teach" and "I Want to Learn" */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: I Can Teach */}
        <div className="bg-canvas-card border border-teach-border/80 rounded-card p-6 shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
            <h2 className="font-heading font-bold text-base text-teach-text flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teach-text" />
              Skills Offered to Teach ({offers.length})
            </h2>
            {!isPublicProfile && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-heading font-semibold text-brand-teal hover:underline"
              >
                Manage
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {offers.length === 0 ? (
              <span className="text-xs text-ink-muted italic">
                No skills listed yet.
              </span>
            ) : (
              offers.map((sk, idx) => (
                <Pill key={idx} variant="teach" size="md">
                  {typeof sk === 'object' ? sk.name : sk}
                </Pill>
              ))
            )}
          </div>
        </div>

        {/* Right Column: I Want to Learn */}
        <div className="bg-canvas-card border border-learn-border/80 rounded-card p-6 shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
            <h2 className="font-heading font-bold text-base text-learn-text flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-learn-text" />
              Skills Desired to Learn ({wants.length})
            </h2>
            {!isPublicProfile && (
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-heading font-semibold text-brand-teal hover:underline"
              >
                Manage
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {wants.length === 0 ? (
              <span className="text-xs text-ink-muted italic">
                No skills desired listed yet.
              </span>
            ) : (
              wants.map((sk, idx) => (
                <Pill key={idx} variant="learn" size="md">
                  {typeof sk === 'object' ? sk.name : sk}
                </Pill>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. REVIEWS & TESTIMONIALS SECTION */}
      <div className="bg-canvas-card border border-canvas-border rounded-card p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-canvas-border">
          <div>
            <h2 className="font-heading font-bold text-base text-ink-primary flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F59E0B]" />
              Verified Reviews & Trust Testimonials ({reviews.length})
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Feedback submitted by peers following completed skill exchange sessions.
            </p>
          </div>
        </div>

        {loadingReviews ? (
          <Skeleton variant="text" count={3} />
        ) : reviews.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-muted">
            No peer reviews recorded yet. Reviews are unlocked once an exchange is marked completed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-4 bg-canvas-subtle/70 border border-canvas-border rounded-card space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
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
                  </div>
                  <RatingStars rating={rev.rating} size="xs" />
                </div>

                <div className="flex items-start gap-1.5 text-ink-secondary italic pt-1">
                  <Quote className="w-3.5 h-3.5 text-brand-teal flex-shrink-0 mt-0.5 not-italic" />
                  <span>"{rev.feedback}"</span>
                </div>

                <div className="text-[10px] text-ink-muted pt-1 border-t border-canvas-border/50">
                  {new Date(rev.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={editFormData.name}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
                Bio & Background
              </label>
              <textarea
                rows={3}
                name="bio"
                value={editFormData.bio}
                onChange={handleEditInputChange}
                placeholder="Share your experience and what you're passionate about..."
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  placeholder="e.g. Remote, San Francisco"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={editFormData.experienceLevel}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-ink-primary mb-1">
                Availability Notes
              </label>
              <input
                type="text"
                name="availability"
                value={editFormData.availability}
                onChange={handleEditInputChange}
                placeholder="e.g. Weekends & Evenings"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
              />
            </div>

            {/* Manage Offered Skills */}
            <div className="pt-2 border-t border-canvas-border">
              <label className="block text-xs font-heading font-semibold text-teach-text uppercase tracking-wider mb-1.5">
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
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
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
            <div className="pt-2 border-t border-canvas-border">
              <label className="block text-xs font-heading font-semibold text-learn-text uppercase tracking-wider mb-1.5">
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
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
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
