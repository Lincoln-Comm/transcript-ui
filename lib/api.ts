const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

import { TranscriptAPIResponse, StudentAPI } from '@/types';
import { getAuthToken } from './auth';

// Re-export types for convenience
export type { TranscriptAPIResponse } from '@/types';

// Alias StudentAPI as StudentAPIResponse for backward compatibility
export type StudentAPIResponse = StudentAPI;

// Generic fetch wrapper with error handling and auth token
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add auth token if available
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    
    // Handle token expiration - redirect to login
    if (response.status === 401 && (error.error === 'Token expired' || error.error === 'Invalid token')) {
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_permissions');
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API Functions

/**
 * Fetch all students
 */
export async function getStudents(): Promise<StudentAPIResponse[]> {
  return fetchAPI<StudentAPIResponse[]>('/students');
}

/**
 * Fetch all students (lightweight list for selectors/dropdowns)
 * This returns all students with fields needed for transcript generation
 */
export async function getStudentsList(): Promise<StudentAPIResponse[]> {
  return fetchAPI<StudentAPIResponse[]>('/students/list');
}

/**
 * Search students by name or year group
 */
export async function searchStudents(params: {
  first_name?: string;
  last_name?: string;
  year_group?: string;
}): Promise<StudentAPIResponse[]> {
  const searchParams = new URLSearchParams();
  if (params.first_name) searchParams.append('first_name', params.first_name);
  if (params.last_name) searchParams.append('last_name', params.last_name);
  if (params.year_group) searchParams.append('year_group', params.year_group);
  
  const query = searchParams.toString();
  return fetchAPI<StudentAPIResponse[]>(`/students/search${query ? `?${query}` : ''}`);
}

/**
 * Fetch transcript for a specific student
 */
export async function getTranscript(studentId: string): Promise<TranscriptAPIResponse> {
  return fetchAPI<TranscriptAPIResponse>(`/transcript/${studentId}`);
}

// =====================================================
// Paginated Students API
// =====================================================

export interface PaginatedStudentsResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  students: StudentAPIResponse[];
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  year_group?: string;
  gender?: string;
  status?: string;
}

/**
 * Fetch paginated students with optional filters
 */
export async function getStudentsPaginated(filters: StudentFilters = {}): Promise<PaginatedStudentsResponse> {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.year_group) params.append('year_group', filters.year_group);
  if (filters.gender) params.append('gender', filters.gender);
  if (filters.status) params.append('status', filters.status);
  
  const query = params.toString();
  return fetchAPI<PaginatedStudentsResponse>(`/students${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single student by ID
 */
export async function getStudentById(studentId: string): Promise<StudentAPIResponse> {
  return fetchAPI<StudentAPIResponse>(`/students/${studentId}`);
}

/**
 * Create a new student
 */
export async function createStudent(student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
  return fetchAPI<StudentAPIResponse>('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  });
}

/**
 * Update a student
 */
export async function updateStudent(studentId: string, student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
  return fetchAPI<StudentAPIResponse>(`/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  });
}

/**
 * Delete a student
 */
export async function deleteStudent(studentId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/students/${studentId}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch distinct year groups for filter dropdown
 */
export async function getYearGroups(): Promise<string[]> {
  return fetchAPI<string[]>('/students/year-groups');
}

// =====================================================
// Courses API
// =====================================================

export interface CourseAPIResponse {
  id: string;
  course_name: string;
  course_description: string | null;
  course_level: string;
  course_number: number;
  course_alias: string | null;
  num_credits: number;
}

export interface PaginatedCoursesResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  courses: CourseAPIResponse[];
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  course_level?: string;
}

/**
 * Fetch paginated courses with optional filters
 */
export async function getCoursesPaginated(filters: CourseFilters = {}): Promise<PaginatedCoursesResponse> {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.course_level) params.append('course_level', filters.course_level);
  
  const query = params.toString();
  return fetchAPI<PaginatedCoursesResponse>(`/courses${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single course by ID
 */
export async function getCourseById(courseId: string): Promise<CourseAPIResponse> {
  return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`);
}

/**
 * Create a new course
 */
export async function createCourse(course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
  return fetchAPI<CourseAPIResponse>('/courses', {
    method: 'POST',
    body: JSON.stringify(course),
  });
}

/**
 * Update a course
 */
