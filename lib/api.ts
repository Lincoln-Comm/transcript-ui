const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

// Student API types from backend
export interface StudentAPIResponse {
  id: string;
  apid: string;
  unique_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  year_group: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  birth_place: string | null;
  language: string | null;
  home_language: string | null;
  student_email: string | null;
  status: string;
  entry_date: string;
  entry_grade: string;
}

export interface CourseGrade {
  course_name: string;
  course_description: string;
  course_level: string;
  sem1_grade: number | null;
  sem2_grade: number | null;
}

export interface AcademicYearData {
  academic_year: string;
  grade_level: number | null;
  courses: CourseGrade[];
}

export interface TranscriptAPIResponse {
  student: StudentAPIResponse;
  transcript: {
    [year: string]: AcademicYearData;
  };
}

// API Functions

/**
 * Fetch all students
 */
export async function getStudents(): Promise<StudentAPIResponse[]> {
  return fetchAPI<StudentAPIResponse[]>('/students');
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