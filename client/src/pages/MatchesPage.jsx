import React, { useState, useEffect } from 'react';
import { getRecommendedMatches } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import SendExchangeModal from '../components/SendExchangeModal';
import { 
  Sparkles, 
  ArrowRightLeft, 
  BookOpen, 
  Star, 
  MapPin, 
  Briefcase, 
  Send, 
  Loader2
} from 'lucide-react';

const MatchesPage = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [exchangePartnerModal, setExchangePartnerModal] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await getRecommendedMatches();
      if (res.success) {
        setMatches(res.data);
      }
    } catch (err) {
      showNotification('Failed to fetch recommended matches', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-purple-200 tracking-wider uppercase border border-white/10 flex items-center gap-1.5 w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" /> Algorithmic Recommendation Engine
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Recommended Skill Matches
            </h1>
            <p className="text-purple-200 text-sm mt-1 max-w-2xl">
              We paired your skills offered and wanted with community peers to find reciprocal learning opportunities with maximum compatibility.
            </p>
          </div>
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all w-fit"
          >
            Update Profile Skills
          </Link>
        </div>
      </div>

      {/* Matches Content Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">Calculating reciprocal compatibility scores...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Recommended Matches Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
            Add skills you offer and skills you want on your profile to let our matching algorithm connect you with compatible mentors!
          </p>
          <Link
            to="/profile"
            className="inline-block mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-indigo-700"
          >
            Add Profile Skills
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((item) => {
            const partner = item.user;
            const score = item.score;
            const isHighMatch = score >= 70;

            return (
              <div
                key={partner._id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar: Compatibility Score & Reciprocal Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${
                          isHighMatch
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {score}% Match
                      </span>
                      {item.isReciprocal && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" /> 2-Way Reciprocal
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {partner.averageRating ? partner.averageRating.toFixed(1) : '5.0'}
                    </div>
                  </div>

                  {/* Partner Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-lg flex items-center justify-center border-2 border-white shadow-md">
                      {partner.name ? partner.name.slice(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{partner.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" /> {partner.location || 'Remote'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-purple-500" /> {partner.experienceLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {partner.bio || 'Ready for peer skill exchange.'}
                  </p>

                  {/* Skills Match Breakdown */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
                        You Can Teach Them:
                      </span>
                      {item.youCanTeach.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.youCanTeach.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-xs font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No direct match</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
                        They Can Teach You:
                      </span>
                      {item.theyCanTeach.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {item.theyCanTeach.map((sk, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-md text-xs font-semibold">
                              {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No direct match</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    {partner.completedExchanges || 0} completed exchanges
                  </span>
                  <button
                    onClick={() => setExchangePartnerModal(partner)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" /> Exchange Skills
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Exchange Modal */}
      {exchangePartnerModal && (
        <SendExchangeModal
          partner={exchangePartnerModal}
          onClose={() => setExchangePartnerModal(null)}
          onSuccess={() => fetchMatches()}
        />
      )}

    </div>
  );
};

export default MatchesPage;
