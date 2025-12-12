-- Drop existing tables (Ordered by dependency)
DROP TABLE IF EXISTS vacations CASCADE;
DROP TABLE IF EXISTS assets_requests CASCADE;
DROP TABLE IF EXISTS advances_requests CASCADE;
DROP TABLE IF EXISTS attendance_correction_requests CASCADE;
DROP TABLE IF EXISTS clearance_requests CASCADE;
DROP TABLE IF EXISTS resignation_requests CASCADE;
DROP TABLE IF EXISTS contract_nonrenewal_requests CASCADE;
DROP TABLE IF EXISTS authorization_requests CASCADE;
DROP TABLE IF EXISTS letters_requests CASCADE;
DROP TABLE IF EXISTS permission_requests CASCADE;

DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS commitments CASCADE;
DROP TABLE IF EXISTS payroll_deductions CASCADE;
DROP TABLE IF EXISTS warnings CASCADE;
DROP TABLE IF EXISTS requests CASCADE; -- Dropping generic requests table
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- DEPARTMENTS Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- POSITIONS Table
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMPLOYEES Table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    employee_number TEXT UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    position_id INTEGER REFERENCES positions(id),
    hire_date DATE,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- MESSAGES Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES employees(id),
    receiver_id INTEGER REFERENCES employees(id),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ATTENDANCE Table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50), -- mobile, web, device
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1) طلبات الإجازات
CREATE TABLE vacations (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id), -- Added REFERENCES for safety
    type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 2) طلبات العهد
CREATE TABLE assets_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    item_name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 3) طلبات السلف
CREATE TABLE advances_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 4) تصحيح بصمة
CREATE TABLE attendance_correction_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 5) إخلاء طرف
CREATE TABLE clearance_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    last_working_day DATE NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 6) طلب استقالة
CREATE TABLE resignation_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    resignation_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 7) طلب عدم تجديد عقد
CREATE TABLE contract_nonrenewal_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 8) طلب تفويض
CREATE TABLE authorization_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    delegate_name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 9) الخطابات
CREATE TABLE letters_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    letter_type VARCHAR(150) NOT NULL,
    purpose TEXT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- 10) طلب استئذان
CREATE TABLE permission_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending'
);

-- WARNINGS Table
CREATE TABLE warnings (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    reason TEXT,
    warning_date DATE,
    created_by INTEGER REFERENCES employees(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- PAYROLL DEDUCTIONS Table (Updated keys to INTEGER)
CREATE TABLE payroll_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id INTEGER NOT NULL REFERENCES employees(id), -- Changed to INTEGER
    month VARCHAR(7) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- COMMITMENTS Table (Updated keys to INTEGER)
CREATE TABLE commitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id INTEGER NOT NULL REFERENCES employees(id), -- Changed to INTEGER
    type VARCHAR(50) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes

