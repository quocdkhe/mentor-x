export interface UserResponseDTO {
  id: string;
  name: string;
  phone?: string;
  email: string;
  avatar?: string;
  role: string;
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
