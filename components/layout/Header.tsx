'use client';

import { LayoutGrid, Users, FileText, Settings } from 'lucide-react';
import { IBLogo } from '@/components/ui';
import NavItem from './NavItem';
import UserProfile from './UserProfile';
import { HeaderProps } from '@/types';

const Header = ({ activeNav = 'generate-transcript' }: HeaderProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { id: 'students', label: 'Students', icon: Users, href: '/dashboard/students' },
    { id: 'generate-transcript', label: 'Generate Transcript', icon: FileText, href: '/dashboard/generate-transcript' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  return (
    <header className="relative overflow-hidden">
      {/* Gradient Background with Earth-like imagery */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600">
        {/* Subtle earth/atmosphere overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-950/40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-gradient-to-t from-green-400/10 to-transparent blur-2xl" />
      </div>
      
      {/* Header Content */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <IBLogo />
            <div className="text-white">
              <div className="text-xs font-semibold tracking-wider uppercase opacity-90">Lincoln</div>
              <div className="text-xs font-semibold tracking-wider uppercase opacity-90">Community Sch</div>
            </div>
          </div>
          
          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="relative z-10 px-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavItem 
                key={item.id} 
                href={item.href} 
                active={activeNav === item.id}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavItem>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;