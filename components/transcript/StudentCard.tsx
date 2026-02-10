// 'use client';

// import { User } from 'lucide-react';
// import { StudentCardProps } from '@/types';

// const StudentCard = ({ student, selected = false, onClick }: StudentCardProps) => {
//   return (
//     <div
//       onClick={onClick}
//       className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
//         ${selected 
//           ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
//           : 'bg-white hover:bg-gray-50 border border-gray-100'
//         }`}
//     >
//       {/* Left side - Avatar and Info */}
//       <div className="flex items-center gap-3">
//         {/* Avatar */}
//         <div className={`w-10 h-10 rounded-full flex items-center justify-center
//           ${selected 
//             ? 'bg-blue-500' 
//             : 'bg-gradient-to-br from-blue-100 to-blue-200'
//           }`}
//         >
//           <User className={`w-5 h-5 ${selected ? 'text-blue-200' : 'text-blue-600'}`} />
//         </div>
        
//         {/* Name and Program */}
//         <div>
//           <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-gray-900'}`}>
//             {student.name}
//           </p>
//           <p className={`text-xs ${selected ? 'text-blue-200' : 'text-gray-500'}`}>
//             {student.programLabel}
//           </p>
//         </div>
//       </div>
      
//       {/* Right side - ID and Badge */}
//       <div className="flex items-center gap-2">
//         <div className="flex items-center gap-1">
//           <User className={`w-3 h-3 ${selected ? 'text-blue-200' : 'text-gray-400'}`} />
//           <span className={`text-xs ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
//             {student.id}
//           </span>
//         </div>
        
//         {/* Program Badge */}
//         <span className={`text-xs font-semibold px-2 py-1 rounded-md
//           ${selected 
//             ? 'bg-blue-500 text-white' 
//             : student.program === 'DP' 
//               ? 'bg-blue-100 text-blue-700' 
//               : 'bg-emerald-100 text-emerald-700'
//           }`}
//         >
//           {student.program}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default StudentCard; 


'use client';

import { User } from 'lucide-react';
import { StudentCardProps } from '@/types';

const StudentCard = ({ student, selected = false, onClick }: StudentCardProps) => {
  // Get initials from name
  const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
        ${selected 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
          : 'bg-white hover:bg-gray-50 border border-gray-100'
        }`}
    >
      {/* Left side - Avatar and Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
          ${selected 
            ? 'bg-blue-500 text-white' 
            : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
          }`}
        >
          {initials}
        </div>
        
        {/* Name and Program */}
        <div>
          <p className={`font-semibold text-sm ${selected ? 'text-white' : 'text-gray-900'}`}>
            {student.name}
          </p>
          <p className={`text-xs ${selected ? 'text-blue-200' : 'text-gray-500'}`}>
            {student.programLabel}
          </p>
        </div>
      </div>
      
      {/* Right side - ID and Badge */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <User className={`w-3 h-3 ${selected ? 'text-blue-200' : 'text-gray-400'}`} />
          <span className={`text-xs ${selected ? 'text-blue-100' : 'text-gray-500'}`}>
            {student.uniqueId}
          </span>
        </div>
        
        {/* Program Badge */}
        <span className={`text-xs font-semibold px-2 py-1 rounded-md
          ${selected 
            ? 'bg-blue-500 text-white' 
            : student.program === 'DP' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {student.program}
        </span>
      </div>
    </div>
  );
};

export default StudentCard;