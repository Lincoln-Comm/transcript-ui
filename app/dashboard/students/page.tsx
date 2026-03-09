// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { Header, Breadcrumb } from '@/components/layout';
// import { ProtectedRoute } from '@/components/auth';
// import { 
//   Search, 
//   Plus, 
//   ChevronLeft, 
//   ChevronRight,
//   MoreVertical,
//   Eye,
//   Pencil,
//   Trash2,
//   Loader2,
//   X,
//   AlertTriangle,
//   Users
// } from 'lucide-react';
// import { 
//   getStudentsPaginated, 
//   getStudentById,
//   createStudent,
//   updateStudent,
//   deleteStudent,
//   getYearGroups,
//   StudentAPIResponse,
//   PaginatedStudentsResponse,
// } from '@/lib/api';

// // =====================================================
// // Types
// // =====================================================

// interface StudentFormData {
//   first_name: string;
//   middle_name: string;
//   last_name: string;
//   gender: string;
//   date_of_birth: string;
//   nationality: string;
//   birth_place: string;
//   language: string;
//   home_language: string;
//   student_email: string;
//   status: string;
//   year_group: string;
//   entry_grade: string;
//   unique_id: string;
// }

// const emptyFormData: StudentFormData = {
//   first_name: '',
//   middle_name: '',
//   last_name: '',
//   gender: '',
//   date_of_birth: '',
//   nationality: '',
//   birth_place: '',
//   language: '',
//   home_language: '',
//   student_email: '',
//   status: 'ACTIVE',
//   year_group: '',
//   entry_grade: '',
//   unique_id: '',
// };

// // =====================================================
// // Action Menu Component
// // =====================================================

// function ActionMenu({ 
//   onView, 
//   onEdit, 
//   onDelete 
// }: { 
//   onView: () => void; 
//   onEdit: () => void; 
//   onDelete: () => void;
// }) {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//       >
//         <MoreVertical className="w-4 h-4 text-gray-500" />
//       </button>

//       {isOpen && (
//         <>
//           <div 
//             className="fixed inset-0 z-40" 
//             onClick={() => setIsOpen(false)} 
//           />
//           <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
//             <button
//               onClick={() => { onView(); setIsOpen(false); }}
//               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//             >
//               <Eye className="w-4 h-4 text-gray-400" />
//               View Details
//             </button>
//             <button
//               onClick={() => { onEdit(); setIsOpen(false); }}
//               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//             >
//               <Pencil className="w-4 h-4 text-gray-400" />
//               Edit
//             </button>
//             <button
//               onClick={() => { onDelete(); setIsOpen(false); }}
//               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//             >
//               <Trash2 className="w-4 h-4" />
//               Delete
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // =====================================================
// // View Student Modal
// // =====================================================

// function ViewStudentModal({ 
//   student, 
//   onClose 
// }: { 
//   student: StudentAPIResponse | null; 
//   onClose: () => void;
// }) {
//   if (!student) return null;

//   const formatDate = (date: string | null) => {
//     if (!date) return '-';
//     return new Date(date).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const fields = [
//     { label: 'Student ID', value: student.unique_id || '-' },
//     { label: 'First Name', value: student.first_name },
//     { label: 'Middle Name', value: student.middle_name || '-' },
//     { label: 'Last Name', value: student.last_name },
//     { label: 'Gender', value: student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '-' },
//     { label: 'Date of Birth', value: formatDate(student.date_of_birth) },
//     { label: 'Nationality', value: student.nationality || '-' },
//     { label: 'Birth Place', value: student.birth_place || '-' },
//     { label: 'Language', value: student.language || '-' },
//     { label: 'Home Language', value: student.home_language || '-' },
//     { label: 'Email', value: student.student_email || '-' },
//     { label: 'Year Group', value: student.year_group || '-' },
//     { label: 'Entry Grade', value: student.entry_grade || '-' },
//     { label: 'Status', value: student.status || '-' },
//   ];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-900">Student Details</h2>
//             <p className="text-sm text-gray-500">{student.first_name} {student.last_name}</p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
//           <div className="grid grid-cols-2 gap-4">
//             {fields.map((field) => (
//               <div key={field.label} className="space-y-1">
//                 <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
//                   {field.label}
//                 </p>
//                 <p className="text-sm text-gray-900">{field.value}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
//           <button
//             onClick={onClose}
//             className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // =====================================================
// // Add/Edit Student Modal
// // =====================================================

