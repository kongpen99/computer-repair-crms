import type { DepartmentType, UserType } from "./user";
import type { ComputerType } from "./computer";

export interface RepairType {
  id: string;
  repairNo: string;
  computerId?: string | null;
  computer?: ComputerType | null;
  requesterName: string;
  departmentId?: string | null;
  department?: DepartmentType | null;
  location?: string | null;
  problemDescription: string;
  problemType: "HARDWARE" | "SOFTWARE" | "NETWORK" | "WINDOWS" | "PRINTER" | "VIRUS_MALWARE" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  technicianId?: string | null;
  technician?: UserType | null;
  receivedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  returnedAt?: Date | null;
  cause?: string | null;
  solution?: string | null;
  cost?: number | null;
  status: "WAITING" | "ASSIGNED" | "DIAGNOSING" | "REPAIRING" | "WAITING_PART" | "COMPLETED" | "RETURNED" | "CANCELLED";
  remark?: string | null;
  createdAt: Date;
  updatedAt: Date;
  histories?: RepairStatusHistoryType[];
  parts?: RepairPartType[];
  attachments?: RepairAttachmentType[];
}

export interface RepairStatusHistoryType {
  id: string;
  repairId: string;
  status: string;
  description?: string | null;
  changedBy?: string | null;
  user?: UserType | null;
  createdAt: Date;
}

export interface RepairPartType {
  id: string;
  repairId: string;
  partId: string;
  part?: PartType;
  quantity: number;
  price: number;
  total: number;
  createdAt: Date;
}

export interface RepairAttachmentType {
  id: string;
  repairId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  createdAt: Date;
}

export interface PartType {
  id: string;
  partCode: string;
  name: string;
  category?: string | null;
  brand?: string | null;
  model?: string | null;
  stock: number;
  minimumStock: number;
  unit?: string | null;
  price: number;
  supplier?: string | null;
  remark?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairFormData {
  computerId: string;
  requesterName: string;
  departmentId: string;
  location: string;
  problemDescription: string;
  problemType: string;
  priority: string;
  technicianId: string;
  cost: string;
  remark: string;
}

export interface RepairUpdateFormData {
  status: string;
  technicianId: string;
  cause: string;
  solution: string;
  cost: string;
  remark: string;
}
