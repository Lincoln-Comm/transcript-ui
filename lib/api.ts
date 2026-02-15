// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://transcript-apis-test.up.railway.app/api';

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

// // Student API types from backend
// export interface StudentAPIResponse {
//   id: string;
//   apid: string;
//   unique_id: string;
//   first_name: string;
//   middle_name: string | null;
//   last_name: string;
//   year_group: string;
//   date_of_birth: string;
//   gender: string;
//   nationality: string;
//   birth_place: string | null;
//   language: string | null;
//   home_language: string | null;
//   student_email: string | null;
//   status: string;
//   entry_date: string;
//   entry_grade: string;
// }

// export interface CourseGrade {
//   course_name: string;
//   course_description: string;
//   course_level: string;
//   sem1_grade: number | null;
//   sem2_grade: number | null;
// }

// export interface AcademicYearData {
//   academic_year: string;
//   grade_level: number | null;
//   courses: CourseGrade[];
// }

// export interface TranscriptAPIResponse {
//   student: StudentAPIResponse;
//   transcript: {
//     [year: string]: AcademicYearData;
//   };
// }

// // API Functions

// /**
//  * Fetch all students
//  */
// export async function getStudents(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students');
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





// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

// // Student API types (from your backend)
// export interface StudentAPIResponse {
//   id: string;
//   apid: string;
//   unique_id: string;
//   first_name: string;
//   middle_name: string | null;
//   last_name: string;
//   year_group: string;
//   date_of_birth: string;
//   gender: string;
//   nationality: string;
//   birth_place: string | null;
//   language: string | null;
//   home_language: string | null;
//   student_email: string | null;
//   status: string;
//   entry_date: string;
//   entry_grade: string;
// }

// export interface CourseGrade {
//   course_name: string;
//   course_level: string;
//   sem1_grade: number | null;
//   sem2_grade: number | null;
// }

// export interface AcademicYearData {
//   academic_year: string;
//   grade_level: number | null;
//   courses: CourseGrade[];
// }

// export interface TranscriptAPIResponse {
//   student: StudentAPIResponse;
//   transcript: {
//     [year: string]: AcademicYearData;
//   };
// }

// // API Functions

// /**
//  * Fetch all students
//  */
// export async function getStudents(): Promise<StudentAPIResponse[]> {
//   return fetchAPI<StudentAPIResponse[]>('/students');
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


// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

// // Student API types (from your backend)
// export interface StudentAPIResponse {
//   id: string;
//   apid: string;
//   unique_id: string;
//   first_name: string;
//   middle_name: string | null;
//   last_name: string;
//   year_group: string;
//   date_of_birth: string;
//   gender: string;
//   nationality: string;
//   birth_place: string | null;
//   language: string | null;
//   home_language: string | null;
//   student_email: string | null;
//   status: string;
//   entry_date: string;
//   entry_grade: string;
// }

// export interface CourseGrade {
//   course_name: string;
//   course_level: string;
//   sem1_grade: number | null;
//   sem2_grade: number | null;
// }

// export interface AcademicYearData {
//   academic_year: string;
//   grade_level: number | null;
//   courses: CourseGrade[];
// }

// export interface TranscriptAPIResponse {
//   student: StudentAPIResponse;
//   transcript: {
//     [year: string]: AcademicYearData;
//   };
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


// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// import { TranscriptAPIResponse } from '@/types';

// // Re-export for convenience
// export type { TranscriptAPIResponse } from '@/types';

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

// // Student API types (from your backend)
// export interface StudentAPIResponse {
//   id: string;
//   apid: string;
//   unique_id: string;
//   first_name: string;
//   middle_name: string | null;
//   last_name: string;
//   year_group: string;
//   date_of_birth: string;
//   gender: string;
//   nationality: string;
//   birth_place: string | null;
//   language: string | null;
//   home_language: string | null;
//   student_email: string | null;
//   status: string;
//   entry_date: string;
//   entry_grade: string;
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



const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

import { TranscriptAPIResponse, StudentAPI } from '@/types';

// Re-export types for convenience
export type { TranscriptAPIResponse } from '@/types';

// Alias StudentAPI as StudentAPIResponse for backward compatibility
export type StudentAPIResponse = StudentAPI;

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
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