// function StudentFormModal({ 
//   student, 
//   isEdit,
//   onClose,
//   onSave,
//   isSaving,
// }: { 
//   student: StudentFormData;
//   isEdit: boolean;
//   onClose: () => void;
//   onSave: (data: StudentFormData) => void;
//   isSaving: boolean;
// }) {
//   const [formData, setFormData] = useState<StudentFormData>(student);

//   const handleChange = (field: keyof StudentFormData, value: string) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm";
//   const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <h2 className="text-xl font-semibold text-gray-900">
//             {isEdit ? 'Edit Student' : 'Add New Student'}
//           </h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <X className="w-5 h-5 text-gray-500" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit}>
//           <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
//             <div className="grid grid-cols-2 gap-4">
//               {/* First Name */}
//               <div>
//                 <label className={labelClass}>First Name *</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.first_name}
//                   onChange={(e) => handleChange('first_name', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter first name"
//                 />
//               </div>

//               {/* Middle Name */}
//               <div>
//                 <label className={labelClass}>Middle Name</label>
//                 <input
//                   type="text"
//                   value={formData.middle_name}
//                   onChange={(e) => handleChange('middle_name', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter middle name"
//                 />
//               </div>

//               {/* Last Name */}
//               <div>
//                 <label className={labelClass}>Last Name *</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.last_name}
//                   onChange={(e) => handleChange('last_name', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter last name"
//                 />
//               </div>

//               {/* Student ID */}
//               <div>
//                 <label className={labelClass}>Student ID</label>
//                 <input
//                   type="text"
//                   value={formData.unique_id}
//                   onChange={(e) => handleChange('unique_id', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter student ID"
//                 />
//               </div>

//               {/* Gender */}
//               <div>
//                 <label className={labelClass}>Gender *</label>
//                 <select
//                   required
//                   value={formData.gender}
//                   onChange={(e) => handleChange('gender', e.target.value)}
//                   className={inputClass}
//                 >
//                   <option value="">Select gender</option>
//                   <option value="M">Male</option>
//                   <option value="F">Female</option>
//                 </select>
//               </div>

//               {/* Date of Birth */}
//               <div>
//                 <label className={labelClass}>Date of Birth</label>
//                 <input
//                   type="date"
//                   value={formData.date_of_birth}
//                   onChange={(e) => handleChange('date_of_birth', e.target.value)}
//                   className={inputClass}
//                 />
//               </div>

//               {/* Nationality */}
//               <div>
//                 <label className={labelClass}>Nationality</label>
//                 <input
//                   type="text"
//                   value={formData.nationality}
//                   onChange={(e) => handleChange('nationality', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter nationality"
//                 />
//               </div>

//               {/* Birth Place */}
//               <div>
//                 <label className={labelClass}>Birth Place</label>
//                 <input
//                   type="text"
//                   value={formData.birth_place}
//                   onChange={(e) => handleChange('birth_place', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter birth place"
//                 />
//               </div>

//               {/* Language */}
//               <div>
//                 <label className={labelClass}>Language</label>
//                 <input
//                   type="text"
//                   value={formData.language}
//                   onChange={(e) => handleChange('language', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter language"
//                 />
//               </div>

//               {/* Home Language */}
//               <div>
//                 <label className={labelClass}>Home Language</label>
//                 <input
//                   type="text"
//                   value={formData.home_language}
//                   onChange={(e) => handleChange('home_language', e.target.value)}
//                   className={inputClass}
//                   placeholder="Enter home language"
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label className={labelClass}>Email</label>
//                 <input
//                   type="email"
//                   value={formData.student_email}
//                   onChange={(e) => handleChange('student_email', e.target.value)}
//                   className={inputClass}
//                   placeholder="student@example.com"
//                 />
//               </div>

