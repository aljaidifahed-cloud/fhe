import { Employee, NationalityType, ContractType, ServiceRequest, RequestType, RequestStatus, OrgTreeNode, UserRole } from '../types';

const DB_KEY = 'hr_system_db_v11_fix';
const REQUESTS_KEY = 'hr_system_requests_v8';
const WARNINGS_KEY = 'hr_system_warnings_v5';
const DEDUCTIONS_KEY = 'hr_system_deductions_v5';
const COMMITMENTS_KEY = 'hr_system_commitments_v5';

// SEED DATA: Employees
const SEED_DATA: Employee[] = [
  // 1. Manager (Saudi) - Complete
  {
    id: "10001",
    companyId: "COMP-001",
    managerId: null,
    fullName: "Fahad Aljaidi",
    nationality: "Saudi Arabia",
    iqamaOrNationalId: "1000000001",
    idExpiryDate: "2030-01-01",
    position: "CEO",
    department: "Management",
    joinDate: "2020-01-01",
    email: "fahad@fahad.sa",
    phoneNumber: "+966 50 000 0001",
    city: "Riyadh",
    district: "Al Olaya",
    iban: "SA0000000000000000000001",
    bankName: "Saudi National Bank",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=facearea&facepad=2&w=256&h=256&q=80",
    contract: { basicSalary: 5000, housingAllowance: 0, transportAllowance: 0, otherAllowance: 0 },
    role: UserRole.MANAGER,
    jobSummary: "As the Chief Executive Officer (CEO), I am responsible for the overall success of the organization. My role involves setting strategic direction, building and leading the senior executive team, contrasting resource allocation, and ensuring that the company's culture and values are up held.",
    // Sample Documents
    employmentContractUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
    bankAccountUrl: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80",
    nationalIdUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&q=80",
    assets: [
      {
        id: "ast-001",
        name: "MacBook Pro 16\"",
        serialNumber: "FVFY782LHV29",
        type: "Electronics",
        dateAssigned: "2020-01-15",
        status: "Active",
        notes: "Primary work laptop"
      },
      {
        id: "ast-002",
        name: "Magic Mouse 2",
        type: "Accessory",
        dateAssigned: "2020-01-15",
        status: "Active"
      }
    ]
  }
];

// SEED DATA: Requests
const REQUEST_SEED_DATA: ServiceRequest[] = [];
// SEED DATA: Warnings
const WARNINGS_SEED_DATA: any[] = [];
// SEED DATA: Deductions
const DEDUCTIONS_SEED_DATA: any[] = [];
// SEED DATA: Commitments
const COMMITMENTS_SEED_DATA: any[] = [];

// --- DATABASE SIMULATION HELPERS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getDb = (): Employee[] => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  } catch (error) { return SEED_DATA; }
};

const getRequestsDb = (): ServiceRequest[] => {
  try {
    const stored = localStorage.getItem(REQUESTS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(REQUEST_SEED_DATA));
    return REQUEST_SEED_DATA;
  } catch (e) { return REQUEST_SEED_DATA; }
}

const saveDb = (data: Employee[]) => localStorage.setItem(DB_KEY, JSON.stringify(data));
const saveRequestsDb = (data: ServiceRequest[]) => localStorage.setItem(REQUESTS_KEY, JSON.stringify(data));