export async function updateCourse(courseId: string, course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
  return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  });
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/courses/${courseId}`, {
    method: 'DELETE',
  });
}

/**
 * Fetch distinct course levels for filter dropdown
 */
export async function getCourseLevels(): Promise<string[]> {
  return fetchAPI<string[]>('/courses/levels');
}

// =====================================================
// Dashboard API
// =====================================================

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalTranscripts: number;
  yearGroupRange: {
    start: string | null;
    end: string | null;
  };
}

export interface YearGroupCount {
  year_group: string;
  count: number;
}

export interface ProgramCount {
  program: string;
  count: number;
}

export interface GenderCount {
  gender: string;
  count: number;
}

export interface CourseLevelCount {
  level: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

/**
 * Fetch dashboard summary stats
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>('/dashboard/stats');
}

/**
 * Fetch students grouped by year
 */
export async function getStudentsByYear(): Promise<YearGroupCount[]> {
  return fetchAPI<YearGroupCount[]>('/dashboard/students-by-year');
}

/**
 * Fetch students grouped by program (DP vs MYP)
 */
export async function getStudentsByProgram(): Promise<ProgramCount[]> {
  return fetchAPI<ProgramCount[]>('/dashboard/students-by-program');
}

/**
 * Fetch students grouped by gender
 */
export async function getStudentsByGender(): Promise<GenderCount[]> {
  return fetchAPI<GenderCount[]>('/dashboard/students-by-gender');
}

/**
 * Fetch courses grouped by level
 */
export async function getCoursesByLevel(): Promise<CourseLevelCount[]> {
  return fetchAPI<CourseLevelCount[]>('/dashboard/courses-by-level');
}

/**
 * Fetch students grouped by status
 */
export async function getStudentsByStatus(): Promise<StatusCount[]> {
  return fetchAPI<StatusCount[]>('/dashboard/students-by-status');
}

/**
 * Fetch top year groups by student count
 */
export async function getTopYearGroups(limit: number = 10): Promise<YearGroupCount[]> {
  return fetchAPI<YearGroupCount[]>(`/dashboard/top-year-groups?limit=${limit}`);
}

// =====================================================
// Grades API
// =====================================================

export interface GradeAPI {
  id: string;
  student_id: string;
  course_id: string;
  calendar_year: number;
  semester: string;
  grade: string;
  course?: {
    id: string;
    course_name: string;
    course_description: string | null;
    course_level: string;
  };
}

export interface StudentGradesResponse {
  student: StudentAPIResponse;
  grades: GradeAPI[];
}

/**
 * Fetch grades for a specific student
 */
export async function getStudentGrades(studentId: string): Promise<StudentGradesResponse> {
  return fetchAPI<StudentGradesResponse>(`/grades/student/${studentId}`);
}

/**
 * Add a new grade
 */
export async function createGrade(grade: {
  student_id: string;
  course_id: string;
  calendar_year: number;
  semester: string;
  grade: string;
}): Promise<GradeAPI> {
  return fetchAPI<GradeAPI>('/grades', {
    method: 'POST',
    body: JSON.stringify(grade),
  });
}

/**
 * Update a grade
 */
export async function updateGrade(gradeId: string, grade: {
  grade: string;
}): Promise<GradeAPI> {
  return fetchAPI<GradeAPI>(`/grades/${gradeId}`, {
    method: 'PUT',
    body: JSON.stringify(grade),
  });
}

/**
 * Delete a grade
 */
export async function deleteGrade(gradeId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/grades/${gradeId}`, {
    method: 'DELETE',
  });
}

// =====================================================
// Users API
// =====================================================

export type UserRole = 'admin' | 'staff';
export type UserStatus = 'active' | 'inactive';

export interface UserAPI {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  must_change_password: boolean;
  status: UserStatus;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface Permissions {
  users: string[];
  students: string[];
  courses: string[];
  grades: string[];
  transcripts: string[];
}

export interface LoginResponse {
  token: string;
  user: UserAPI;
  permissions: Permissions;
  must_change_password: boolean;
}

export interface PaginatedUsersResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  users: UserAPI[];
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  return fetchAPI<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string; token: string; user: UserAPI }> {
  return fetchAPI<{ message: string; token: string; user: UserAPI }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ user: UserAPI; permissions: Permissions }> {
  return fetchAPI<{ user: UserAPI; permissions: Permissions }>('/auth/me');
}

/**
 * Get all users (admin only)
 */
export async function getUsersPaginated(filters: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
} = {}): Promise<PaginatedUsersResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  return fetchAPI<PaginatedUsersResponse>(`/users${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get user by ID (admin only)
 */
export async function getUserById(userId: string): Promise<UserAPI> {
  return fetchAPI<UserAPI>(`/users/${userId}`);
}

/**
 * Create user (admin only)
 * Password is auto-generated and emailed to user
 */
export async function createUser(user: {
  email: string;
  name: string;
  role: UserRole;
}): Promise<UserAPI & { message: string }> {
  return fetchAPI<UserAPI & { message: string }>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

/**
 * Update user (admin only)
 */
export async function updateUser(userId: string, user: {
  email?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}): Promise<UserAPI> {
  return fetchAPI<UserAPI>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

/**
 * Reset user password (admin only)
 * Password is auto-generated and emailed to user
 */
export async function resetUserPassword(userId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/users/${userId}/reset-password`, {
    method: 'POST',
  });
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/users/${userId}`, {
    method: 'DELETE',
  });
}

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// import { TranscriptAPIResponse, StudentAPI } from '@/types';
// import { getAuthToken } from './auth';

// // Re-export types for convenience
// export type { TranscriptAPIResponse } from '@/types';

// // Alias StudentAPI as StudentAPIResponse for backward compatibility
// export type StudentAPIResponse = StudentAPI;

// // Generic fetch wrapper with error handling and auth token
// async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
//   const url = `${API_BASE_URL}${endpoint}`;
//   const token = getAuthToken();
  
//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//     ...options?.headers,
//   };

//   // Add auth token if available
//   if (token) {
//     (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
//   }
  
//   const response = await fetch(url, {
//     headers,
//     ...options,
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    
//     // Handle token expiration - redirect to login
//     if (response.status === 401 && (error.error === 'Token expired' || error.error === 'Invalid token')) {
//       // Clear auth data
//       if (typeof window !== 'undefined') {
//         localStorage.removeItem('auth_token');
//         localStorage.removeItem('auth_user');
//         localStorage.removeItem('auth_permissions');
//         // Redirect to login
//         window.location.href = '/login';
//       }
//     }
    
//     throw new Error(error.error || `HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// }

// // API Functions

// /**
//  * Fetch all students
//  */
// export async function getStudents(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students');
// }

// /**
//  * Fetch all students (lightweight list for selectors/dropdowns)
//  * This returns all students with fields needed for transcript generation
//  */
// export async function getStudentsList(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students/list');
// }

// /**
//  * Search students by name or year group
//  */
// export async function searchStudents(params: {
//   first_name?: string;
//   last_name?: string;
//   year_group?: string;
// }): Promise<StudentAPIResponse[]> {
//   const searchParams = new URLSearchParams();
//   if (params.first_name) searchParams.append('first_name', params.first_name);
//   if (params.last_name) searchParams.append('last_name', params.last_name);
//   if (params.year_group) searchParams.append('year_group', params.year_group);
  
