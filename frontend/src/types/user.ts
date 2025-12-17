export interface UserResponseDTO {
  id: string;
  name: string;
  phone?: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface AdminCreateUser {
  name: string;
  phone?: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface RegisterDTO {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateProfile {
  name: string;
  phone: string;
  avatar: string;
  password?: string;
}

export interface GoogleLoginRequest {
  token: string | undefined;
}

// 1. Define the constant object
export const USER_ROLES = {
  ADMIN: "Admin",
  USER: "User",
  MENTOR: "Mentor",
} as const; // 'as const' makes the values read-only

// 2. Derive the type from the object (No need to write the strings twice!)
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
