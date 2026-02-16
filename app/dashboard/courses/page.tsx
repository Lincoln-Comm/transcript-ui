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
  BookOpen
} from 'lucide-react';
import { 
  getCoursesPaginated, 
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseLevels,
  CourseAPIResponse,
  PaginatedCoursesResponse,
} from '@/lib/api';

// =====================================================
// Types
// =====================================================

interface CourseFormData {
  course_name: string;
  course_description: string;
  course_level: string;
  course_number: string;
  course_alias: string;
  num_credits: string;
}

const emptyFormData: CourseFormData = {
  course_name: '',
  course_description: '',
  course_level: '',
  course_number: '',
  course_alias: '',
  num_credits: '',
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
// View Course Modal
// =====================================================

function ViewCourseModal({ 
  course, 
  onClose 
}: { 
  course: CourseAPIResponse | null; 
  onClose: () => void;
}) {
  if (!course) return null;

  const fields = [
    { label: 'Course Name', value: course.course_name },
    { label: 'Course Alias', value: course.course_alias || '-' },
    { label: 'Course Level', value: course.course_level },
    { label: 'Course Number', value: course.course_number?.toString() || '-' },
    { label: 'Credits', value: course.num_credits?.toString() || '-' },
    { label: 'Description', value: course.course_description || '-', fullWidth: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Course Details</h2>
            <p className="text-sm text-gray-500">{course.course_name}</p>
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
              <div key={field.label} className={`space-y-1 ${field.fullWidth ? 'col-span-2' : ''}`}>
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
// Add/Edit Course Modal
// =====================================================

function CourseFormModal({ 
  course, 
  isEdit,
  onClose,
  onSave,
  isSaving,
}: { 
  course: CourseFormData;
  isEdit: boolean;
  onClose: () => void;
  onSave: (data: CourseFormData) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<CourseFormData>(course);

  const handleChange = (field: keyof CourseFormData, value: string) => {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Course' : 'Add New Course'}
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
              {/* Course Name */}
              <div className="col-span-2">
                <label className={labelClass}>Course Name *</label>
                <input
                  type="text"
                  required
                  value={formData.course_name}
                  onChange={(e) => handleChange('course_name', e.target.value)}
                  className={inputClass}
                  placeholder="Enter course name"
                />
              </div>

              {/* Course Alias */}
              <div>
                <label className={labelClass}>Course Alias</label>
                <input
                  type="text"
                  value={formData.course_alias}
                  onChange={(e) => handleChange('course_alias', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., MYPMath9"
                />
              </div>

              {/* Course Level */}
              <div>
                <label className={labelClass}>Course Level *</label>
                <select
                  required
                  value={formData.course_level}
                  onChange={(e) => handleChange('course_level', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select level</option>
                  <option value="MYP">MYP</option>
                  <option value="DP">DP</option>
                  <option value="HL">HL (Higher Level)</option>
                  <option value="SL">SL (Standard Level)</option>
                  <option value="LCS">LCS (Local)</option>
                </select>
              </div>

              {/* Course Number */}
              <div>
                <label className={labelClass}>Course Number *</label>
                <input
                  type="number"
                  required
                  value={formData.course_number}
                  onChange={(e) => handleChange('course_number', e.target.value)}
                  className={inputClass}
                  placeholder="Enter course number"
                />
              </div>

              {/* Credits */}
              <div>
                <label className={labelClass}>Credits *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={formData.num_credits}
                  onChange={(e) => handleChange('num_credits', e.target.value)}
                  className={inputClass}
                  placeholder="e.g., 1.0"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className={labelClass}>Description</label>
                <textarea
                  value={formData.course_description}
                  onChange={(e) => handleChange('course_description', e.target.value)}
                  className={`${inputClass} min-h-[100px] resize-none`}
                  placeholder="Enter course description"
                />
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
                isEdit ? 'Save Changes' : 'Add Course'
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
  courseName,
  onClose,
  onConfirm,
  isDeleting,
}: {
  courseName: string;
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Course</h3>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{courseName}</span>? 
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
// Level Badge Component
// =====================================================

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    'MYP': 'bg-emerald-100 text-emerald-700',
    'DP': 'bg-blue-100 text-blue-700',
    'HL': 'bg-purple-100 text-purple-700',
    'SL': 'bg-indigo-100 text-indigo-700',
    'LCS': 'bg-amber-100 text-amber-700',
  };

  const colorClass = colors[level] || 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${colorClass}`}>
      {level}
    </span>
  );
}

// =====================================================
// Main Courses Page Content
// =====================================================

function CoursesContent() {
  // State
  const [courses, setCourses] = useState<CourseAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 25;

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [courseLevels, setCourseLevels] = useState<string[]>([]);

  // Modals
  const [viewCourse, setViewCourse] = useState<CourseAPIResponse | null>(null);
  const [editCourse, setEditCourse] = useState<CourseAPIResponse | null>(null);
  const [deleteCourseData, setDeleteCourseData] = useState<CourseAPIResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCoursesPaginated({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        course_level: levelFilter || undefined,
      });

      console.log('📚 Courses fetched:', response);
      
      setCourses(response.courses);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, levelFilter]);

  // Fetch course levels for filter
  const fetchCourseLevels = useCallback(async () => {
    try {
      const levels = await getCourseLevels();
      setCourseLevels(levels);
    } catch (err) {
      console.error('Error fetching course levels:', err);
      // Fallback to default levels
      setCourseLevels(['MYP', 'DP', 'HL', 'SL', 'LCS']);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    fetchCourseLevels();
  }, [fetchCourseLevels]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle view course
  const handleView = async (course: CourseAPIResponse) => {
    try {
      const fullCourse = await getCourseById(course.id);
      setViewCourse(fullCourse);
    } catch (err) {
      console.error('Error fetching course details:', err);
    }
  };

  // Handle edit course
  const handleEdit = async (course: CourseAPIResponse) => {
    try {
      const fullCourse = await getCourseById(course.id);
      setEditCourse(fullCourse);
    } catch (err) {
      console.error('Error fetching course details:', err);
    }
  };

  // Handle save (create or update)
  const handleSave = async (data: CourseFormData) => {
    setIsSaving(true);
    
    try {
      const payload = {
        course_name: data.course_name,
        course_description: data.course_description || null,
        course_level: data.course_level,
        course_number: parseInt(data.course_number),
        course_alias: data.course_alias || null,
        num_credits: parseFloat(data.num_credits),
      };

      if (editCourse) {
        await updateCourse(editCourse.id, payload);
        console.log('✅ Course updated');
      } else {
        await createCourse(payload);
        console.log('✅ Course created');
      }
      
      setEditCourse(null);
      setShowAddModal(false);
      fetchCourses();
    } catch (err) {
      console.error('❌ Error saving course:', err);
      alert(err instanceof Error ? err.message : 'Failed to save course');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteCourseData) return;
    
    setIsDeleting(true);
    
    try {
      await deleteCourse(deleteCourseData.id);
      console.log('✅ Course deleted');
      setDeleteCourseData(null);
      fetchCourses();
    } catch (err) {
      console.error('❌ Error deleting course:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
      <Header activeNav="courses" />
      
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Courses', href: null },
            ]}
          />

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-1">Manage course catalog</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Course
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
                    placeholder="Search by course name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <select
                value={levelFilter}
                onChange={(e) => { setLevelFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[150px]"
              >
                <option value="">All Levels</option>
                {courseLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading courses...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500">
                <p>{error}</p>
                <button 
                  onClick={fetchCourses}
                  className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
                <p>No courses found</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Alias</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Level</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Number</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Credits</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-600">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{course.course_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{course.course_alias || '-'}</td>
                        <td className="px-6 py-4">
                          <LevelBadge level={course.course_level} />
                        </td>
                        <td className="px-6 py-4 text-gray-600">{course.course_number}</td>
                        <td className="px-6 py-4 text-gray-600">{course.num_credits}</td>
                        <td className="px-6 py-4 text-right">
                          <ActionMenu
                            onView={() => handleView(course)}
                            onEdit={() => handleEdit(course)}
                            onDelete={() => setDeleteCourseData(course)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600">
                    Showing {startItem} - {endItem} of {totalItems} courses
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
      {viewCourse && (
        <ViewCourseModal
          course={viewCourse}
          onClose={() => setViewCourse(null)}
        />
      )}

      {(showAddModal || editCourse) && (
        <CourseFormModal
          course={editCourse ? {
            course_name: editCourse.course_name || '',
            course_description: editCourse.course_description || '',
            course_level: editCourse.course_level || '',
            course_number: editCourse.course_number?.toString() || '',
            course_alias: editCourse.course_alias || '',
            num_credits: editCourse.num_credits?.toString() || '',
          } : emptyFormData}
          isEdit={!!editCourse}
          onClose={() => { setShowAddModal(false); setEditCourse(null); }}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {deleteCourseData && (
        <DeleteConfirmModal
          courseName={deleteCourseData.course_name}
          onClose={() => setDeleteCourseData(null)}
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

export default function CoursesPage() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  );
}