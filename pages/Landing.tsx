import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { YouTubeBackground } from '../components/YouTubeBackground';
import { MoonLogo } from '../components/MoonLogo';
import {
  GlobeAltIcon,
  BanknotesIcon,
  ClockIcon,
  ShieldCheckIcon,
  StarIcon,
  UsersIcon,
  DocumentCheckIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface LandingProps {
  onLoginClick: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onLoginClick }) => {
  const { t, language, setLanguage } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Carousel Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden relative">

      {/* YouTube Background */}
      <YouTubeBackground />

      {/* Navbar */}
      <nav className="border-b border-white/10 bg-transparent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10">
                  <MoonLogo className="w-full h-full" />
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-yellow-100 transition-colors animate-float-text">
                MOON HR
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={toggleLanguage}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 backdrop-blur-md"
              >
                <GlobeAltIcon className="w-4 h-4 mr-2 rtl:ml-2" />
                {language === 'en' ? 'العربية' : 'English'}
              </button>
              <button
                onClick={onLoginClick}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-bold hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                {t('btn_login')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <div className="pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            <div className="inline-flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs font-medium mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>Enterprise Edition v2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg">
              {t('landing_hero_title')}
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10 leading-relaxed drop-shadow-md">
              {t('landing_hero_subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={onLoginClick} className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                {t('btn_get_started')}
              </button>
              <button className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                Book a Demo
              </button>
            </div>

            {/* Dynamic Dashboard Carousel */}
            <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl shadow-2xl border border-white/10 bg-[#0B1120]/90 backdrop-blur-xl overflow-hidden group h-[500px] flex flex-col">
              {/* Window Controls (Mac Style) */}
              <div className="absolute top-0 w-full h-11 bg-white/5 border-b border-white/5 flex justify-between items-center px-4 z-20">
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {currentSlide === 0 && 'dashboard.tsx'}
                  {currentSlide === 1 && 'employees_list.tsx'}
                  {currentSlide === 2 && 'payroll_engine.tsx'}
                </div>
              </div>

              {/* Content Area with Transitions */}
              <div className="relative flex-1 pt-14 pb-8 px-8 font-sans text-left overflow-hidden" dir="ltr">

                {/* Slide 1: Dashboard */}
                <div className={`absolute inset-0 pt-14 px-8 transition-opacity duration-700 ease-in-out ${currentSlide === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <SlideDashboard t={t} />
                </div>

                {/* Slide 2: Employees Directory */}
                <div className={`absolute inset-0 pt-14 px-8 transition-opacity duration-700 ease-in-out ${currentSlide === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <SlideEmployees t={t} />
                </div>

                {/* Slide 3: Payroll Processing */}
                <div className={`absolute inset-0 pt-14 px-8 transition-opacity duration-700 ease-in-out ${currentSlide === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <SlidePayroll t={t} />
                </div>

              </div>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-emerald-400 w-6' : 'bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>

              {/* Glow Overlay */}
              <div className="absolute -inset-1 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none z-30"></div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 relative z-10 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-sm font-bold text-cyan-400 tracking-widest uppercase mb-4">{t('trusted_by')}</p>
              <div className="flex justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="h-8 w-24 bg-white/20 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-white/20 rounded animate-pulse delay-100"></div>
                <div className="h-8 w-24 bg-white/20 rounded animate-pulse delay-200"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard
                icon={BanknotesIcon}
                title={t('feat_payroll_title')}
                desc={t('feat_payroll_desc')}
                delay="0"
              />
              <FeatureCard
                icon={ClockIcon}
                title={t('feat_attendance_title')}
                desc={t('feat_attendance_desc')}
                delay="100"
              />
              <FeatureCard
                icon={ShieldCheckIcon}
                title={t('feat_compliance_title')}
                desc={t('feat_compliance_desc')}
                delay="200"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/80 backdrop-blur-md py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 mr-2 rtl:ml-2">
              <MoonLogo className="w-full h-full" />
            </div>
            <span className="text-white font-bold text-lg animate-float-text">MOON HR</span>
          </div>
          <div className="text-sm text-slate-500">
            &copy; 2023 Tech Arabia. {t('footer_rights')}
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SLIDE COMPONENTS ---

const SlideDashboard = ({ t }: { t: any }) => (
  <div className="h-full flex flex-col">
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-xl font-bold text-white">{t('slide_dash_title')}</h3>
        <p className="text-slate-400 text-sm">{t('welcome_msg')}</p>
      </div>
      <div className="flex items-center space-x-3">
        <span className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
        </span>
        <span className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white border border-white/10 shadow-lg">TA</span>
      </div>
    </div>

    {/* Stats Row */}
    <div className="grid grid-cols-3 gap-5 mb-6">
      <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
        <p className="text-slate-400 text-[10px] uppercase font-bold">{t('employees')}</p>
        <h4 className="text-2xl font-bold text-white mt-1">1,245</h4>
        <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">+12%</span>
      </div>
      <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
        <p className="text-slate-400 text-[10px] uppercase font-bold">{t('payroll')} (SAR)</p>
        <h4 className="text-2xl font-bold text-white mt-1">4.2M</h4>
        <span className="text-slate-400 text-[10px] mt-1 block">{t('status_pending')}</span>
      </div>
      <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
        <p className="text-slate-400 text-[10px] uppercase font-bold">{t('compliance')}</p>
        <h4 className="text-2xl font-bold text-white mt-1">100%</h4>
        <span className="text-emerald-400 text-[10px] mt-1 block">{t('gosi_ready')}</span>
      </div>
    </div>

    {/* Chart Mock */}
    <div className="flex-1 bg-slate-800/40 p-4 rounded-xl border border-white/5 flex flex-col relative overflow-hidden">
      <h4 className="text-sm font-bold text-slate-300 mb-4">{t('payroll_trends')}</h4>
      <div className="flex-1 flex items-end justify-between px-2 space-x-3">
        {['J', 'F', 'M', 'A', 'M', 'J'].map((m, i) => (
          <div key={m} className="flex flex-col items-center w-full">
            <div className="w-full bg-emerald-500/30 rounded-t-sm" style={{ height: `${40 + Math.random() * 50}%` }}></div>
            <span className="text-[10px] text-slate-500 mt-2">{m}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SlideEmployees = ({ t }: { t: any }) => (
  <div className="h-full flex flex-col">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h3 className="text-xl font-bold text-white">{t('employee_directory')}</h3>
        <p className="text-slate-400 text-sm">{t('managing_files_count')}</p>
      </div>
      <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg font-medium">{t('new_hire')}</button>
    </div>

    <div className="bg-slate-800/40 rounded-xl border border-white/5 overflow-hidden flex-1">
      <div className="grid grid-cols-4 gap-4 p-3 bg-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <div className="col-span-2">{t('col_employee')}</div>
        <div>{t('role')}</div>
        <div>{t('col_status')}</div>
      </div>
      <div className="divide-y divide-white/5">
        {[
          { name: 'Ahmed Al-Farsi', role: 'HR Manager', status: 'Active', color: 'bg-blue-500' },
          { name: 'Sarah Smith', role: 'Developer', status: 'On Leave', color: 'bg-purple-500' },
          { name: 'Mohammed Iqbal', role: 'Driver', status: 'Active', color: 'bg-yellow-500' },
          { name: 'Fatima Al-Harbi', role: 'Accountant', status: 'Active', color: 'bg-pink-500' },
          { name: 'John Doe', role: 'Engineer', status: 'Active', color: 'bg-cyan-500' },
        ].map((emp, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-3 items-center hover:bg-white/5 transition-colors">
            <div className="col-span-2 flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${emp.color} flex items-center justify-center text-xs font-bold text-white`}>
                {emp.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{emp.name}</p>
                <p className="text-[10px] text-slate-500">ID: 100{i}</p>
              </div>
            </div>
            <div className="text-xs text-slate-300">{emp.role}</div>
            <div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${emp.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {emp.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SlidePayroll = ({ t }: { t: any }) => (
  <div className="h-full flex flex-col justify-center">
    <div className="text-center mb-8">
      <h3 className="text-2xl font-bold text-white">{t('payroll_processing')}</h3>
      <p className="text-slate-400 text-sm mt-1">October 2023 • {t('cycle_num')}</p>
    </div>

    <div className="max-w-md mx-auto w-full bg-slate-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">

      {/* Steps */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <CalculatorIcon className="w-5 h-5" />
            </div>
            <span className="text-slate-200 text-sm">{t('gosi_calcs')}</span>
          </div>
          <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <DocumentCheckIcon className="w-5 h-5" />
            </div>
            <span className="text-slate-200 text-sm">{t('allowances_deductions')}</span>
          </div>
          <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <span className="text-slate-200 text-sm">{t('net_salary_gen')}</span>
          </div>
          <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      <div className="my-6 border-t border-white/10"></div>

      <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-emerald-400 text-xs font-bold uppercase mb-1">{t('sama_ready')}</p>
          <p className="text-white text-sm font-mono">WPS_OCT23_10045.csv</p>
        </div>
        <button className="p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors">
          <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

// Simple icon for the payroll slide
const CalculatorIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const FeatureCard: React.FC<{ icon: any, title: string, desc: string, delay: string }> = ({ icon: Icon, title, desc, delay }) => (
  <div className={`flex flex-col items-center text-center p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm group`}>
    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{desc}</p>
  </div>
);
