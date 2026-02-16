'use client';

import { AcademicYear } from '@/types';

interface CoursesTableProps {
  academicYear: AcademicYear;
}

const CoursesTable = ({ academicYear }: CoursesTableProps) => {
  const programLabel = academicYear.program === 'DP' ? 'DP' : 'MYP';
  const headerText = `${programLabel} - All courses are IB subjects, unless indicated as LCS - ${academicYear.gradeLevel} - ${academicYear.academicYear}`;

  return (
    <div className="mb-4">
      {/* Section Header */}
      <div className="bg-gray-100 border border-gray-300 px-3 py-2">
        <p className="text-xs font-semibold text-gray-800">{headerText}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-x border-gray-300">
            <th className="text-left py-1.5 px-3 font-semibold text-gray-700 border-r border-gray-300 w-2/5">
              Subject
            </th>
            <th className="text-left py-1.5 px-3 font-semibold text-gray-700 border-r border-gray-300 w-2/5">
              Description
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
              <td className="py-1 px-3 text-gray-800 border-r border-gray-300">
                {course.name}
              </td>
              <td className="py-1 px-3 text-gray-800 border-r border-gray-300">
                {course.description || '-'}
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