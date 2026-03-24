const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole = 'admin' | 'staff';
export type UserStatus = 'active' | 'inactive';

export interface Permissions {
  users: string[];
  students: string[];
  courses: string[];
  grades: string[];
  transcripts: string[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  must_change_password: boolean;
  status: UserStatus;
}

export interface LoginResponse {
  message?: string;
  token: string;
  user: AuthUser;
  permissions: Permissions;
  must_change_password: boolean;
}

/**
 * Login user with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Login failed');
  }

  return data;
}

/**
 * Change password
 */
export async function changePasswordAPI(currentPassword: string, newPassword: string): Promise<{ message: string; token: string; user: AuthUser }> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      current_password: currentPassword, 
      new_password: newPassword 
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to change password');
  }

  return data;
}

/**
 * Store auth token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_permissions');
  }
}

/**
 * Store user info in localStorage
 */
export function setAuthUser(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

/**
 * Get user info from localStorage
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

/**
 * Store permissions in localStorage
 */
export function setAuthPermissions(permissions: Permissions): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_permissions', JSON.stringify(permissions));
  }
}

/**
 * Get permissions from localStorage
 */
export function getAuthPermissions(): Permissions | null {
  if (typeof window !== 'undefined') {
    const permissions = localStorage.getItem('auth_permissions');
    return permissions ? JSON.parse(permissions) : null;
  }
  return null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(resource: keyof Permissions, action: string): boolean {
  const permissions = getAuthPermissions();
  if (!permissions) return false;
  return permissions[resource]?.includes(action) || false;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const user = getAuthUser();
  return user?.role === 'admin';
}

/**
 * Logout user
 */
export function logout(): void {
  removeAuthToken();
}


// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export type UserRole = 'admin' | 'staff';
// export type UserStatus = 'active' | 'inactive';

// export interface Permissions {
//   users: string[];
//   students: string[];
//   courses: string[];
//   grades: string[];
//   transcripts: string[];
// }

// export interface AuthUser {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole;
//   must_change_password: boolean;
//   status: UserStatus;
// }

// export interface LoginResponse {
//   message?: string;
//   token: string;
//   user: AuthUser;
//   permissions: Permissions;
//   must_change_password: boolean;
// }

// /**
//  * Login user with email and password
//  */
// export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
//   const response = await fetch(`${API_BASE_URL}/auth/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(credentials),
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.error || data.message || 'Login failed');
//   }

//   return data;
// }

// /**
//  * Change password
//  */
// export async function changePasswordAPI(currentPassword: string, newPassword: string): Promise<{ message: string; token: string; user: AuthUser }> {
//   const token = getAuthToken();
  
//   const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify({ 
//       current_password: currentPassword, 
//       new_password: newPassword 
//     }),
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.error || data.message || 'Failed to change password');
//   }

//   return data;
// }

// /**
//  * Store auth token in localStorage
//  */
// export function setAuthToken(token: string): void {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('auth_token', token);
//   }
// }

// /**
//  * Get auth token from localStorage
//  */
// export function getAuthToken(): string | null {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('auth_token');
//   }
//   return null;
// }

// /**
//  * Remove auth token from localStorage
//  */
// export function removeAuthToken(): void {
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('auth_user');
//     localStorage.removeItem('auth_permissions');
//   }
// }

// /**
//  * Store user info in localStorage
//  */
// export function setAuthUser(user: AuthUser): void {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('auth_user', JSON.stringify(user));
//   }
// }

// /**
//  * Get user info from localStorage
//  */
// export function getAuthUser(): AuthUser | null {
//   if (typeof window !== 'undefined') {
//     const user = localStorage.getItem('auth_user');
//     return user ? JSON.parse(user) : null;
//   }
//   return null;
// }

// /**
//  * Store permissions in localStorage
//  */
// export function setAuthPermissions(permissions: Permissions): void {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('auth_permissions', JSON.stringify(permissions));
//   }
// }

// /**
//  * Get permissions from localStorage
//  */
// export function getAuthPermissions(): Permissions | null {
//   if (typeof window !== 'undefined') {
//     const permissions = localStorage.getItem('auth_permissions');
//     return permissions ? JSON.parse(permissions) : null;
//   }
//   return null;
// }

// /**
//  * Check if user is authenticated
//  */
// export function isAuthenticated(): boolean {
//   return !!getAuthToken();
// }

// /**
//  * Check if user has permission for an action
//  */
// export function hasPermission(resource: keyof Permissions, action: string): boolean {
//   const permissions = getAuthPermissions();
//   if (!permissions) return false;
//   return permissions[resource]?.includes(action) || false;
// }

// /**
//  * Check if user is admin
//  */
// export function isAdmin(): boolean {
//   const user = getAuthUser();
//   return user?.role === 'admin';
// }

// /**
//  * Logout user
//  */
// export function logout(): void {
//   removeAuthToken();
// }


// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';


// export interface LoginCredentials {
//   email: string;
//   password: string;
// }

// export interface LoginResponse {
//   message: string;
//   token: string;
//   user: {
//     name: string;
//     email: string;
//   };
// }

// export interface AuthUser {
//   name: string;
//   email: string;
// }

// /**
//  * Login user with email and password
//  */
// export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
//   const response = await fetch(`${API_BASE_URL}/auth/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(credentials),
//   });

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.message || 'Login failed');
//   }

//   return data;
// }

// /**
//  * Store auth token in localStorage
//  */
// export function setAuthToken(token: string): void {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('auth_token', token);
//   }
// }

// /**
//  * Get auth token from localStorage
//  */
// export function getAuthToken(): string | null {
//   if (typeof window !== 'undefined') {
//     return localStorage.getItem('auth_token');
//   }
//   return null;
// }

// /**
//  * Remove auth token from localStorage
//  */
// export function removeAuthToken(): void {
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem('auth_token');
//     localStorage.removeItem('auth_user');
//   }
// }

// /**
//  * Store user info in localStorage
//  */
// export function setAuthUser(user: AuthUser): void {
//   if (typeof window !== 'undefined') {
//     localStorage.setItem('auth_user', JSON.stringify(user));
//   }
// }

// /**
//  * Get user info from localStorage
//  */
// export function getAuthUser(): AuthUser | null {
//   if (typeof window !== 'undefined') {
//     const user = localStorage.getItem('auth_user');
//     return user ? JSON.parse(user) : null;
//   }
//   return null;
// }

// /**
//  * Check if user is authenticated
//  */
// export function isAuthenticated(): boolean {
//   return !!getAuthToken();
// }

// /**
//  * Logout user
//  */
// export function logout(): void {
//   removeAuthToken();
// }