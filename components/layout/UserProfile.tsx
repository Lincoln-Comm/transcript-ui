'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, LogOut, User, Settings, Key, Shield, ShieldCheck, Eye } from 'lucide-react';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';

// Role styles
const ROLE_STYLES: Record<string, { bg: string; text: string; label: string; icon: typeof ShieldCheck }> = {
  admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin', icon: ShieldCheck },
  staff: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Staff', icon: Shield },
};

const UserProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  // Get user info or fallback
  const name = user?.name || 'User';
  const role = user?.role || 'staff';
  const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.staff;
  const RoleIcon = roleStyle.icon;
  
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    router.push('/change-password');
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/dashboard/settings');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white rounded-full pl-1 pr-4 py-1 shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
          {initials}
        </div>
        <div className="text-left">
          <span className="text-gray-700 font-medium text-sm block">{name}</span>
          <span className={`text-xs ${roleStyle.text}`}>{roleStyle.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{name}</p>
            <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}>
              <RoleIcon className="w-3 h-3" />
              {roleStyle.label}
            </span>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={handleChangePassword}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Key className="w-4 h-4 text-gray-400" />
              Change Password
            </button>
            {isAdmin && (
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;

// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import { ChevronDown, LogOut, User, Settings } from 'lucide-react';
// import { useAuth } from '@/contexts';

// const UserProfile = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const { user, logout } = useAuth();

//   // Get user info or fallback
//   const name = user?.name || 'User';
//   const initials = name
//     .split(' ')
//     .map(n => n[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     setIsOpen(false);
//     logout();
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* Profile Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-3 bg-white rounded-full pl-1 pr-4 py-1 shadow-lg hover:shadow-xl transition-shadow"
//       >
//         <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
//           {initials}
//         </div>
//         <span className="text-gray-700 font-medium text-sm">{name}</span>
//         <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
//       </button>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
//           {/* User Info */}
//           <div className="px-4 py-3 border-b border-gray-100">
//             <p className="text-sm font-semibold text-gray-900">{name}</p>
//             <p className="text-xs text-gray-500">{user?.email}</p>
//           </div>

//           {/* Menu Items */}
//           {/* <div className="py-1">
//             <button
//               onClick={() => setIsOpen(false)}
//               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               <User className="w-4 h-4 text-gray-400" />
//               Profile
//             </button>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               <Settings className="w-4 h-4 text-gray-400" />
//               Settings
//             </button>
//           </div> */}

//           {/* Logout */}
//           <div className="border-t border-gray-100 pt-1">
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
//             >
//               <LogOut className="w-4 h-4" />
//               Sign Out
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserProfile;