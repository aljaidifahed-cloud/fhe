import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../contexts/LanguageContext';
import * as echarts from 'echarts';

// Mock Data for Payroll Trends
const data = [
    { month: 'Jan', cost: 150000 },
    { month: 'Feb', cost: 155000 },
    { month: 'Mar', cost: 152000 },
    { month: 'Apr', cost: 158000 },
    { month: 'May', cost: 160000 },
    { month: 'Jun', cost: 165000 },
    { month: 'Jul', cost: 162000 },
    { month: 'Aug', cost: 168439 }, // Current
    { month: 'Sep', cost: 172000 },
    { month: 'Oct', cost: 175000 },
    { month: 'Nov', cost: 178000 },
    { month: 'Dec', cost: 185000 },
];

interface CostChartProps {
    totalCost: string;
}

export const CostChart: React.FC<CostChartProps> = ({ totalCost }) => {
    const { t } = useLanguage();

    const option = {
        grid: { left: 0, right: 0, top: 0, bottom: 0 },
        xAxis: {
            type: 'category',
            data: data.map(d => t(`month_${d.month.toLowerCase()}` as any)),
            show: false
        },
        yAxis: {
            type: 'value',
            show: false
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#f8fafc' }
        },
        series: [
            {
                data: data.map(d => d.cost),
                type: 'bar',
                barWidth: '60%',
                itemStyle: {
                    borderRadius: [4, 4, 0, 0],
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#10B981' },
                        { offset: 1, color: 'rgba(16, 185, 129, 0.3)' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: '#059669'
                    }
                }
            }
        ]
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors relative overflow-hidden h-40 flex flex-col justify-between group hover:shadow-md duration-200">

            {/* Chart Background (Absolute) */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-auto">
                <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
            </div>

            {/* Content (Z-Index 10) */}
            <div className="relative z-10 pointer-events-none">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('monthly_cost')}</p>
                <h3 className="text-2xl font-bold text-black dark:text-white mt-1">{totalCost}</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded text-[10px] font-bold mr-2 rtl:ml-2">
                        +4.2%
                    </span>
                    {t('includes_gosi')}
                </p>
            </div>

        </div>
    );
};
