'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header, Breadcrumb } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  Users
} from 'lucide-react';
import { 
  getStudentsPaginated, 
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getYearGroups,
  StudentAPIResponse,
  PaginatedStudentsResponse,
} from '@/lib/api';

// =====================================================
// Types
// =====================================================

interface StudentFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  nationality: string;
  birth_place: string;
  language: string;
  home_language: string;
  student_email: string;
  status: string;
  year_group: string;
  entry_grade: string;
  unique_id: string;
}

const emptyFormData: StudentFormData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  nationality: '',
  birth_place: '',
  language: '',
  home_language: '',
  student_email: '',
  status: 'ACTIVE',
  year_group: '',
  entry_grade: '',
  unique_id: '',
};

// =====================================================
// Action Menu Component
// =====================================================

function ActionMenu({ 
  onView, 
  onEdit, 
  onDelete 
}: { 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
            <button
              onClick={() => { onView(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 text-gray-400" />
              View Details
            </button>
            <button
              onClick={() => { onEdit(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="w-4 h-4 text-gray-400" />
              Edit
            </button>
            <button
              onClick={() => { onDelete(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// =====================================================
// View Student Modal
// =====================================================

function ViewStudentModal({ 
  student, 
  onClose 
}: { 
  student: StudentAPIResponse | null; 
  onClose: () => void;
}) {
  if (!student) return null;

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const fields = [
    { label: 'Student ID', value: student.unique_id || '-' },
    { label: 'First Name', value: student.first_name },
    { label: 'Middle Name', value: student.middle_name || '-' },
    { label: 'Last Name', value: student.last_name },
    { label: 'Gender', value: student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '-' },
    { label: 'Date of Birth', value: formatDate(student.date_of_birth) },
    { label: 'Nationality', value: student.nationality || '-' },
    { label: 'Birth Place', value: student.birth_place || '-' },
    { label: 'Language', value: student.language || '-' },
    { label: 'Home Language', value: student.home_language || '-' },
    { label: 'Email', value: student.student_email || '-' },
    { label: 'Year Group', value: student.year_group || '-' },
    { label: 'Entry Grade', value: student.entry_grade || '-' },
    { label: 'Status', value: student.status || '-' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
            <p className="text-sm text-gray-500">{student.first_name} {student.last_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.label} className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {field.label}
                </p>
                <p className="text-sm text-gray-900">{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Add/Edit Student Modal
// =====================================================

function StudentFormModal({ 
  student, 
  isEdit,
  onClose,
  onSave,
  isSaving,
}: { 
  student: StudentFormData;
  isEdit: boolean;
  onClose: () => void;
  onSave: (data: StudentFormData) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<StudentFormData>(student);

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  className={inputClass}
                  placeholder="Enter first name"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className={labelClass}>Middle Name</label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) => handleChange('middle_name', e.target.value)}
                  className={inputClass}
                  placeholder="Enter middle name"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  className={inputClass}
                  placeholder="Enter last name"
                />
              </div>

              {/* Student ID */}
              <div>
                <label className={labelClass}>Student ID</label>
                <input
                  type="text"
                  value={formData.unique_id}
                  onChange={(e) => handleChange('unique_id', e.target.value)}
                  className={inputClass}
                  placeholder="Enter student ID"
                />
              </div>

              {/* Gender */}
              <div>
                <label className={labelClass}>Gender *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Nationality */}
              <div>
                <label className={labelClass}>Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className={inputClass}
                  placeholder="Enter nationality"
                />
              </div>

              {/* Birth Place */}
              <div>
                <label className={labelClass}>Birth Place</label>
                <input
                  type="text"
                  value={formData.birth_place}
                  onChange={(e) => handleChange('birth_place', e.target.value)}
                  className={inputClass}
                  placeholder="Enter birth place"
                />
              </div>

              {/* Language */}
              <div>
                <label className={labelClass}>Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  className={inputClass}
                  placeholder="Enter language"
                />
              </div>

              {/* Home Language */}
              <div>
                <label className={labelClass}>Home Language</label>
                <input
                  type="text"
                  value={formData.home_language}
                  onChange={(e) => handleChange('home_language', e.target.value)}
                  className={inputClass}
                  placeholder="Enter home language"
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) => handleChange('student_email', e.target.value)}
                  className={inputClass}
                  placeholder="student@example.com"
                />
              </div>

              {/* Year Group */}
              <div>
                <label className={labelClass}>Year Group</label>
                <input
                  type="text"
                  value={formData.year_group}
                  onChange={(e) => handleChange('year_group', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 2023-2024"
                />
              </div>

              {/* Entry Grade */}
              <div>
                <label className={labelClass}>Entry Grade</label>
                <input
                  type="text"
                  value={formData.entry_grade}
                  onChange={(e) => handleChange('entry_grade', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., Grade 9"
                />
              </div>

              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={inputClass}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="GRADUATED">Graduated</option>
                  <option value="TRANSFERRED">Transferred</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Save Changes' : 'Add Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// Delete Confirmation Modal
// =====================================================

function DeleteConfirmModal({
  studentName,
  onClose,
  onConfirm,
  isDeleting,
}: {
  studentName: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Icon */}
        <div className="pt-6 pb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Student</h3>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{studentName}</span>? 
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Main Students Page Content
// =====================================================

function StudentsContent() {
  // State
  const [students, setStudents] = useState<StudentAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 25;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [yearGroupFilter, setYearGroupFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearGroups, setYearGroups] = useState<string[]>([]);

  // Modals
  const [viewStudent, setViewStudent] = useState<StudentAPIResponse | null>(null);
  const [editStudent, setEditStudent] = useState<StudentAPIResponse | null>(null);
  const [deleteStudentData, setDeleteStudentData] = useState<StudentAPIResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getStudentsPaginated({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        year_group: yearGroupFilter || undefined,
        gender: genderFilter || undefined,
        status: statusFilter || undefined,
      });

      console.log('📚 Students fetched:', response);
      
      setStudents(response.students);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err) {
      console.error('❌ Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, yearGroupFilter, genderFilter, statusFilter]);

  // Fetch year groups for filter
  const fetchYearGroups = useCallback(async () => {
    try {
      const groups = await getYearGroups();
      setYearGroups(groups);
    } catch (err) {
      console.error('Error fetching year groups:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchYearGroups();
  }, [fetchYearGroups]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchStudents();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle view student
  const handleView = async (student: StudentAPIResponse) => {
    try {
      const fullStudent = await getStudentById(student.id);
      setViewStudent(fullStudent);
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  // Handle edit student
  const handleEdit = async (student: StudentAPIResponse) => {
    try {
      const fullStudent = await getStudentById(student.id);
      setEditStudent(fullStudent);
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  // Handle save (create or update)
  const handleSave = async (data: StudentFormData) => {
    setIsSaving(true);
    
    try {
      if (editStudent) {
        await updateStudent(editStudent.id, data);
        console.log('✅ Student updated');
      } else {
        await createStudent(data);
        console.log('✅ Student created');
      }
      
      setEditStudent(null);
      setShowAddModal(false);
      fetchStudents();
    } catch (err) {
      console.error('❌ Error saving student:', err);
      alert(err instanceof Error ? err.message : 'Failed to save student');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteStudentData) return;
    
    setIsDeleting(true);
    
    try {
      await deleteStudent(deleteStudentData.id);
      console.log('✅ Student deleted');
      setDeleteStudentData(null);
      fetchStudents();
    } catch (err) {
      console.error('❌ Error deleting student:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
      <Header activeNav="students" />
      
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Students', href: null },
            ]}
          />

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600 mt-1">Manage student records</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Student
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Year Group Filter */}
              <select
                value={yearGroupFilter}
                onChange={(e) => { setYearGroupFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[150px]"
              >
                <option value="">All Years</option>
                {yearGroups.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Gender Filter */}
              <select
                value={genderFilter}
                onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[130px]"
              >
                <option value="">All Genders</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[130px]"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="GRADUATED">Graduated</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading students...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500">
                <p>{error}</p>
                <button 
                  onClick={fetchStudents}
                  className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Users className="w-12 h-12 mb-4 text-gray-300" />
                <p>No students found</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Year Group</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {student.first_name[0]}{student.last_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{student.year_group || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{student.student_email || '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <ActionMenu
                            onView={() => handleView(student)}
                            onEdit={() => handleEdit(student)}
                            onDelete={() => setDeleteStudentData(student)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Showing {startItem} - {endItem} of {totalItems} students
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let page: number;
                        if (totalPages <= 5) {
                          page = i + 1;
                        } else if (currentPage <= 3) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i;
                        } else {
                          page = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {viewStudent && (
        <ViewStudentModal
          student={viewStudent}
          onClose={() => setViewStudent(null)}
        />
      )}

      {(showAddModal || editStudent) && (
        <StudentFormModal
          student={editStudent ? {
            first_name: editStudent.first_name || '',
            middle_name: editStudent.middle_name || '',
            last_name: editStudent.last_name || '',
            gender: editStudent.gender || '',
            date_of_birth: editStudent.date_of_birth || '',
            nationality: editStudent.nationality || '',
            birth_place: editStudent.birth_place || '',
            language: editStudent.language || '',
            home_language: editStudent.home_language || '',
            student_email: editStudent.student_email || '',
            status: editStudent.status || 'ACTIVE',
            year_group: editStudent.year_group || '',
            entry_grade: editStudent.entry_grade || '',
            unique_id: editStudent.unique_id || '',
          } : emptyFormData}
          isEdit={!!editStudent}
          onClose={() => { setShowAddModal(false); setEditStudent(null); }}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {deleteStudentData && (
        <DeleteConfirmModal
          studentName={`${deleteStudentData.first_name} ${deleteStudentData.last_name}`}
          onClose={() => setDeleteStudentData(null)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

// =====================================================
// Export with Protected Route
// =====================================================

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <StudentsContent />
    </ProtectedRoute>
  );
}