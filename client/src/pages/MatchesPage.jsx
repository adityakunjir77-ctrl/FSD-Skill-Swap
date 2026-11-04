import React, { useState, useEffect } from 'react';
import { getRecommendedMatches } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { useNavigate, Link } from 'react-router-dom';
import SwapCard from '../components/ui/SwapCard';
import Tabs from '../components/ui/Tabs';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import SendExchangeModal from '../components/SendExchangeModal';
import { Sparkles, ArrowRightLeft, UserCheck } from 'lucide-react';

export default function MatchesPage() {
  const { user: currentUser } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'reciprocal'

  // Modal
  const [exchangePartnerModal, setExchangePartnerModal] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await getRecommendedMatches();
      if (res.success) {
        setMatches(res.data || []);
      }
    } catch (err) {
      error('Failed to load recommended matches');
    } finally {
      setLoading(false);
    }
  };

  const reciprocalCount = matches.filter((m) => m.isReciprocal || m.score >= 70).length;

  const displayedMatches =
    filterMode === 'reciprocal'
      ? matches.filter((m) => m.isReciprocal || m.score >= 70)
      : matches;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 border-b border-ink-primary">
        <div>
          <div className="flex items-baseline gap-3 sm:gap-4">
            <span className="chapter-num text-display-sm sm:text-display-md leading-none" aria-hidden="true">2</span>
            <h1 className="font-display font-medium text-display-sm sm:text-display-md tracking-[-0.02em] text-ink-primary">
              Reciprocal Skill Matches
            </h1>
          </div>
          <p className="text-base text-ink-secondary mt-2 max-w-2xl">
            Complementary peer pairings calculated from your offered and wanted skills.
          </p>
        </div>

        {/* Segmented Filter Control */}
        <div className="self-start sm:self-auto">
          <Tabs
            variant="segmented"
            tabs={[
              { id: 'all', label: 'All Matches', count: matches.length },
              { id: 'reciprocal', label: '100% Reciprocal', count: reciprocalCount },
            ]}
            activeTab={filterMode}
            onChange={(tabId) => setFilterMode(tabId)}
          />
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton variant="card" count={4} />
        </div>
      ) : displayedMatches.length === 0 ? (
        <EmptyState
          title={
            filterMode === 'reciprocal'
              ? 'No 100% reciprocal matches yet'
              : 'No recommended matches calculated'
          }
          description="Add more skills you offer and want to learn to your profile so our matching engine can discover complementary learning partners."
          actionLabel="Update My Skills Profile"
          onAction={() => navigate('/profile')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedMatches.map((item, idx) => (
            <SwapCard
              key={item.user?._id || idx}
              currentUser={currentUser}
              partnerUser={item.user}
              compatibilityScore={item.score}
              isReciprocal={item.isReciprocal || item.score >= 70}
              isBestMatch={idx === 0 && filterMode === 'all'}
              youCanTeach={item.youCanTeach}
              theyCanTeach={item.theyCanTeach}
              onProposeSwap={(partner) => setExchangePartnerModal(partner)}
              onViewProfile={(partner) => navigate(`/profile/${partner._id}`)}
            />
          ))}
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
