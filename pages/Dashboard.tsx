import React, { useEffect, useState } from 'react';
import { NotificationBell } from '../components/NotificationBell';
import { getEmployees } from '../services/mockService';
import { Employee, NationalityType } from '../types';
import { calculatePayroll, formatCurrency } from '../utils/payrollUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../types';
import {
  UsersIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  ClockIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { CostChart } from '../components/CostChart';
import { WorkforceChart } from '../components/WorkforceChart';

// --- DND KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { SortableItem } from '../components/SortableItem';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  // --- WIDGET ORDER STATE ---
  // IDs correspond to the widgets we want to drag
  const [items, setItems] = useState([
    'total-employees',
    'monthly-cost',
    'pending-requests',
    'avg-salary',
    'workforce-chart',
    'expiry-alerts'
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags when clicking buttons
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    getEmployees().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );

  // --- CALCULATIONS ---
  const totalEmployees = employees.length;
  const saudiCount = employees.filter(e => e.nationality === NationalityType.SAUDI || e.nationality === 'Saudi Arabia' || e.nationality === 'المملكة العربية السعودية').length;
  const nonSaudiCount = totalEmployees - saudiCount;

  const totalPayrollCost = employees.reduce((acc, emp) => {
    if (!emp.contract) {
      console.error('Employee missing contract:', emp);
      return acc;
    }
    const payroll = calculatePayroll(emp);
    return acc + payroll.grossSalary + payroll.gosiDeductionEmployer;
  }, 0);

  const averageSalary = totalEmployees > 0 ? totalPayrollCost / totalEmployees : 0;

  const getDaysRemaining = (dateStr: string) => {
    if (!dateStr) return 999;
    const expiry = new Date(dateStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const expiryAlerts = employees
    .map(emp => ({ ...emp, daysRemaining: getDaysRemaining(emp.idExpiryDate) }))
    .filter(emp => emp.daysRemaining <= 90)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 5);

  const incompleteProfiles = employees.filter(e => !e.avatarUrl || !e.iban).length;

  // Chart Data
  const nationalityCounts: Record<string, number> = {};
  employees.forEach(emp => {
    const nat = emp.nationality || 'Unknown';
    nationalityCounts[nat] = (nationalityCounts[nat] || 0) + 1;
  });

  const NATIONALITY_COLORS: Record<string, string> = {
    'Saudi Arabia': '#10B981',
    'Egypt': '#3B82F6',
    'Jordan': '#F59E0B',
    'India': '#EC4899',
    'Pakistan': '#8B5CF6',
    'Bangladesh': '#06B6D4',
    'Philippines': '#14B8A6',
    'Yemen': '#EF4444',
    'Lebanon': '#6366F1',
    'Syria': '#F97316',
    'Sudan': '#84CC16',
    'United States': '#374151',
    'United Kingdom': '#4B5563',
  };

  const saudizationData = Object.entries(nationalityCounts)
    .map(([name, value]) => {
      let displayName = name;
      if (name === 'Saudi Arabia' || name === 'المملكة العربية السعودية') displayName = t('nationality_saudi');
      else if (name === 'Egypt') displayName = t('country_egypt');
      else if (name === 'Jordan') displayName = t('country_jordan');
      else if (name === 'India') displayName = t('country_india');
      else if (name === 'Pakistan') displayName = t('country_pakistan');
      else if (name === 'Bangladesh') displayName = t('country_bangladesh');
      else if (name === 'Philippines') displayName = t('country_philippines');
      else if (name === 'Yemen') displayName = t('country_yemen');
      else if (name === 'Lebanon') displayName = t('country_lebanon');
      else if (name === 'Syria') displayName = t('country_syria');
      else if (name === 'Sudan') displayName = t('country_sudan');
      else if (name === 'United States') displayName = t('country_us');
      else if (name === 'United Kingdom') displayName = t('country_uk');

      return {
        name: displayName,
        value,
        color: NATIONALITY_COLORS[name] || '#94A3B8'
      };
    })
    .sort((a, b) => b.value - a.value);

  // --- DRAG HANDLER ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- WIDGET RENDERER ---
  const renderWidget = (id: string) => {
    switch (id) {
      case 'total-employees':
        return (
          <MetricCard
            title={t('total_employees')}
            value={totalEmployees.toString()}
            subValue={`${totalEmployees > 0 ? Math.round((saudiCount / totalEmployees) * 100) : 0}% ${t('saudization')}`}
            icon={UsersIcon}
            color="blue"
          />
        );
      case 'monthly-cost':
        return (
          <CostChart
            totalCost={formatCurrency(totalPayrollCost, language === 'ar' ? 'ar-SA' : 'en-SA')}
            onClick={() => onNavigate(Page.PAYROLL)}
          />
        );
      case 'pending-requests':
        return (
          <MetricCard
            title={t('pending_requests')}
            value={incompleteProfiles.toString()}
            subValue={incompleteProfiles > 0 ? t('msg_incomplete_profiles') : t('msg_all_clear')}
            icon={DocumentCheckIcon}
            color={incompleteProfiles > 0 ? "amber" : "slate"}
          />
        );
      case 'avg-salary':
        return (
          <MetricCard
            title={t('avg_salary')}
            value={formatCurrency(averageSalary, language === 'ar' ? 'ar-SA' : 'en-SA')}
            subValue={t('per_employee')}
            icon={ClockIcon}
            color="purple"
          />
        );
      case 'workforce-chart':
        return (
          <WorkforceChart
            data={saudizationData}
            title={t('workforce_comp')}
            percentSaudi={totalEmployees > 0 ? Math.round((saudiCount / totalEmployees) * 100) : 0}
          />
        );
      case 'expiry-alerts':
        return (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-full transition-colors flex flex-col">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-black dark:text-white">{t('expiry_alerts')}</h3>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {expiryAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <CheckBadgeIcon className="w-12 h-12 mb-2 text-emerald-100 dark:text-emerald-900" />
                  <p className="text-sm">{t('msg_no_expiries')}</p>
                </div>
              ) : (
                expiryAlerts.map((emp) => {
                  const isExpired = emp.daysRemaining < 0;
                  return (
                    <div key={emp.id} className={`flex items-start space-x-3 rtl:space-x-reverse p-3 rounded-lg border transition-all hover:bg-opacity-80 ${isExpired ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30'}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isExpired ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">{emp.fullName}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {t('id_expires')} <span className="font-mono">{emp.idExpiryDate}</span>
                          </p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isExpired ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                            {isExpired ? t('status_expired') : `${emp.daysRemaining} ${t('suffix_days')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {expiryAlerts.length > 0 && (
              <button
                onClick={() => onNavigate(Page.EMPLOYEES)}
                className="w-full text-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-4 font-medium border-t border-slate-100 dark:border-slate-700 pt-3"
              >
                {t('view_all')}
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // --- GRID HELPERS ---
  const getGridSpan = (id: string) => {
    // Large charts take 2 columns on large screens
    if (id === 'workforce-chart' || id === 'expiry-alerts') {
      return 'col-span-1 md:col-span-2 lg:col-span-2';
    }
    // Metric cards take 1 column
    return 'col-span-1';
  };



  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-white transition-colors">{t('hr_dashboard')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('welcome_msg')}</p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse items-center">
          <NotificationBell />
          <div className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-2"></div>
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {t('download_report')}
          </button>
          <button
            onClick={() => onNavigate(Page.ADD_EMPLOYEE)}
            className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <UserPlusIcon className="w-5 h-5" />
            <span>{t('add_employee')}</span>
          </button>
        </div>
      </div>

      {/* DRAGGABLE GRID */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items}
          strategy={rectSortingStrategy}
        >
          {/* Grid Layout: Auto-flow but with some items spanning 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((id) => (
              <SortableItem key={id} id={id} className={getGridSpan(id)}>
                {renderWidget(id)}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const MetricCard: React.FC<{ title: string, value: string, subValue: string, icon: any, color: string }> = ({ title, value, subValue, icon: Icon, color }) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    slate: "bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400"
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-start justify-between transition-colors hover:shadow-md duration-200 h-full">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <h3 className="text-2xl font-bold text-black dark:text-white mt-1">{value}</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subValue}</p>
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};