'use client';

import Link from 'next/link';
import { NavItemProps } from '@/types';

const NavItem = ({ children, href = '#', active = false }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
        ${active 
          ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
        }`}
    >
      {children}
    </Link>
  );
};

export default NavItem;