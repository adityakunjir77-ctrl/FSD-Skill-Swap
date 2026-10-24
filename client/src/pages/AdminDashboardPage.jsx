import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  getAdminStats,
  getAdminUsers,
  toggleUserStatus,
  deleteUser,
  getAdminSkills,
  deleteSkill,
  getAdminExchanges,
} from '../services/adminService';
import { getSkillCategories, createSkill } from '../services/skillService';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Layers,
  Repeat,
  BarChart3,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  Loader2,
  RefreshCw,
  Star,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { showNotification } = useNotification();

  // Determine active view based on route
  const currentPath = location.pathname;
  const isUsersView = currentPath === '/admin/users';
  const isSkillsView = currentPath === '/admin/skills';
  const isExchangesView = currentPath === '/admin/exchanges';
  const isOverview = !isUsersView && !isSkillsView && !isExchangesView;

  // State
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('All');
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Programming', description: '' });
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentPath]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isOverview) {
        const [statsRes, usersRes, exchangesRes] = await Promise.all([
          getAdminStats(),
          getAdminUsers(),
          getAdminExchanges(),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (usersRes.success) setUsers(usersRes.data);
        if (exchangesRes.success) setExchanges(exchangesRes.data);
      } else if (isUsersView) {
        const res = await getAdminUsers({ search: userSearch });
        if (res.success) setUsers(res.data);
      } else if (isSkillsView) {
        const [catRes, skillsRes] = await Promise.all([
          getSkillCategories(),
          getAdminSkills(),
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (skillsRes.success) setSkills(skillsRes.data);
      } else if (isExchangesView) {
        const res = await getAdminExchanges();
        if (res.success) setExchanges(res.data);
      }
    } catch (err) {
      showNotification('Failed to load administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleToggleUserStatus = async (userId, userName, currentStatus) => {
    try {
      const res = await toggleUserStatus(userId);
      if (res.success) {
        showNotification(`${userName} account ${currentStatus ? 'suspended' : 'activated'}`, 'success');
        setUsers(users.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u)));
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await deleteUser(userId);
      if (res.success) {
        showNotification(`User ${userName} deleted successfully`, 'success');
        setUsers(users.filter((u) => u._id !== userId));
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  // Skill Actions
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) {
      showNotification('Please enter a skill name', 'error');
      return;
    }
    setIsSubmittingSkill(true);
    try {
      const res = await createSkill(newSkill);
      if (res.success) {
        showNotification(`Skill "${newSkill.name}" created!`, 'success');
        setNewSkill({ name: '', category: 'Programming', description: '' });
        // Refresh skills and categories
        const [catRes, skillsRes] = await Promise.all([
          getSkillCategories(),
          getAdminSkills(),
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (skillsRes.success) setSkills(skillsRes.data);
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to create skill', 'error');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Delete skill "${skillName}"?`)) return;
    try {
      const res = await deleteSkill(skillId);
      if (res.success) {
        showNotification(`Skill "${skillName}" removed`, 'success');
        setSkills(skills.filter((s) => s._id !== skillId));
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete skill', 'error');
    }
  };

  // Filter exchanges
  const filteredExchanges = exchanges.filter((item) => {
    if (exchangeFilter === 'All') return true;
    return item.status.toLowerCase() === exchangeFilter.toLowerCase();
  });

  return (
    <div className="space-y-8">
      {/* View Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {isOverview && <BarChart3 className="w-6 h-6 text-indigo-400" />}
            {isUsersView && <Users className="w-6 h-6 text-indigo-400" />}
            {isSkillsView && <Layers className="w-6 h-6 text-purple-400" />}
            {isExchangesView && <Repeat className="w-6 h-6 text-emerald-400" />}
            <span>
              {isOverview && 'Platform Metrics & Health Overview'}
              {isUsersView && 'User Moderation & Account Management'}
              {isSkillsView && 'Skill Taxonomy & Category Catalog'}
              {isExchangesView && 'Exchange Transaction Audit Log'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management controls for the SkillSwap collaborative network.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading administrative records...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. OVERVIEW VIEW */}
          {/* ========================================================================= */}
          {isOverview && (
            <div className="space-y-8">
              {/* Stats KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    title: 'Total Community Users',
                    val: stats?.totalUsers ?? '0',
                    sub: `${stats?.activeUsers ?? 0} active accounts`,
                    icon: Users,
                    color: 'text-indigo-400',
                  },
                  {
                    title: 'Skill Catalog Size',
                    val: stats?.totalSkills ?? '0',
                    sub: 'Available skills to swap',
                    icon: Layers,
                    color: 'text-purple-400',
                  },
                  {
                    title: 'Completed Exchanges',
                    val: stats?.completedExchanges ?? '0',
                    sub: `${stats?.pendingExchanges ?? 0} currently pending`,
                    icon: Repeat,
                    color: 'text-emerald-400',
                  },
                  {
                    title: 'Platform Average Rating',
                    val: stats?.averagePlatformRating ? `${stats.averagePlatformRating} ★` : '5.0 ★',
                    sub: 'Peer exchange trust score',
                    icon: Star,
                    color: 'text-amber-400',
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">{item.val}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{item.sub}</p>
                      </div>
                      <div className={`p-3 bg-slate-700/60 rounded-xl ${item.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions & Recent Users Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" /> Recent User Registrations
                    </h3>
                    <Link to="/admin/users" className="text-xs font-semibold text-indigo-400 hover:underline">
                      Manage All Users →
                    </Link>
                  </div>
                  <div className="divide-y divide-slate-700/60">
                    {users.slice(0, 5).map((u) => (
                      <div key={u._id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-full bg-slate-700"
                          />
                          <div>
                            <p className="text-sm font-semibold text-white">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                          <span className="text-xs text-slate-400 capitalize">{u.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" /> Administrative Quick Hub
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Control access, audit cross-peer exchanges, add taxonomy categories, and monitor user ratings.
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    <Link
                      to="/admin/users"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-xs font-semibold text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" /> User Moderation
                      </span>
                      <span>→</span>
                    </Link>
                    <Link
                      to="/admin/skills"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-xs font-semibold text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-purple-400" /> Skill Categories
                      </span>
                      <span>→</span>
                    </Link>
                    <Link
                      to="/admin/exchanges"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-700/60 hover:bg-slate-700 rounded-xl text-xs font-semibold text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Repeat className="w-4 h-4 text-emerald-400" /> Exchanges Audit
                      </span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. USER MODERATION VIEW */}
          {/* ========================================================================= */}
          {isUsersView && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadData()}
                    placeholder="Search users by name, email, or location..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={loadData}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-700/50 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Skills (Offered / Wanted)</th>
                        <th className="px-6 py-4">Rating</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                            No users found matching query.
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => {
                          const isSelf = currentUser?._id === u._id;
                          return (
                            <tr key={u._id} className="hover:bg-slate-750/50 transition-colors">
                              <td className="px-6 py-4 flex items-center gap-3">
                                <img
                                  src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full bg-slate-700"
                                />
                                <div>
                                  <p className="font-semibold text-white">{u.name}</p>
                                  <p className="text-slate-400 text-[11px]">{u.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    u.role === 'admin'
                                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                      : 'bg-slate-700 text-slate-300'
                                  }`}
                                >
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-300">{u.location || 'Remote'}</td>
                              <td className="px-6 py-4">
                                <span className="text-indigo-400 font-semibold">{u.skillsOffered?.length || 0}</span>
                                <span className="text-slate-500 mx-1">/</span>
                                <span className="text-purple-400 font-semibold">{u.skillsWanted?.length || 0}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-amber-400 font-bold flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  {u.averageRating ? u.averageRating.toFixed(1) : '5.0'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    u.isActive
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {u.isActive ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isSelf ? (
                                  <span className="text-[11px] text-slate-500 italic">Current Session</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleToggleUserStatus(u._id, u.name, u.isActive)}
                                      title={u.isActive ? 'Suspend User' : 'Activate User'}
                                      className={`p-1.5 rounded-lg border transition-colors ${
                                        u.isActive
                                          ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                          : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                      }`}
                                    >
                                      {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u._id, u.name)}
                                      title="Permanently Delete User"
                                      className="p-1.5 rounded-lg border border-slate-600 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SKILLS CATEGORIES & MANAGEMENT VIEW */}
          {/* ========================================================================= */}
          {isSkillsView && (
            <div className="space-y-8">
              {/* Category Distribution Grid */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                  Active Taxonomy Categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                      <p className="text-xs text-slate-400">{cat.name}</p>
                      <p className="text-lg font-bold text-white mt-1">
                        {cat.count} <span className="text-xs font-normal text-slate-500">skills</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Skill Form */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-400" /> Create Platform Skill
                </h3>
                <form onSubmit={handleCreateSkill} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Skill Name</label>
                    <input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="e.g. Next.js, Rust, Figma"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Category</label>
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      {[
                        'Programming',
                        'Web Development',
                        'Mobile Development',
                        'UI/UX Design',
                        'Graphic Design',
                        'Languages',
                        'Marketing',
                        'Photography',
                        'Video Editing',
                        'Music',
                        'Business',
                        'Other',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isSubmittingSkill}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isSubmittingSkill ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Skill
                    </button>
                  </div>
                </form>
              </div>

              {/* Skills List Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    All Registered Skills ({skills.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-700/50 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-3.5">Skill Name</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Added Date</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {skills.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                            No skills in database yet.
                          </td>
                        </tr>
                      ) : (
                        skills.map((sk) => (
                          <tr key={sk._id} className="hover:bg-slate-750/50">
                            <td className="px-6 py-3 font-semibold text-white">{sk.name}</td>
                            <td className="px-6 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700 text-slate-300">
                                {sk.category}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-slate-400">
                              {new Date(sk.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => handleDeleteSkill(sk._id, sk.name)}
                                title="Delete Skill"
                                className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. EXCHANGES AUDIT VIEW */}
          {/* ========================================================================= */}
          {isExchangesView && (
            <div className="space-y-6">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {['All', 'Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setExchangeFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      exchangeFilter === f
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Exchanges Table */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-700/50 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4">Sender</th>
                        <th className="px-6 py-4">Receiver</th>
                        <th className="px-6 py-4">Exchange Offering</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredExchanges.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                            No exchange records found in this category.
                          </td>
                        </tr>
                      ) : (
                        filteredExchanges.map((ex) => {
                          const statusColors = {
                            Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                            Accepted: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                            'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                            Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                            Cancelled: 'bg-slate-700 text-slate-400 border-slate-600',
                            Rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                          };
                          return (
                            <tr key={ex._id} className="hover:bg-slate-750/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={
                                      ex.sender?.avatar ||
                                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${ex.sender?.name || 'User'}`
                                    }
                                    alt="Sender"
                                    className="w-6 h-6 rounded-full bg-slate-700"
                                  />
                                  <span className="font-semibold text-white">{ex.sender?.name || 'Deleted User'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={
                                      ex.receiver?.avatar ||
                                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${ex.receiver?.name || 'User'}`
                                    }
                                    alt="Receiver"
                                    className="w-6 h-6 rounded-full bg-slate-700"
                                  />
                                  <span className="font-semibold text-white">
                                    {ex.receiver?.name || 'Deleted User'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-indigo-400 font-semibold">{ex.offeredSkill}</span>
                                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="text-purple-400 font-semibold">{ex.wantedSkill}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                    statusColors[ex.status] || 'bg-slate-700 text-slate-300'
                                  }`}
                                >
                                  {ex.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-400">
                                {new Date(ex.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
