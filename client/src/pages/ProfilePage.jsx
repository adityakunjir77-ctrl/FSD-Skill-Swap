import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { updateProfile } from '../services/userService';
import { getUserReviews } from '../services/reviewService';
import { 
  User, 
  Mail, 
  MapPin, 
  Star, 
  Sparkles, 
  BookOpen, 
  Shield, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Clock, 
  Briefcase, 
  CheckCircle,
  Loader2,
  Award
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, refreshProfile } = useAuth();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    experienceLevel: 'Intermediate',
    availability: '',
  });

  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);

  const [newOfferedInput, setNewOfferedInput] = useState('');
  const [newWantedInput, setNewWantedInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || 'Remote',
        experienceLevel: user.experienceLevel || 'Intermediate',
        availability: user.availability || 'Weekends & Evenings',
      });
      setSkillsOffered(user.skillsOffered || []);
      setSkillsWanted(user.skillsWanted || []);
      fetchReviews(user._id);
    }
  }, [user]);

  const fetchReviews = async (userId) => {
    setLoadingReviews(true);
    try {
      const res = await getUserReviews(userId);
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOfferedSkill = () => {
    if (!newOfferedInput.trim()) return;
    const exists = skillsOffered.some(
      (sk) => (typeof sk === 'string' ? sk : sk.name).toLowerCase() === newOfferedInput.trim().toLowerCase()
    );
    if (exists) {
      return showNotification('Skill already in your offered list', 'info');
    }
    setSkillsOffered([...skillsOffered, newOfferedInput.trim()]);
    setNewOfferedInput('');
  };

  const handleRemoveOfferedSkill = (index) => {
    setSkillsOffered(skillsOffered.filter((_, idx) => idx !== index));
  };

  const handleAddWantedSkill = () => {
    if (!newWantedInput.trim()) return;
    const exists = skillsWanted.some(
      (sk) => (typeof sk === 'string' ? sk : sk.name).toLowerCase() === newWantedInput.trim().toLowerCase()
    );
    if (exists) {
      return showNotification('Skill already in your wanted list', 'info');
    }
    setSkillsWanted([...skillsWanted, newWantedInput.trim()]);
    setNewWantedInput('');
  };

  const handleRemoveWantedSkill = (index) => {
    setSkillsWanted(skillsWanted.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        skillsOffered: skillsOffered.map((s) => (typeof s === 'string' ? s : s.name)),
        skillsWanted: skillsWanted.map((s) => (typeof s === 'string' ? s : s.name)),
      };
      const response = await updateProfile(payload);
      if (response.success) {
        updateUser(response.data);
        await refreshProfile();
        showNotification('Profile updated successfully!', 'success');
        setIsEditing(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-3xl flex items-center justify-center border-4 border-white shadow-lg">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                {user?.role === 'admin' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-4 h-4 text-gray-400" /> {user?.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-600 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {user?.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-purple-500" /> {user?.experienceLevel || 'Intermediate'}
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {user?.averageRating ? user.averageRating.toFixed(1) : '5.0'} ({reviews.length} reviews)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
              isEditing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" /> Cancel Edit
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" /> Edit Profile
              </>
            )}
          </button>

        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Edit Profile Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Mumbai, India or Remote"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Experience Level</label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Availability</label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                placeholder="e.g. Weekends & Evenings"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Bio / About Me</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell fellow learners about your background and goals..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Skills Offered Manager */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Skills You Offer to Teach</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOfferedInput}
                onChange={(e) => setNewOfferedInput(e.target.value)}
                placeholder="Add a skill (e.g. React, Java, UI/UX)..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOfferedSkill(); } }}
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddOfferedSkill}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {skillsOffered.map((sk, idx) => {
                const name = typeof sk === 'string' ? sk : sk.name;
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                    {name}
                    <button type="button" onClick={() => handleRemoveOfferedSkill(idx)} className="text-indigo-400 hover:text-indigo-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Skills Wanted Manager */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Skills You Want to Learn</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newWantedInput}
                onChange={(e) => setNewWantedInput(e.target.value)}
                placeholder="Add a desired skill (e.g. Photoshop, Python, German)..."
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddWantedSkill(); } }}
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddWantedSkill}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {skillsWanted.map((sk, idx) => {
                const name = typeof sk === 'string' ? sk : sk.name;
                return (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-100">
                    {name}
                    <button type="button" onClick={() => handleRemoveWantedSkill(idx)} className="text-purple-400 hover:text-purple-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          {/* Bio Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">About Me</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{user?.bio || 'No bio provided yet.'}</p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Skills I Offer to Teach
              </h3>
              <p className="text-xs text-gray-500">Skills you are ready to share with matched partners.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {user?.skillsOffered?.length ? (
                  user.skillsOffered.map((sk, idx) => (
                    <span key={idx} className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 shadow-xs">
                      {typeof sk === 'object' ? sk.name : sk}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No skills offered yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" /> Skills I Want to Learn
              </h3>
              <p className="text-xs text-gray-500">Skills you are looking to acquire from mentors.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {user?.skillsWanted?.length ? (
                  user.skillsWanted.map((sk, idx) => (
                    <span key={idx} className="px-3.5 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold border border-purple-100 shadow-xs">
                      {typeof sk === 'object' ? sk.name : sk}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No desired skills listed yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Peer Ratings & Reviews Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Received Ratings & Peer Feedback ({reviews.length})
              </h3>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {user?.averageRating ? user.averageRating.toFixed(1) : '5.0'} / 5.0
              </span>
            </div>

            {loadingReviews ? (
              <p className="text-xs text-gray-400 py-4 text-center">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center italic">
                No reviews received yet. Complete skill exchanges to build your trusted peer reputation!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {rev.reviewer?.name ? rev.reviewer.name.slice(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{rev.reviewer?.name}</p>
                          <p className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed italic">"{rev.feedback}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfilePage;
