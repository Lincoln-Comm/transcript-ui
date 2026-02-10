// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { getStudents, searchStudents, StudentAPIResponse } from '@/lib/api';

// interface UseStudentsResult {
//   students: StudentAPIResponse[];
//   isLoading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
//   search: (query: string) => void;
// }

// export function useStudents(): UseStudentsResult {
//   const [students, setStudents] = useState<StudentAPIResponse[]>([]);
//   const [allStudents, setAllStudents] = useState<StudentAPIResponse[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchStudents = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
    
//     try {
//       const data = await getStudents();
//       setStudents(data);
//       setAllStudents(data);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch students');
//       console.error('Error fetching students:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchStudents();
//   }, [fetchStudents]);

//   // Client-side search for better UX (instant filtering)
//   const search = useCallback((query: string) => {
//     if (!query.trim()) {
//       setStudents(allStudents);
//       return;
//     }

//     const lowerQuery = query.toLowerCase();
//     const filtered = allStudents.filter(student => 
//       student.first_name.toLowerCase().includes(lowerQuery) ||
//       student.last_name.toLowerCase().includes(lowerQuery) ||
//       student.unique_id.toLowerCase().includes(lowerQuery) ||
//       student.apid.toLowerCase().includes(lowerQuery) ||
//       `${student.first_name} ${student.last_name}`.toLowerCase().includes(lowerQuery)
//     );
    
//     setStudents(filtered);
//   }, [allStudents]);

//   return {
//     students,
//     isLoading,
//     error,
//     refetch: fetchStudents,
//     search,
//   };
// } 


'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStudents, searchStudents, StudentAPIResponse } from '@/lib/api';

interface UseStudentsResult {
  students: StudentAPIResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  search: (query: string) => void;
}

export function useStudents(): UseStudentsResult {
  const [students, setStudents] = useState<StudentAPIResponse[]>([]);
  const [allStudents, setAllStudents] = useState<StudentAPIResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getStudents();
      
      // Console log the API response
      console.log('📚 Students API Response:', data);
      console.log(`📊 Total students fetched: ${data.length}`);
      
      setStudents(data);
      setAllStudents(data);
    } catch (err) {
      console.error('❌ Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Client-side search for better UX (instant filtering)
  const search = useCallback((query: string) => {
    if (!query.trim()) {
      setStudents(allStudents);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allStudents.filter(student => 
      student.first_name.toLowerCase().includes(lowerQuery) ||
      student.last_name.toLowerCase().includes(lowerQuery) ||
      student.unique_id.toLowerCase().includes(lowerQuery) ||
      student.apid.toLowerCase().includes(lowerQuery) ||
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(lowerQuery)
    );
    
    console.log(`🔍 Search "${query}" found ${filtered.length} students`);
    setStudents(filtered);
  }, [allStudents]);

  return {
    students,
    isLoading,
    error,
    refetch: fetchStudents,
    search,
  };
}