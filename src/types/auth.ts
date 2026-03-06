export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "DONOR" | "ADMIN" | "HOSPITAL" | string;
  hospitalName: string | null;
  cni: string | null;
  phone: string | null;
  birthDate: string | null;
  bloodType: string | null;
  city: string | null;
  district: string | null;
  authProvider: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserDto;
}

export interface RegisterDonorRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  cni: string;
  phone: string;
  birthDate?: string;
  bloodType?: string;
  city?: string;
  district?: string;
}

export interface LoginDonorRequestDto {
  email: string;
  password: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}
