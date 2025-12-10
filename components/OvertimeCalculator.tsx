import React, { useState } from 'react';
import { CalculatorIcon } from '@heroicons/react/24/outline';

export const OvertimeCalculator: React.FC = () => {
    const [basicSalary, setBasicSalary] = useState<number>(0);
    const [hours, setHours] = useState<number>(0);
    const [rate, setRate] = useState<number>(1.5);

    const hourlyRate = basicSalary / 30 / 8; // Assuming 30 days, 8 hours/day
    const overtimePay = hourlyRate * hours * rate;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <CalculatorIcon className="w-6 h-6 text-indigo-500" />
                <h3 className="font-bold text-black dark:text-white">Overtime Calculator</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Basic Salary (SAR)</label>
                    <input
                        type="number"
                        value={basicSalary || ''}
                        onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. 5000"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Overtime Hours</label>
                        <input
                            type="number"
                            value={hours || ''}
                            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. 5"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Rate Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-black dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Hourly Rate</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{hourlyRate > 0 ? hourlyRate.toFixed(2) : '0.00'} SAR</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm font-bold text-black dark:text-white">Total Overtime Pay</span>
                        <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">{overtimePay > 0 ? overtimePay.toFixed(2) : '0.00'} SAR</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