//               {/* Year Group */}
//               <div>
//                 <label className={labelClass}>Year Group</label>
//                 <input
//                   type="text"
//                   value={formData.year_group}
//                   onChange={(e) => handleChange('year_group', e.target.value)}
//                   className={inputClass}
//                   placeholder="e.g., 2023-2024"
//                 />
//               </div>

//               {/* Entry Grade */}
//               <div>
//                 <label className={labelClass}>Entry Grade</label>
//                 <input
//                   type="text"
//                   value={formData.entry_grade}
//                   onChange={(e) => handleChange('entry_grade', e.target.value)}
//                   className={inputClass}
//                   placeholder="e.g., Grade 9"
//                 />
//               </div>

//               {/* Status */}
//               <div>
//                 <label className={labelClass}>Status</label>
//                 <select
//                   value={formData.status}
//                   onChange={(e) => handleChange('status', e.target.value)}
//                   className={inputClass}
//                 >
//                   <option value="ACTIVE">Active</option>
//                   <option value="INACTIVE">Inactive</option>
//                   <option value="GRADUATED">Graduated</option>
//                   <option value="TRANSFERRED">Transferred</option>
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSaving}
//               className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
//             >
//               {isSaving ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Saving...
//                 </>
//               ) : (
//                 isEdit ? 'Save Changes' : 'Add Student'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // =====================================================
// // Delete Confirmation Modal
// // =====================================================

// function DeleteConfirmModal({
//   studentName,
//   onClose,
//   onConfirm,
//   isDeleting,
// }: {
//   studentName: string;
//   onClose: () => void;
//   onConfirm: () => void;
//   isDeleting: boolean;
// }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
//         {/* Icon */}
//         <div className="pt-6 pb-4 flex justify-center">
//           <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
//             <AlertTriangle className="w-8 h-8 text-red-600" />
//           </div>
//         </div>

//         {/* Content */}
//         <div className="px-6 pb-6 text-center">
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Student</h3>
//           <p className="text-gray-600">
//             Are you sure you want to delete <span className="font-semibold">{studentName}</span>? 
//             This action cannot be undone.
//           </p>
//         </div>

//         {/* Actions */}
//         <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={isDeleting}
//             className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
//           >
//             {isDeleting ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Deleting...
//               </>
//             ) : (
//               'Delete'
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // =====================================================
// // Main Students Page Content
// // =====================================================

// function StudentsContent() {
//   // State
//   const [students, setStudents] = useState<StudentAPIResponse[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const limit = 25;

//   // Filters
//   const [searchQuery, setSearchQuery] = useState('');
//   const [yearGroupFilter, setYearGroupFilter] = useState('');
//   const [genderFilter, setGenderFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [yearGroups, setYearGroups] = useState<string[]>([]);

//   // Modals
//   const [viewStudent, setViewStudent] = useState<StudentAPIResponse | null>(null);
//   const [editStudent, setEditStudent] = useState<StudentAPIResponse | null>(null);
//   const [deleteStudentData, setDeleteStudentData] = useState<StudentAPIResponse | null>(null);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // Fetch students
//   const fetchStudents = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await getStudentsPaginated({
//         page: currentPage,
//         limit,
//         search: searchQuery || undefined,
//         year_group: yearGroupFilter || undefined,
//         gender: genderFilter || undefined,
//         status: statusFilter || undefined,
//       });

//       console.log('📚 Students fetched:', response);
      
//       setStudents(response.students);
//       setTotalPages(response.totalPages);
//       setTotalItems(response.totalItems);
//     } catch (err) {
//       console.error('❌ Error fetching students:', err);
//       setError(err instanceof Error ? err.message : 'Failed to fetch students');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [currentPage, searchQuery, yearGroupFilter, genderFilter, statusFilter]);

