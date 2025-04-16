// src/types/auth.ts
  
  // src/config/permission.ts
  export const ROLES = {
    ADMIN: 'Admin',
    STUDENT: 'Student',
    WARDEN: 'warden',
    STAFF: 'staff'
  } as const;
  
  export type Role = typeof ROLES[keyof typeof ROLES];
  
  export const ROLE_REDIRECTS: Record<Role, string> = {
    [ROLES.ADMIN]: '/admin/dashboard',
    [ROLES.STUDENT]: '/student/dashboard',
    [ROLES.WARDEN]: '/warden/dashboard',
    [ROLES.STAFF]: '/staff/dashboard'
  };

  export const isValidRole = (role: string): role is Role => {
    return Object.values(ROLES).includes(role as Role);
  };