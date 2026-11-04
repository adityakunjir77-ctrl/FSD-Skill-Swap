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
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Pill from '../components/ui/Pill';
import StatTile from '../components/ui/StatTile';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import RatingStars from '../components/ui/RatingStars';
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
  RefreshCw,
  Star,
  CheckCircle,
  Clock,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const currentPath = location.pathname;
  const isUsersView = currentPath === '/admin/users';
  const isSkillsView = currentPath === '/admin/skills';
  const isExchangesView = currentPath === '/admin/exchanges';
  const isOverview = !isUsersView && !isSkillsView && !isExchangesView;

  // Data States
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('All');
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming',
    description: '',
  });
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  // Confirmation Modal State (Replaces browser confirm)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: null,
  });

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
        if (usersRes.success) setUsers(usersRes.data || []);
        if (exchangesRes.success) setExchanges(exchangesRes.data || []);
      } else if (isUsersView) {
        const res = await getAdminUsers();
        if (res.success) setUsers(res.data || []);
      } else if (isSkillsView) {
        const [catRes, skillsRes] = await Promise.all([
          getSkillCategories(),
          getAdminSkills(),
        ]);
        if (catRes.success) setCategories(catRes.data || []);
        if (skillsRes.success) setSkills(skillsRes.data || []);
      } else if (isExchangesView) {
        const res = await getAdminExchanges();
        if (res.success) setExchanges(res.data || []);
      }
    } catch (err) {
      error('Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleToggleUserStatus = async (userId, userName, currentStatus) => {
    try {
      const res = await toggleUserStatus(userId);
      if (res.success) {
        success(
          `${userName}'s account ${currentStatus ? 'suspended' : 'activated'}`
        );
        setUsers(
          users.map((u) =>
            u._id === userId ? { ...u, isActive: !currentStatus } : u
          )
        );
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const promptDeleteUser = (userToDelete) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete User: ${userToDelete.name}`,
      message: `Are you sure you want to permanently delete user "${userToDelete.name}" (${userToDelete.email})? This action cannot be undone.`,
      confirmLabel: 'Delete User',
      onConfirm: async () => {
        try {
          const res = await deleteUser(userToDelete._id);
          if (res.success) {
            success(`User ${userToDelete.name} deleted successfully.`);
            setUsers(users.filter((u) => u._id !== userToDelete._id));
          }
        } catch (err) {
          error(err.response?.data?.message || 'Failed to delete user');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Skill Actions
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.name.trim()) {
      error('Please enter a skill name');
      return;
    }
    setIsSubmittingSkill(true);
    try {
      const res = await createSkill(newSkill);
      if (res.success) {
        success(`Skill "${newSkill.name}" created!`);
        setNewSkill({ name: '', category: 'Programming', description: '' });
        loadData();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create skill');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const promptDeleteSkill = (skillToDelete) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete Skill: ${skillToDelete.name}`,
      message: `Are you sure you want to delete "${skillToDelete.name}" from the skill catalog?`,
      confirmLabel: 'Delete Skill',
      onConfirm: async () => {
        try {
          const res = await deleteSkill(skillToDelete._id);
          if (res.success) {
            success(`Skill "${skillToDelete.name}" deleted.`);
            setSkills(skills.filter((s) => s._id !== skillToDelete._id));
          }
        } catch (err) {
          error(err.response?.data?.message || 'Failed to delete skill');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Filtered queries
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q)
    );
  });

  const filteredSkills = skills.filter((s) => {
    const q = skillSearch.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q);
  });

  const filteredExchanges = exchanges.filter((ex) => {
    if (exchangeFilter === 'All') return true;
    return ex.status === exchangeFilter;
  });

  return (
    <div className="space-y-6">
      {/* VIEW 1: OVERVIEW */}
      {isOverview && (
        <div className="space-y-6">
          {/* KPI Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <StatTile
              label="Total Users"
              value={stats?.totalUsers || users.length}
              icon={Users}
              variant="default"
            />
            <StatTile
              label="Active Users"
              value={stats?.activeUsers || users.filter((u) => u.isActive).length}
              icon={UserCheck}
              variant="success"
            />
            <StatTile
              label="Catalog Skills"
              value={stats?.totalSkills || 16}
              icon={Layers}
              variant="default"
            />
            <StatTile
              label="Total Exchanges"
              value={stats?.totalExchanges || exchanges.length}
              icon={Repeat}
              variant="coral"
            />
            <StatTile
              label="Completed"
              value={stats?.completedExchanges || exchanges.filter((e) => e.status === 'Completed').length}
              icon={CheckCircle}
              variant="success"
            />
            <StatTile
              label="Platform Avg"
              value={`${stats?.averagePlatformRating || '5.0'} ★`}
              icon={Star}
              variant="amber"
            />
          </div>

          {/* Recent Users & Exchanges Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users preview */}
            <div className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft">
              <div className="flex items-center justify-between pb-3 border-b border-canvas-border mb-3">
                <h2 className="font-heading font-bold text-sm text-ink-primary flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-teal" />
                  Recent Member Registrations
                </h2>
                <Link
                  to="/admin/users"
                  className="text-xs font-heading font-semibold text-brand-teal hover:underline"
                >
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-canvas-border">
                {users.slice(0, 5).map((u) => (
                  <div key={u._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar src={u.avatar} name={u.name} id={u._id} size="xs" />
                      <div className="min-w-0">
                        <span className="font-heading font-semibold text-ink-primary truncate block">
                          {u.name}
                        </span>
                        <span className="text-[11px] text-ink-muted truncate block">
                          {u.email}
                        </span>
                      </div>
                    </div>

                    <Pill variant={u.isActive ? 'success' : 'danger'} size="xs">
                      {u.isActive ? 'Active' : 'Suspended'}
                    </Pill>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Exchanges preview */}
            <div className="bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft">
              <div className="flex items-center justify-between pb-3 border-b border-canvas-border mb-3">
                <h2 className="font-heading font-bold text-sm text-ink-primary flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-brand-coral" />
                  Latest Peer Exchanges
                </h2>
                <Link
                  to="/admin/exchanges"
                  className="text-xs font-heading font-semibold text-brand-teal hover:underline"
                >
                  View audit log →
                </Link>
              </div>

              <div className="divide-y divide-canvas-border">
                {exchanges.slice(0, 5).map((ex) => (
                  <div key={ex._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-heading font-semibold text-ink-primary truncate">
                        {ex.sender?.name} ↔ {ex.receiver?.name}
                      </div>
                      <div className="text-[11px] text-ink-secondary truncate">
                        {ex.offeredSkill} for {ex.wantedSkill}
                      </div>
                    </div>

                    <Pill
                      variant={
                        ex.status === 'Completed'
                          ? 'success'
                          : ex.status === 'Accepted'
                          ? 'teach'
                          : ex.status === 'Pending'
                          ? 'warning'
                          : 'danger'
                      }
                      size="xs"
                    >
                      {ex.status}
                    </Pill>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: USER MODERATION */}
      {isUsersView && (
        <div className="bg-canvas-card border border-canvas-border rounded-card shadow-soft overflow-hidden">
          {/* Header & Search */}
          <div className="p-4 border-b border-canvas-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-bold text-base text-ink-primary">
                User Moderation Directory ({filteredUsers.length})
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Audit registered users, toggle account active status, and moderate abusive profiles.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email, location..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-canvas-subtle border border-canvas-border rounded-input text-ink-primary focus-ring"
              />
            </div>
          </div>

          {/* Sticky Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle/80 border-b border-canvas-border text-ink-muted font-heading font-semibold sticky top-0 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border">
                {filteredUsers.map((u) => {
                  const isCurrent = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-canvas-subtle/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={u.avatar} name={u.name} id={u._id} size="sm" />
                          <div>
                            <div className="font-heading font-semibold text-ink-primary">
                              {u.name} {isCurrent && '(You)'}
                            </div>
                            <div className="text-[11px] text-ink-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-heading font-medium capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-secondary">
                        {u.location || 'Remote'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-ink-primary">
                          {u.averageRating?.toFixed(1) || '5.0'} ★
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Pill variant={u.isActive ? 'success' : 'danger'} size="xs">
                          {u.isActive ? 'Active' : 'Suspended'}
                        </Pill>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleToggleUserStatus(u._id, u.name, u.isActive)}
                              icon={u.isActive ? UserX : UserCheck}
                            >
                              {u.isActive ? 'Suspend' : 'Activate'}
                            </Button>
                            <Button
                              variant="danger-ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => promptDeleteUser(u)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: SKILL CATALOG AUDIT */}
      {isSkillsView && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Skills List Table (8 cols) */}
          <div className="lg:col-span-8 bg-canvas-card border border-canvas-border rounded-card shadow-soft overflow-hidden">
            <div className="p-4 border-b border-canvas-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading font-bold text-base text-ink-primary">
                  Skill Catalog Entries ({filteredSkills.length})
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Audit registered skills and categories. Remove duplicate or inappropriate skills.
                </p>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-canvas-subtle border border-canvas-border rounded-input text-ink-primary focus-ring"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas-subtle/80 border-b border-canvas-border text-ink-muted font-heading font-semibold sticky top-0 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Skill Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-canvas-border">
                  {filteredSkills.map((sk) => (
                    <tr key={sk._id} className="hover:bg-canvas-subtle/50 transition-colors">
                      <td className="py-2.5 px-4 font-heading font-semibold text-ink-primary">
                        {sk.name}
                      </td>
                      <td className="py-2.5 px-4">
                        <Pill variant="neutral" size="xs">
                          {sk.category}
                        </Pill>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Button
                          variant="danger-ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => promptDeleteSkill(sk)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Skill Panel (4 cols) */}
          <div className="lg:col-span-4 bg-canvas-card border border-canvas-border rounded-card p-5 shadow-soft space-y-4">
            <h2 className="font-heading font-bold text-sm text-ink-primary flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-teal" />
              Add New Platform Skill
            </h2>

            <form onSubmit={handleCreateSkill} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-heading font-semibold text-ink-primary mb-1">
                  Skill Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Go Programming"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
                />
              </div>

              <div>
                <label className="block font-heading font-semibold text-ink-primary mb-1">
                  Category
                </label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-canvas-border rounded-input text-ink-primary focus-ring"
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
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-heading font-semibold text-ink-primary mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description..."
                  value={newSkill.description}
                  onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-canvas-border rounded-input text-ink-primary focus-ring resize-none leading-relaxed"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSubmittingSkill}
                icon={Plus}
                className="w-full"
              >
                Add Skill to Catalog
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW 4: GLOBAL EXCHANGES AUDIT */}
      {isExchangesView && (
        <div className="bg-canvas-card border border-canvas-border rounded-card shadow-soft overflow-hidden">
          <div className="p-4 border-b border-canvas-border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-heading font-bold text-base text-ink-primary">
                Global Exchange Audit Logs ({filteredExchanges.length})
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Complete transactional audit trail of all peer skill exchanges initiated across the platform.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Filter status:</span>
              <select
                value={exchangeFilter}
                onChange={(e) => setExchangeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-canvas-subtle border border-canvas-border rounded-input text-ink-primary focus-ring"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle/80 border-b border-canvas-border text-ink-muted font-heading font-semibold sticky top-0 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Receiver</th>
                  <th className="py-3 px-4">Offered Skill</th>
                  <th className="py-3 px-4">Wanted Skill</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-canvas-border">
                {filteredExchanges.map((ex) => (
                  <tr key={ex._id} className="hover:bg-canvas-subtle/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={ex.sender?.avatar} name={ex.sender?.name} id={ex.sender?._id} size="xs" />
                        <span className="font-heading font-semibold text-ink-primary">
                          {ex.sender?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar src={ex.receiver?.avatar} name={ex.receiver?.name} id={ex.receiver?._id} size="xs" />
                        <span className="font-heading font-semibold text-ink-primary">
                          {ex.receiver?.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Pill variant="teach" size="xs">
                        {ex.offeredSkill}
                      </Pill>
                    </td>
                    <td className="py-3 px-4">
                      <Pill variant="learn" size="xs">
                        {ex.wantedSkill}
                      </Pill>
                    </td>
                    <td className="py-3 px-4">
                      <Pill
                        variant={
                          ex.status === 'Completed'
                            ? 'success'
                            : ex.status === 'Accepted'
                            ? 'teach'
                            : ex.status === 'Pending'
                            ? 'warning'
                            : 'danger'
                        }
                        size="xs"
                      >
                        {ex.status}
                      </Pill>
                    </td>
                    <td className="py-3 px-4 text-right text-ink-muted">
                      {new Date(ex.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (Replaces window.confirm) */}
      <Modal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDialog.onConfirm}
            >
              {confirmDialog.confirmLabel}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-secondary leading-relaxed">
          {confirmDialog.message}
        </p>
      </Modal>
    </div>
  );
}