//   // Fetch year groups for filter
//   const fetchYearGroups = useCallback(async () => {
//     try {
//       const groups = await getYearGroups();
//       setYearGroups(groups);
//     } catch (err) {
//       console.error('Error fetching year groups:', err);
//     }
//   }, []);

//   // Initial fetch
//   useEffect(() => {
//     fetchStudents();
//   }, [fetchStudents]);

//   useEffect(() => {
//     fetchYearGroups();
//   }, [fetchYearGroups]);

//   // Debounced search
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setCurrentPage(1);
//       fetchStudents();
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   // Handle view student
//   const handleView = async (student: StudentAPIResponse) => {
//     try {
//       const fullStudent = await getStudentById(student.id);
//       setViewStudent(fullStudent);
//     } catch (err) {
//       console.error('Error fetching student details:', err);
//     }
//   };

//   // Handle edit student
//   const handleEdit = async (student: StudentAPIResponse) => {
//     try {
//       const fullStudent = await getStudentById(student.id);
//       setEditStudent(fullStudent);
//     } catch (err) {
//       console.error('Error fetching student details:', err);
//     }
//   };

//   // Handle save (create or update)
//   const handleSave = async (data: StudentFormData) => {
//     setIsSaving(true);
    
//     try {
//       if (editStudent) {
//         await updateStudent(editStudent.id, data);
//         console.log('✅ Student updated');
//       } else {
//         await createStudent(data);
//         console.log('✅ Student created');
//       }
      
//       setEditStudent(null);
//       setShowAddModal(false);
//       fetchStudents();
//     } catch (err) {
//       console.error('❌ Error saving student:', err);
//       alert(err instanceof Error ? err.message : 'Failed to save student');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Handle delete
//   const handleDelete = async () => {
//     if (!deleteStudentData) return;
    
//     setIsDeleting(true);
    
//     try {
//       await deleteStudent(deleteStudentData.id);
//       console.log('✅ Student deleted');
//       setDeleteStudentData(null);
//       fetchStudents();
//     } catch (err) {
//       console.error('❌ Error deleting student:', err);
//       alert(err instanceof Error ? err.message : 'Failed to delete student');
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   // Pagination
//   const startItem = (currentPage - 1) * limit + 1;
//   const endItem = Math.min(currentPage * limit, totalItems);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
//       <Header activeNav="students" />
      
//       <main className="px-6 py-8">
//         <div className="max-w-7xl mx-auto">
//           <Breadcrumb 
//             items={[
//               { label: 'Dashboard', href: '/dashboard' },
//               { label: 'Students', href: null },
//             ]}
//           />

//           {/* Page Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Students</h1>
//               <p className="text-gray-600 mt-1">Manage student records</p>
//             </div>
//             <button
//               onClick={() => setShowAddModal(true)}
//               className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition-all"
//             >
//               <Plus className="w-5 h-5" />
//               Add Student
//             </button>
//           </div>

//           {/* Filters */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
//             <div className="flex flex-wrap gap-4">
//               {/* Search */}
//               <div className="flex-1 min-w-[250px]">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                   />
//                 </div>
//               </div>

//               {/* Year Group Filter */}
//               <select
//                 value={yearGroupFilter}
//                 onChange={(e) => { setYearGroupFilter(e.target.value); setCurrentPage(1); }}
//                 className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[150px]"
//               >
//                 <option value="">All Years</option>
//                 {yearGroups.map((year) => (
//                   <option key={year} value={year}>{year}</option>
//                 ))}
//               </select>

//               {/* Gender Filter */}
//               <select
//                 value={genderFilter}
//                 onChange={(e) => { setGenderFilter(e.target.value); setCurrentPage(1); }}
//                 className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[130px]"
//               >
//                 <option value="">All Genders</option>
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//               </select>

//               {/* Status Filter */}
//               <select
//                 value={statusFilter}
//                 onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
//                 className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[130px]"
//               >
//                 <option value="">All Status</option>
//                 <option value="ACTIVE">Active</option>
//                 <option value="INACTIVE">Inactive</option>
//                 <option value="GRADUATED">Graduated</option>
//                 <option value="TRANSFERRED">Transferred</option>
//               </select>
//             </div>
//           </div>

