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
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 border-b border-ink-primary">
        <div>
          <div className="flex items-baseline gap-3 sm:gap-4">
            <span className="chapter-num text-display-sm sm:text-display-md leading-none" aria-hidden="true">1</span>
            <h1 className="font-display font-medium text-display-sm sm:text-display-md tracking-[-0.02em] text-ink-primary">
              Skill Discovery Directory
            </h1>
          </div>
          <p className="text-base text-ink-secondary mt-2 max-w-2xl">
            Search, filter, and discover community peers offering skills you want to learn.
          </p>
        </div>

        {/* View Toggle (Grid vs List) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center border border-ink-primary rounded-button">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-ink-primary text-white'
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
              className={`p-2 text-xs font-medium transition-colors border-l border-ink-primary ${
                viewMode === 'list'
                  ? 'bg-ink-primary text-white'
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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by peer name, skill offered, or skill wanted..."
              className="w-full pl-9 pr-8 py-2.5 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input text-ink-primary placeholder-ink-muted hover:border-ink-muted focus-ring transition-colors"
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
              className="px-3 py-2.5 text-[15px] bg-canvas-card border border-canvas-border-dark rounded-input text-ink-primary hover:border-ink-muted focus-ring"
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <button
            type="button"
            onClick={() => handleCategorySelect('All')}
            className={`px-3 py-1.5 rounded-button text-sm font-heading font-semibold whitespace-nowrap transition-colors border select-none ${
              selectedCategory === 'All'
                ? 'bg-ink-primary text-white border-ink-primary'
                : 'bg-transparent text-ink-secondary border-canvas-border-dark hover:border-ink-primary hover:text-ink-primary'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategorySelect(cat.name)}
              className={`px-3 py-1.5 rounded-button text-sm font-heading font-semibold whitespace-nowrap transition-colors border select-none ${
                selectedCategory === cat.name
                  ? 'bg-ink-primary text-white border-ink-primary'
                  : 'bg-transparent text-ink-secondary border-canvas-border-dark hover:border-ink-primary hover:text-ink-primary'
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
                className="bg-canvas-card border border-canvas-border border-t-2 border-t-ink-primary rounded-card p-5 hover:border-ink-primary/50 hover:border-t-ink-primary transition-colors flex flex-col justify-between"
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
                        <h3 className="font-display font-medium text-lg leading-snug text-ink-primary truncate">
                          {userCard.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-ink-muted mt-0.5">
                          {userCard.location && (
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" strokeWidth={1.75} />
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
                    <p className="text-sm text-ink-secondary line-clamp-2 leading-relaxed mb-4">
                      {userCard.bio}
                    </p>
                  )}

                  {/* Skills Breakdown */}
                  <div className="space-y-3 pt-3 border-t border-canvas-border text-xs">
                    {/* Teaches */}
                    <div>
                      <div className="text-[13px] font-heading font-semibold text-teach-text mb-1.5 flex items-center gap-1">
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
                              <span className="text-xs text-ink-muted font-medium self-center pl-1">
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
                      <div className="text-[13px] font-heading font-semibold text-learn-text mb-1.5 flex items-center gap-1">
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
                              <span className="text-xs text-ink-muted font-medium self-center pl-1">
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
                <div className="flex items-center gap-2 pt-4 mt-4">
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
        <div className="border-t-2 border-ink-primary divide-y divide-canvas-border">
          {filteredUsers.map((userCard) => {
            const offers = userCard.skillsOffered || [];
            const wants = userCard.skillsWanted || [];

            return (
              <div
                key={userCard._id}
                className="py-4 px-1 hover:bg-canvas-card transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                      <h3 className="font-display font-medium text-lg leading-snug text-ink-primary truncate">
                        {userCard.name}
                      </h3>
                      <span className="text-sm text-ink-muted">
                        {userCard.location || 'Remote'}
                      </span>
                      <span className="text-ink-faint" aria-hidden="true">/</span>
                      <RatingStars
                        rating={userCard.averageRating || 5.0}
                        count={userCard.totalReviews || 0}
                        size="xs"
                        showScore
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-teach-text font-semibold text-[13px]">Teaches:</span>
                        <div className="flex flex-wrap gap-1">
                          {offers.slice(0, 3).map((sk, idx) => (
                            <Pill key={idx} variant="teach" size="xs">
                              {typeof sk === 'object' ? sk.name : sk}
                            </Pill>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-learn-text font-semibold text-[13px]">Wants:</span>
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