//   const query = searchParams.toString();
//   return fetchAPI<StudentAPIResponse[]>(`/students/search${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch transcript for a specific student
//  */
// export async function getTranscript(studentId: string): Promise<TranscriptAPIResponse> {
//   return fetchAPI<TranscriptAPIResponse>(`/transcript/${studentId}`);
// }

// // =====================================================
// // Paginated Students API
// // =====================================================

// export interface PaginatedStudentsResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   students: StudentAPIResponse[];
// }

// export interface StudentFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   year_group?: string;
//   gender?: string;
//   status?: string;
// }

// /**
//  * Fetch paginated students with optional filters
//  */
// export async function getStudentsPaginated(filters: StudentFilters = {}): Promise<PaginatedStudentsResponse> {
//   const params = new URLSearchParams();
  
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.year_group) params.append('year_group', filters.year_group);
//   if (filters.gender) params.append('gender', filters.gender);
//   if (filters.status) params.append('status', filters.status);
  
//   const query = params.toString();
//   return fetchAPI<PaginatedStudentsResponse>(`/students${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch a single student by ID
//  */
// export async function getStudentById(studentId: string): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>(`/students/${studentId}`);
// }

// /**
//  * Create a new student
//  */
// export async function createStudent(student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>('/students', {
//     method: 'POST',
//     body: JSON.stringify(student),
//   });
// }

// /**
//  * Update a student
//  */
// export async function updateStudent(studentId: string, student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>(`/students/${studentId}`, {
//     method: 'PUT',
//     body: JSON.stringify(student),
//   });
// }

// /**
//  * Delete a student
//  */
// export async function deleteStudent(studentId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/students/${studentId}`, {
//     method: 'DELETE',
//   });
// }

// /**
//  * Fetch distinct year groups for filter dropdown
//  */
// export async function getYearGroups(): Promise<string[]> {
//   return fetchAPI<string[]>('/students/year-groups');
// }

// // =====================================================
// // Courses API
// // =====================================================

// export interface CourseAPIResponse {
//   id: string;
//   course_name: string;
//   course_description: string | null;
//   course_level: string;
//   course_number: number;
//   course_alias: string | null;
//   num_credits: number;
// }

// export interface PaginatedCoursesResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   courses: CourseAPIResponse[];
// }

// export interface CourseFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   course_level?: string;
// }

// /**
//  * Fetch paginated courses with optional filters
//  */
// export async function getCoursesPaginated(filters: CourseFilters = {}): Promise<PaginatedCoursesResponse> {
//   const params = new URLSearchParams();
  
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.course_level) params.append('course_level', filters.course_level);
  
//   const query = params.toString();
//   return fetchAPI<PaginatedCoursesResponse>(`/courses${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch a single course by ID
//  */
// export async function getCourseById(courseId: string): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`);
// }

// /**
//  * Create a new course
//  */
// export async function createCourse(course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>('/courses', {
//     method: 'POST',
//     body: JSON.stringify(course),
//   });
// }

// /**
//  * Update a course
//  */
// export async function updateCourse(courseId: string, course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`, {
//     method: 'PUT',
//     body: JSON.stringify(course),
//   });
// }

// /**
//  * Delete a course
//  */
// export async function deleteCourse(courseId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/courses/${courseId}`, {
//     method: 'DELETE',
//   });
// }

// /**
//  * Fetch distinct course levels for filter dropdown
//  */
// export async function getCourseLevels(): Promise<string[]> {
//   return fetchAPI<string[]>('/courses/levels');
// }

// // =====================================================
// // Dashboard API
// // =====================================================

// export interface DashboardStats {
//   totalStudents: number;
//   totalCourses: number;
//   totalTranscripts: number;
//   yearGroupRange: {
//     start: string | null;
//     end: string | null;
//   };
// }

// export interface YearGroupCount {
//   year_group: string;
//   count: number;
// }

// export interface ProgramCount {
//   program: string;
//   count: number;
// }

// export interface GenderCount {
//   gender: string;
//   count: number;
// }

// export interface CourseLevelCount {
//   level: string;
//   count: number;
// }

// export interface StatusCount {
//   status: string;
//   count: number;
// }

// /**
//  * Fetch dashboard summary stats
//  */
// export async function getDashboardStats(): Promise<DashboardStats> {
//   return fetchAPI<DashboardStats>('/dashboard/stats');
// }

// /**
//  * Fetch students grouped by year
//  */
// export async function getStudentsByYear(): Promise<YearGroupCount[]> {
//   return fetchAPI<YearGroupCount[]>('/dashboard/students-by-year');
// }

// /**
//  * Fetch students grouped by program (DP vs MYP)
//  */
// export async function getStudentsByProgram(): Promise<ProgramCount[]> {
//   return fetchAPI<ProgramCount[]>('/dashboard/students-by-program');
// }

// /**
//  * Fetch students grouped by gender
//  */
// export async function getStudentsByGender(): Promise<GenderCount[]> {
//   return fetchAPI<GenderCount[]>('/dashboard/students-by-gender');
// }

// /**
//  * Fetch courses grouped by level
//  */
// export async function getCoursesByLevel(): Promise<CourseLevelCount[]> {
//   return fetchAPI<CourseLevelCount[]>('/dashboard/courses-by-level');
// }

// /**
//  * Fetch students grouped by status
//  */
// export async function getStudentsByStatus(): Promise<StatusCount[]> {
//   return fetchAPI<StatusCount[]>('/dashboard/students-by-status');
// }

// /**
//  * Fetch top year groups by student count
//  */
// export async function getTopYearGroups(limit: number = 10): Promise<YearGroupCount[]> {
//   return fetchAPI<YearGroupCount[]>(`/dashboard/top-year-groups?limit=${limit}`);
// }

// // =====================================================
// // Grades API
// // =====================================================

// export interface GradeAPI {
//   id: string;
//   student_id: string;
//   course_id: string;
//   calendar_year: number;
//   semester: string;
//   grade: string;
//   course?: {
//     id: string;
//     course_name: string;
//     course_description: string | null;
//     course_level: string;
//   };
// }

