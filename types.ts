

export enum Page {
  DASHBOARD = 'dashboard',
  EMPLOYEES = 'employees',
  ADD_EMPLOYEE = 'add_employee',
  EDIT_EMPLOYEE = 'edit_employee',
  PAYROLL = 'payroll',
  ATTENDANCE = 'attendance',
  ARCHITECTURE = 'architecture',
  PROFILE = 'profile',
  REQUESTS = 'requests',
  ORG_CHART = 'org_chart',
  PRIVATE = 'private',
  PERMISSIONS = 'permissions',
  INBOX = 'inbox',
  WARNINGS_COMMITMENTS = 'warnings_commitments',
  MY_WARNINGS = 'my_warnings',
  HIRED_LABOR = 'hired_labor'
}

export enum UserRole {
  MANAGER = 'MANAGER', // Owner
  ADMIN = 'ADMIN',     // Assistant Manager / System Admin
  DEPT_MANAGER = 'DEPT_MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum Permission {
  VIEW_ALL_EMPLOYEES = 'VIEW_ALL_EMPLOYEES',
  MANAGE_ALL_EMPLOYEES = 'MANAGE_ALL_EMPLOYEES', // Add/Edit/Delete anyone
  MANAGE_DEPT_EMPLOYEES = 'MANAGE_DEPT_EMPLOYEES', // Add/Edit own dept
  VIEW_SALARIES = 'VIEW_SALARIES',
  MANAGE_PAYROLL = 'MANAGE_PAYROLL',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  APPROVE_REQUESTS_FINAL = 'APPROVE_REQUESTS_FINAL',
  APPROVE_REQUESTS_INITIAL = 'APPROVE_REQUESTS_INITIAL',
  MANAGE_WARNINGS = 'MANAGE_WARNINGS',
  VIEW_ORG_CHART = 'VIEW_ORG_CHART'
}

export enum NationalityType {
  SAUDI = 'Saudi Arabia',
  NON_SAUDI = 'Non-Saudi'
}

export enum ContractType {
  FULL_TIME = 'Full Time',
  PART_TIME = 'Part Time'
}

export interface Employee {
  id: string;
  companyId: string;
  managerId?: string | null; // NEW: Self-referencing FK for Hierarchy
  fullName: string;
  nationality: string;
  iqamaOrNationalId: string;
  idExpiryDate: string;
  position: string;
  department: string;
  joinDate: string;
  email: string;
  iban: string;
  bankName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  nationalAddress?: string;
  city?: string;
  district?: string;
  contract: Contract;
  role: UserRole;
  permissions?: Record<string, boolean>;
  employmentContractUrl?: string; // New Document
  bankAccountUrl?: string;        // New Document
  nationalIdUrl?: string;         // New Document
  jobSummary?: string;            // New Job Info
  assets?: Asset[];               // New Custody/Assets
}

export interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  type: string;
  dateAssigned: string;
  status: 'Active' | 'Returned' | 'Lost';
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  limit: number;
  members: number;
  isTemporary: boolean;
  memberIds?: string[];
}

export interface Contract {
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
}

export interface PayrollRecord {
  employeeId: string;
  employeeName: string;
  basicSalary: number;
  totalAllowances: number;
  grossSalary: number;
  gosiDeductionEmployee: number;
  gosiDeductionEmployer: number;
  netSalary: number;
  isSaudi: boolean;
  absenceDeduction: number;
  penaltyDeduction: number;
  absenceReason?: string; // New
  penaltyReason?: string; // New
}

export interface DepartmentStat {
  name: string;
  value: number;
}

// --- NEW REQUEST ENGINE TYPES ---

export enum RequestType {
  LEAVE = 'LEAVE',
  ASSET = 'ASSET',
  LOAN = 'LOAN',
  PUNCH_CORRECTION = 'PUNCH_CORRECTION',
  CLEARANCE = 'CLEARANCE',
  RESIGNATION = 'RESIGNATION',
  CONTRACT_NON_RENEWAL = 'CONTRACT_NON_RENEWAL',
  AUTHORIZATION = 'AUTHORIZATION',
  LETTER = 'LETTER',
  PERMISSION = 'PERMISSION'
}

export enum RequestStatus {
  PENDING_MANAGER = 'PENDING_MANAGER',
  PENDING_GM = 'PENDING_GM',
  PENDING_HR = 'PENDING_HR',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// Discriminated Union for JSONB Details
// Discriminated Union for JSONB Details
export type RequestDetails =
  | { type: RequestType.LEAVE; leaveType: string; startDate: string; endDate: string; }
  | { type: RequestType.ASSET; itemName: string; serialNumber?: string; }
  | { type: RequestType.LOAN; amount: number; reason: string; }
  | { type: RequestType.PUNCH_CORRECTION; date: string; reason: string; }
  | { type: RequestType.CLEARANCE; lastWorkingDay: string; notes?: string; }
  | { type: RequestType.RESIGNATION; resignationDate: string; reason: string; }
  | { type: RequestType.CONTRACT_NON_RENEWAL; requestedDate: string; reason: string; }
  | { type: RequestType.AUTHORIZATION; delegateName: string; startDate: string; endDate: string; reason: string; }
  | { type: RequestType.LETTER; letterType: string; purpose: string; }
  | { type: RequestType.PERMISSION; date: string; startTime: string; endTime: string; reason: string; };

export interface ServiceRequest {
  id: string;
  userId: string;
  userName: string; // Denormalized for UI
  userAvatar?: string;
  type: RequestType;
  status: RequestStatus;
  details: any; // Using 'any' in frontend for flexibility, strict typing in backend DTOs
  createdAt: string;
  approverId?: string;
}

// --- ORG CHART TYPES ---
export interface OrgTreeNode {
  name: string;
  attributes: {
    id: string;
    position: string;
    department: string;
    avatarUrl?: string;
    nationality: string;
  };
  children: OrgTreeNode[];
}

// --- WARNINGS & COMMITMENTS ---

export enum WarningType {
  VERBAL = 'VERBAL',
  WRITTEN = 'WRITTEN',
  FINAL = 'FINAL',
  TERMINATION_NOTICE = 'TERMINATION_NOTICE'
}

export interface Warning {
  id: string;
  employeeId: string;
  date: string;
  type: WarningType;
  level: 'High' | 'Medium' | 'Low';
  description: string;
  status: 'Active' | 'Resolved' | 'Archived';
  managerId?: string; // Who issued it
  acknowledged?: boolean;
  acknowledgedAt?: string;
}

export interface PayrollDeduction {
  id: string;
  employeeId: string;
  month: string; // "YYYY-MM"
  type: 'ABSENCE' | 'PENALTY';
  amount: number;
  reason: string;
  createdAt: string;
}

export enum CommitmentType {
  GENERAL = 'GENERAL',
  SAFETY = 'SAFETY',
  CUSTODY = 'CUSTODY',
  ATTENDANCE = 'ATTENDANCE'
}

export interface Commitment {
  id: string;
  employeeId: string;
  type: CommitmentType;
  description: string;
  date: string; // Issue Date
  status: 'Pending' | 'Signed';
  signedAt?: string;
}

export interface HiredWorker {
  id: string;
  fullName: string;
  residencyNumber: string; // Iqama/ID
  employerName: string; // External company name
  jobTitle: string;
}
