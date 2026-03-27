'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Header, Breadcrumb } from '@/components/layout';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  X, 
  Loader2,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Key,
  AlertCircle,
  CheckCircle,
  UserX,
  UserCheck,
  Send
} from 'lucide-react';
import {
  getUsersPaginated,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  resendWelcomeEmail,
  UserAPI,
  UserRole,
  UserStatus,
} from '@/lib/api';

// Role badge colors
const ROLE_STYLES: Record<UserRole, { bg: string; text: string; icon: React.ReactNode }> = {
  admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <ShieldCheck className="w-3 h-3" /> },
  staff: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Shield className="w-3 h-3" /> },
};

// Status badge colors
const STATUS_STYLES: Record<UserStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  inactive: { bg: 'bg-red-100', text: 'text-red-700' },
};

interface UserFormData {
  email: string;
  name: string;
  role: UserRole;
}

export default function UsersPage() {
  const { user: currentUser, isAdmin, hasPermission } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<UserAPI | null>(null);
  const [deleteUserData, setDeleteUserData] = useState<UserAPI | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserAPI | null>(null);
  const [resendWelcomeUser, setResendWelcomeUser] = useState<UserAPI | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    name: '',
    role: 'staff',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResendingWelcome, setIsResendingWelcome] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Action menu
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Handle action menu open with position calculation
  const handleActionMenuOpen = (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (actionMenuOpen === userId) {
      setActionMenuOpen(null);
      return;
    }
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    // Position menu above the button, aligned to the right
    setMenuPosition({
      top: rect.top - 10, // Will be adjusted by the menu height
      left: rect.right - 192, // 192px = w-48 (12rem)
    });
    setActionMenuOpen(userId);
  };

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsersPaginated({
        page: currentPage,
        limit: 25,
        search: searchQuery || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [fetchUsers, isAdmin]);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset form
  const resetForm = () => {
    setFormData({ email: '', name: '', role: 'staff' });
    setError(null);
    setSuccessMessage(null);
  };

  // Handle create user
  const handleCreateUser = async () => {
    setError(null);
    setSuccessMessage(null);
    
    if (!formData.email || !formData.name) {
      setError('Email and name are required');
      return;
    }

    // Basic email validation
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSaving(true);
    try {
      const response = await createUser({
        email: formData.email,
        name: formData.name,
        role: formData.role,
      });
      setSuccessMessage(response.message || 'User created successfully. A setup link has been sent to their email.');
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
        fetchUsers();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle update user
  const handleUpdateUser = async () => {
    if (!editUser) return;
    setError(null);

    if (!formData.email || !formData.name) {
      setError('Email and name are required');
      return;
    }

    setIsSaving(true);
    try {
      await updateUser(editUser.id, {
        email: formData.email,
        name: formData.name,
        role: formData.role,
      });
      setEditUser(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: UserAPI) => {
    try {
      await updateUser(user.id, {
        status: user.status === 'active' ? 'inactive' : 'active',
      });
      fetchUsers();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
    setActionMenuOpen(null);
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;

    setIsResettingPassword(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await resetUserPassword(resetPasswordUser.id);
      setSuccessMessage(response.message || 'Password reset link has been sent to the user\'s email.');
      setTimeout(() => {
        setResetPasswordUser(null);
        setSuccessMessage(null);
        fetchUsers();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Handle resend welcome email
  const handleResendWelcome = async () => {
    if (!resendWelcomeUser) return;

    setIsResendingWelcome(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await resendWelcomeEmail(resendWelcomeUser.id);
      setSuccessMessage(response.message || 'Setup link has been sent to the user\'s email.');
      setTimeout(() => {
        setResendWelcomeUser(null);
        setSuccessMessage(null);
        fetchUsers();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send welcome email');
    } finally {
      setIsResendingWelcome(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!deleteUserData) return;

    setIsDeleting(true);
    try {
      await deleteUser(deleteUserData.id);
      setDeleteUserData(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
        <Header activeNav="users" />
        <main className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">You don't have permission to access this page.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
      <Header activeNav="users" />
      
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Users', href: null },
            ]}
          />

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage users and their permissions</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} className="ml-auto">
                <X className="w-4 h-4 text-green-500" />
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value as UserRole | '');
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '');
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[user.role].bg} ${ROLE_STYLES[user.role].text}`}>
                        {ROLE_STYLES[user.role].icon}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[user.status].bg} ${STATUS_STYLES[user.status].text}`}>
                        {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(user.last_login)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {user.must_change_password ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Key className="w-3 h-3 mr-1" />
                          Must Change
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => handleActionMenuOpen(user.id, e)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Menu Portal - Rendered outside table to avoid overflow issues */}
        {actionMenuOpen && (
          <>
            <div 
              className="fixed inset-0 z-[100]" 
              onClick={() => setActionMenuOpen(null)} 
            />
            <div 
              className="fixed z-[101] w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1"
              style={{
                top: `${Math.max(10, menuPosition.top - 180)}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              {users.filter(u => u.id === actionMenuOpen).map(user => (
                <div key={user.id}>
                  <button
                    onClick={() => {
                      setFormData({
                        email: user.email,
                        name: user.name,
                        role: user.role,
                      });
                      setEditUser(user);
                      setActionMenuOpen(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                    Edit User
                  </button>
                  <button
                    onClick={() => {
                      setResetPasswordUser(user);
                      setError(null);
                      setSuccessMessage(null);
                      setActionMenuOpen(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Key className="w-4 h-4 text-gray-500" />
                    Reset Password
                  </button>
                  <button
                    onClick={() => {
                      setResendWelcomeUser(user);
                      setError(null);
                      setSuccessMessage(null);
                      setActionMenuOpen(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 text-gray-500" />
                    Resend Welcome Email
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    {user.status === 'active' ? (
                      <>
                        <UserX className="w-4 h-4 text-gray-500" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        Activate
                      </>
                    )}
                  </button>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => {
                        setDeleteUserData(user);
                        setActionMenuOpen(null);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete User
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || editUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditUser(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@school.edu"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password info (only for new users) */}
              {!editUser && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      A setup link will be sent to the user's email address. They will create their own password using that link.
                    </p>
                  </div>
                </div>
              )}

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">Staff - Can view all data and generate transcripts</option>
                  <option value="admin">Admin - Full access to everything</option>
                </select>
              </div>

              {/* Role description */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  {formData.role === 'admin' && (
                    <><strong>Admin:</strong> Full access to all features including user management, student records, courses, grades, and transcript generation.</>
                  )}
                  {formData.role === 'staff' && (
                    <><strong>Staff:</strong> Can view students, courses, and grades. Can generate transcripts. Cannot manage users or edit data.</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditUser(null);
                  resetForm();
                }}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={editUser ? handleUpdateUser : handleCreateUser}
                disabled={isSaving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editUser ? 'Save Changes' : 'Create User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
              <button
                onClick={() => {
                  setResetPasswordUser(null);
                  setError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              <p className="text-gray-600">
                Reset password for <strong>{resetPasswordUser.name}</strong>
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    A password reset link will be sent to <strong>{resetPasswordUser.email}</strong>.
                    They can use it to create a new password.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setResetPasswordUser(null);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isResettingPassword || !!successMessage}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resend Welcome Email Modal */}
      {resendWelcomeUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Resend Welcome Email</h2>
              <button
                onClick={() => {
                  setResendWelcomeUser(null);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              )}

              <p className="text-gray-600">
                Resend welcome email to <strong>{resendWelcomeUser.name}</strong>
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    A new setup link will be sent to <strong>{resendWelcomeUser.email}</strong>.
                    They can use it to set up their password.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    This will invalidate any previous setup link sent to this user.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setResendWelcomeUser(null);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResendWelcome}
                disabled={isResendingWelcome || !!successMessage}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                {isResendingWelcome ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Welcome Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteUserData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Delete User
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <strong>{deleteUserData.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteUserData(null)}
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useRouter } from 'next/navigation';
// import { Header, Breadcrumb } from '@/components/layout';
// import { 
//   Users, 
//   Plus, 
//   Search, 
//   MoreVertical, 
//   Pencil, 
//   Trash2, 
//   X, 
//   Loader2,
//   Shield,
//   ShieldCheck,
//   Mail,
//   Calendar,
//   Key,
//   AlertCircle,
//   CheckCircle,
//   UserX,
//   UserCheck
// } from 'lucide-react';
// import {
//   getUsersPaginated,
//   createUser,
//   updateUser,
//   deleteUser,
//   resetUserPassword,
//   UserAPI,
//   UserRole,
//   UserStatus,
// } from '@/lib/api';

// // Role badge colors
// const ROLE_STYLES: Record<UserRole, { bg: string; text: string; icon: React.ReactNode }> = {
//   admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <ShieldCheck className="w-3 h-3" /> },
//   staff: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Shield className="w-3 h-3" /> },
// };

// // Status badge colors
// const STATUS_STYLES: Record<UserStatus, { bg: string; text: string }> = {
//   active: { bg: 'bg-green-100', text: 'text-green-700' },
//   inactive: { bg: 'bg-red-100', text: 'text-red-700' },
// };

// interface UserFormData {
//   email: string;
//   name: string;
//   role: UserRole;
// }

// export default function UsersPage() {
//   const { user: currentUser, isAdmin, hasPermission } = useAuth();
//   const router = useRouter();
  
//   const [users, setUsers] = useState<UserAPI[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [totalPages, setTotalPages] = useState(1);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
//   const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  
//   // Modal states
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editUser, setEditUser] = useState<UserAPI | null>(null);
//   const [deleteUserData, setDeleteUserData] = useState<UserAPI | null>(null);
//   const [resetPasswordUser, setResetPasswordUser] = useState<UserAPI | null>(null);
  
//   // Form states
//   const [formData, setFormData] = useState<UserFormData>({
//     email: '',
//     name: '',
//     role: 'staff',
//   });
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isResettingPassword, setIsResettingPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
//   // Action menu
//   const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
//   const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

//   // Handle action menu open with position calculation
//   const handleActionMenuOpen = (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
//     if (actionMenuOpen === userId) {
//       setActionMenuOpen(null);
//       return;
//     }
    
//     const button = event.currentTarget;
//     const rect = button.getBoundingClientRect();
    
//     // Position menu above the button, aligned to the right
//     setMenuPosition({
//       top: rect.top - 10, // Will be adjusted by the menu height
//       left: rect.right - 192, // 192px = w-48 (12rem)
//     });
//     setActionMenuOpen(userId);
//   };

//   // Check if user is admin
//   useEffect(() => {
//     if (!isAdmin) {
//       router.push('/dashboard');
//     }
//   }, [isAdmin, router]);

//   // Fetch users
//   const fetchUsers = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await getUsersPaginated({
//         page: currentPage,
//         limit: 25,
//         search: searchQuery || undefined,
//         role: roleFilter || undefined,
//         status: statusFilter || undefined,
//       });
//       setUsers(response.users);
//       setTotalPages(response.totalPages);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [currentPage, searchQuery, roleFilter, statusFilter]);

//   useEffect(() => {
//     if (isAdmin) {
//       fetchUsers();
//     }
//   }, [fetchUsers, isAdmin]);

//   // Handle search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setCurrentPage(1);
//       fetchUsers();
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   // Reset form
//   const resetForm = () => {
//     setFormData({ email: '', name: '', role: 'staff' });
//     setError(null);
//     setSuccessMessage(null);
//   };

//   // Handle create user
//   const handleCreateUser = async () => {
//     setError(null);
//     setSuccessMessage(null);
    
//     if (!formData.email || !formData.name) {
//       setError('Email and name are required');
//       return;
//     }

//     // Basic email validation
//     if (!formData.email.includes('@')) {
//       setError('Please enter a valid email address');
//       return;
//     }

//     setIsSaving(true);
//     try {
//       const response = await createUser({
//         email: formData.email,
//         name: formData.name,
//         role: formData.role,
//       });
//       setSuccessMessage(response.message || 'User created successfully. Login credentials have been sent to their email.');
//       setTimeout(() => {
//         setShowAddModal(false);
//         resetForm();
//         fetchUsers();
//       }, 2000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to create user');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Handle update user
//   const handleUpdateUser = async () => {
//     if (!editUser) return;
//     setError(null);

//     if (!formData.email || !formData.name) {
//       setError('Email and name are required');
//       return;
//     }

//     setIsSaving(true);
//     try {
//       await updateUser(editUser.id, {
//         email: formData.email,
//         name: formData.name,
//         role: formData.role,
//       });
//       setEditUser(null);
//       resetForm();
//       fetchUsers();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to update user');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Handle toggle status
//   const handleToggleStatus = async (user: UserAPI) => {
//     try {
//       await updateUser(user.id, {
//         status: user.status === 'active' ? 'inactive' : 'active',
//       });
//       fetchUsers();
//     } catch (err) {
//       console.error('Error toggling status:', err);
//     }
//     setActionMenuOpen(null);
//   };

//   // Handle reset password
//   const handleResetPassword = async () => {
//     if (!resetPasswordUser) return;

//     setIsResettingPassword(true);
//     setError(null);
//     setSuccessMessage(null);
    
//     try {
//       const response = await resetUserPassword(resetPasswordUser.id);
//       setSuccessMessage(response.message || 'Password reset successfully. New credentials have been sent to the user\'s email.');
//       setTimeout(() => {
//         setResetPasswordUser(null);
//         setSuccessMessage(null);
//         fetchUsers();
//       }, 2000);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to reset password');
//     } finally {
//       setIsResettingPassword(false);
//     }
//   };

//   // Handle delete user
//   const handleDeleteUser = async () => {
//     if (!deleteUserData) return;

//     setIsDeleting(true);
//     try {
//       await deleteUser(deleteUserData.id);
//       setDeleteUserData(null);
//       fetchUsers();
//     } catch (err) {
//       console.error('Error deleting user:', err);
//       alert(err instanceof Error ? err.message : 'Failed to delete user');
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Format date
//   const formatDate = (dateString: string | null) => {
//     if (!dateString) return 'Never';
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   if (!isAdmin) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
//         <Header activeNav="users" />
//         <main className="px-6 py-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="flex items-center justify-center min-h-[400px]">
//               <div className="text-center">
//                 <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
//                 <p className="text-gray-600">You don't have permission to access this page.</p>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
//       <Header activeNav="users" />
      
//       <main className="px-6 py-8">
//         <div className="max-w-7xl mx-auto">
//           <Breadcrumb 
//             items={[
//               { label: 'Dashboard', href: '/dashboard' },
//               { label: 'Users', href: null },
//             ]}
//           />

//           {/* Page Header */}
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage users and their permissions</p>
//             </div>
//             <button
//               onClick={() => {
//                 resetForm();
//                 setShowAddModal(true);
//               }}
//               className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all"
//             >
//               <Plus className="w-5 h-5" />
//               Add User
//             </button>
//           </div>

//           {/* Success Message */}
//           {successMessage && (
//             <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
//               <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-green-700">{successMessage}</p>
//               <button onClick={() => setSuccessMessage(null)} className="ml-auto">
//                 <X className="w-4 h-4 text-green-500" />
//               </button>
//             </div>
//           )}

//           {/* Filters */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               {/* Search */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search by name or email..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
              
//               {/* Role filter */}
//               <select
//                 value={roleFilter}
//                 onChange={(e) => {
//                   setRoleFilter(e.target.value as UserRole | '');
//                   setCurrentPage(1);
//                 }}
//                 className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//               >
//             <option value="">All Roles</option>
//             <option value="admin">Admin</option>
//             <option value="staff">Staff</option>
//           </select>

//           {/* Status filter */}
//           <select
//             value={statusFilter}
//             onChange={(e) => {
//               setStatusFilter(e.target.value as UserStatus | '');
//               setCurrentPage(1);
//             }}
//             className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//           </div>
//         ) : users.length === 0 ? (
//           <div className="text-center py-12">
//             <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
//             <p className="text-gray-500">Try adjusting your search or filters</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</th>
//                   <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {users.map((user) => (
//                   <tr key={user.id} className="hover:bg-gray-50 transition-colors">
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className="font-medium text-gray-900">{user.name}</p>
//                         <p className="text-sm text-gray-500 flex items-center gap-1">
//                           <Mail className="w-3 h-3" />
//                           {user.email}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[user.role].bg} ${ROLE_STYLES[user.role].text}`}>
//                         {ROLE_STYLES[user.role].icon}
//                         {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[user.status].bg} ${STATUS_STYLES[user.status].text}`}>
//                         {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
//                         {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="text-sm text-gray-600 flex items-center gap-1">
//                         <Calendar className="w-3 h-3" />
//                         {formatDate(user.last_login)}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       {user.must_change_password ? (
//                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
//                           <Key className="w-3 h-3 mr-1" />
//                           Must Change
//                         </span>
//                       ) : (
//                         <span className="text-sm text-gray-500">Set</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="relative inline-block">
//                         <button
//                           onClick={(e) => handleActionMenuOpen(user.id, e)}
//                           className="p-2 hover:bg-gray-100 rounded-lg"
//                         >
//                           <MoreVertical className="w-5 h-5 text-gray-500" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Action Menu Portal - Rendered outside table to avoid overflow issues */}
//         {actionMenuOpen && (
//           <>
//             <div 
//               className="fixed inset-0 z-[100]" 
//               onClick={() => setActionMenuOpen(null)} 
//             />
//             <div 
//               className="fixed z-[101] w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1"
//               style={{
//                 top: `${Math.max(10, menuPosition.top - 180)}px`,
//                 left: `${menuPosition.left}px`,
//               }}
//             >
//               {users.filter(u => u.id === actionMenuOpen).map(user => (
//                 <div key={user.id}>
//                   <button
//                     onClick={() => {
//                       setFormData({
//                         email: user.email,
//                         name: user.name,
//                         role: user.role,
//                       });
//                       setEditUser(user);
//                       setActionMenuOpen(null);
//                     }}
//                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     <Pencil className="w-4 h-4 text-gray-500" />
//                     Edit User
//                   </button>
//                   <button
//                     onClick={() => {
//                       setResetPasswordUser(user);
//                       setError(null);
//                       setSuccessMessage(null);
//                       setActionMenuOpen(null);
//                     }}
//                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     <Key className="w-4 h-4 text-gray-500" />
//                     Reset Password
//                   </button>
//                   <button
//                     onClick={() => handleToggleStatus(user)}
//                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
//                   >
//                     {user.status === 'active' ? (
//                       <>
//                         <UserX className="w-4 h-4 text-gray-500" />
//                         Deactivate
//                       </>
//                     ) : (
//                       <>
//                         <UserCheck className="w-4 h-4 text-gray-500" />
//                         Activate
//                       </>
//                     )}
//                   </button>
//                   {user.id !== currentUser?.id && (
//                     <button
//                       onClick={() => {
//                         setDeleteUserData(user);
//                         setActionMenuOpen(null);
//                       }}
//                       className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                       Delete User
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
//             <button
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="text-sm text-gray-600">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Add/Edit User Modal */}
//       {(showAddModal || editUser) && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 {editUser ? 'Edit User' : 'Add New User'}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowAddModal(false);
//                   setEditUser(null);
//                   resetForm();
//                 }}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               {error && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
//                   <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               )}

//               {successMessage && (
//                 <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-green-700">{successMessage}</p>
//                 </div>
//               )}

//               {/* Name */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   placeholder="Full name"
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   placeholder="user@school.edu"
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               {/* Password info (only for new users) */}
//               {!editUser && (
//                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
//                   <div className="flex items-start gap-3">
//                     <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
//                     <p className="text-sm text-blue-700">
//                       A secure password will be automatically generated and sent to the user's email address.
//                       They will be required to change it on first login.
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Role */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                 <select
//                   value={formData.role}
//                   onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
//                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="staff">Staff - Can view all data and generate transcripts</option>
//                   <option value="admin">Admin - Full access to everything</option>
//                 </select>
//               </div>

//               {/* Role description */}
//               <div className="p-3 bg-gray-50 rounded-xl">
//                 <p className="text-sm text-gray-600">
//                   {formData.role === 'admin' && (
//                     <><strong>Admin:</strong> Full access to all features including user management, student records, courses, grades, and transcript generation.</>
//                   )}
//                   {formData.role === 'staff' && (
//                     <><strong>Staff:</strong> Can view students, courses, and grades. Can generate transcripts. Cannot manage users or edit data.</>
//                   )}
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-3 p-6 border-t border-gray-200">
//               <button
//                 onClick={() => {
//                   setShowAddModal(false);
//                   setEditUser(null);
//                   resetForm();
//                 }}
//                 className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={editUser ? handleUpdateUser : handleCreateUser}
//                 disabled={isSaving}
//                 className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
//               >
//                 {isSaving ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   editUser ? 'Save Changes' : 'Create User'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reset Password Modal */}
//       {resetPasswordUser && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
//               <button
//                 onClick={() => {
//                   setResetPasswordUser(null);
//                   setError(null);
//                 }}
//                 className="p-2 hover:bg-gray-100 rounded-lg"
//               >
//                 <X className="w-5 h-5 text-gray-500" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               {error && (
//                 <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
//                   <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               )}

//               {successMessage && (
//                 <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
//                   <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-green-700">{successMessage}</p>
//                 </div>
//               )}

//               <p className="text-gray-600">
//                 Reset password for <strong>{resetPasswordUser.name}</strong>
//               </p>

//               <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
//                 <div className="flex items-start gap-3">
//                   <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
//                   <p className="text-sm text-blue-700">
//                     A new secure password will be automatically generated and sent to <strong>{resetPasswordUser.email}</strong>.
//                     The user will be required to change it on next login.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3 p-6 border-t border-gray-200">
//               <button
//                 onClick={() => {
//                   setResetPasswordUser(null);
//                   setError(null);
//                   setSuccessMessage(null);
//                 }}
//                 className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleResetPassword}
//                 disabled={isResettingPassword || !!successMessage}
//                 className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium rounded-xl flex items-center justify-center gap-2"
//               >
//                 {isResettingPassword ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Sending...
//                   </>
//                 ) : (
//                   <>
//                     <Key className="w-4 h-4" />
//                     Reset & Send Email
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deleteUserData && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
//             <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
//               <Trash2 className="w-6 h-6 text-red-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
//               Delete User
//             </h3>
//             <p className="text-gray-600 text-center mb-6">
//               Are you sure you want to delete <strong>{deleteUserData.name}</strong>? This action cannot be undone.
//             </p>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteUserData(null)}
//                 className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteUser}
//                 disabled={isDeleting}
//                 className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
//               >
//                 {isDeleting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Deleting...
//                   </>
//                 ) : (
//                   'Delete User'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//         </div>
//       </main>
//     </div>
//   );
// }
// // 'use client';

// // import { useState, useEffect, useCallback } from 'react';
// // import { useAuth } from '@/contexts/AuthContext';
// // import { useRouter } from 'next/navigation';
// // import { Header, Breadcrumb } from '@/components/layout';
// // import { 
// //   Users, 
// //   Plus, 
// //   Search, 
// //   MoreVertical, 
// //   Pencil, 
// //   Trash2, 
// //   X, 
// //   Loader2,
// //   Shield,
// //   ShieldCheck,
// //   Mail,
// //   Calendar,
// //   Key,
// //   AlertCircle,
// //   CheckCircle,
// //   UserX,
// //   UserCheck
// // } from 'lucide-react';
// // import {
// //   getUsersPaginated,
// //   createUser,
// //   updateUser,
// //   deleteUser,
// //   resetUserPassword,
// //   UserAPI,
// //   UserRole,
// //   UserStatus,
// // } from '@/lib/api';

// // // Role badge colors
// // const ROLE_STYLES: Record<UserRole, { bg: string; text: string; icon: React.ReactNode }> = {
// //   admin: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <ShieldCheck className="w-3 h-3" /> },
// //   staff: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Shield className="w-3 h-3" /> },
// // };

// // // Status badge colors
// // const STATUS_STYLES: Record<UserStatus, { bg: string; text: string }> = {
// //   active: { bg: 'bg-green-100', text: 'text-green-700' },
// //   inactive: { bg: 'bg-red-100', text: 'text-red-700' },
// // };

// // interface UserFormData {
// //   email: string;
// //   name: string;
// //   role: UserRole;
// // }

// // export default function UsersPage() {
// //   const { user: currentUser, isAdmin, hasPermission } = useAuth();
// //   const router = useRouter();
  
// //   const [users, setUsers] = useState<UserAPI[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [totalPages, setTotalPages] = useState(1);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [searchQuery, setSearchQuery] = useState('');
// //   const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
// //   const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  
// //   // Modal states
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [editUser, setEditUser] = useState<UserAPI | null>(null);
// //   const [deleteUserData, setDeleteUserData] = useState<UserAPI | null>(null);
// //   const [resetPasswordUser, setResetPasswordUser] = useState<UserAPI | null>(null);
  
// //   // Form states
// //   const [formData, setFormData] = useState<UserFormData>({
// //     email: '',
// //     name: '',
// //     role: 'staff',
// //   });
// //   const [isSaving, setIsSaving] = useState(false);
// //   const [isDeleting, setIsDeleting] = useState(false);
// //   const [isResettingPassword, setIsResettingPassword] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
// //   // Action menu
// //   const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
// //   const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

// //   // Handle action menu open with position calculation
// //   const handleActionMenuOpen = (userId: string, event: React.MouseEvent<HTMLButtonElement>) => {
// //     if (actionMenuOpen === userId) {
// //       setActionMenuOpen(null);
// //       return;
// //     }
    
// //     const button = event.currentTarget;
// //     const rect = button.getBoundingClientRect();
    
// //     // Position menu above the button, aligned to the right
// //     setMenuPosition({
// //       top: rect.top - 10, // Will be adjusted by the menu height
// //       left: rect.right - 192, // 192px = w-48 (12rem)
// //     });
// //     setActionMenuOpen(userId);
// //   };

// //   // Check if user is admin
// //   useEffect(() => {
// //     if (!isAdmin) {
// //       router.push('/dashboard');
// //     }
// //   }, [isAdmin, router]);

// //   // Fetch users
// //   const fetchUsers = useCallback(async () => {
// //     setIsLoading(true);
// //     try {
// //       const response = await getUsersPaginated({
// //         page: currentPage,
// //         limit: 25,
// //         search: searchQuery || undefined,
// //         role: roleFilter || undefined,
// //         status: statusFilter || undefined,
// //       });
// //       setUsers(response.users);
// //       setTotalPages(response.totalPages);
// //     } catch (err) {
// //       console.error('Error fetching users:', err);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [currentPage, searchQuery, roleFilter, statusFilter]);

// //   useEffect(() => {
// //     if (isAdmin) {
// //       fetchUsers();
// //     }
// //   }, [fetchUsers, isAdmin]);

// //   // Handle search
// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setCurrentPage(1);
// //       fetchUsers();
// //     }, 300);
// //     return () => clearTimeout(timer);
// //   }, [searchQuery]);

// //   // Reset form
// //   const resetForm = () => {
// //     setFormData({ email: '', name: '', role: 'staff' });
// //     setError(null);
// //     setSuccessMessage(null);
// //   };

// //   // Handle create user
// //   const handleCreateUser = async () => {
// //     setError(null);
// //     setSuccessMessage(null);
    
// //     if (!formData.email || !formData.name) {
// //       setError('Email and name are required');
// //       return;
// //     }

// //     // Basic email validation
// //     if (!formData.email.includes('@')) {
// //       setError('Please enter a valid email address');
// //       return;
// //     }

// //     setIsSaving(true);
// //     try {
// //       const response = await createUser({
// //         email: formData.email,
// //         name: formData.name,
// //         role: formData.role,
// //       });
// //       setSuccessMessage(response.message || 'User created successfully. Login credentials have been sent to their email.');
// //       setTimeout(() => {
// //         setShowAddModal(false);
// //         resetForm();
// //         fetchUsers();
// //       }, 2000);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Failed to create user');
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   // Handle update user
// //   const handleUpdateUser = async () => {
// //     if (!editUser) return;
// //     setError(null);

// //     if (!formData.email || !formData.name) {
// //       setError('Email and name are required');
// //       return;
// //     }

// //     setIsSaving(true);
// //     try {
// //       await updateUser(editUser.id, {
// //         email: formData.email,
// //         name: formData.name,
// //         role: formData.role,
// //       });
// //       setEditUser(null);
// //       resetForm();
// //       fetchUsers();
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Failed to update user');
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   // Handle toggle status
// //   const handleToggleStatus = async (user: UserAPI) => {
// //     try {
// //       await updateUser(user.id, {
// //         status: user.status === 'active' ? 'inactive' : 'active',
// //       });
// //       fetchUsers();
// //     } catch (err) {
// //       console.error('Error toggling status:', err);
// //     }
// //     setActionMenuOpen(null);
// //   };

// //   // Handle reset password
// //   const handleResetPassword = async () => {
// //     if (!resetPasswordUser) return;

// //     setIsResettingPassword(true);
// //     setError(null);
// //     setSuccessMessage(null);
    
// //     try {
// //       const response = await resetUserPassword(resetPasswordUser.id);
// //       setSuccessMessage(response.message || 'Password reset successfully. New credentials have been sent to the user\'s email.');
// //       setTimeout(() => {
// //         setResetPasswordUser(null);
// //         setSuccessMessage(null);
// //         fetchUsers();
// //       }, 2000);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Failed to reset password');
// //     } finally {
// //       setIsResettingPassword(false);
// //     }
// //   };

// //   // Handle delete user
// //   const handleDeleteUser = async () => {
// //     if (!deleteUserData) return;

// //     setIsDeleting(true);
// //     try {
// //       await deleteUser(deleteUserData.id);
// //       setDeleteUserData(null);
// //       fetchUsers();
// //     } catch (err) {
// //       console.error('Error deleting user:', err);
// //       alert(err instanceof Error ? err.message : 'Failed to delete user');
// //     } finally {
// //       setIsDeleting(false);
// //     }
// //   };

// //   // Format date
// //   const formatDate = (dateString: string | null) => {
// //     if (!dateString) return 'Never';
// //     return new Date(dateString).toLocaleDateString('en-GB', {
// //       day: '2-digit',
// //       month: 'short',
// //       year: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit',
// //     });
// //   };

// //   if (!isAdmin) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
// //         <Header activeNav="users" />
// //         <main className="px-6 py-8">
// //           <div className="max-w-7xl mx-auto">
// //             <div className="flex items-center justify-center min-h-[400px]">
// //               <div className="text-center">
// //                 <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
// //                 <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
// //                 <p className="text-gray-600">You don't have permission to access this page.</p>
// //               </div>
// //             </div>
// //           </div>
// //         </main>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
// //       <Header activeNav="users" />
      
// //       <main className="px-6 py-8">
// //         <div className="max-w-7xl mx-auto">
// //           <Breadcrumb 
// //             items={[
// //               { label: 'Dashboard', href: '/dashboard' },
// //               { label: 'Users', href: null },
// //             ]}
// //           />

// //           {/* Page Header */}
// //           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
// //             <div>
// //               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
// //               <p className="text-gray-600 mt-1">Manage users and their permissions</p>
// //             </div>
// //             <button
// //               onClick={() => {
// //                 resetForm();
// //                 setShowAddModal(true);
// //               }}
// //               className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all"
// //             >
// //               <Plus className="w-5 h-5" />
// //               Add User
// //             </button>
// //           </div>

// //           {/* Success Message */}
// //           {successMessage && (
// //             <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
// //               <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
// //               <p className="text-sm text-green-700">{successMessage}</p>
// //               <button onClick={() => setSuccessMessage(null)} className="ml-auto">
// //                 <X className="w-4 h-4 text-green-500" />
// //               </button>
// //             </div>
// //           )}

// //           {/* Filters */}
// //           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
// //             <div className="flex flex-col sm:flex-row gap-4">
// //               {/* Search */}
// //               <div className="flex-1 relative">
// //                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
// //                 <input
// //                   type="text"
// //                   placeholder="Search by name or email..."
// //                   value={searchQuery}
// //                   onChange={(e) => setSearchQuery(e.target.value)}
// //                   className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>
              
// //               {/* Role filter */}
// //               <select
// //                 value={roleFilter}
// //                 onChange={(e) => {
// //                   setRoleFilter(e.target.value as UserRole | '');
// //                   setCurrentPage(1);
// //                 }}
// //                 className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
// //               >
// //             <option value="">All Roles</option>
// //             <option value="admin">Admin</option>
// //             <option value="staff">Staff</option>
// //           </select>

// //           {/* Status filter */}
// //           <select
// //             value={statusFilter}
// //             onChange={(e) => {
// //               setStatusFilter(e.target.value as UserStatus | '');
// //               setCurrentPage(1);
// //             }}
// //             className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
// //           >
// //             <option value="">All Status</option>
// //             <option value="active">Active</option>
// //             <option value="inactive">Inactive</option>
// //           </select>
// //         </div>
// //       </div>

// //       {/* Users Table */}
// //       <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
// //         {isLoading ? (
// //           <div className="flex items-center justify-center py-12">
// //             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
// //           </div>
// //         ) : users.length === 0 ? (
// //           <div className="text-center py-12">
// //             <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
// //             <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
// //             <p className="text-gray-500">Try adjusting your search or filters</p>
// //           </div>
// //         ) : (
// //           <div className="overflow-x-auto">
// //             <table className="w-full">
// //               <thead className="bg-gray-50 border-b border-gray-200">
// //                 <tr>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
// //                   <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</th>
// //                   <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-gray-200">
// //                 {users.map((user) => (
// //                   <tr key={user.id} className="hover:bg-gray-50 transition-colors">
// //                     <td className="px-6 py-4">
// //                       <div>
// //                         <p className="font-medium text-gray-900">{user.name}</p>
// //                         <p className="text-sm text-gray-500 flex items-center gap-1">
// //                           <Mail className="w-3 h-3" />
// //                           {user.email}
// //                         </p>
// //                       </div>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[user.role].bg} ${ROLE_STYLES[user.role].text}`}>
// //                         {ROLE_STYLES[user.role].icon}
// //                         {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
// //                       </span>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[user.status].bg} ${STATUS_STYLES[user.status].text}`}>
// //                         {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
// //                         {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
// //                       </span>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       <p className="text-sm text-gray-600 flex items-center gap-1">
// //                         <Calendar className="w-3 h-3" />
// //                         {formatDate(user.last_login)}
// //                       </p>
// //                     </td>
// //                     <td className="px-6 py-4">
// //                       {user.must_change_password ? (
// //                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
// //                           <Key className="w-3 h-3 mr-1" />
// //                           Must Change
// //                         </span>
// //                       ) : (
// //                         <span className="text-sm text-gray-500">Set</span>
// //                       )}
// //                     </td>
// //                     <td className="px-6 py-4 text-right">
// //                       <div className="relative inline-block">
// //                         <button
// //                           onClick={(e) => handleActionMenuOpen(user.id, e)}
// //                           className="p-2 hover:bg-gray-100 rounded-lg"
// //                         >
// //                           <MoreVertical className="w-5 h-5 text-gray-500" />
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}

// //         {/* Action Menu Portal - Rendered outside table to avoid overflow issues */}
// //         {actionMenuOpen && (
// //           <>
// //             <div 
// //               className="fixed inset-0 z-[100]" 
// //               onClick={() => setActionMenuOpen(null)} 
// //             />
// //             <div 
// //               className="fixed z-[101] w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1"
// //               style={{
// //                 top: `${Math.max(10, menuPosition.top - 180)}px`,
// //                 left: `${menuPosition.left}px`,
// //               }}
// //             >
// //               {users.filter(u => u.id === actionMenuOpen).map(user => (
// //                 <div key={user.id}>
// //                   <button
// //                     onClick={() => {
// //                       setFormData({
// //                         email: user.email,
// //                         name: user.name,
// //                         role: user.role,
// //                       });
// //                       setEditUser(user);
// //                       setActionMenuOpen(null);
// //                     }}
// //                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
// //                   >
// //                     <Pencil className="w-4 h-4 text-gray-500" />
// //                     Edit User
// //                   </button>
// //                   <button
// //                     onClick={() => {
// //                       setResetPasswordUser(user);
// //                       setError(null);
// //                       setSuccessMessage(null);
// //                       setActionMenuOpen(null);
// //                     }}
// //                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
// //                   >
// //                     <Key className="w-4 h-4 text-gray-500" />
// //                     Reset Password
// //                   </button>
// //                   <button
// //                     onClick={() => handleToggleStatus(user)}
// //                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
// //                   >
// //                     {user.status === 'active' ? (
// //                       <>
// //                         <UserX className="w-4 h-4 text-gray-500" />
// //                         Deactivate
// //                       </>
// //                     ) : (
// //                       <>
// //                         <UserCheck className="w-4 h-4 text-gray-500" />
// //                         Activate
// //                       </>
// //                     )}
// //                   </button>
// //                   {user.id !== currentUser?.id && (
// //                     <button
// //                       onClick={() => {
// //                         setDeleteUserData(user);
// //                         setActionMenuOpen(null);
// //                       }}
// //                       className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
// //                     >
// //                       <Trash2 className="w-4 h-4" />
// //                       Delete User
// //                     </button>
// //                   )}
// //                 </div>
// //               ))}
// //             </div>
// //           </>
// //         )}

// //         {/* Pagination */}
// //         {totalPages > 1 && (
// //           <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
// //             <button
// //               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
// //               disabled={currentPage === 1}
// //               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
// //             >
// //               Previous
// //             </button>
// //             <span className="text-sm text-gray-600">
// //               Page {currentPage} of {totalPages}
// //             </span>
// //             <button
// //               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
// //               disabled={currentPage === totalPages}
// //               className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
// //             >
// //               Next
// //             </button>
// //           </div>
// //         )}
// //       </div>

// //       {/* Add/Edit User Modal */}
// //       {(showAddModal || editUser) && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
// //             <div className="flex items-center justify-between p-6 border-b border-gray-200">
// //               <h2 className="text-xl font-semibold text-gray-900">
// //                 {editUser ? 'Edit User' : 'Add New User'}
// //               </h2>
// //               <button
// //                 onClick={() => {
// //                   setShowAddModal(false);
// //                   setEditUser(null);
// //                   resetForm();
// //                 }}
// //                 className="p-2 hover:bg-gray-100 rounded-lg"
// //               >
// //                 <X className="w-5 h-5 text-gray-500" />
// //               </button>
// //             </div>

// //             <div className="p-6 space-y-4">
// //               {error && (
// //                 <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
// //                   <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
// //                   <p className="text-sm text-red-700">{error}</p>
// //                 </div>
// //               )}

// //               {successMessage && (
// //                 <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
// //                   <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
// //                   <p className="text-sm text-green-700">{successMessage}</p>
// //                 </div>
// //               )}

// //               {/* Name */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
// //                 <input
// //                   type="text"
// //                   value={formData.name}
// //                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //                   placeholder="Full name"
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>

// //               {/* Email */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
// //                 <input
// //                   type="email"
// //                   value={formData.email}
// //                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
// //                   placeholder="user@school.edu"
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
// //                 />
// //               </div>

// //               {/* Password info (only for new users) */}
// //               {!editUser && (
// //                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
// //                   <div className="flex items-start gap-3">
// //                     <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
// //                     <p className="text-sm text-blue-700">
// //                       A secure password will be automatically generated and sent to the user's email address.
// //                       They will be required to change it on first login.
// //                     </p>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Role */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
// //                 <select
// //                   value={formData.role}
// //                   onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
// //                   className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
// //                 >
// //                   <option value="staff">Staff - Can view all data and generate transcripts</option>
// //                   <option value="admin">Admin - Full access to everything</option>
// //                 </select>
// //               </div>

// //               {/* Role description */}
// //               <div className="p-3 bg-gray-50 rounded-xl">
// //                 <p className="text-sm text-gray-600">
// //                   {formData.role === 'admin' && (
// //                     <><strong>Admin:</strong> Full access to all features including user management, student records, courses, grades, and transcript generation.</>
// //                   )}
// //                   {formData.role === 'staff' && (
// //                     <><strong>Staff:</strong> Can view students, courses, and grades. Can generate transcripts. Cannot manage users or edit data.</>
// //                   )}
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="flex gap-3 p-6 border-t border-gray-200">
// //               <button
// //                 onClick={() => {
// //                   setShowAddModal(false);
// //                   setEditUser(null);
// //                   resetForm();
// //                 }}
// //                 className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={editUser ? handleUpdateUser : handleCreateUser}
// //                 disabled={isSaving}
// //                 className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
// //               >
// //                 {isSaving ? (
// //                   <>
// //                     <Loader2 className="w-4 h-4 animate-spin" />
// //                     Saving...
// //                   </>
// //                 ) : (
// //                   editUser ? 'Save Changes' : 'Create User'
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Reset Password Modal */}
// //       {resetPasswordUser && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
// //             <div className="flex items-center justify-between p-6 border-b border-gray-200">
// //               <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
// //               <button
// //                 onClick={() => {
// //                   setResetPasswordUser(null);
// //                   setError(null);
// //                 }}
// //                 className="p-2 hover:bg-gray-100 rounded-lg"
// //               >
// //                 <X className="w-5 h-5 text-gray-500" />
// //               </button>
// //             </div>

// //             <div className="p-6 space-y-4">
// //               {error && (
// //                 <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
// //                   <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
// //                   <p className="text-sm text-red-700">{error}</p>
// //                 </div>
// //               )}

// //               {successMessage && (
// //                 <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
// //                   <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
// //                   <p className="text-sm text-green-700">{successMessage}</p>
// //                 </div>
// //               )}

// //               <p className="text-gray-600">
// //                 Reset password for <strong>{resetPasswordUser.name}</strong>
// //               </p>

// //               <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
// //                 <div className="flex items-start gap-3">
// //                   <Mail className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
// //                   <p className="text-sm text-blue-700">
// //                     A new secure password will be automatically generated and sent to <strong>{resetPasswordUser.email}</strong>.
// //                     The user will be required to change it on next login.
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="flex gap-3 p-6 border-t border-gray-200">
// //               <button
// //                 onClick={() => {
// //                   setResetPasswordUser(null);
// //                   setError(null);
// //                   setSuccessMessage(null);
// //                 }}
// //                 className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleResetPassword}
// //                 disabled={isResettingPassword || !!successMessage}
// //                 className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-medium rounded-xl flex items-center justify-center gap-2"
// //               >
// //                 {isResettingPassword ? (
// //                   <>
// //                     <Loader2 className="w-4 h-4 animate-spin" />
// //                     Sending...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <Key className="w-4 h-4" />
// //                     Reset & Send Email
// //                   </>
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* Delete Confirmation Modal */}
// //       {deleteUserData && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
// //           <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
// //             <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
// //               <Trash2 className="w-6 h-6 text-red-600" />
// //             </div>
// //             <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
// //               Delete User
// //             </h3>
// //             <p className="text-gray-600 text-center mb-6">
// //               Are you sure you want to delete <strong>{deleteUserData.name}</strong>? This action cannot be undone.
// //             </p>
// //             <div className="flex gap-3">
// //               <button
// //                 onClick={() => setDeleteUserData(null)}
// //                 className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={handleDeleteUser}
// //                 disabled={isDeleting}
// //                 className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
// //               >
// //                 {isDeleting ? (
// //                   <>
// //                     <Loader2 className="w-4 h-4 animate-spin" />
// //                     Deleting...
// //                   </>
// //                 ) : (
// //                   'Delete User'
// //                 )}
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //         </div>
// //       </main>
// //     </div>
// //   );
// // }
