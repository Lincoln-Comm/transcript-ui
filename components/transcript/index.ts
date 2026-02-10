// // Student Types
// export interface Student {
//   id: string;
//   name: string;
//   program: 'DP' | 'MYP';
//   programLabel: string;
//   grade: number;
//   avatarUrl?: string;
// }

// // Course Types
// export interface Course {
//   id: string;
//   name: string;
//   level: 'HL' | 'SL';
//   predictedGrade?: number;
//   finalGrade?: number;
//   hasNote?: boolean;
// }

// // Transcript Data
// export interface TranscriptData {
//   student: Student;
//   schoolName: string;
//   schoolYear: string;
//   sessionType: string;
//   courses: Course[];
//   extendedEssay?: number;
//   cas?: number;
//   diplomaCorePoints?: number;
//   overallTotal?: number;
//   coordinatorName?: string;
//   coordinatorDate?: string;
// }

// // Form Options
// export interface TranscriptOptions {
//   program: 'DP' | 'MYP';
//   schoolYear: string;
//   sessionType: 'May Session' | 'November Session';
//   transcriptType: 'official' | 'unofficial';
//   includePredictedGrades: boolean;
// }

// // Navigation
// export interface NavItemProps {
//   children: React.ReactNode;
//   href?: string;
//   active?: boolean;
// }

// export interface BreadcrumbItem {
//   label: string;
//   href: string | null;
// }

// // Component Props
// export interface HeaderProps {
//   activeNav?: string;
// }

// export interface UserProfileProps {
//   name?: string;
//   initials?: string;
// }

// export interface BreadcrumbProps {
//   items?: BreadcrumbItem[];
// }

// export interface StudentCardProps {
//   student: Student;
//   selected?: boolean;
//   onClick?: () => void;
// }

// export interface StudentSelectorProps {
//   students: Student[];
//   selectedStudent: Student | null;
//   onSelectStudent: (student: Student) => void;
// }

// export interface TranscriptPreviewProps {
//   data: TranscriptData | null;
// }


export { default as StudentCard } from './StudentCard';
export { default as StudentSelector } from './StudentSelector';
export { default as TranscriptOptions } from './TranscriptOptions';
export { default as CoursesTable } from './CoursesTable';
export { default as TranscriptPreview } from './TranscriptPreview';
export { default as GradingScale } from './GradingScale';
export { default as TranscriptPDF } from './TranscriptPDF';