// export interface StudentGradesResponse {
//   student: StudentAPIResponse;
//   grades: GradeAPI[];
// }

// /**
//  * Fetch grades for a specific student
//  */
// export async function getStudentGrades(studentId: string): Promise<StudentGradesResponse> {
//   return fetchAPI<StudentGradesResponse>(`/grades/student/${studentId}`);
// }

// /**
//  * Add a new grade
//  */
// export async function createGrade(grade: {
//   student_id: string;
//   course_id: string;
//   calendar_year: number;
//   semester: string;
//   grade: string;
// }): Promise<GradeAPI> {
//   return fetchAPI<GradeAPI>('/grades', {
//     method: 'POST',
//     body: JSON.stringify(grade),
//   });
// }

// /**
//  * Update a grade
//  */
// export async function updateGrade(gradeId: string, grade: {
//   grade: string;
// }): Promise<GradeAPI> {
//   return fetchAPI<GradeAPI>(`/grades/${gradeId}`, {
//     method: 'PUT',
//     body: JSON.stringify(grade),
//   });
// }

// /**
//  * Delete a grade
//  */
// export async function deleteGrade(gradeId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/grades/${gradeId}`, {
//     method: 'DELETE',
//   });
// }

// // =====================================================
// // Users API
// // =====================================================

// export type UserRole = 'admin' | 'staff';
// export type UserStatus = 'active' | 'inactive';

// export interface UserAPI {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
//   must_change_password: boolean;
//   status: UserStatus;
//   last_login: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface Permissions {
//   users: string[];
//   students: string[];
//   courses: string[];
//   grades: string[];
//   transcripts: string[];
// }

// export interface LoginResponse {
//   token: string;
//   user: UserAPI;
//   permissions: Permissions;
//   must_change_password: boolean;
// }

// export interface PaginatedUsersResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   users: UserAPI[];
// }

// /**
//  * Login user
//  */
// export async function loginUser(email: string, password: string): Promise<LoginResponse> {
//   return fetchAPI<LoginResponse>('/auth/login', {
//     method: 'POST',
//     body: JSON.stringify({ email, password }),
//   });
// }

// /**
//  * Change password
//  */
// export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string; token: string; user: UserAPI }> {
//   return fetchAPI<{ message: string; token: string; user: UserAPI }>('/auth/change-password', {
//     method: 'POST',
//     body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
//   });
// }

// /**
//  * Get current user
//  */
// export async function getCurrentUser(): Promise<{ user: UserAPI; permissions: Permissions }> {
//   return fetchAPI<{ user: UserAPI; permissions: Permissions }>('/auth/me');
// }

// /**
//  * Get all users (admin only)
//  */
// export async function getUsersPaginated(filters: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   role?: UserRole;
//   status?: UserStatus;
// } = {}): Promise<PaginatedUsersResponse> {
//   const params = new URLSearchParams();
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.role) params.append('role', filters.role);
//   if (filters.status) params.append('status', filters.status);
  
//   const queryString = params.toString();
//   return fetchAPI<PaginatedUsersResponse>(`/users${queryString ? `?${queryString}` : ''}`);
// }

// /**
//  * Get user by ID (admin only)
//  */
// export async function getUserById(userId: string): Promise<UserAPI> {
//   return fetchAPI<UserAPI>(`/users/${userId}`);
// }

// /**
//  * Create user (admin only)
//  * Password is auto-generated and emailed to user
//  */
// export async function createUser(user: {
//   email: string;
//   name: string;
//   role: UserRole;
// }): Promise<UserAPI & { message: string }> {
//   return fetchAPI<UserAPI & { message: string }>('/users', {
//     method: 'POST',
//     body: JSON.stringify(user),
//   });
// }

// /**
//  * Update user (admin only)
//  */
// export async function updateUser(userId: string, user: {
//   email?: string;
//   name?: string;
//   role?: UserRole;
//   status?: UserStatus;
// }): Promise<UserAPI> {
//   return fetchAPI<UserAPI>(`/users/${userId}`, {
//     method: 'PUT',
//     body: JSON.stringify(user),
//   });
// }

// /**
//  * Reset user password (admin only)
//  * Password is auto-generated and emailed to user
//  */
// export async function resetUserPassword(userId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/users/${userId}/reset-password`, {
//     method: 'POST',
//   });
// }

// /**
//  * Delete user (admin only)
//  */
// export async function deleteUser(userId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/users/${userId}`, {
//     method: 'DELETE',
//   });
// }

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// import { TranscriptAPIResponse, StudentAPI } from '@/types';
// import { getAuthToken } from './auth';

// // Re-export types for convenience
// export type { TranscriptAPIResponse } from '@/types';

// // Alias StudentAPI as StudentAPIResponse for backward compatibility
// export type StudentAPIResponse = StudentAPI;

// // Generic fetch wrapper with error handling and auth token
// async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
//   const url = `${API_BASE_URL}${endpoint}`;
//   const token = getAuthToken();
  
//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//     ...options?.headers,
//   };

//   // Add auth token if available
//   if (token) {
//     (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
//   }
  
//   const response = await fetch(url, {
//     headers,
//     ...options,
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ error: 'An error occurred' }));
//     throw new Error(error.error || `HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// }

// // API Functions

// /**
//  * Fetch all students
//  */
// export async function getStudents(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students');
// }

// /**
//  * Fetch all students (lightweight list for selectors/dropdowns)
//  * This returns all students with fields needed for transcript generation
//  */
// export async function getStudentsList(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students/list');
// }

// /**
//  * Search students by name or year group
//  */
// export async function searchStudents(params: {
//   first_name?: string;
//   last_name?: string;
//   year_group?: string;
// }): Promise<StudentAPIResponse[]> {
//   const searchParams = new URLSearchParams();
//   if (params.first_name) searchParams.append('first_name', params.first_name);
//   if (params.last_name) searchParams.append('last_name', params.last_name);
//   if (params.year_group) searchParams.append('year_group', params.year_group);
  
