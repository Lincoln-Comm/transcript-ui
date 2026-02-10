'use client';

import { ChevronDown } from 'lucide-react';
import { UserProfileProps } from '@/types';

const UserProfile = ({ name = 'Mr. Sam', initials = 'MS' }: UserProfileProps) => {
  return (
    <div className="flex items-center gap-3 bg-white rounded-full pl-1 pr-4 py-1 shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
        {initials}
      </div>
      <span className="text-gray-700 font-medium text-sm">{name}</span>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </div>
  );
};

export default UserProfile;