'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { verifySetupToken, setupPassword } from '@/lib/api';
import { setAuthToken, setAuthUser, setAuthPermissions } from '@/lib/auth';

function SetupPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber;
  const canSubmit = isPasswordStrong && passwordsMatch;

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setTokenError('No setup token provided. Please use the link from your email.');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await verifySetupToken(token);
        if (response.valid) {
          setIsValidToken(true);
          setUserInfo(response.user);
        } else {
          setTokenError(response.error || 'Invalid or expired token.');
        }
      } catch (err) {
        setTokenError('This link is invalid or has expired. Please contact your administrator for a new setup link.');
      } finally {
        setIsVerifying(false);
      }
    }

    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canSubmit || !token) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await setupPassword(token, password);
      
      // Store auth data
      setAuthToken(response.token);
      setAuthUser(response.user);
      setAuthPermissions(response.permissions);
      
      setSuccess(true);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your setup link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Invalid or Expired</h1>
          <p className="text-gray-600 mb-6">{tokenError}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Set Successfully!</h1>
          <p className="text-gray-600 mb-4">Your account is ready. Redirecting to dashboard...</p>
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Setup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set Up Your Password</h1>
          <p className="text-blue-100 mt-1">LCS Transcript System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {userInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">Setting password for</p>
              <p className="font-semibold text-gray-900">{userInfo.name}</p>
              <p className="text-sm text-gray-600">{userInfo.email}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-2">Password requirements:</p>
            <ul className="space-y-1">
              <li className={`text-sm flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasMinLength ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {hasMinLength ? '✓' : '○'}
                </span>
                At least 8 characters
              </li>
              <li className={`text-sm flex items-center gap-2 ${hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasUppercase ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {hasUppercase ? '✓' : '○'}
                </span>
                One uppercase letter
              </li>
              <li className={`text-sm flex items-center gap-2 ${hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasLowercase ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {hasLowercase ? '✓' : '○'}
                </span>
                One lowercase letter
              </li>
              <li className={`text-sm flex items-center gap-2 ${hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${hasNumber ? 'bg-green-100' : 'bg-gray-200'}`}>
                  {hasNumber ? '✓' : '○'}
                </span>
                One number
              </li>
            </ul>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="mt-2 text-sm text-red-600">Passwords do not match</p>
            )}
            {passwordsMatch && (
              <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting Password...
              </>
            ) : (
              'Set Password & Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SetupPasswordContent />
    </Suspense>
  );
}
// 'use client';

// import { useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

// export default function ChangePasswordPage() {
//   const { user, changePassword, logout, isLoading } = useAuth();
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     // Validation
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       setError('All fields are required');
//       return;
//     }

//     if (newPassword.length < 8) {
//       setError('New password must be at least 8 characters');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('New passwords do not match');
//       return;
//     }

//     if (currentPassword === newPassword) {
//       setError('New password must be different from current password');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await changePassword(currentPassword, newPassword);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to change password');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         {/* Card */}
//         <div className="bg-white rounded-2xl shadow-xl p-8">
//           {/* Icon */}
//           <div className="flex justify-center mb-6">
//             <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
//               <Lock className="w-8 h-8 text-amber-600" />
//             </div>
//           </div>

//           {/* Title */}
//           <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
//             Change Your Password
//           </h1>
//           <p className="text-gray-600 text-center mb-6">
//             {user?.must_change_password 
//               ? 'You must change your password before continuing.'
//               : 'Create a new secure password for your account.'}
//           </p>

//           {/* Error */}
//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
//               <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
//               <p className="text-sm text-red-700">{error}</p>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Current Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Current Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showCurrentPassword ? 'text' : 'password'}
//                   value={currentPassword}
//                   onChange={(e) => setCurrentPassword(e.target.value)}
//                   placeholder="Enter current password"
//                   className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* New Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 New Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showNewPassword ? 'text' : 'password'}
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   placeholder="Enter new password (min 8 characters)"
//                   className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirm New Password
//               </label>
//               <input
//                 type="password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="Confirm new password"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={isSubmitting || isLoading}
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Changing Password...
//                 </>
//               ) : (
//                 'Change Password'
//               )}
//             </button>
//           </form>

//           {/* Logout option */}
//           {user?.must_change_password && (
//             <div className="mt-6 text-center">
//               <button
//                 onClick={logout}
//                 className="text-sm text-gray-500 hover:text-gray-700"
//               >
//                 Or logout and try a different account
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Password requirements */}
//         <div className="mt-4 p-4 bg-white/50 rounded-xl">
//           <p className="text-xs text-gray-500 text-center">
//             Password must be at least 8 characters long. Use a mix of letters, numbers, and symbols for better security.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


// // 'use client';

// // import { useState } from 'react';
// // import { useAuth } from '@/contexts/AuthContext';
// // import { Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

// // export default function ChangePasswordPage() {
// //   const { user, changePassword, logout, isLoading } = useAuth();
// //   const [currentPassword, setCurrentPassword] = useState('');
// //   const [newPassword, setNewPassword] = useState('');
// //   const [confirmPassword, setConfirmPassword] = useState('');
// //   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
// //   const [showNewPassword, setShowNewPassword] = useState(false);
// //   const [error, setError] = useState<string | null>(null);
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setError(null);

// //     // Validation
// //     if (!currentPassword || !newPassword || !confirmPassword) {
// //       setError('All fields are required');
// //       return;
// //     }

// //     if (newPassword.length < 8) {
// //       setError('New password must be at least 8 characters');
// //       return;
// //     }

// //     if (newPassword !== confirmPassword) {
// //       setError('New passwords do not match');
// //       return;
// //     }

// //     if (currentPassword === newPassword) {
// //       setError('New password must be different from current password');
// //       return;
// //     }

// //     setIsSubmitting(true);

// //     try {
// //       await changePassword(currentPassword, newPassword);
// //     } catch (err) {
// //       setError(err instanceof Error ? err.message : 'Failed to change password');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
// //       <div className="w-full max-w-md">
// //         {/* Card */}
// //         <div className="bg-white rounded-2xl shadow-xl p-8">
// //           {/* Icon */}
// //           <div className="flex justify-center mb-6">
// //             <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
// //               <Lock className="w-8 h-8 text-amber-600" />
// //             </div>
// //           </div>

// //           {/* Title */}
// //           <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
// //             Change Your Password
// //           </h1>
// //           <p className="text-gray-600 text-center mb-6">
// //             {user?.must_change_password 
// //               ? 'You must change your password before continuing.'
// //               : 'Create a new secure password for your account.'}
// //           </p>

// //           {/* Error */}
// //           {error && (
// //             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
// //               <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
// //               <p className="text-sm text-red-700">{error}</p>
// //             </div>
// //           )}

// //           {/* Form */}
// //           <form onSubmit={handleSubmit} className="space-y-4">
// //             {/* Current Password */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 Current Password
// //               </label>
// //               <div className="relative">
// //                 <input
// //                   type={showCurrentPassword ? 'text' : 'password'}
// //                   value={currentPassword}
// //                   onChange={(e) => setCurrentPassword(e.target.value)}
// //                   placeholder="Enter current password"
// //                   className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
// //                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
// //                 >
// //                   {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* New Password */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 New Password
// //               </label>
// //               <div className="relative">
// //                 <input
// //                   type={showNewPassword ? 'text' : 'password'}
// //                   value={newPassword}
// //                   onChange={(e) => setNewPassword(e.target.value)}
// //                   placeholder="Enter new password (min 8 characters)"
// //                   className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowNewPassword(!showNewPassword)}
// //                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
// //                 >
// //                   {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Confirm Password */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 Confirm New Password
// //               </label>
// //               <input
// //                 type="password"
// //                 value={confirmPassword}
// //                 onChange={(e) => setConfirmPassword(e.target.value)}
// //                 placeholder="Confirm new password"
// //                 className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //               />
// //             </div>

// //             {/* Submit Button */}
// //             <button
// //               type="submit"
// //               disabled={isSubmitting || isLoading}
// //               className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
// //             >
// //               {isSubmitting ? (
// //                 <>
// //                   <Loader2 className="w-5 h-5 animate-spin" />
// //                   Changing Password...
// //                 </>
// //               ) : (
// //                 'Change Password'
// //               )}
// //             </button>
// //           </form>

// //           {/* Logout option */}
// //           {user?.must_change_password && (
// //             <div className="mt-6 text-center">
// //               <button
// //                 onClick={logout}
// //                 className="text-sm text-gray-500 hover:text-gray-700"
// //               >
// //                 Or logout and try a different account
// //               </button>
// //             </div>
// //           )}
// //         </div>

// //         {/* Password requirements */}
// //         <div className="mt-4 p-4 bg-white/50 rounded-xl">
// //           <p className="text-xs text-gray-500 text-center">
// //             Password must be at least 8 characters long. Use a mix of letters, numbers, and symbols for better security.
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }