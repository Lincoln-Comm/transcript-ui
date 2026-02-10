// 'use client';

// import { useState } from 'react';
// import { SearchInput } from '@/components/ui';
// import StudentCard from './StudentCard';
// import { StudentSelectorProps } from '@/types';

// const StudentSelector = ({ 
//   students, 
//   selectedStudent, 
//   onSelectStudent 
// }: StudentSelectorProps) => {
//   const [searchQuery, setSearchQuery] = useState('');

//   // Filter students based on search query
//   const filteredStudents = students.filter((student) =>
//     student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     student.id.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//       {/* Section Title */}
//       <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h2>
      
//       {/* Search Input */}
//       <div className="mb-4">
//         <SearchInput
//           placeholder="Search student..."
//           value={searchQuery}
//           onChange={setSearchQuery}
//         />
//       </div>
      
//       {/* Student List */}
//       <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
//         {filteredStudents.length > 0 ? (
//           filteredStudents.map((student) => (
//             <StudentCard
//               key={student.id}
//               student={student}
//               selected={selectedStudent?.id === student.id}
//               onClick={() => onSelectStudent(student)}
//             />
//           ))
//         ) : (
//           <div className="text-center py-8 text-gray-400">
//             No students found
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default StudentSelector;


'use client';

import { useState, useEffect } from 'react';
import { SearchInput } from '@/components/ui';
import StudentCard from './StudentCard';
import { StudentSelectorProps } from '@/types';
import { Loader2 } from 'lucide-react';

const StudentSelector = ({ 
  students, 
  selectedStudent, 
  onSelectStudent,
  isLoading = false,
  error = null,
  onSearch,
}: StudentSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Section Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Student</h2>
      
      {/* Search Input */}
      <div className="mb-4">
        <SearchInput
          placeholder="Search by name or ID..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>
      
      {/* Student List */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading students...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <button 
              className="mt-2 text-sm text-blue-600 hover:underline"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : students.length > 0 ? (
          students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              selected={selectedStudent?.id === student.id}
              onClick={() => onSelectStudent(student)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'No students found matching your search' : 'No students available'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSelector;