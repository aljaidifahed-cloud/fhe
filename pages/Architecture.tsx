import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const Architecture: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-black dark:text-white">{t('sys_arch')}</h2>
        <p className="text-slate-500 mt-2">{t('tech_deliverables')}</p>
      </div>

      {/* Database Schema Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-black dark:text-white">{t('db_schema')}</h3>
          <p className="text-sm text-slate-500">{t('db_desc')}</p>
        </div>
        <div className="p-0 bg-[#1e293b] overflow-x-auto">
          <pre className="text-sm text-emerald-400 p-6 font-mono code-scroll" dir="ltr">
            {`-- Companies (Tenants)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Employees (Core Profile)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    first_name VARCHAR(100),
    nationality VARCHAR(50),
    iqama_national_id VARCHAR(20),
    -- ... other fields
    created_at TIMESTAMP DEFAULT NOW()
);

-- 🆕 UNIFIED REQUESTS ENGINE (Polymorphic Pattern)
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) NOT NULL,
    user_id UUID REFERENCES employees(id) NOT NULL,
    
    -- Request Classification
    type VARCHAR(50) NOT NULL CHECK (type IN ('LEAVE', 'ASSET', 'RESIGNATION', 'PUNCH_CORRECTION', 'LETTER')),
    
    -- Workflow Status
    status VARCHAR(50) DEFAULT 'PENDING_MANAGER' CHECK (status IN ('PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED')),
    
    -- 🚀 THE MAGIC COLUMN: JSONB for flexible data storage
    -- Leave: {"startDate": "2023-10-01", "endDate": "2023-10-05", "reason": "Sick"}
    -- Asset: {"itemName": "MacBook Pro", "justification": "New Hire"}
    details JSONB NOT NULL,
    
    approver_id UUID REFERENCES employees(id),
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- GIN Index for searching inside the JSONB column
CREATE INDEX idx_requests_details ON requests USING gin (details);
CREATE INDEX idx_requests_composite ON requests(company_id, status);`}
          </pre>
        </div>
      </section>

      {/* Backend Structure Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-black dark:text-white">{t('backend_struct')}</h3>
          <p className="text-sm text-slate-500">{t('backend_desc')}</p>
        </div>
        <div className="p-6 bg-slate-50 font-mono text-sm text-slate-700">
          <pre dir="ltr">{`src/
├── modules/
    ├── requests/            # 🆕 Request Module
    │   ├── requests.controller.ts
    │   ├── requests.service.ts
    │   ├── dto/
    │   │   ├── create-request.dto.ts # Validates 'type'
    │   │   ├── leave-details.dto.ts  # Validates JSON content
    │   │   └── asset-details.dto.ts
    │   └── guards/          # Workflow approval guards`}</pre>
        </div>
      </section>

      {/* API Endpoints Section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-black dark:text-white">{t('api_design')}</h3>
          <p className="text-sm text-slate-500">{t('api_desc')}</p>
        </div>
        <div className="p-0">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-bold text-slate-500 uppercase">{t('method')}</th>
                <th className="px-6 py-3 text-start text-xs font-bold text-slate-500 uppercase">{t('endpoint')}</th>
                <th className="px-6 py-3 text-start text-xs font-bold text-slate-500 uppercase">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-sm font-mono" dir="ltr">
              <tr>
                <td className="px-6 py-4 text-green-600 font-bold">GET</td>
                <td className="px-6 py-4">/requests</td>
                <td className="px-6 py-4 text-slate-600 font-sans">Get all requests. Supports filtering `?type=LEAVE&status=PENDING`.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-blue-600 font-bold">POST</td>
                <td className="px-6 py-4">/requests</td>
                <td className="px-6 py-4 text-slate-600 font-sans">Submit new request. Body contains `type` and `details` JSON.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-orange-600 font-bold">PATCH</td>
                <td className="px-6 py-4">/requests/:id/status</td>
                <td className="px-6 py-4 text-slate-600 font-sans">Manager/HR Approval action.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};