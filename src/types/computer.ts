import type { DepartmentType } from "./user";
import type { PaginatedResponse } from "./user";

export type { PaginatedResponse };

export interface ComputerType {
  id: string;
  assetCode: string;
  serialNumber?: string | null;
  computerName?: string | null;
  brand?: string | null;
  model?: string | null;
  cpu?: string | null;
  ram?: string | null;
  storage?: string | null;
  operatingSystem?: string | null;
  ipAddress?: string | null;
  macAddress?: string | null;
  departmentId?: string | null;
  department?: DepartmentType | null;
  location?: string | null;
  assignedUser?: string | null;
  purchaseDate?: Date | null;
  warrantyExpiry?: Date | null;
  status: "NORMAL" | "REPAIR" | "DAMAGED" | "RETIRED" | "LOST";
  remark?: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    repairs: number;
  };
}

export interface ComputerFormData {
  assetCode: string;
  serialNumber: string;
  computerName: string;
  brand: string;
  model: string;
  cpu: string;
  ram: string;
  storage: string;
  operatingSystem: string;
  ipAddress: string;
  macAddress: string;
  departmentId: string;
  location: string;
  assignedUser: string;
  purchaseDate: string;
  warrantyExpiry: string;
  status: string;
  remark: string;
}
