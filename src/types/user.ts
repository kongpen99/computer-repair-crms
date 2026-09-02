export interface UserType {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "ADMIN" | "TECHNICIAN";
  departmentId?: string | null;
  department?: DepartmentType | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  userId: string;
  username: string;
  name: string;
  role: "ADMIN" | "TECHNICIAN";
  departmentId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
