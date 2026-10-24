import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecommendedMatches } from '../services/skillService';
import { getUserSessions } from '../services/sessionService';
import {
  Sparkles,
  ArrowRightLeft,
  Calendar,
  Send,
  Star,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [matchesRes, sessionsRes] = await Promise.all([
        getRecommendedMatches(),
        getUserSessions(),
      ]);
      if (matchesRes.success) setMatches(matchesRes.data.slice(0, 3));
      if (sessionsRes.success) setSessions(sessionsRes.data.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-indigo-200 tracking-wider uppercase border border-white/10">
              User Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
              Welcome back, {user?.name || 'SkillSwapper'}! 👋
            </h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-xl">
              Ready to learn something new today or share your expertise with a fellow peer?
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/matches"
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-sm hover:bg-indigo-50 shadow-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Find Recommended Matches
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Skills Offered',
            val: user?.skillsOffered?.length || 0,
            icon: ArrowRightLeft,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
          },
          {
            label: 'Skills Wanted',
            val: user?.skillsWanted?.length || 0,
            icon: Sparkles,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
          {
            label: 'Completed Exchanges',
            val: user?.completedExchanges || 0,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Average Rating',
            val: user?.averageRating ? `${user.averageRating.toFixed(1)} ★` : '5.0 ★',
            icon: Star,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.val}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Matches Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Top Recommended Matches
            </h3>
            <Link to="/matches" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All Matches →
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Calculating reciprocal compatibility...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No Direct Matches Yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                Add skills to your profile to get automatically matched with peers!
              </p>
              <Link
                to="/profile"
                className="inline-block mt-4 text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Update Skills Profile
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((item) => {
                const partner = item.user;
                return (
                  <div
                    key={partner._id}
                    className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={partner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.name}`}
                        alt={partner.name}
                        className="w-10 h-10 rounded-full bg-gray-100 object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{partner.name}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {item.score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Teaches: <span className="font-semibold text-indigo-600">{item.theyCanTeach?.join(', ') || 'Various skills'}</span>
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/matches"
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 self-end sm:self-center"
                    >
                      Connect <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Sessions Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" /> Upcoming Sessions
            </h3>
            <Link to="/sessions" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Checking scheduled dates...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No upcoming sessions scheduled.</p>
              <Link
                to="/requests"
                className="inline-block mt-3 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Schedule via Accepted Requests →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((ses) => (
                <div
                  key={ses._id}
                  className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2"
                >
                  <p className="text-xs font-bold text-gray-900">{ses.topic}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {ses.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-500" /> {ses.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
