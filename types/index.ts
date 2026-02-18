
// =====================================================
// API Response Types (from backend)
// =====================================================

export interface StudentAPI {
  id: string;
  apid?: string;
  unique_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  year_group: string;
  date_of_birth: string;
  gender: string;
  nationality: string | null;
  birth_place?: string | null;
  language?: string | null;
  home_language?: string | null;
  student_email?: string | null;
  status: string;
  entry_date?: string;
  entry_grade?: string;
}

export interface CourseGradeAPI {
  course_name: string;
  course_level: string;
  course_description?: string | null;
  sem1_grade: number | null;
  sem2_grade: number | null;
}

export interface AcademicYearAPI {
  academic_year: string;
  grade_level: number | null;
  courses: CourseGradeAPI[];
}

export interface TranscriptAPIResponse {
  student: StudentAPI;
  transcript: {
    [year: string]: AcademicYearAPI;
  };
}

// =====================================================
// UI Types (transformed for display)
// =====================================================

export interface Student {
  id: string;
  apid?: string;
  uniqueId: string;
  name: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  program: 'DP' | 'MYP';
  programLabel: string;
  grade: number;
  dateOfBirth: string;
  gender: string;
  nationality: string | null;
  yearGroup: string;
  status: string;
  entryDate?: string;
  entryGrade?: string;
  dateOfGraduation?: string;
}

export interface Course {
  id: string;
  name: string;
  level: string;
  description?: string | null;
  semester1Grade: number | string | null;
  semester2Grade: number | string | null;
}

export interface AcademicYear {
  id: string;
  program: 'DP' | 'MYP';
  gradeLevel: string;
  academicYear: string;
  courses: Course[];
}

export interface TranscriptData {
  student: Student;
  schoolName: string;
  schoolAddress: {
    line1: string;
    city: string;
    country: string;
    phone: string;
    web: string;
  };
  academicYears: AcademicYear[];
  principalName: string;
  principalTitle: string;
}

// =====================================================
// Transformer Functions
// =====================================================

/**
 * Transform API student to UI student format
 */
export function transformStudent(apiStudent: StudentAPI): Student {
  // Determine program based on year_group or entry_grade
  const program: 'DP' | 'MYP' = apiStudent.entry_grade?.includes('DP') ? 'DP' : 'MYP';
  
  // Extract grade number from entry_grade if possible
  const gradeMatch = apiStudent.entry_grade?.match(/(\d+)/);
  const grade = gradeMatch ? parseInt(gradeMatch[1]) : 0;

  return {
    id: apiStudent.id,
    apid: apiStudent.apid || undefined,
    uniqueId: apiStudent.unique_id,
    name: `${apiStudent.first_name} ${apiStudent.last_name}`,
    firstName: apiStudent.first_name,
    middleName: apiStudent.middle_name,
    lastName: apiStudent.last_name,
    program,
    programLabel: `${program} Program: ${apiStudent.entry_grade || 'N/A'}`,
    grade,
    dateOfBirth: formatDate(apiStudent.date_of_birth),
    gender: apiStudent.gender === 'M' ? 'Male' : apiStudent.gender === 'F' ? 'Female' : apiStudent.gender,
    nationality: apiStudent.nationality || null,
    yearGroup: apiStudent.year_group,
    status: apiStudent.status,
    entryDate: apiStudent.entry_date ? formatDate(apiStudent.entry_date) : undefined,
    entryGrade: apiStudent.entry_grade || undefined,
    dateOfGraduation: calculateGraduationDate(apiStudent.entry_grade || null, apiStudent.entry_date || null),
  };
}

/**
 * Transform API transcript to UI transcript format
 */
export function transformTranscript(apiResponse: TranscriptAPIResponse): TranscriptData {
  const student = transformStudent(apiResponse.student);
  
  // Transform academic years
  const academicYears: AcademicYear[] = Object.entries(apiResponse.transcript)
    .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort by year descending
    .map(([year, data]) => {
      // Determine program from course levels
      const hasDP = data.courses.some(c => 
        c.course_level === 'DP' || 
        c.course_level === 'HL' || 
        c.course_level === 'SL'
      );
      const program: 'DP' | 'MYP' = hasDP ? 'DP' : 'MYP';
      
      // Format grade level
      let gradeLevel = '';
      if (data.grade_level) {
        if (program === 'MYP' && data.grade_level <= 10) {
          // MYP uses Year 1-5 (grades 6-10)
          const mypYear = data.grade_level - 5;
          gradeLevel = mypYear > 0 ? `Year ${mypYear}` : `Grade ${data.grade_level}`;
        } else {
          gradeLevel = `Grade ${data.grade_level}`;
        }
      }

      return {
        id: `${year}-${program}`,
        program,
        gradeLevel,
        academicYear: data.academic_year,
        courses: data.courses.map((course, index) => ({
          id: `${year}-${index}`,
          name: course.course_name,
          level: course.course_level,
          description: course.course_description || null,
          semester1Grade: course.sem1_grade,
          semester2Grade: course.sem2_grade,
        })),
      };
    });

  return {
    student,
    schoolName: 'Lincoln Community School',
    schoolAddress: {
      line1: 'PMB CT 354, Cantonment',
      city: 'Accra',
      country: 'Ghana',
      phone: '+233 30 221 8100',
      web: 'www.lincoln.edu.gh',
    },
    academicYears,
    principalName: 'Jennifer Hager',
    principalTitle: 'Secondary School Principal',
  };
}

/**
 * Format date from ISO string to readable format
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Calculate estimated graduation date based on entry grade and entry date
 */
function calculateGraduationDate(entryGrade: string | null, entryDate: string | null): string {
  if (!entryGrade || !entryDate) return '';
  
  try {
    // Extract grade number from entry_grade (e.g., "Grade 9" -> 9)
    const gradeMatch = entryGrade.match(/(\d+)/);
    if (!gradeMatch) return '';
    
    const entryGradeNum = parseInt(gradeMatch[1]);
    const yearsToGraduation = 12 - entryGradeNum; // Assuming graduation at Grade 12
    
    const entry = new Date(entryDate);
    const graduationYear = entry.getFullYear() + yearsToGraduation + 1; // +1 because they complete the grade
    
    // Graduation typically in May
    return `23 May ${graduationYear}`;
  } catch {
    return '';
  }
}

// =====================================================
// Grading Scale
// =====================================================

export interface GradeDescriptor {
  grade: string;
  lcsDescriptor: string;
  descriptor: string;
}

// =====================================================
// Form Options
// =====================================================

export interface TranscriptOptions {
  program: 'DP' | 'MYP';
  schoolYear: string;
  sessionType: 'May Session' | 'November Session';
  transcriptType: 'official' | 'unofficial';
  includePredictedGrades: boolean;
}

// =====================================================
// Component Props
// =====================================================

export interface NavItemProps {
  children: React.ReactNode;
  href?: string;
  active?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string | null;
}

export interface HeaderProps {
  activeNav?: string;
}

export interface UserProfileProps {
  name?: string;
  initials?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export interface StudentCardProps {
  student: Student;
  selected?: boolean;
  onClick?: () => void;
}

export interface StudentSelectorProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  isLoading?: boolean;
  error?: string | null;
  onSearch?: (query: string) => void;
}

export interface TranscriptPreviewProps {
  data: TranscriptData | null;
  isLoading?: boolean;
  error?: string | null;
}

export interface CoursesTableProps {
  academicYear: AcademicYear;
}

export interface GradingScaleProps {
  descriptors: GradeDescriptor[];
}