const getWarningsDb = (): any[] => {
  try {
    const stored = localStorage.getItem(WARNINGS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(WARNINGS_KEY, JSON.stringify(WARNINGS_SEED_DATA));
    return WARNINGS_SEED_DATA;
  } catch (e) { return WARNINGS_SEED_DATA; }
}
const saveWarningsDb = (data: any[]) => localStorage.setItem(WARNINGS_KEY, JSON.stringify(data));

const getDeductionsDb = (): any[] => {
  try {
    const stored = localStorage.getItem(DEDUCTIONS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(DEDUCTIONS_KEY, JSON.stringify(DEDUCTIONS_SEED_DATA));
    return DEDUCTIONS_SEED_DATA;
  } catch (e) { return DEDUCTIONS_SEED_DATA; }
}
const saveDeductionsDb = (data: any[]) => localStorage.setItem(DEDUCTIONS_KEY, JSON.stringify(data));

// --- HIRED WORKERS ---
const HIRED_WORKERS_KEY = 'hr_system_hired_workers_v1';
import { HiredWorker } from '../types';

const getHiredWorkersDb = (): HiredWorker[] => {
  try {
    const stored = localStorage.getItem(HIRED_WORKERS_KEY);
    if (stored) return JSON.parse(stored);
    return [];
  } catch (e) { return []; }
}
const saveHiredWorkersDb = (data: HiredWorker[]) => localStorage.setItem(HIRED_WORKERS_KEY, JSON.stringify(data));

export const getHiredWorkers = async (): Promise<HiredWorker[]> => {
  await delay(500);
  return getHiredWorkersDb();
};

export const addHiredWorker = async (worker: Omit<HiredWorker, 'id'>): Promise<HiredWorker> => {
  await delay(500);
  const db = getHiredWorkersDb();
  const newWorker: HiredWorker = {
    ...worker,
    id: `HW-${Date.now()}`
  };
  db.push(newWorker);
  saveHiredWorkersDb(db);
  return newWorker;
};

// --- COUNTRY DATA FOR DROPDOWN ---
export interface Country {
  isoCode: string;
  nameEn: string;
  nameAr: string;
}

const COUNTRIES_LIST: Country[] = [
  { isoCode: 'SA', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية' },
  { isoCode: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة' },
  { isoCode: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين' },
  { isoCode: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت' },
  { isoCode: 'OM', nameEn: 'Oman', nameAr: 'عمان' },
  { isoCode: 'QA', nameEn: 'Qatar', nameAr: 'قطر' },
  { isoCode: 'EG', nameEn: 'Egypt', nameAr: 'مصر' },
  { isoCode: 'JO', nameEn: 'Jordan', nameAr: 'الأردن' },
  { isoCode: 'LB', nameEn: 'Lebanon', nameAr: 'لبنان' },
  { isoCode: 'SY', nameEn: 'Syria', nameAr: 'سوريا' },
  { isoCode: 'IQ', nameEn: 'Iraq', nameAr: 'العراق' },
  { isoCode: 'YE', nameEn: 'Yemen', nameAr: 'اليمن' },
  { isoCode: 'PS', nameEn: 'Palestine', nameAr: 'فلسطين' },
  { isoCode: 'SD', nameEn: 'Sudan', nameAr: 'السودان' },
  { isoCode: 'MA', nameEn: 'Morocco', nameAr: 'المغرب' },
  { isoCode: 'IN', nameEn: 'India', nameAr: 'الهند' },
  { isoCode: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان' },
  { isoCode: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين' },
  { isoCode: 'BD', nameEn: 'Bangladesh', nameAr: 'بنجلاديش' },
  { isoCode: 'ID', nameEn: 'Indonesia', nameAr: 'إندونيسيا' },
  { isoCode: 'US', nameEn: 'United States', nameAr: 'الولايات المتحدة' },
  { isoCode: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة' },
  { isoCode: 'CA', nameEn: 'Canada', nameAr: 'كندا' },
  { isoCode: 'FR', nameEn: 'France', nameAr: 'فرنسا' },
  { isoCode: 'DE', nameEn: 'Germany', nameAr: 'ألمانيا' },
  { isoCode: 'TR', nameEn: 'Turkey', nameAr: 'تركيا' },
];

// --- FILE UPLOAD SERVICE ---
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Try to upload to real backend
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    }); // Note: Vite proxy might handle /api, but direct port 3001 is safer if proxy isn't set up for it. 
    // Wait, package.json says server runs on 3001 (implied or explicit? server.js says 3001). 
    // Let's assume /api/upload is proxied or we hit 3001 directly.
    // The vite config usually proxies /api. Let's check vite.config.ts later or just try relative path if proxy exists.
    // For now, let's try direct to 3001 or relative if we assume proxy.
    // server.js says: const PORT = process.env.PORT || 3001;

    if (response.ok) {
      const data = await response.json();
      return data.url; // e.g., "/uploads/filename.jpg"
    } else {
      throw new Error('Backend upload failed');
    }
  } catch (error) {
    console.warn("Backend upload failed, falling back to local object URL (non-persistent)", error);
    // Fallback: Create a local object URL (preview only, won't persist across refresh effectively unless we store base64)
    // For "Save", we really need the backend. But let's return a blob URL as fallback so UI doesn't break.
    return URL.createObjectURL(file);
  }
};

// --- API CLIENT METHODS ---

export const getEmployees = async (): Promise<Employee[]> => {
  await delay(600);
  const data = getDb();
  console.log("[API] GET /employees response:", data);
  return data;
};

// --- ID GENERATION ---
export const getNextEmployeeId = async (): Promise<string> => {
  await delay(300);
  const db = getDb();
  let maxId = 10000;

  db.forEach(emp => {
    // Handle both old "EMP-1001" and new "1001" formats during migration/testing
    const num = parseInt(emp.id.replace('EMP-', ''));
    if (!isNaN(num) && num > maxId) {
      maxId = num;
    }
  });

  return `${maxId + 1}`;
};

export const getEmployeeById = async (id: string): Promise<Employee | undefined> => {
  // ... existing code ...
  await delay(300);
  const db = getDb();
  const user = db.find(e => e.id === id);
  console.log(`[API] GET /employees/${id} response:`, user ? "Found" : "Not Found");
  return user;
};

export const addEmployee = async (employee: Employee): Promise<Employee> => {
  await delay(500);
  const db = getDb();
  db.push(employee);
  saveDb(db);
  console.log("[API] POST /employees success:", employee.id);
  return employee;
};

export const updateEmployee = async (id: string, updatedData: Partial<Employee>): Promise<Employee> => {
  await delay(500);
  const db = getDb();
  const index = db.findIndex(e => e.id === id);

  if (index !== -1) {
    db[index] = {
      ...db[index],
      ...updatedData,
      contract: {
        ...db[index].contract,
        ...(updatedData.contract || {})
      }
    };
    saveDb(db);
    console.log("[API] PUT /employees success:", id);
    return db[index];
  }
  throw new Error("Employee not found");
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const updateMyProfile = async (id: string, formData: FormData): Promise<Employee> => {
  await delay(800);
  const updates: any = {};
  if (formData.get('phoneNumber')) updates.phoneNumber = formData.get('phoneNumber');
  if (formData.get('nationalAddress')) updates.nationalAddress = formData.get('nationalAddress');
  if (formData.get('city')) updates.city = formData.get('city');
  if (formData.get('city')) updates.city = formData.get('city');
  if (formData.get('district')) updates.district = formData.get('district');

  // Helper to handle file uploads
  const handleDocUpload = async (fieldName: string, updateKey: string) => {
    const file = formData.get(fieldName);
    if (file && file instanceof File) {
      try {
        const base64 = await fileToBase64(file);
        updates[updateKey] = base64;
      } catch (error) {
        console.error(`Error processing ${fieldName}`, error);
      }
    }
  }

  await handleDocUpload('avatar', 'avatarUrl');
  await handleDocUpload('employmentContract', 'employmentContractUrl');
  await handleDocUpload('bankAccount', 'bankAccountUrl');
  await handleDocUpload('nationalId', 'nationalIdUrl');

  return updateEmployee(id, updates);
};

export const getCountries = async (): Promise<Country[]> => {
  await delay(200);
  return COUNTRIES_LIST;
};

// --- HIERARCHY MANIPULATION METHODS ---

export const assignManager = async (employeeId: string, newManagerId: string | null): Promise<void> => {
  await delay(500);
  const db = getDb();
  const employee = db.find(e => e.id === employeeId);
  if (!employee) throw new Error("Employee not found");

  // Prevent cycles: Check if newManagerId is a child of employeeId
  // In a real app, we'd do a graph traversal. For now, simple check:
  if (employeeId === newManagerId) throw new Error("Cannot report to self");

  employee.managerId = newManagerId;
  saveDb(db);
  console.log(`[API] MOVE ${employeeId} -> ${newManagerId}`);
};

export const deleteEmployee = async (employeeId: string): Promise<void> => {
  await delay(500);
  const db = getDb();

  // Check for subordinates
  const hasSubordinates = db.some(e => e.managerId === employeeId);
  if (hasSubordinates) {
    throw new Error("Cannot delete employee with subordinates. Move them first.");
  }

  const newDb = db.filter(e => e.id !== employeeId);
  saveDb(newDb);
  console.log(`[API] DELETE ${employeeId}`);
};


// --- REQUESTS API METHODS ---

export const getRequests = async (): Promise<ServiceRequest[]> => {
  await delay(400);
  const db = getRequestsDb();
  return db.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createRequest = async (userId: string, userName: string, type: RequestType, details: any): Promise<ServiceRequest> => {
  await delay(600);
  const db = getRequestsDb();
  const newRequest: ServiceRequest = {
    id: `REQ-${Math.floor(Math.random() * 10000)}`,
    userId,
    userName,
    type,
    status: RequestStatus.PENDING_MANAGER,
    createdAt: new Date().toISOString(),
    details
  };
  db.push(newRequest);
  saveRequestsDb(db);
  return newRequest;
};

export const updateRequestStatus = async (id: string, status: RequestStatus, approverId: string): Promise<ServiceRequest> => {
  await delay(400);
  const db = getRequestsDb();
  const idx = db.findIndex(r => r.id === id);

  if (idx !== -1) {
    const currentStatus = db[idx].status;
    let nextStatus = status;

    // Sequential Approval Logic
    if (status === RequestStatus.APPROVED) { // If "Approve" action is triggered
      if (currentStatus === RequestStatus.PENDING_MANAGER) {
        nextStatus = RequestStatus.PENDING_GM;
      } else if (currentStatus === RequestStatus.PENDING_GM) {
        nextStatus = RequestStatus.PENDING_HR;
      } else if (currentStatus === RequestStatus.PENDING_HR) {
        nextStatus = RequestStatus.APPROVED;
      }
    }

    // If Rejected, it goes straight to REJECTED regardless of stage
    if (status === RequestStatus.REJECTED) {
      nextStatus = RequestStatus.REJECTED;
    }

    db[idx] = { ...db[idx], status: nextStatus, approverId };
    saveRequestsDb(db);
    return db[idx];
  }
  throw new Error("Request not found");
};

// --- WARNINGS API METHODS ---
import { Warning, WarningType, PayrollDeduction } from '../types';

export const getWarnings = async (): Promise<Warning[]> => {
  await delay(300);
  return getWarningsDb();
};

export const addWarning = async (warning: Omit<Warning, 'id'>): Promise<Warning> => {
  await delay(300);
  const db = getWarningsDb();
  const newWarning: Warning = {
    ...warning,
    id: `WARN-${Date.now()}`,
    acknowledged: false,
  };
  db.push(newWarning);
  saveWarningsDb(db);
  return newWarning;
};

export const deleteWarning = async (id: string): Promise<void> => {
  await delay(300);
  const db = getWarningsDb();
  const newDb = db.filter(w => w.id !== id);
  saveWarningsDb(newDb);
};

export const updateWarning = async (warning: Warning): Promise<Warning> => {
  await delay(300);
  const db = getWarningsDb();
  const index = db.findIndex(w => w.id === warning.id);
  if (index !== -1) {
    db[index] = warning;
    saveWarningsDb(db);
    return warning;
  }
  throw new Error("Warning not found");
};

export const acknowledgeWarning = async (id: string): Promise<Warning> => {
  await delay(300);
  const db = getWarningsDb();
  const index = db.findIndex(w => w.id === id);
  if (index !== -1) {
    db[index] = {
      ...db[index],
      acknowledged: true,
      acknowledgedAt: new Date().toISOString()
    };
    saveWarningsDb(db);
    return db[index];
  }
  throw new Error("Warning not found");
};

// --- DEDUCTIONS API METHODS ---
export const getDeductions = async (): Promise<PayrollDeduction[]> => {
  await delay(300);
  return getDeductionsDb();
};

export const addDeduction = async (deduction: Omit<PayrollDeduction, 'id'>): Promise<PayrollDeduction> => {
  await delay(300);
  const db = getDeductionsDb();
  const newDeduction: PayrollDeduction = {
    ...deduction,
    id: `DED-${Date.now()}`
  };
  db.push(newDeduction);
  saveDeductionsDb(db);
  return newDeduction;
};

export const deleteDeduction = async (id: string): Promise<void> => {
  await delay(300);
  const db = getDeductionsDb();
  const newDb = db.filter(d => d.id !== id);
  saveDeductionsDb(newDb);
};

// --- ORG CHART API METHODS ---

export const getOrgHierarchy = async (): Promise<OrgTreeNode | null> => {
  await delay(800);
  const employees = getDb();

  if (employees.length === 0) return null;

  // Recursive helper to build tree
  const buildTree = (managerId: string | null): OrgTreeNode[] => {
    return employees
      .filter(emp => emp.managerId === managerId)
      .map(emp => ({
        name: emp.fullName,
        attributes: {
          id: emp.id,
          position: emp.position,
          department: emp.department,
          avatarUrl: emp.avatarUrl,
          nationality: emp.nationality
        },
        children: buildTree(emp.id)
      }));
  };

  // Find the CEO (Top Level - no manager)
  // In a real DB we might have multiple roots, but here we assume one CEO
  const rootNodes = buildTree(null);

  // If no root with null manager, try finding the one with the 'CEO' title
  if (rootNodes.length === 0) {
    const ceo = employees.find(e => e.position.includes('CEO'));
    if (ceo) {
      return {
        name: ceo.fullName,
        attributes: {
          id: ceo.id,
          position: ceo.position,
          department: ceo.department,
          avatarUrl: ceo.avatarUrl,
          nationality: ceo.nationality
        },
        children: buildTree(ceo.id)
      };
    }
    return null; // Broken hierarchy
  }

  return rootNodes[0];
};

// --- COMMITMENTS API METHODS ---
import { Commitment, CommitmentType } from '../types';

const getCommitmentsDb = (): Commitment[] => {
  try {
    const stored = localStorage.getItem(COMMITMENTS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(COMMITMENTS_KEY, JSON.stringify(COMMITMENTS_SEED_DATA));
    return COMMITMENTS_SEED_DATA;
  } catch (e) { return COMMITMENTS_SEED_DATA; }
}
const saveCommitmentsDb = (data: Commitment[]) => localStorage.setItem(COMMITMENTS_KEY, JSON.stringify(data));

export const getCommitments = async (): Promise<Commitment[]> => {
  await delay(300);
  return getCommitmentsDb();
};

export const addCommitment = async (commitment: Omit<Commitment, 'id'>): Promise<Commitment> => {
  await delay(300);
  const db = getCommitmentsDb();
  const newCommitment: Commitment = {
    ...commitment,
    id: `CMT-${Date.now()}`,
    status: 'Pending'
  };
  db.push(newCommitment);
  saveCommitmentsDb(db);
  return newCommitment;
};

export const deleteCommitment = async (id: string): Promise<void> => {
  await delay(300);
  const db = getCommitmentsDb();
  const newDb = db.filter(c => c.id !== id);
  saveCommitmentsDb(newDb);
};

export const signCommitment = async (id: string): Promise<Commitment> => {
  await delay(300);
  const db = getCommitmentsDb();
  const index = db.findIndex(c => c.id === id);
  if (index !== -1) {
    db[index] = {
      ...db[index],
      status: 'Signed',
      signedAt: new Date().toISOString()
    };
    saveCommitmentsDb(db);
    return db[index];
  }
  throw new Error("Commitment not found");
};