//           {/* Table */}
//           <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//             {isLoading ? (
//               <div className="flex items-center justify-center py-20">
//                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//                 <span className="ml-3 text-gray-600">Loading students...</span>
//               </div>
//             ) : error ? (
//               <div className="flex flex-col items-center justify-center py-20 text-red-500">
//                 <p>{error}</p>
//                 <button 
//                   onClick={fetchStudents}
//                   className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             ) : students.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-20 text-gray-500">
//                 <Users className="w-12 h-12 mb-4 text-gray-300" />
//                 <p>No students found</p>
//               </div>
//             ) : (
//               <>
//                 <table className="w-full">
//                   <thead className="bg-gray-50 border-b border-gray-200">
//                     <tr>
//                       <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
//                       <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Gender</th>
//                       <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Year Group</th>
//                       <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
//                       <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100">
//                     {students.map((student) => (
//                       <tr key={student.id} className="hover:bg-gray-50 transition-colors">
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-semibold text-sm">
//                               {student.first_name[0]}{student.last_name[0]}
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-900">
//                                 {student.first_name} {student.middle_name ? `${student.middle_name} ` : ''}{student.last_name}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 text-gray-600">
//                           {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : '-'}
//                         </td>
//                         <td className="px-6 py-4 text-gray-600">{student.year_group || '-'}</td>
//                         <td className="px-6 py-4 text-gray-600">{student.student_email || '-'}</td>
//                         <td className="px-6 py-4 text-right">
//                           <ActionMenu
//                             onView={() => handleView(student)}
//                             onEdit={() => handleEdit(student)}
//                             onDelete={() => setDeleteStudentData(student)}
//                           />
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>

//                 {/* Pagination */}
//                 <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
//                   <p className="text-sm text-gray-600">
//                     Showing {startItem} - {endItem} of {totalItems} students
//                   </p>
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                       disabled={currentPage === 1}
//                       className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       <ChevronLeft className="w-5 h-5" />
//                     </button>
                    
//                     <div className="flex items-center gap-1">
//                       {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                         let page: number;
//                         if (totalPages <= 5) {
//                           page = i + 1;
//                         } else if (currentPage <= 3) {
//                           page = i + 1;
//                         } else if (currentPage >= totalPages - 2) {
//                           page = totalPages - 4 + i;
//                         } else {
//                           page = currentPage - 2 + i;
//                         }
                        
//                         return (
//                           <button
//                             key={page}
//                             onClick={() => setCurrentPage(page)}
//                             className={`w-10 h-10 rounded-lg font-medium transition-colors ${
//                               currentPage === page
//                                 ? 'bg-blue-600 text-white'
//                                 : 'hover:bg-gray-100 text-gray-700'
//                             }`}
//                           >
//                             {page}
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <button
//                       onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                       disabled={currentPage === totalPages}
//                       className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       <ChevronRight className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Modals */}
//       {viewStudent && (
//         <ViewStudentModal
//           student={viewStudent}
//           onClose={() => setViewStudent(null)}
//         />
//       )}

//       {(showAddModal || editStudent) && (
//         <StudentFormModal
//           student={editStudent ? {
//             first_name: editStudent.first_name || '',
//             middle_name: editStudent.middle_name || '',
//             last_name: editStudent.last_name || '',
//             gender: editStudent.gender || '',
//             date_of_birth: editStudent.date_of_birth || '',
//             nationality: editStudent.nationality || '',
//             birth_place: editStudent.birth_place || '',
//             language: editStudent.language || '',
//             home_language: editStudent.home_language || '',
//             student_email: editStudent.student_email || '',
//             status: editStudent.status || 'ACTIVE',
//             year_group: editStudent.year_group || '',
//             entry_grade: editStudent.entry_grade || '',
//             unique_id: editStudent.unique_id || '',
//           } : emptyFormData}
//           isEdit={!!editStudent}
//           onClose={() => { setShowAddModal(false); setEditStudent(null); }}
//           onSave={handleSave}
//           isSaving={isSaving}
//         />
//       )}