//   const query = searchParams.toString();
//   return fetchAPI<StudentAPIResponse[]>(`/students/search${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch transcript for a specific student
//  */
// export async function getTranscript(studentId: string): Promise<TranscriptAPIResponse> {
//   return fetchAPI<TranscriptAPIResponse>(`/transcript/${studentId}`);
// }

// // =====================================================
// // Paginated Students API
// // =====================================================

// export interface PaginatedStudentsResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   students: StudentAPIResponse[];
// }

// export interface StudentFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   year_group?: string;
//   gender?: string;
//   status?: string;
// }

// /**
//  * Fetch paginated students with optional filters
//  */
// export async function getStudentsPaginated(filters: StudentFilters = {}): Promise<PaginatedStudentsResponse> {
//   const params = new URLSearchParams();
  
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.year_group) params.append('year_group', filters.year_group);
//   if (filters.gender) params.append('gender', filters.gender);
//   if (filters.status) params.append('status', filters.status);
  
//   const query = params.toString();
//   return fetchAPI<PaginatedStudentsResponse>(`/students${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch a single student by ID
//  */
// export async function getStudentById(studentId: string): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>(`/students/${studentId}`);
// }

// /**
//  * Create a new student
//  */
// export async function createStudent(student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>('/students', {
//     method: 'POST',
//     body: JSON.stringify(student),
//   });
// }

// /**
//  * Update a student
//  */
// export async function updateStudent(studentId: string, student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>(`/students/${studentId}`, {
//     method: 'PUT',
//     body: JSON.stringify(student),
//   });
// }

// /**
//  * Delete a student
//  */
// export async function deleteStudent(studentId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/students/${studentId}`, {
//     method: 'DELETE',
//   });
// }

// /**
//  * Fetch distinct year groups for filter dropdown
//  */
// export async function getYearGroups(): Promise<string[]> {
//   return fetchAPI<string[]>('/students/year-groups');
// }

// // =====================================================
// // Courses API
// // =====================================================

// export interface CourseAPIResponse {
//   id: string;
//   course_name: string;
//   course_description: string | null;
//   course_level: string;
//   course_number: number;
//   course_alias: string | null;
//   num_credits: number;
// }

// export interface PaginatedCoursesResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   courses: CourseAPIResponse[];
// }

// export interface CourseFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   course_level?: string;
// }

// /**
//  * Fetch paginated courses with optional filters
//  */
// export async function getCoursesPaginated(filters: CourseFilters = {}): Promise<PaginatedCoursesResponse> {
//   const params = new URLSearchParams();
  
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.course_level) params.append('course_level', filters.course_level);
  
//   const query = params.toString();
//   return fetchAPI<PaginatedCoursesResponse>(`/courses${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch a single course by ID
//  */
// export async function getCourseById(courseId: string): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`);
// }

// /**
//  * Create a new course
//  */
// export async function createCourse(course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>('/courses', {
//     method: 'POST',
//     body: JSON.stringify(course),
//   });
// }

// /**
//  * Update a course
//  */
// export async function updateCourse(courseId: string, course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`, {
//     method: 'PUT',
//     body: JSON.stringify(course),
//   });
// }

// /**
//  * Delete a course
//  */
// export async function deleteCourse(courseId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/courses/${courseId}`, {
//     method: 'DELETE',
//   });
// }

// /**
//  * Fetch distinct course levels for filter dropdown
//  */
// export async function getCourseLevels(): Promise<string[]> {
//   return fetchAPI<string[]>('/courses/levels');
// }

// // =====================================================
// // Dashboard API
// // =====================================================

// export interface DashboardStats {
//   totalStudents: number;
//   totalCourses: number;
//   totalTranscripts: number;
//   yearGroupRange: {
//     start: string | null;
//     end: string | null;
//   };
// }

// export interface YearGroupCount {
//   year_group: string;
//   count: number;
// }

// export interface ProgramCount {
//   program: string;
//   count: number;
// }

// export interface GenderCount {
//   gender: string;
//   count: number;
// }

// export interface CourseLevelCount {
//   level: string;
//   count: number;
// }

// export interface StatusCount {
//   status: string;
//   count: number;
// }

// /**
//  * Fetch dashboard summary stats
//  */
// export async function getDashboardStats(): Promise<DashboardStats> {
//   return fetchAPI<DashboardStats>('/dashboard/stats');
// }

// /**
//  * Fetch students grouped by year
//  */
// export async function getStudentsByYear(): Promise<YearGroupCount[]> {
//   return fetchAPI<YearGroupCount[]>('/dashboard/students-by-year');
// }

// /**
//  * Fetch students grouped by program (DP vs MYP)
//  */
// export async function getStudentsByProgram(): Promise<ProgramCount[]> {
//   return fetchAPI<ProgramCount[]>('/dashboard/students-by-program');
// }

// /**
//  * Fetch students grouped by gender
//  */
// export async function getStudentsByGender(): Promise<GenderCount[]> {
//   return fetchAPI<GenderCount[]>('/dashboard/students-by-gender');
// }

// /**
//  * Fetch courses grouped by level
//  */
// export async function getCoursesByLevel(): Promise<CourseLevelCount[]> {
//   return fetchAPI<CourseLevelCount[]>('/dashboard/courses-by-level');
// }

// /**
//  * Fetch students grouped by status
//  */
// export async function getStudentsByStatus(): Promise<StatusCount[]> {
//   return fetchAPI<StatusCount[]>('/dashboard/students-by-status');
// }

// /**
//  * Fetch top year groups by student count
//  */
// export async function getTopYearGroups(limit: number = 10): Promise<YearGroupCount[]> {
//   return fetchAPI<YearGroupCount[]>(`/dashboard/top-year-groups?limit=${limit}`);
// }

