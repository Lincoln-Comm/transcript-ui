// 'use client';

// import { FileText } from 'lucide-react';
// import { Course } from '@/types';

// interface CoursesTableProps {
//   courses: Course[];
//   showPredicted: boolean;
// }

// const CoursesTable = ({ courses, showPredicted }: CoursesTableProps) => {
//   return (
//     <div className="overflow-hidden">
//       {/* Table Header */}
//       <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 border-b border-gray-200 pb-2 mb-1">
//         <div className="col-span-6">Courses:</div>
//         <div className="col-span-2 text-center">Level</div>
//         {showPredicted && <div className="col-span-2 text-center">Predicted</div>}
//         <div className={`${showPredicted ? 'col-span-2' : 'col-span-4'} text-center`}>Final</div>
//       </div>

//       {/* Course Rows */}
//       <div className="space-y-0.5">
//         {courses.map((course) => (
//           <div 
//             key={course.id} 
//             className="grid grid-cols-12 gap-2 text-xs py-1.5 border-b border-gray-100 items-center"
//           >
//             {/* Course Name */}
//             <div className="col-span-6 text-gray-800 font-medium truncate pr-2">
//               {course.name}
//             </div>
            
//             {/* Level */}
//             <div className="col-span-2 text-center text-gray-600">
//               {course.level}
//             </div>
            
//             {/* Predicted Grade */}
//             {showPredicted && (
//               <div className="col-span-2 text-center text-gray-600">
//                 {course.predictedGrade ?? '-'}
//               </div>
//             )}
            
//             {/* Final Grade */}
//             <div className={`${showPredicted ? 'col-span-2' : 'col-span-4'} flex items-center justify-center gap-1`}>
//               <span className="font-semibold text-gray-900">
//                 {course.finalGrade ?? '-'}
//               </span>
//               {course.hasNote && (
//                 <FileText className="w-3 h-3 text-blue-500" />
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CoursesTable;


'use client';

import { AcademicYear } from '@/types';

interface CoursesTableProps {
  academicYear: AcademicYear;
}

const CoursesTable = ({ academicYear }: CoursesTableProps) => {
  const programLabel = academicYear.program === 'DP' ? 'DP' : 'MYP';
  const headerText = `${programLabel} - All courses are IB subjects, unless indicated as LCS - ${academicYear.gradeLevel} - ${academicYear.academicYear}`;

  return (
    <div className="mb-2">
      {/* Section Header */}
      <div className="bg-gray-100 border border-gray-300 px-3 py-1">
        <p className="text-xs font-semibold text-gray-800">{headerText}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-x border-gray-300">
            <th className="text-left py-1.5 px-3 font-semibold text-gray-700 border-r border-gray-300 w-3/5">
              Subject
            </th>
            <th className="text-center py-1.5 px-2 font-semibold text-gray-700 border-r border-gray-300">
              Semester 1<br />
              <span className="font-normal">Final Grade</span>
            </th>
            <th className="text-center py-1.5 px-2 font-semibold text-gray-700">
              Semester 2<br />
              <span className="font-normal">Final Grade</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {academicYear.courses.map((course, index) => (
            <tr 
              key={course.id} 
              className={`border-x border-gray-300 ${index === academicYear.courses.length - 1 ? 'border-b' : ''}`}
            >
              <td className="py-1 px-3 text-gray-800 border-r border-gray-300" >
                {course.description}
              </td>
              
              <td className="py-1 px-2 text-center text-gray-800 border-r border-gray-300">
                {course.semester1Grade ?? '-'}
              </td>
              <td className="py-1 px-2 text-center text-gray-800">
                {course.semester2Grade ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CoursesTable;