//       {deleteStudentData && (
//         <DeleteConfirmModal
//           studentName={`${deleteStudentData.first_name} ${deleteStudentData.last_name}`}
//           onClose={() => setDeleteStudentData(null)}
//           onConfirm={handleDelete}
//           isDeleting={isDeleting}
//         />
//       )}
//     </div>
//   );
// }

// // =====================================================
// // Export with Protected Route
// // =====================================================

// export default function StudentsPage() {
//   return (
//     <ProtectedRoute>
//       <StudentsContent />
//     </ProtectedRoute>
//   );
// } 




'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Users,
  GraduationCap,
  BookOpen,
  Save
} from 'lucide-react';
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
  StudentAPIResponse,
  PaginatedStudentsResponse,
  GradeAPI,
  CourseAPIResponse,
} from '@/lib/api';

// Types

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


// Action Menu Component
function ActionMenu({ 
  onView, 
  onEdit, 
  onDelete,
  onViewGrades,
}: { 
  onView: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
  onViewGrades: () => void;
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
            className="fixed w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
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

// View Student Modal

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


// Add/Edit Student Modal

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

              {/* Gender */}
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


// Delete Confirmation Modal
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

// Student Grades Modal
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
}: {
  student: StudentAPIResponse;
  onClose: () => void;
}) {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState({ course_name: '', course_description: '' });
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [courses, setCourses] = useState<CourseAPIResponse[]>([]);
  const [newGrade, setNewGrade] = useState({
    course_id: '',
    calendar_year: '',
    semester: 'SEM1',
    grade: '',
  });

  // Fetch grades
  const fetchGrades = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getStudentGrades(student.id);
      
      // Group grades by course and calendar year
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
        
        // Handle semester formats: "SEM1", "SEM2", "S1", "S2", "1", "2"
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
    } catch (err) {
      console.error('Error fetching grades:', err);
    } finally {
      setIsLoading(false);
    }
  }, [student.id]);

  // Fetch courses for add grade dropdown
  const fetchCourses = useCallback(async () => {
    try {
      const response = await getCoursesPaginated({ limit: 500 });
      setCourses(response.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, []);

  useEffect(() => {
    fetchGrades();
    fetchCourses();
  }, [fetchGrades, fetchCourses]);

  // Handle edit course
  const handleEditCourse = (grade: GradeEntry) => {
    setEditingCourse(grade.course_id);
    setCourseForm({
      course_name: grade.course_name,
      course_description: grade.course_description || '',
    });
  };

  // Handle save course
  const handleSaveCourse = async (courseId: string) => {
    setIsSaving(true);
    try {
      await updateCourse(courseId, {
        course_name: courseForm.course_name,
        course_description: courseForm.course_description || null,
      });
      
      // Update local state
      setGrades(grades.map(g => 
        g.course_id === courseId 
          ? { ...g, course_name: courseForm.course_name, course_description: courseForm.course_description }
          : g
      ));
      
      setEditingCourse(null);
      console.log('Course updated');
    } catch (err) {
      console.error('Error updating course:', err);
      alert('Failed to update course');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle add grade
  const handleAddGrade = async () => {
    if (!newGrade.course_id || !newGrade.calendar_year || !newGrade.grade) {
      alert('Please select a course, enter calendar year, and enter a grade');
      return;
    }

    setIsSaving(true);
    try {
      await createGrade({
        student_id: student.id,
        course_id: newGrade.course_id,
        calendar_year: parseInt(newGrade.calendar_year),
        semester: newGrade.semester,
        grade: newGrade.grade,
      });
      
      setShowAddGrade(false);
      setNewGrade({ course_id: '', calendar_year: '', semester: 'SEM1', grade: '' });
      fetchGrades();
      console.log('Grade added');
    } catch (err) {
      console.error('Error adding grade:', err);
      alert('Failed to add grade');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle update grade inline
  const handleUpdateGrade = async (gradeId: string, newValue: string) => {
    if (!gradeId) return;
    
    try {
      await updateGrade(gradeId, {
        grade: newValue,
      });
      fetchGrades();
    } catch (err) {
      console.error('Error updating grade:', err);
    }
  };

  // Handle delete grade
  const handleDeleteGrade = async (gradeId: string | null) => {
    if (!gradeId) return;
    
    if (!confirm('Are you sure you want to delete this grade?')) return;
    
    try {
      await deleteGrade(gradeId);
      fetchGrades();
      console.log('Grade deleted');
    } catch (err) {
      console.error('Error deleting grade:', err);
    }
  };

  // Group grades by calendar year
  const gradesByYear = grades.reduce((acc, grade) => {
    const yearKey = grade.calendar_year.toString();
    if (!acc[yearKey]) {
      acc[yearKey] = [];
    }
    acc[yearKey].push(grade);
    return acc;
  }, {} as Record<string, GradeEntry[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Student Grades</h2>
            <p className="text-sm text-gray-500">{student.first_name} {student.last_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddGrade(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Grade
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : grades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <GraduationCap className="w-12 h-12 mb-4 text-gray-300" />
              <p>No grades found for this student</p>
              <button
                onClick={() => setShowAddGrade(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add first grade
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(gradesByYear)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, yearGrades]) => (
                  <div key={year} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Year Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">{year}</h3>
                    </div>

                    {/* Grades Table */}
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
                                  <input
                                    type="text"
                                    value={grade.sem1_grade ?? ''}
                                    onChange={(e) => handleUpdateGrade(grade.sem1_grade_id!, e.target.value)}
                                    className="w-14 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                                    placeholder="-"
                                    disabled={!grade.sem1_grade_id}
                                  />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <input
                                    type="text"
                                    value={grade.sem2_grade ?? ''}
                                    onChange={(e) => handleUpdateGrade(grade.sem2_grade_id!, e.target.value)}
                                    className="w-14 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                                    placeholder="-"
                                    disabled={!grade.sem2_grade_id}
                                  />
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <div className="flex justify-center gap-1">
                                    <button
                                      onClick={() => handleEditCourse(grade)}
                                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                                      title="Edit Course"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (grade.sem1_grade_id) handleDeleteGrade(grade.sem1_grade_id);
                                        if (grade.sem2_grade_id) handleDeleteGrade(grade.sem2_grade_id);
                                      }}
                                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"
                                      title="Delete Grade"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
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

        {/* Add Grade Modal */}
        {showAddGrade && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Grade</h3>
              
              <div className="space-y-4">
                {/* Course Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    value={newGrade.course_id}
                    onChange={(e) => setNewGrade({ ...newGrade, course_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name} ({course.course_level})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Calendar Year */}
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

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <select
                    value={newGrade.semester}
                    onChange={(e) => setNewGrade({ ...newGrade, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SEM1">Semester 1</option>
                    <option value="SEM2">Semester 2</option>
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <input
                    type="text"
                    value={newGrade.grade}
                    onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })}
                    placeholder="Enter grade (e.g., 6, P)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddGrade(false)}
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
      </div>
    </div>
  );
}


// Main Students Page Content

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
  const [gradesStudent, setGradesStudent] = useState<StudentAPIResponse | null>(null);
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
      console.error('Error fetching students:', err);
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
      // Prepare payload - convert empty strings to null for optional fields
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
        console.log('✅ Student updated');
      } else {
        await createStudent(payload);
        console.log('✅ Student created');
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
      console.error('Error deleting student:', err);
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
                            onViewGrades={() => setGradesStudent(student)}
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

      {gradesStudent && (
        <StudentGradesModal
          student={gradesStudent}
          onClose={() => setGradesStudent(null)}
        />
      )}
    </div>
  );
}


// Export with Protected Route

export default function StudentsPage() {
  return (
    <ProtectedRoute>
      <StudentsContent />
    </ProtectedRoute>
  );
}