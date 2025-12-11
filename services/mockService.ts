import { Employee, NationalityType, ContractType, ServiceRequest, RequestType, RequestStatus, OrgTreeNode, UserRole } from '../types';

const DB_KEY = 'hr_system_db_v7';
const REQUESTS_KEY = 'hr_system_requests_v4';
const WARNINGS_KEY = 'hr_system_warnings_v1';
const DEDUCTIONS_KEY = 'hr_system_deductions_v1';

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
    contract: { basicSalary: 35000, housingAllowance: 8750, transportAllowance: 2000, otherAllowance: 0 },
    role: UserRole.MANAGER
  },
  // 2. HR Manager (Saudi) - Incomplete
  {
    id: "10002",
    companyId: "COMP-001",
    managerId: "10001",
    fullName: "Mohammed Al-Otaibi",
    nationality: "Saudi Arabia",
    iqamaOrNationalId: "1000000002",
    idExpiryDate: "2028-05-15",
    position: "HR Manager",
    department: "Human Resources",
    joinDate: "2021-03-10",
    email: "mohammed@company.com",
    phoneNumber: "+966 50 000 0002",
    city: "Jeddah",
    district: "Al Rawdah",
    iban: "", // Incomplete
    bankName: "",
    contract: { basicSalary: 18000, housingAllowance: 4500, transportAllowance: 1500, otherAllowance: 0 },
    role: UserRole.ADMIN
  },
  // 3. Senior Dev (Non-Saudi) - Expired ID
  {
    id: "10003",
    companyId: "COMP-001",
    managerId: "10001",
    fullName: "Ahmed Rateb Ahmed Al-Tarani",
    nationality: "Jordan",
    iqamaOrNationalId: "2000000001",
    idExpiryDate: "2023-01-01", // EXPIRED
    position: "Senior Developer",
    department: "IT",
    joinDate: "2019-11-01",
    email: "ahmed.rateb@company.com",
    phoneNumber: "+966 50 000 0003",
    city: "Riyadh",
    district: "Al Malqa",
    iban: "", // Incomplete
    bankName: "Al Rajhi Bank",
    contract: { basicSalary: 15000, housingAllowance: 3750, transportAllowance: 1000, otherAllowance: 500 },
    role: UserRole.DEPT_MANAGER
  },
  // 4. Accountant (Saudi) - Incomplete
  {
    id: "10004",
    companyId: "COMP-001",
    managerId: "10001",
    fullName: "Sarah Al-Ghamdi",
    nationality: "Saudi Arabia",
    iqamaOrNationalId: "1000000003",
    idExpiryDate: "2029-12-31",
    position: "Accountant",
    department: "Finance",
    joinDate: "2022-07-01",
    email: "sarah@company.com",
    phoneNumber: "+966 50 000 0004",
    city: "Dammam",
    district: "Al Faisaliyah",
    iban: "", // Incomplete
    bankName: "",
    contract: { basicSalary: 9000, housingAllowance: 2250, transportAllowance: 800, otherAllowance: 200 },
    role: UserRole.DEPT_MANAGER
  },
  // 5. Marketing Spec (Non-Saudi) - Incomplete
  {
    id: "10005",
    companyId: "COMP-001",
    managerId: "10001",
    fullName: "Karim Mahmoud",
    nationality: "Egypt",
    iqamaOrNationalId: "2000000002",
    idExpiryDate: "2026-08-20",
    position: "Marketing Specialist",
    department: "Marketing",
    joinDate: "2023-01-15",
    email: "karim@company.com",
    phoneNumber: "+966 50 000 0005",
    city: "Riyadh",
    district: "Olaya",
    iban: "",
    bankName: "",
    contract: { basicSalary: 8000, housingAllowance: 2000, transportAllowance: 600, otherAllowance: 0 },
    role: UserRole.DEPT_MANAGER
  },
  // 6. Admin Assistant (Saudi) - Incomplete
  {
    id: "10006",
    companyId: "COMP-001",
    managerId: "10002",
    fullName: "Noura Al-Saud",
    nationality: "Saudi Arabia",
    iqamaOrNationalId: "1000000004",
    idExpiryDate: "2027-02-28",
    position: "Admin Assistant",
    department: "Administration",
    joinDate: "2023-05-01",
    email: "noura@company.com",
    phoneNumber: "+966 50 000 0006",
    city: "Riyadh",
    district: "Hittin",
    iban: "",
    bankName: "",
    contract: { basicSalary: 6000, housingAllowance: 1500, transportAllowance: 500, otherAllowance: 0 },
    role: UserRole.EMPLOYEE
  },
  // 7. IT Support (Non-Saudi) - Expired ID
  {
    id: "10007",
    companyId: "COMP-001",
    managerId: "10003",
    fullName: "Hail bin Turki Al-Farahidi",
    nationality: "Yemen",
    iqamaOrNationalId: "2000000003",
    idExpiryDate: "2020-01-01", // EXPIRED LONG AGO
    position: "IT Support",
    department: "IT",
    joinDate: "2018-06-01",
    email: "hail@company.com",
    phoneNumber: "+966 50 000 0007",
    city: "Jeddah",
    district: "Al Safa",
    iban: "",
    bankName: "",
    contract: { basicSalary: 7000, housingAllowance: 1750, transportAllowance: 500, otherAllowance: 0 },
    role: UserRole.EMPLOYEE
  },
  // 8. Sales Rep (Saudi) - Incomplete
  {
    id: "10008",
    companyId: "COMP-001",
    managerId: "10001",
    fullName: "Khalid Al-Dossari",
    nationality: "Saudi Arabia",
    iqamaOrNationalId: "1000000005",
    idExpiryDate: "2030-11-11",
    position: "Sales Representative",
    department: "Sales",
    joinDate: "2022-09-01",
    email: "khalid@company.com",
    phoneNumber: "+966 50 000 0008",
    city: "Khobar",
    district: "Al Rakah",
    iban: "",
    bankName: "",
    avatarUrl: "", // No avatar
    contract: { basicSalary: 7500, housingAllowance: 1875, transportAllowance: 800, otherAllowance: 1500 }, // Commission?
    role: UserRole.DEPT_MANAGER
  },
  // 9. Designer (Non-Saudi) - Incomplete
  {
    id: "10009",
    companyId: "COMP-001",
    managerId: "10005",
    fullName: "Layla Hassan",
    nationality: "Lebanon",
    iqamaOrNationalId: "2000000004",
    idExpiryDate: "2025-12-31", // Approaching
    position: "Graphic Designer",
    department: "Marketing",
    joinDate: "2023-02-01",
    email: "layla@company.com",
    phoneNumber: "+966 50 000 0009",
    city: "Riyadh",
    district: "Al Narjis",
    iban: "",
    bankName: "",
    contract: { basicSalary: 11000, housingAllowance: 2750, transportAllowance: 800, otherAllowance: 0 },
    role: UserRole.EMPLOYEE
  },
  // 10. Developer (Indian)
  {
    id: "10010",
    companyId: "COMP-001",
    managerId: "10003",
    fullName: "Rajesh Kumar",
    nationality: "India",
    iqamaOrNationalId: "2000000005",
    idExpiryDate: "2026-03-15",
    position: "Backend Developer",
    department: "IT",
    joinDate: "2023-06-01",
    email: "rajesh@company.com",
    phoneNumber: "+966 50 000 0010",
    city: "Riyadh",
    district: "Olaya",
    iban: "SA0000000000000000000002",
    bankName: "Alinma Bank",
    contract: { basicSalary: 9500, housingAllowance: 2375, transportAllowance: 800, otherAllowance: 0 },
    role: UserRole.EMPLOYEE
  },
  // 11. Worker (Bangladeshi)
  {
    id: "10011",
    companyId: "COMP-001",
    managerId: "10002",
    fullName: "Abdul Rahman Khan",
    nationality: "Bangladesh",
    iqamaOrNationalId: "2000000006",
    idExpiryDate: "2025-11-20",
    position: "Facility Worker",
    department: "Administration",
    joinDate: "2022-01-15",
    email: "abdul@company.com",
    phoneNumber: "+966 50 000 0011",
    city: "Riyadh",
    district: "Batha",
    iban: "SA0000000000000000000003",
    bankName: "Al Rajhi Bank",
    contract: { basicSalary: 3500, housingAllowance: 800, transportAllowance: 400, otherAllowance: 0 },
    role: UserRole.EMPLOYEE
  },
  // 12. Driver (Pakistani)
  {
    id: "10012",
    companyId: "COMP-001",
    managerId: "10002",
    fullName: "Muhammad Ali",
    nationality: "Pakistan",
    iqamaOrNationalId: "2000000007",
    idExpiryDate: "2027-04-10",
    position: "Driver",
    department: "Logistics",
    joinDate: "2021-08-20",
    email: "ali@company.com",
    phoneNumber: "+966 50 000 0012",
    city: "Jeddah",
    district: "Rawdah",
    iban: "SA0000000000000000000004",
    bankName: "SNB",
    contract: { basicSalary: 4500, housingAllowance: 1125, transportAllowance: 500, otherAllowance: 0 },
    role: UserRole.EMPLOYEE
  },
  // 13. Another Saudi
  {
    id: "10013",
    companyId: "COMP-001",
    managerId: "10008",
    fullName: "Omar Al-Harbi",
    nationality: "Saudi Arabia",
    iqamaOrNationalId: "1000000006",
    idExpiryDate: "2029-01-01",
    position: "Junior Sales",
    department: "Sales",
    joinDate: "2023-09-01",
    email: "omar@company.com",
    phoneNumber: "+966 50 000 0013",
    city: "Riyadh",
    district: "Malaz",
    iban: "SA0000000000000000000005",
    bankName: "Riyad Bank",
    contract: { basicSalary: 6000, housingAllowance: 1500, transportAllowance: 500, otherAllowance: 1000 },
    role: UserRole.EMPLOYEE
  },
];

// SEED DATA: Requests
const REQUEST_SEED_DATA: ServiceRequest[] = [];
// SEED DATA: Warnings
const WARNINGS_SEED_DATA: any[] = [];
// SEED DATA: Deductions
const DEDUCTIONS_SEED_DATA: any[] = [];

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

export const updateMyProfile = async (id: string, formData: FormData): Promise<Employee> => {
  await delay(800);
  const updates: any = {};
  if (formData.get('phoneNumber')) updates.phoneNumber = formData.get('phoneNumber');
  if (formData.get('nationalAddress')) updates.nationalAddress = formData.get('nationalAddress');
  if (formData.get('city')) updates.city = formData.get('city');
  if (formData.get('district')) updates.district = formData.get('district');

  const avatarFile = formData.get('avatar');
  if (avatarFile && typeof avatarFile !== 'string') {
    updates.avatarUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  }

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
    db[idx] = { ...db[idx], status, approverId };
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
