import { Employee, PayrollRecord, NationalityType, PayrollDeduction } from '../types';

/**
 * Calculates the Net Salary and GOSI deductions based on Saudi Labor Law.
 * 
 * Rules:
 * - Saudi Nationals: 9.75% deduction from employee (Basic + Housing), 11.75% from employer.
 * - Non-Saudis: 0% deduction from employee, 2% (Occupational Hazards) from employer.
 * 
 * Note: GOSI is typically calculated on Basic + Housing. Transport is often excluded from GOSI base 
 * depending on specific company registration, but standard practice is Basic + Housing.
 */
export const calculatePayroll = (employee: Employee, deductions: PayrollDeduction[] = []): PayrollRecord => {
  const { basicSalary, housingAllowance, transportAllowance, otherAllowance } = employee.contract;

  const gosiBase = basicSalary + housingAllowance;

  // Update logic: Check for "Saudi Arabia" or Arabic equivalent
  const isSaudi = employee.nationality === 'Saudi Arabia' ||
    employee.nationality === 'المملكة العربية السعودية' ||
    employee.nationality === NationalityType.SAUDI;

  let gosiDeductionEmployee = 0;
  let gosiDeductionEmployer = 0;

  if (isSaudi) {
    // Saudi: 9% Annuities + 0.75% Unemployment (Saned) = 9.75%
    gosiDeductionEmployee = gosiBase * 0.0975;
    // Employer: 9% Annuities + 2% Hazards + 0.75% Unemployment = 11.75%
    gosiDeductionEmployer = gosiBase * 0.1175;
  } else {
    // Non-Saudi: Employee pays 0
    gosiDeductionEmployee = 0;
    // Employer: 2% Occupational Hazards
    gosiDeductionEmployer = gosiBase * 0.02;
  }

  // Sum up Deductions for this employee
  const employeeDeductions = deductions.filter(d => d.employeeId === employee.id);
  const absenceDeduction = employeeDeductions.filter(d => d.type === 'ABSENCE').reduce((sum, d) => sum + d.amount, 0);
  const penaltyDeduction = employeeDeductions.filter(d => d.type === 'PENALTY').reduce((sum, d) => sum + d.amount, 0);

  const totalAllowances = housingAllowance + transportAllowance + otherAllowance;
  const grossSalary = basicSalary + totalAllowances;
  const netSalary = grossSalary - gosiDeductionEmployee - absenceDeduction - penaltyDeduction;

  const absenceReason = employeeDeductions.filter(d => d.type === 'ABSENCE').map(d => d.reason).join(', ') || undefined;
  const penaltyReason = employeeDeductions.filter(d => d.type === 'PENALTY').map(d => d.reason).join(', ') || undefined;

  return {
    employeeId: employee.id,
    employeeName: employee.fullName,
    basicSalary,
    totalAllowances,
    grossSalary,
    gosiDeductionEmployee,
    gosiDeductionEmployer,
    netSalary,
    isSaudi,
    absenceDeduction,
    penaltyDeduction,
    absenceReason,
    penaltyReason
  };
};

/**
 * Generates a mock WPS (Wage Protection System) CSV content.
 * Real SAMA format is a specific fixed-width or CSV format (SIP format).
 * This is a simplified CSV representation for the MVP.
 */
export const generateWPSContent = (payrolls: PayrollRecord[], companyId: string, payDate: string): string => {
  const header = "Employee ID,IBAN,Employee Name,Basic Salary,Housing,Transport,Other,Deductions,Net Salary,Reference";
  const rows = payrolls.map(p => {
    return `${p.employeeId},SA5680000${Math.floor(Math.random() * 1000000000)},"${p.employeeName}",${p.basicSalary.toFixed(2)},${(p.totalAllowances).toFixed(2)},0,0,${p.gosiDeductionEmployee.toFixed(2)},${p.netSalary.toFixed(2)},SALARY-${payDate}`;
  });
  return [header, ...rows].join('\n');
};

export const formatCurrency = (amount: number, locale: string = 'en-SA') => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR' }).format(amount);
};