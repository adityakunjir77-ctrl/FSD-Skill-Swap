import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllUsers } from '../services/userService';
import { getSkillCategories } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Avatar from '../components/ui/Avatar';
import Pill from '../components/ui/Pill';
import Button from '../components/ui/Button';
import RatingStars from '../components/ui/RatingStars';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import SendExchangeModal from '../components/SendExchangeModal';
import {
  Compass,
  Search,
  Filter,
  MapPin,
  Briefcase,
  LayoutGrid,
  List,
  X,
  ArrowRightLeft,
  ArrowRight,
} from 'lucide-react';

export default function SkillDirectoryPage() {
  const { user: currentUser } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modal
  const [exchangePartnerModal, setExchangePartnerModal] = useState(null);

  useEffect(() => {
    fetchDirectoryData();
  }, []);

  // Sync url param changes to category
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q) setSearchQuery(q);
  }, [searchParams]);

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
      error('Failed to load skill directory data');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  const filteredUsers = users.filter((u) => {
    // Exclude logged in user
    if (currentUser && u._id === currentUser._id) return false;

    // Search query matching
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      u.name?.toLowerCase().includes(query) ||
      u.bio?.toLowerCase().includes(query) ||
      u.location?.toLowerCase().includes(query) ||
      u.skillsOffered?.some((sk) =>
        (typeof sk === 'object' ? sk.name : sk).toLowerCase().includes(query)
      ) ||
      u.skillsWanted?.some((sk) =>
        (typeof sk === 'object' ? sk.name : sk).toLowerCase().includes(query)
      );

    // Category matching
    const matchesCategory =
      selectedCategory === 'All' ||
      u.skillsOffered?.some(
        (sk) => typeof sk === 'object' && sk.category === selectedCategory
      ) ||
      u.skillsWanted?.some(
        (sk) => typeof sk === 'object' && sk.category === selectedCategory
      );

    // Experience matching
    const matchesExperience =
      selectedExperience === 'All' || u.experienceLevel === selectedExperience;

    return matchesSearch && matchesCategory && matchesExperience;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-canvas-border">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-ink-primary flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-teal" />
            Skill Discovery Directory
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Search, filter, and discover community peers offering skills you want to learn.
          </p>
        </div>

        {/* View Toggle (Grid vs List) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-canvas-subtle border border-canvas-border rounded-button">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-ink-primary shadow-soft'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-ink-primary shadow-soft'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls Card */}
      <div className="bg-canvas-card border border-canvas-border rounded-card p-4 shadow-soft space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by peer name, skill offered, or skill wanted..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-canvas-subtle/70 border border-canvas-border rounded-input text-ink-primary placeholder-ink-muted focus-ring transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Experience Filter Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-ink-muted hidden sm:block" />
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-canvas-subtle/70 border border-canvas-border rounded-input text-ink-primary focus-ring"
            >
              <option value="All">All Experience Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        {/* 12 Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => handleCategorySelect('All')}
            className={`px-3 py-1 rounded-full text-xs font-heading font-medium whitespace-nowrap transition-colors border select-none ${
              selectedCategory === 'All'
                ? 'bg-brand-teal text-white border-transparent'
                : 'bg-canvas-subtle text-ink-secondary border-canvas-border hover:bg-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategorySelect(cat.name)}
              className={`px-3 py-1 rounded-full text-xs font-heading font-medium whitespace-nowrap transition-colors border select-none ${
                selectedCategory === cat.name
                  ? 'bg-brand-teal text-white border-transparent'
                  : 'bg-canvas-subtle text-ink-secondary border-canvas-border hover:bg-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Users Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton variant="card" count={6} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No peers found matching your criteria"
          description="Try clearing your search query or selecting a different skill category to find other community members."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setSelectedExperience('All');
          }}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((userCard) => {
            const offers = userCard.skillsOffered || [];
            const wants = userCard.skillsWanted || [];

            return (
              <div
                key={userCard._id}
                className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft hover:border-canvas-border-dark transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Avatar, Name, Location, Rating */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={userCard.avatar}
                        name={userCard.name}
                        id={userCard._id}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <h3 className="font-heading font-bold text-sm text-ink-primary truncate">
                          {userCard.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-ink-muted mt-0.5">
                          {userCard.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" />
                              {userCard.location}
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Briefcase className="w-3 h-3" />
                            {userCard.experienceLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <RatingStars
                      rating={userCard.averageRating || 5.0}
                      count={userCard.totalReviews || 0}
                      size="xs"
                      showScore
                    />
                  </div>

                  {/* Bio */}
                  {userCard.bio && (
                    <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed mb-4">
                      {userCard.bio}
                    </p>
                  )}

                  {/* Skills Breakdown */}
                  <div className="space-y-2.5 pt-3 border-t border-canvas-border/70 text-xs">
                    {/* Teaches */}
                    <div>
                      <div className="text-[11px] font-heading font-semibold text-teach-text uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teach-text" />
                        Teaches:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {offers.length > 0 ? (
                          <>
                            {offers.slice(0, 3).map((sk, idx) => (
                              <Pill key={idx} variant="teach" size="xs">
                                {typeof sk === 'object' ? sk.name : sk}
                              </Pill>
                            ))}
                            {offers.length > 3 && (
                              <span className="text-[10px] text-ink-muted font-medium self-center pl-1">
                                +{offers.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-ink-muted italic">None specified</span>
                        )}
                      </div>
                    </div>

                    {/* Wants to Learn */}
                    <div>
                      <div className="text-[11px] font-heading font-semibold text-learn-text uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-learn-text" />
                        Wants to learn:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {wants.length > 0 ? (
                          <>
                            {wants.slice(0, 3).map((sk, idx) => (
                              <Pill key={idx} variant="learn" size="xs">
                                {typeof sk === 'object' ? sk.name : sk}
                              </Pill>
                            ))}
                            {wants.length > 3 && (
                              <span className="text-[10px] text-ink-muted font-medium self-center pl-1">
                                +{wants.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-ink-muted italic">None specified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t border-canvas-border">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/profile/${userCard._id}`)}
                    className="flex-1"
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setExchangePartnerModal(userCard)}
                    className="flex-1"
                  >
                    Propose Swap
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-3">
          {filteredUsers.map((userCard) => {
            const offers = userCard.skillsOffered || [];
            const wants = userCard.skillsWanted || [];

            return (
              <div
                key={userCard._id}
                className="bg-canvas-card border border-canvas-border rounded-card p-4 shadow-soft hover:border-canvas-border-dark transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
                  <Avatar
                    src={userCard.avatar}
                    name={userCard.name}
                    id={userCard._id}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-sm text-ink-primary truncate">
                        {userCard.name}
                      </h3>
                      <span className="text-[11px] text-ink-muted">
                        {userCard.location || 'Remote'}
                      </span>
                      <span>•</span>
                      <RatingStars
                        rating={userCard.averageRating || 5.0}
                        count={userCard.totalReviews || 0}
                        size="xs"
                        showScore
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-teach-text font-semibold text-[11px]">Teaches:</span>
                        <div className="flex flex-wrap gap-1">
                          {offers.slice(0, 3).map((sk, idx) => (
                            <Pill key={idx} variant="teach" size="xs">
                              {typeof sk === 'object' ? sk.name : sk}
                            </Pill>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-learn-text font-semibold text-[11px]">Wants:</span>
                        <div className="flex flex-wrap gap-1">
                          {wants.slice(0, 3).map((sk, idx) => (
                            <Pill key={idx} variant="learn" size="xs">
                              {typeof sk === 'object' ? sk.name : sk}
                            </Pill>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/profile/${userCard._id}`)}
                  >
                    Profile
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setExchangePartnerModal(userCard)}
                  >
                    Propose Swap
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Swap Modal */}
      {exchangePartnerModal && (
        <SendExchangeModal
          isOpen={Boolean(exchangePartnerModal)}
          onClose={() => setExchangePartnerModal(null)}
          partnerUser={exchangePartnerModal}
          onSuccess={() => {
            setExchangePartnerModal(null);
          }}
        />
      )}
    </div>
  );
}