// // =====================================================
// // Grades API
// // =====================================================

// export interface GradeAPI {
//   id: string;
//   student_id: string;
//   course_id: string;
//   calendar_year: number;
//   semester: string;
//   grade: string;
//   course?: {
//     id: string;
//     course_name: string;
//     course_description: string | null;
//     course_level: string;
//   };
// }

// export interface StudentGradesResponse {
//   student: StudentAPIResponse;
//   grades: GradeAPI[];
// }

// /**
//  * Fetch grades for a specific student
//  */
// export async function getStudentGrades(studentId: string): Promise<StudentGradesResponse> {
//   return fetchAPI<StudentGradesResponse>(`/grades/student/${studentId}`);
// }

// /**
//  * Add a new grade
//  */
// export async function createGrade(grade: {
//   student_id: string;
//   course_id: string;
//   calendar_year: number;
//   semester: string;
//   grade: string;
// }): Promise<GradeAPI> {
//   return fetchAPI<GradeAPI>('/grades', {
//     method: 'POST',
//     body: JSON.stringify(grade),
//   });
// }

// /**
//  * Update a grade
//  */
// export async function updateGrade(gradeId: string, grade: {
//   grade: string;
// }): Promise<GradeAPI> {
//   return fetchAPI<GradeAPI>(`/grades/${gradeId}`, {
//     method: 'PUT',
//     body: JSON.stringify(grade),
//   });
// }

// /**
//  * Delete a grade
//  */
// export async function deleteGrade(gradeId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/grades/${gradeId}`, {
//     method: 'DELETE',
//   });
// }

// // =====================================================
// // Users API
// // =====================================================

// export type UserRole = 'admin' | 'staff';
// export type UserStatus = 'active' | 'inactive';

// export interface UserAPI {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
//   must_change_password: boolean;
//   status: UserStatus;
//   last_login: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface Permissions {
//   users: string[];
//   students: string[];
//   courses: string[];
//   grades: string[];
//   transcripts: string[];
// }

// export interface LoginResponse {
//   token: string;
//   user: UserAPI;
//   permissions: Permissions;
//   must_change_password: boolean;
// }

// export interface PaginatedUsersResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   users: UserAPI[];
// }

// /**
//  * Login user
//  */
// export async function loginUser(email: string, password: string): Promise<LoginResponse> {
//   return fetchAPI<LoginResponse>('/auth/login', {
//     method: 'POST',
//     body: JSON.stringify({ email, password }),
//   });
// }

// /**
//  * Change password
//  */
// export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string; token: string; user: UserAPI }> {
//   return fetchAPI<{ message: string; token: string; user: UserAPI }>('/auth/change-password', {
//     method: 'POST',
//     body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
//   });
// }

// /**
//  * Get current user
//  */
// export async function getCurrentUser(): Promise<{ user: UserAPI; permissions: Permissions }> {
//   return fetchAPI<{ user: UserAPI; permissions: Permissions }>('/auth/me');
// }

// /**
//  * Get all users (admin only)
//  */
// export async function getUsersPaginated(filters: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   role?: UserRole;
//   status?: UserStatus;
// } = {}): Promise<PaginatedUsersResponse> {
//   const params = new URLSearchParams();
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.role) params.append('role', filters.role);
//   if (filters.status) params.append('status', filters.status);
  
//   const queryString = params.toString();
//   return fetchAPI<PaginatedUsersResponse>(`/users${queryString ? `?${queryString}` : ''}`);
// }

// /**
//  * Get user by ID (admin only)
//  */
// export async function getUserById(userId: string): Promise<UserAPI> {
//   return fetchAPI<UserAPI>(`/users/${userId}`);
// }

// /**
//  * Create user (admin only)
//  * Password is auto-generated and emailed to user
//  */
// export async function createUser(user: {
//   email: string;
//   name: string;
//   role: UserRole;
// }): Promise<UserAPI & { message: string }> {
//   return fetchAPI<UserAPI & { message: string }>('/users', {
//     method: 'POST',
//     body: JSON.stringify(user),
//   });
// }

// /**
//  * Update user (admin only)
//  */
// export async function updateUser(userId: string, user: {
//   email?: string;
//   name?: string;
//   role?: UserRole;
//   status?: UserStatus;
// }): Promise<UserAPI> {
//   return fetchAPI<UserAPI>(`/users/${userId}`, {
//     method: 'PUT',
//     body: JSON.stringify(user),
//   });
// }

// /**
//  * Reset user password (admin only)
//  * Password is auto-generated and emailed to user
//  */
// export async function resetUserPassword(userId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/users/${userId}/reset-password`, {
//     method: 'POST',
//   });
// }

// /**
//  * Delete user (admin only)
//  */
// export async function deleteUser(userId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/users/${userId}`, {
//     method: 'DELETE',
//   });
// }


// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// import { TranscriptAPIResponse, StudentAPI } from '@/types';

// // Re-export types for convenience
// export type { TranscriptAPIResponse } from '@/types';

// // Alias StudentAPI as StudentAPIResponse for backward compatibility
// export type StudentAPIResponse = StudentAPI;

// // Generic fetch wrapper with error handling
// async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
//   const url = `${API_BASE_URL}${endpoint}`;
  
//   const response = await fetch(url, {
//     headers: {
//       'Content-Type': 'application/json',
//       ...options?.headers,
//     },
//     ...options,
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ error: 'An error occurred' }));
//     throw new Error(error.error || `HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// }

// // API Functions

// /**
//  * Fetch all students
//  */
// export async function getStudents(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students');
// }

// /**
//  * Fetch all students (lightweight list for selectors/dropdowns)
//  * This returns all students with fields needed for transcript generation
//  */
// export async function getStudentsList(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students/list');
// }

