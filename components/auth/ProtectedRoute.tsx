'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: 'users' | 'students' | 'courses' | 'grades' | 'transcripts';
    action: string;
  };
  adminOnly?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  adminOnly = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, mustChangePassword, hasPermission, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        console.log('🚫 Not authenticated, redirecting to login...');
        router.push('/login');
        return;
      }

      // Must change password - redirect to change-password page
      if (mustChangePassword && pathname !== '/change-password') {
        console.log('🔐 Must change password, redirecting...');
        router.push('/change-password');
        return;
      }

      // Admin-only route check
      if (adminOnly && !isAdmin) {
        console.log('🚫 Admin access required, redirecting to dashboard...');
        router.push('/dashboard');
        return;
      }

      // Permission check
      if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
        console.log('🚫 Permission denied, redirecting to dashboard...');
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, mustChangePassword, pathname, router, adminOnly, isAdmin, hasPermission, requiredPermission]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if must change password (except on change-password page)
  if (mustChangePassword && pathname !== '/change-password') {
    return null;
  }

  // Don't render if permission check fails
  if (adminOnly && !isAdmin) {
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return null;
  }

  return <>{children}</>;
}

// 'use client';

// import { useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useAuth } from '@/contexts';
// import { Loader2 } from 'lucide-react';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requiredPermission?: {
//     resource: 'users' | 'students' | 'courses' | 'grades' | 'transcripts';
//     action: string;
//   };
//   adminOnly?: boolean;
// }

// export default function ProtectedRoute({ 
//   children, 
//   requiredPermission,
//   adminOnly = false 
// }: ProtectedRouteProps) {
//   const { isAuthenticated, isLoading, mustChangePassword, hasPermission, isAdmin } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!isLoading) {
//       // Not authenticated - redirect to login
//       if (!isAuthenticated) {
//         console.log('🚫 Not authenticated, redirecting to login...');
//         router.push('/login');
//         return;
//       }

//       // Must change password - redirect to change-password page
//       if (mustChangePassword && pathname !== '/change-password') {
//         console.log('🔐 Must change password, redirecting...');
//         router.push('/change-password');
//         return;
//       }

//       // Admin-only route check
//       if (adminOnly && !isAdmin) {
//         console.log('🚫 Admin access required, redirecting to dashboard...');
//         router.push('/dashboard');
//         return;
//       }

//       // Permission check
//       if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
//         console.log('🚫 Permission denied, redirecting to dashboard...');
//         router.push('/dashboard');
//         return;
//       }
//     }
//   }, [isAuthenticated, isLoading, mustChangePassword, pathname, router, adminOnly, isAdmin, hasPermission, requiredPermission]);

//   // Show loading while checking auth
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // Don't render children if not authenticated
//   if (!isAuthenticated) {
//     return null;
//   }

//   // Don't render if must change password (except on change-password page)
//   if (mustChangePassword && pathname !== '/change-password') {
//     return null;
//   }

//   // Don't render if permission check fails
//   if (adminOnly && !isAdmin) {
//     return null;
//   }

//   if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
//     return null;
//   }

//   return <>{children}</>;
// }

// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts';
// import { Loader2 } from 'lucide-react';

// interface ProtectedRouteProps {
//   children: React.ReactNode;
// }

// export default function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const { isAuthenticated, isLoading } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       console.log('🚫 Not authenticated, redirecting to login...');
//       router.push('/login');
//     }
//   }, [isAuthenticated, isLoading, router]);

//   // Show loading while checking auth
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-gray-200">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Checking authentication...</p>
//         </div>
//       </div>
//     );
//   }

//   // Don't render children if not authenticated
//   if (!isAuthenticated) {
//     return null;
//   }

//   return <>{children}</>;
// }