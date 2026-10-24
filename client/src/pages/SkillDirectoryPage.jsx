import React, { useState, useEffect } from 'react';
import { getAllUsers } from '../services/userService';
import { getSkillCategories } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import SendExchangeModal from '../components/SendExchangeModal';
import { 
  Compass, 
  Search, 
  Filter, 
  BookOpen, 
  Sparkles, 
  Star, 
  MapPin, 
  Briefcase, 
  Send, 
  User as UserIcon,
  Loader2,
  X
} from 'lucide-react';

const SkillDirectoryPage = () => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [exchangePartnerModal, setExchangePartnerModal] = useState(null);

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  const fetchDirectoryData = async () => {
    setLoading(true);
    try {
      const [usersRes, catRes] = await Promise.all([
        getAllUsers(),
        getSkillCategories(),
      ]);
      if (usersRes.success) setUsers(usersRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      showNotification('Failed to load skill directory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (currentUser && u._id === currentUser._id) return false;

    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.skillsOffered.some((sk) => (typeof sk === 'object' ? sk.name : sk).toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.skillsWanted.some((sk) => (typeof sk === 'object' ? sk.name : sk).toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      u.skillsOffered.some((sk) => typeof sk === 'object' && sk.category === selectedCategory) ||
      u.skillsWanted.some((sk) => typeof sk === 'object' && sk.category === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Compass className="w-7 h-7 text-indigo-600" /> Skill Discovery Catalog
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search, filter, and discover community peers offering skills you wish to learn.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by peer name, skill offered (e.g. React), or skill wanted (e.g. UI/UX)..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Loading skill directory profiles...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <Compass className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Peers Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Try resetting your search query or selecting a different skill category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((userCard) => (
            <div
              key={userCard._id}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-base flex items-center justify-center border-2 border-white shadow-md">
                      {userCard.name ? userCard.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug">{userCard.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" /> {userCard.location || 'Remote'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-purple-500" /> {userCard.experienceLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {userCard.averageRating ? userCard.averageRating.toFixed(1) : '5.0'}
                  </span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {userCard.bio || 'Ready for peer skill exchange.'}
                </p>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Offers to Teach
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {userCard.skillsOffered?.length ? (
                      userCard.skillsOffered.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100"
                        >
                          {typeof sk === 'object' ? sk.name : sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">None listed</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Wants to Learn
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {userCard.skillsWanted?.length ? (
                      userCard.skillsWanted.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium border border-purple-100"
                        >
                          {typeof sk === 'object' ? sk.name : sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">None listed</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedUserModal(userCard)}
                  className="text-xs font-semibold text-gray-600 hover:text-indigo-600"
                >
                  View Profile
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setExchangePartnerModal(userCard)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Request
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Profile View Modal */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 relative">
            <button
              onClick={() => setSelectedUserModal(null)}
              className="absolute top-5 right-5 p-1 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white shadow-md">
                {selectedUserModal.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUserModal.name}</h3>
                <p className="text-xs text-gray-500">{selectedUserModal.location} • {selectedUserModal.experienceLevel}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {selectedUserModal.averageRating?.toFixed(1) || '5.0'} ({selectedUserModal.totalReviews || 0} reviews)
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900 mb-1">Bio:</p>
              {selectedUserModal.bio || 'No bio provided.'}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-indigo-700 uppercase">Offers to Teach:</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedUserModal.skillsOffered?.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold">
                      {typeof sk === 'object' ? sk.name : sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-purple-700 uppercase">Wants to Learn:</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedUserModal.skillsWanted?.map((sk, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-semibold">
                      {typeof sk === 'object' ? sk.name : sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUserModal(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => {
                    const p = selectedUserModal;
                    setSelectedUserModal(null);
                    setExchangePartnerModal(p);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Exchange Skills
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Exchange Modal */}
      {exchangePartnerModal && (
        <SendExchangeModal
          partner={exchangePartnerModal}
          onClose={() => setExchangePartnerModal(null)}
          onSuccess={() => fetchDirectoryData()}
        />
      )}

    </div>
  );
};

export default SkillDirectoryPage;