// /**
//  * Search students by name or year group
//  */
// export async function searchStudents(params: {
//   first_name?: string;
//   last_name?: string;
//   year_group?: string;
// }): Promise<StudentAPIResponse[]> {
//   const searchParams = new URLSearchParams();
//   if (params.first_name) searchParams.append('first_name', params.first_name);
//   if (params.last_name) searchParams.append('last_name', params.last_name);
//   if (params.year_group) searchParams.append('year_group', params.year_group);
  
//   const query = searchParams.toString();
//   return fetchAPI<StudentAPIResponse[]>(`/students/search${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch transcript for a specific student
//  */
// export async function getTranscript(studentId: string): Promise<TranscriptAPIResponse> {
//   return fetchAPI<TranscriptAPIResponse>(`/transcript/${studentId}`);
// }

// // =====================================================
// // Paginated Students API
// // =====================================================

// export interface PaginatedStudentsResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   students: StudentAPIResponse[];
// }

// export interface StudentFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   year_group?: string;
//   gender?: string;
//   status?: string;
// }

// /**
//  * Fetch paginated students with optional filters
//  */
// export async function getStudentsPaginated(filters: StudentFilters = {}): Promise<PaginatedStudentsResponse> {
//   const params = new URLSearchParams();
  
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.year_group) params.append('year_group', filters.year_group);
//   if (filters.gender) params.append('gender', filters.gender);
//   if (filters.status) params.append('status', filters.status);
  
//   const query = params.toString();
//   return fetchAPI<PaginatedStudentsResponse>(`/students${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch a single student by ID
//  */
// export async function getStudentById(studentId: string): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>(`/students/${studentId}`);
// }

// /**
//  * Create a new student
//  */
// export async function createStudent(student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>('/students', {
//     method: 'POST',
//     body: JSON.stringify(student),
//   });
// }

// /**
//  * Update a student
//  */
// export async function updateStudent(studentId: string, student: Partial<StudentAPIResponse>): Promise<StudentAPIResponse> {
//   return fetchAPI<StudentAPIResponse>(`/students/${studentId}`, {
//     method: 'PUT',
//     body: JSON.stringify(student),
//   });
// }

// /**
//  * Delete a student
//  */
// export async function deleteStudent(studentId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/students/${studentId}`, {
//     method: 'DELETE',
//   });
// }

// /**
//  * Fetch distinct year groups for filter dropdown
//  */
// export async function getYearGroups(): Promise<string[]> {
//   return fetchAPI<string[]>('/students/year-groups');
// }

// // =====================================================
// // Courses API
// // =====================================================

// export interface CourseAPIResponse {
//   id: string;
//   course_name: string;
//   course_description: string | null;
//   course_level: string;
//   course_number: number;
//   course_alias: string | null;
//   num_credits: number;
// }

// export interface PaginatedCoursesResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   courses: CourseAPIResponse[];
// }

// export interface CourseFilters {
//   page?: number;
//   limit?: number;
//   search?: string;
//   course_level?: string;
// }

// /**
//  * Fetch paginated courses with optional filters
//  */
// export async function getCoursesPaginated(filters: CourseFilters = {}): Promise<PaginatedCoursesResponse> {
//   const params = new URLSearchParams();
  
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.course_level) params.append('course_level', filters.course_level);
  
//   const query = params.toString();
//   return fetchAPI<PaginatedCoursesResponse>(`/courses${query ? `?${query}` : ''}`);
// }

// /**
//  * Fetch a single course by ID
//  */
// export async function getCourseById(courseId: string): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`);
// }

// /**
//  * Create a new course
//  */
// export async function createCourse(course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>('/courses', {
//     method: 'POST',
//     body: JSON.stringify(course),
//   });
// }

// /**
//  * Update a course
//  */
// export async function updateCourse(courseId: string, course: Partial<CourseAPIResponse>): Promise<CourseAPIResponse> {
//   return fetchAPI<CourseAPIResponse>(`/courses/${courseId}`, {
//     method: 'PUT',
//     body: JSON.stringify(course),
//   });
// }

// /**
//  * Delete a course
//  */
// export async function deleteCourse(courseId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/courses/${courseId}`, {
//     method: 'DELETE',
//   });
// }

// /**
//  * Fetch distinct course levels for filter dropdown
//  */
// export async function getCourseLevels(): Promise<string[]> {
//   return fetchAPI<string[]>('/courses/levels');
// }

// // =====================================================
// // Dashboard API
// // =====================================================

// export interface DashboardStats {
//   totalStudents: number;
//   totalCourses: number;
//   totalTranscripts: number;
//   yearGroupRange: {
//     start: string | null;
//     end: string | null;
//   };
// }

// export interface YearGroupCount {
//   year_group: string;
//   count: number;
// }

// export interface ProgramCount {
//   program: string;
//   count: number;
// }

// export interface GenderCount {
//   gender: string;
//   count: number;
// }

// export interface CourseLevelCount {
//   level: string;
//   count: number;
// }

// export interface StatusCount {
//   status: string;
//   count: number;
// }

// /**
//  * Fetch dashboard summary stats
//  */
// export async function getDashboardStats(): Promise<DashboardStats> {
//   return fetchAPI<DashboardStats>('/dashboard/stats');
// }

// /**
//  * Fetch students grouped by year
//  */
// export async function getStudentsByYear(): Promise<YearGroupCount[]> {
//   return fetchAPI<YearGroupCount[]>('/dashboard/students-by-year');
// }

// /**
//  * Fetch students grouped by program (DP vs MYP)
//  */
// export async function getStudentsByProgram(): Promise<ProgramCount[]> {
//   return fetchAPI<ProgramCount[]>('/dashboard/students-by-program');
// }

// /**
//  * Fetch students grouped by gender
//  */
// export async function getStudentsByGender(): Promise<GenderCount[]> {
//   return fetchAPI<GenderCount[]>('/dashboard/students-by-gender');
// }

// /**
//  * Fetch courses grouped by level
//  */
// export async function getCoursesByLevel(): Promise<CourseLevelCount[]> {
//   return fetchAPI<CourseLevelCount[]>('/dashboard/courses-by-level');
// }

// /**
//  * Fetch students grouped by status
//  */
// export async function getStudentsByStatus(): Promise<StatusCount[]> {
//   return fetchAPI<StatusCount[]>('/dashboard/students-by-status');
// }

// /**
//  * Fetch top year groups by student count
//  */
// export async function getTopYearGroups(limit: number = 10): Promise<YearGroupCount[]> {
//   return fetchAPI<YearGroupCount[]>(`/dashboard/top-year-groups?limit=${limit}`);
// }

// // =====================================================
// // Grades API
// // =====================================================

// export interface GradeAPI {
//   id: string;
//   student_id: string;
//   course_id: string;
//   calendar_year: number;
//   semester: string;
//   grade: string;
//   course?: {
//     id: string;
//     course_name: string;
//     course_description: string | null;
//     course_level: string;
//   };
// }

// export interface StudentGradesResponse {
//   student: StudentAPIResponse;
//   grades: GradeAPI[];
// }

// /**
//  * Fetch grades for a specific student
//  */
// export async function getStudentGrades(studentId: string): Promise<StudentGradesResponse> {
//   return fetchAPI<StudentGradesResponse>(`/grades/student/${studentId}`);
// }

// /**
//  * Add a new grade
//  */
// export async function createGrade(grade: {
//   student_id: string;
//   course_id: string;
//   calendar_year: number;
//   semester: string;
//   grade: string;
// }): Promise<GradeAPI> {
//   return fetchAPI<GradeAPI>('/grades', {
//     method: 'POST',
//     body: JSON.stringify(grade),
//   });
// }

// /**
//  * Update a grade
//  */
// export async function updateGrade(gradeId: string, grade: {
//   grade: string;
// }): Promise<GradeAPI> {
//   return fetchAPI<GradeAPI>(`/grades/${gradeId}`, {
//     method: 'PUT',
//     body: JSON.stringify(grade),
//   });
// }

// /**
//  * Delete a grade
//  */
// export async function deleteGrade(gradeId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/grades/${gradeId}`, {
//     method: 'DELETE',
//   });
// }

// // =====================================================
// // Users API
// // =====================================================

// export type UserRole = 'admin' | 'staff';
// export type UserStatus = 'active' | 'inactive';

// export interface UserAPI {
//   id: string;
//   email: string;
//   name: string;
//   role: UserRole;
//   must_change_password: boolean;
//   status: UserStatus;
//   last_login: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface Permissions {
//   users: string[];
//   students: string[];
//   courses: string[];
//   grades: string[];
//   transcripts: string[];
// }

// export interface LoginResponse {
//   token: string;
//   user: UserAPI;
//   permissions: Permissions;
//   must_change_password: boolean;
// }

// export interface PaginatedUsersResponse {
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   users: UserAPI[];
// }

// /**
//  * Login user
//  */
// export async function loginUser(email: string, password: string): Promise<LoginResponse> {
//   return fetchAPI<LoginResponse>('/auth/login', {
//     method: 'POST',
//     body: JSON.stringify({ email, password }),
//   });
// }

// /**
//  * Change password
//  */
// export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string; token: string; user: UserAPI }> {
//   return fetchAPI<{ message: string; token: string; user: UserAPI }>('/auth/change-password', {
//     method: 'POST',
//     body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
//   });
// }

// /**
//  * Get current user
//  */
// export async function getCurrentUser(): Promise<{ user: UserAPI; permissions: Permissions }> {
//   return fetchAPI<{ user: UserAPI; permissions: Permissions }>('/auth/me');
// }

// /**
//  * Get all users (admin only)
//  */
// export async function getUsersPaginated(filters: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   role?: UserRole;
//   status?: UserStatus;
// } = {}): Promise<PaginatedUsersResponse> {
//   const params = new URLSearchParams();
//   if (filters.page) params.append('page', filters.page.toString());
//   if (filters.limit) params.append('limit', filters.limit.toString());
//   if (filters.search) params.append('search', filters.search);
//   if (filters.role) params.append('role', filters.role);
//   if (filters.status) params.append('status', filters.status);
  
//   const queryString = params.toString();
//   return fetchAPI<PaginatedUsersResponse>(`/users${queryString ? `?${queryString}` : ''}`);
// }

// /**
//  * Get user by ID (admin only)
//  */
// export async function getUserById(userId: string): Promise<UserAPI> {
//   return fetchAPI<UserAPI>(`/users/${userId}`);
// }

// /**
//  * Create user (admin only)
//  * Password is auto-generated and emailed to user
//  */
// export async function createUser(user: {
//   email: string;
//   name: string;
//   role: UserRole;
// }): Promise<UserAPI & { message: string }> {
//   return fetchAPI<UserAPI & { message: string }>('/users', {
//     method: 'POST',
//     body: JSON.stringify(user),
//   });
// }

// /**
//  * Update user (admin only)
//  */
// export async function updateUser(userId: string, user: {
//   email?: string;
//   name?: string;
//   role?: UserRole;
//   status?: UserStatus;
// }): Promise<UserAPI> {
//   return fetchAPI<UserAPI>(`/users/${userId}`, {
//     method: 'PUT',
//     body: JSON.stringify(user),
//   });
// }

// /**
//  * Reset user password (admin only)
//  * Password is auto-generated and emailed to user
//  */
// export async function resetUserPassword(userId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/users/${userId}/reset-password`, {
//     method: 'POST',
//   });
// }

// /**
//  * Delete user (admin only)
//  */
// export async function deleteUser(userId: string): Promise<{ message: string }> {
//   return fetchAPI<{ message: string }>(`/users/${userId}`, {
//     method: 'DELETE',
//   });
// }

