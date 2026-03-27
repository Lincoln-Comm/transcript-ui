'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header, Breadcrumb } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { useAuth } from '@/contexts/AuthContext';
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
  Users,
  GraduationCap,
  FileText
} from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { 
  getStudentsPaginated, 
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getYearGroups,
  getStudentGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  updateCourse,
  getCoursesPaginated,
  getTranscript,
  StudentAPIResponse,
  GradeAPI,
  CourseAPIResponse,
} from '@/lib/api';
import { transformTranscript } from '@/types';
import TranscriptPDF from '@/components/transcript/TranscriptPDF';

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

function ActionMenu({ 
  onView, 
  onEdit, 
  onDelete,
  onViewGrades,
  onDownloadTranscript,
  canEdit = true,
  canDelete = true,
  isDownloading = false,
}: { 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
  onViewGrades: () => void;
  onDownloadTranscript: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  isDownloading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
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
          <div 
            className="fixed w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            <button
              onClick={() => { onView(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 text-gray-400" />
              View Details
            </button>
            <button
              onClick={() => { onViewGrades(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <GraduationCap className="w-4 h-4 text-gray-400" />
              View Grades
            </button>
            <button
              onClick={() => { onDownloadTranscript(); setIsOpen(false); }}
              disabled={isDownloading}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-gray-400" />
              )}
              Download Transcript
            </button>
            {canEdit && (
              <button
                onClick={() => { onEdit(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="w-4 h-4 text-gray-400" />
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => { onDelete(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

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

        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className={labelClass}>Student ID *</label>
                <input
                  type="text"
                  required
                  value={formData.unique_id}
                  onChange={(e) => handleChange('unique_id', e.target.value)}
                  className={inputClass}
                  placeholder="Enter student ID"
                />
              </div>

              <div>
                <label className={labelClass}>Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  className={inputClass}
                />
              </div>

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

              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className={inputClass}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

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
        <div className="pt-6 pb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Student</h3>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-semibold">{studentName}</span>? 
            This action cannot be undone.
          </p>
        </div>

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

interface GradeEntry {
  id: string;
  course_id: string;
  course_name: string;
  course_description: string | null;
  course_level: string;
  calendar_year: number;
  sem1_grade: string | null;
  sem2_grade: string | null;
  sem1_grade_id: string | null;
  sem2_grade_id: string | null;
}

function StudentGradesModal({
  student,
  onClose,
  canEdit = true,
  canCreate = true,
  canDelete = true,
}: {
  student: StudentAPIResponse;
  onClose: () => void;
  canEdit?: boolean;
  canCreate?: boolean;
  canDelete?: boolean;
}) {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({ course_name: '', course_description: '' });
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [courses, setCourses] = useState<CourseAPIResponse[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [newGrade, setNewGrade] = useState({
    course_id: '',
    calendar_year: '',
    sem1_grade: '',
    sem2_grade: '',
  });
  
  // Bulk add grades state
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkYear, setBulkYear] = useState('');
  const [bulkGrades, setBulkGrades] = useState<Array<{
    course_id: string;
    course_name: string;
    course_level: string;
    sem1_grade: string;
    sem2_grade: string;
  }>>([]);
  const [bulkCourseSearch, setBulkCourseSearch] = useState('');
  const [showBulkCourseDropdown, setShowBulkCourseDropdown] = useState(false);
  
  // Track local grade edits before saving
  const [localGradeEdits, setLocalGradeEdits] = useState<Record<string, string>>({});
  
  // Delete grade confirmation state
  const [deleteGradeConfirm, setDeleteGradeConfirm] = useState<{
    gradeId: string;
    courseName: string;
    semester: string;
    sem1Id: string | null;
    sem2Id: string | null;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCourses = courses.filter(course => {
    const search = courseSearch.toLowerCase();
    const nameMatch = course.course_name 
      ? course.course_name.toLowerCase().includes(search) 
      : false;
    const descMatch = course.course_description 
      ? course.course_description.toLowerCase().includes(search) 
      : false;
    const levelMatch = course.course_level 
      ? course.course_level.toLowerCase().includes(search) 
      : false;
    return nameMatch || descMatch || levelMatch;
  });

  const selectedCourse = courses.find(c => c.id === newGrade.course_id);

  const fetchGrades = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getStudentGrades(student.id);
      
      const gradeMap = new Map<string, GradeEntry>();
      
      response.grades.forEach((grade) => {
        const key = `${grade.course_id}-${grade.calendar_year}`;
        
        if (!gradeMap.has(key)) {
          gradeMap.set(key, {
            id: key,
            course_id: grade.course_id,
            course_name: grade.course?.course_name || '',
            course_description: grade.course?.course_description || null,
            course_level: grade.course?.course_level || '',
            calendar_year: grade.calendar_year,
            sem1_grade: null,
            sem2_grade: null,
            sem1_grade_id: null,
            sem2_grade_id: null,
          });
        }
        
        const entry = gradeMap.get(key)!;
        const sem = String(grade.semester).toUpperCase();
        
        if (sem === 'SEM1' || sem === 'S1' || sem === '1' || sem === 'SEMESTER1') {
          entry.sem1_grade = grade.grade;
          entry.sem1_grade_id = grade.id;
        } else if (sem === 'SEM2' || sem === 'S2' || sem === '2' || sem === 'SEMESTER2') {
          entry.sem2_grade = grade.grade;
          entry.sem2_grade_id = grade.id;
        }
      });
      
      setGrades(Array.from(gradeMap.values()).sort((a, b) => 
        b.calendar_year - a.calendar_year
      ));
      setLocalGradeEdits({});
    } catch (err) {
      console.error('Error fetching grades:', err);
    } finally {
      setIsLoading(false);
    }
  }, [student.id]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await getCoursesPaginated({ limit: 10000 });
      setCourses(response.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
    fetchCourses();
  }, [fetchGrades, fetchCourses]);

  const handleEditCourse = (grade: GradeEntry) => {
    setEditingCourse(grade.course_id);
    setCourseForm({
      course_name: grade.course_name,
      course_description: grade.course_description || '',
    });
  };

  const handleSaveCourse = async (courseId: string) => {
    setIsSaving(true);
    try {
      await updateCourse(courseId, {
        course_name: courseForm.course_name,
        course_description: courseForm.course_description || null,
      });
      
      setGrades(grades.map(g => 
        g.course_id === courseId 
          ? { ...g, course_name: courseForm.course_name, course_description: courseForm.course_description }
          : g
      ));
      
      setEditingCourse(null);
    } catch (err) {
      console.error('Error updating course:', err);
      alert('Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGrade = async () => {
    if (!newGrade.course_id || !newGrade.calendar_year) {
      alert('Please select a course and enter calendar year');
      return;
    }
    
    if (!newGrade.sem1_grade && !newGrade.sem2_grade) {
      alert('Please enter at least one semester grade');
      return;
    }

    setIsSaving(true);
    try {
      const promises = [];
      
      if (newGrade.sem1_grade) {
        promises.push(createGrade({
          student_id: student.id,
          course_id: newGrade.course_id,
          calendar_year: parseInt(newGrade.calendar_year),
          semester: 'SEM1',
          grade: newGrade.sem1_grade,
        }));
      }
      
      if (newGrade.sem2_grade) {
        promises.push(createGrade({
          student_id: student.id,
          course_id: newGrade.course_id,
          calendar_year: parseInt(newGrade.calendar_year),
          semester: 'SEM2',
          grade: newGrade.sem2_grade,
        }));
      }
      
      await Promise.all(promises);
      
      setShowAddGrade(false);
      setNewGrade({ course_id: '', calendar_year: '', sem1_grade: '', sem2_grade: '' });
      setCourseSearch('');
      setShowCourseDropdown(false);
      fetchGrades();
    } catch (err) {
      console.error('Error adding grade:', err);
      alert('Failed to add grade');
    } finally {
      setIsSaving(false);
    }
  };

  // Add course to bulk list
  const handleAddCourseToBulk = (course: CourseAPIResponse) => {
    if (bulkGrades.find(g => g.course_id === course.id)) {
      alert('This course is already added');
      return;
    }
    setBulkGrades([...bulkGrades, {
      course_id: course.id,
      course_name: course.course_name,
      course_level: course.course_level || '',
      sem1_grade: '',
      sem2_grade: '',
    }]);
    setBulkCourseSearch('');
    setShowBulkCourseDropdown(false);
  };

  // Remove course from bulk list
  const handleRemoveFromBulk = (courseId: string) => {
    setBulkGrades(bulkGrades.filter(g => g.course_id !== courseId));
  };

  // Update bulk grade
  const handleBulkGradeChange = (courseId: string, field: 'sem1_grade' | 'sem2_grade', value: string) => {
    setBulkGrades(bulkGrades.map(g => 
      g.course_id === courseId ? { ...g, [field]: value } : g
    ));
  };

  // Save all bulk grades
  const handleSaveBulkGrades = async () => {
    if (!bulkYear) {
      alert('Please enter the calendar year');
      return;
    }
    
    const gradesToSave = bulkGrades.filter(g => g.sem1_grade || g.sem2_grade);
    if (gradesToSave.length === 0) {
      alert('Please enter at least one grade');
      return;
    }

    setIsSaving(true);
    try {
      const promises: Promise<GradeAPI>[] = [];
      
      gradesToSave.forEach(gradeEntry => {
        if (gradeEntry.sem1_grade) {
          promises.push(createGrade({
            student_id: student.id,
            course_id: gradeEntry.course_id,
            calendar_year: parseInt(bulkYear),
            semester: 'SEM1',
            grade: gradeEntry.sem1_grade,
          }));
        }
        if (gradeEntry.sem2_grade) {
          promises.push(createGrade({
            student_id: student.id,
            course_id: gradeEntry.course_id,
            calendar_year: parseInt(bulkYear),
            semester: 'SEM2',
            grade: gradeEntry.sem2_grade,
          }));
        }
      });
      
      await Promise.all(promises);
      
      setShowBulkAdd(false);
      setBulkYear('');
      setBulkGrades([]);
      setBulkCourseSearch('');
      fetchGrades();
    } catch (err) {
      console.error('Error saving bulk grades:', err);
      alert('Failed to save grades');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter courses for bulk add (exclude already added)
  const filteredBulkCourses = courses.filter(course => {
    const search = bulkCourseSearch.toLowerCase();
    const alreadyAdded = bulkGrades.some(g => g.course_id === course.id);
    if (alreadyAdded) return false;
    
    const nameMatch = course.course_name 
      ? course.course_name.toLowerCase().includes(search) 
      : false;
    const descMatch = course.course_description 
      ? course.course_description.toLowerCase().includes(search) 
      : false;
    const levelMatch = course.course_level 
      ? course.course_level.toLowerCase().includes(search) 
      : false;
    return nameMatch || descMatch || levelMatch;
  });

  // Handle local grade change (before blur/save)
  const handleLocalGradeChange = (gradeId: string, newValue: string) => {
    setLocalGradeEdits(prev => ({ ...prev, [gradeId]: newValue }));
  };

  // Handle grade update on blur
  const handleUpdateGrade = async (gradeId: string | null, originalValue: string | null) => {
    if (!gradeId) return;
    
    const newValue = localGradeEdits[gradeId];
    
    // Only update if value changed
    if (newValue === undefined || newValue === (originalValue || '')) {
      return;
    }
    
    try {
      await updateGrade(gradeId, {
        grade: newValue,
      });
      
      // Update local state
      setGrades(grades.map(g => {
        if (g.sem1_grade_id === gradeId) {
          return { ...g, sem1_grade: newValue };
        }
        if (g.sem2_grade_id === gradeId) {
          return { ...g, sem2_grade: newValue };
        }
        return g;
      }));
      
      // Clear the local edit
      setLocalGradeEdits(prev => {
        const updated = { ...prev };
        delete updated[gradeId];
        return updated;
      });
    } catch (err) {
      console.error('Error updating grade:', err);
      alert('Failed to update grade');
    }
  };

  const handleDeleteGrade = async (deleteBoth: boolean = true) => {
    if (!deleteGradeConfirm) return;
    
    setIsDeleting(true);
    try {
      if (deleteBoth && deleteGradeConfirm.sem1Id && deleteGradeConfirm.sem2Id) {
        // Delete both semesters
        await Promise.all([
          deleteGrade(deleteGradeConfirm.sem1Id),
          deleteGrade(deleteGradeConfirm.sem2Id),
        ]);
      } else if (deleteGradeConfirm.sem1Id) {
        await deleteGrade(deleteGradeConfirm.sem1Id);
      } else if (deleteGradeConfirm.sem2Id) {
        await deleteGrade(deleteGradeConfirm.sem2Id);
      }
      setDeleteGradeConfirm(null);
      fetchGrades();
    } catch (err) {
      console.error('Error deleting grade:', err);
      alert('Failed to delete grade');
    } finally {
      setIsDeleting(false);
    }
  };

  const gradesByYear = grades.reduce((acc, grade) => {
    const yearKey = grade.calendar_year.toString();
    if (!acc[yearKey]) {
      acc[yearKey] = [];
    }
    acc[yearKey].push(grade);
    return acc;
  }, {} as Record<string, GradeEntry[]>);

  // Get display value for grade input
  const getGradeDisplayValue = (gradeId: string | null, originalValue: string | null) => {
    if (!gradeId) return '';
    if (localGradeEdits[gradeId] !== undefined) {
      return localGradeEdits[gradeId];
    }
    return originalValue || '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Student Grades</h2>
            <p className="text-sm text-gray-500">{student.first_name} {student.last_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {canCreate && (
              <>
                <button
                  onClick={() => setShowBulkAdd(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Bulk Add
                </button>
                <button
                  onClick={() => setShowAddGrade(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Grade
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : grades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <GraduationCap className="w-12 h-12 mb-4 text-gray-300" />
              <p>No grades found for this student</p>
              {canCreate && (
                <button
                  onClick={() => setShowAddGrade(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add first grade
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(gradesByYear)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, yearGrades]) => (
                  <div key={year} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">{year}</h3>
                    </div>

                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Course</th>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Description</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-20">Sem 1</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-20">Sem 2</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {yearGrades.map((grade) => (
                          <tr key={grade.id} className="hover:bg-gray-50">
                            {editingCourse === grade.course_id ? (
                              <>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={courseForm.course_name}
                                    onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="text"
                                    value={courseForm.course_description}
                                    onChange={(e) => setCourseForm({ ...courseForm, course_description: e.target.value })}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                                  />
                                </td>
                                <td colSpan={2} className="px-4 py-2 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      onClick={() => handleSaveCourse(grade.course_id)}
                                      disabled={isSaving}
                                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                                    >
                                      {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => setEditingCourse(null)}
                                      className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                                <td></td>
                              </>
                            ) : (
                              <>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{grade.course_name}</span>
                                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                      {grade.course_level}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-600">
                                  {grade.course_description || '-'}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  {canEdit && grade.sem1_grade_id ? (
                                    <input
                                      type="text"
                                      value={getGradeDisplayValue(grade.sem1_grade_id, grade.sem1_grade)}
                                      onChange={(e) => handleLocalGradeChange(grade.sem1_grade_id!, e.target.value)}
                                      onBlur={() => handleUpdateGrade(grade.sem1_grade_id, grade.sem1_grade)}
                                      className="w-14 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                                      placeholder="-"
                                    />
                                  ) : (
                                    <span className="text-sm text-gray-900">{grade.sem1_grade ?? '-'}</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  {canEdit && grade.sem2_grade_id ? (
                                    <input
                                      type="text"
                                      value={getGradeDisplayValue(grade.sem2_grade_id, grade.sem2_grade)}
                                      onChange={(e) => handleLocalGradeChange(grade.sem2_grade_id!, e.target.value)}
                                      onBlur={() => handleUpdateGrade(grade.sem2_grade_id, grade.sem2_grade)}
                                      className="w-14 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                                      placeholder="-"
                                    />
                                  ) : (
                                    <span className="text-sm text-gray-900">{grade.sem2_grade ?? '-'}</span>
                                  )}
                                </td>
                                <td className="px-4 py-2 text-center">
                                  {(canEdit || canDelete) && (
                                    <div className="flex justify-center gap-1">
                                      {canEdit && (
                                        <button
                                          onClick={() => handleEditCourse(grade)}
                                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                                          title="Edit Course"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {canDelete && (grade.sem1_grade_id || grade.sem2_grade_id) && (
                                        <button
                                          onClick={() => {
                                            // Determine what to show in confirmation
                                            const hasBoth = grade.sem1_grade_id && grade.sem2_grade_id;
                                            setDeleteGradeConfirm({
                                              gradeId: grade.sem1_grade_id || grade.sem2_grade_id || '',
                                              courseName: grade.course_name,
                                              semester: hasBoth ? 'both' : (grade.sem1_grade_id ? 'Semester 1' : 'Semester 2'),
                                              sem1Id: grade.sem1_grade_id,
                                              sem2Id: grade.sem2_grade_id,
                                            });
                                          }}
                                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                                          title="Delete Grade"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
          )}
        </div>

        {showAddGrade && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Grade</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={showCourseDropdown ? courseSearch : (selectedCourse ? `${selectedCourse.course_name} (${selectedCourse.course_level})` : '')}
                      onChange={(e) => {
                        setCourseSearch(e.target.value);
                        setShowCourseDropdown(true);
                        if (!e.target.value) {
                          setNewGrade({ ...newGrade, course_id: '' });
                        }
                      }}
                      onFocus={() => {
                        setShowCourseDropdown(true);
                        setCourseSearch('');
                      }}
                      placeholder="Search for a course..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  {showCourseDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowCourseDropdown(false)} 
                      />
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                        {filteredCourses.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No courses found matching &quot;{courseSearch}&quot;
                          </div>
                        ) : (
                          <>
                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-b sticky top-0">
                              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
                            </div>
                            {filteredCourses.map((course) => (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => {
                                  setNewGrade({ ...newGrade, course_id: course.id });
                                  setCourseSearch('');
                                  setShowCourseDropdown(false);
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between ${
                                  newGrade.course_id === course.id ? 'bg-blue-50' : ''
                                }`}
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{course.course_name}</p>
                                  <p className="text-xs text-gray-500">{course.course_description || 'No description'}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {course.course_level || '-'}
                                </span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calendar Year *</label>
                  <input
                    type="number"
                    value={newGrade.calendar_year}
                    onChange={(e) => setNewGrade({ ...newGrade, calendar_year: e.target.value })}
                    placeholder="e.g., 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grades</label>
                  <p className="text-xs text-gray-500 mb-3">Enter grade for one or both semesters</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Semester 1</label>
                      <input
                        type="text"
                        value={newGrade.sem1_grade}
                        onChange={(e) => setNewGrade({ ...newGrade, sem1_grade: e.target.value })}
                        placeholder="e.g., 6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Semester 2</label>
                      <input
                        type="text"
                        value={newGrade.sem2_grade}
                        onChange={(e) => setNewGrade({ ...newGrade, sem2_grade: e.target.value })}
                        placeholder="e.g., 7"
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddGrade(false);
                    setCourseSearch('');
                    setShowCourseDropdown(false);
                    setNewGrade({ course_id: '', calendar_year: '', sem1_grade: '', sem2_grade: '' });
                  }}
                  className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGrade}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Add Grade
                </button>
              </div>
            </div>
          </div>
        )}

        {showBulkAdd && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bulk Add Grades</h3>
                <p className="text-sm text-gray-500">Add multiple course grades for a specific year</p>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calendar Year *</label>
                  <input
                    type="number"
                    value={bulkYear}
                    onChange={(e) => setBulkYear(e.target.value)}
                    placeholder="e.g., 2024"
                    className="w-48 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Courses</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bulkCourseSearch}
                      onChange={(e) => {
                        setBulkCourseSearch(e.target.value);
                        setShowBulkCourseDropdown(true);
                      }}
                      onFocus={() => setShowBulkCourseDropdown(true)}
                      placeholder="Search and add courses..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                    
                    {showBulkCourseDropdown && bulkCourseSearch && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowBulkCourseDropdown(false)} 
                        />
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {filteredBulkCourses.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500">
                              No courses found
                            </div>
                          ) : (
                            filteredBulkCourses.slice(0, 10).map((course) => (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => handleAddCourseToBulk(course)}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{course.course_name}</p>
                                  <p className="text-xs text-gray-500">{course.course_description || 'No description'}</p>
                                </div>
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {course.course_level || '-'}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {bulkGrades.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Course</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-24">Sem 1</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-24">Sem 2</th>
                          <th className="text-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bulkGrades.map((grade) => (
                          <tr key={grade.course_id}>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900">{grade.course_name}</span>
                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {grade.course_level}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="text"
                                value={grade.sem1_grade}
                                onChange={(e) => handleBulkGradeChange(grade.course_id, 'sem1_grade', e.target.value)}
                                placeholder="-"
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <input
                                type="text"
                                value={grade.sem2_grade}
                                onChange={(e) => handleBulkGradeChange(grade.course_id, 'sem2_grade', e.target.value)}
                                placeholder="-"
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                              />
                            </td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleRemoveFromBulk(grade.course_id)}
                                className="p-1 hover:bg-red-50 rounded text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {bulkGrades.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                    <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Search and add courses above</p>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkAdd(false);
                    setBulkYear('');
                    setBulkGrades([]);
                    setBulkCourseSearch('');
                  }}
                  className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBulkGrades}
                  disabled={isSaving || bulkGrades.length === 0}
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save {bulkGrades.filter(g => g.sem1_grade || g.sem2_grade).length} Grade{bulkGrades.filter(g => g.sem1_grade || g.sem2_grade).length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteGradeConfirm && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Grade</h3>
                  <p className="text-sm text-gray-500">{deleteGradeConfirm.courseName}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                {deleteGradeConfirm.semester === 'both' 
                  ? 'This course has grades for both semesters. Would you like to delete both or just one?'
                  : `Are you sure you want to delete the ${deleteGradeConfirm.semester} grade for this course?`
                }
              </p>

              {deleteGradeConfirm.semester === 'both' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleDeleteGrade(true)}
                    disabled={isDeleting}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete Both Semesters
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setDeleteGradeConfirm({
                          ...deleteGradeConfirm,
                          semester: 'Semester 1',
                          sem2Id: null,
                        });
                      }}
                      className="py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-xl text-sm"
                    >
                      Delete Sem 1 Only
                    </button>
                    <button
                      onClick={() => {
                        setDeleteGradeConfirm({
                          ...deleteGradeConfirm,
                          semester: 'Semester 2',
                          sem1Id: null,
                        });
                      }}
                      className="py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-xl text-sm"
                    >
                      Delete Sem 2 Only
                    </button>
                  </div>
                  <button
                    onClick={() => setDeleteGradeConfirm(null)}
                    className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteGradeConfirm(null)}
                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteGrade(false)}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium rounded-xl flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentsContent() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('students', 'update');
  const canCreate = hasPermission('students', 'create');
  const canDelete = hasPermission('students', 'delete');
  const canEditGrades = hasPermission('grades', 'update');
  const canCreateGrades = hasPermission('grades', 'create');
  const canDeleteGrades = hasPermission('grades', 'delete');

  const [students, setStudents] = useState<StudentAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 25;

  const [searchQuery, setSearchQuery] = useState('');
  const [yearGroupFilter, setYearGroupFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [yearGroups, setYearGroups] = useState<string[]>([]);

  const [viewStudent, setViewStudent] = useState<StudentAPIResponse | null>(null);
  const [editStudent, setEditStudent] = useState<StudentAPIResponse | null>(null);
  const [deleteStudentData, setDeleteStudentData] = useState<StudentAPIResponse | null>(null);
  const [gradesStudent, setGradesStudent] = useState<StudentAPIResponse | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingStudentId, setDownloadingStudentId] = useState<string | null>(null);

  const defaultGradingScale = [
    { grade: '7', lcsDescriptor: 'Excellent', descriptor: 'A+' },
    { grade: '6', lcsDescriptor: 'Very Good', descriptor: 'A' },
    { grade: '5', lcsDescriptor: 'Good', descriptor: 'B' },
    { grade: '4', lcsDescriptor: 'Satisfactory', descriptor: 'C' },
    { grade: '3', lcsDescriptor: 'Mediocre', descriptor: 'D' },
    { grade: '2', lcsDescriptor: 'Poor', descriptor: 'E' },
    { grade: '1', lcsDescriptor: 'Very Poor', descriptor: 'F' },
  ];

  const handleDownloadTranscript = async (student: StudentAPIResponse) => {
    setDownloadingStudentId(student.id);
    
    try {
      const transcriptResponse = await getTranscript(student.id);
      const transcriptData = transformTranscript(transcriptResponse);
      
      const blob = await pdf(
        <TranscriptPDF data={transcriptData} gradingScale={defaultGradingScale} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Transcript_${student.first_name}_${student.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading transcript:', err);
      alert(err instanceof Error ? err.message : 'Failed to download transcript');
    } finally {
      setDownloadingStudentId(null);
    }
  };

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
      
      setStudents(response.students);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, yearGroupFilter, genderFilter, statusFilter]);

  const fetchYearGroups = useCallback(async () => {
    try {
      const groups = await getYearGroups();
      setYearGroups(groups);
    } catch (err) {
      console.error('Error fetching year groups:', err);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchYearGroups();
  }, [fetchYearGroups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchStudents();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleView = async (student: StudentAPIResponse) => {
    try {
      const fullStudent = await getStudentById(student.id);
      setViewStudent(fullStudent);
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  const handleEdit = async (student: StudentAPIResponse) => {
    try {
      const fullStudent = await getStudentById(student.id);
      setEditStudent(fullStudent);
    } catch (err) {
      console.error('Error fetching student details:', err);
    }
  };

  const handleSave = async (data: StudentFormData) => {
    setIsSaving(true);
    
    try {
      const payload = {
        first_name: data.first_name,
        middle_name: data.middle_name || null,
        last_name: data.last_name,
        unique_id: data.unique_id,
        gender: data.gender || null,
        date_of_birth: data.date_of_birth || null,
        nationality: data.nationality || null,
        birth_place: data.birth_place || null,
        language: data.language || null,
        home_language: data.home_language || null,
        student_email: data.student_email || null,
        status: data.status || 'ACTIVE',
        year_group: data.year_group || null,
        entry_grade: data.entry_grade || null,
      };

      if (editStudent) {
        await updateStudent(editStudent.id, payload);
      } else {
        await createStudent(payload);
      }
      
      setEditStudent(null);
      setShowAddModal(false);
      fetchStudents();
    } catch (err) {
      console.error('Error saving student:', err);
      alert(err instanceof Error ? err.message : 'Failed to save student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteStudentData) return;
    
    setIsDeleting(true);
    
    try {
      await deleteStudent(deleteStudentData.id);
      setDeleteStudentData(null);
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

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

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600 mt-1">Manage student records</p>
            </div>
            {canCreate && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Student
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4">
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

              <select
                value={genderFilter}
                onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[130px]"
              >
                <option value="">All Genders</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[130px]"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

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
                            onViewGrades={() => setGradesStudent(student)}
                            onDownloadTranscript={() => handleDownloadTranscript(student)}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            isDownloading={downloadingStudentId === student.id}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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

      {gradesStudent && (
        <StudentGradesModal
          student={gradesStudent}
          onClose={() => setGradesStudent(null)}
          canEdit={canEditGrades}
          canCreate={canCreateGrades}
          canDelete={canDeleteGrades}
        />
      )}
    </div>
  );
}

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <StudentsContent />
    </ProtectedRoute>
  );
}
