import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkforceData {
    name: string;
    value: number;
    color: string;
}

interface WorkforceChartProps {
    data: WorkforceData[];
    title: string;
    percentSaudi: number;
}

export const WorkforceChart: React.FC<WorkforceChartProps> = ({ data, title, percentSaudi }) => {
    const { t } = useLanguage();

    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(30, 41, 59, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#f8fafc' },
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 0,
            top: 'middle',
            icon: 'circle',
            textStyle: { color: '#94a3b8' } // Slate-400
        },
        series: [
            {
                name: 'Nationality',
                type: 'pie',
                radius: ['60%', '80%'], // Donut chart
                center: ['40%', '50%'], // Shift left to make room for legend
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#1e293b', // Matches dark bg of container for "gap" effect
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#fff'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data.map(item => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: { color: item.color }
                }))
            }
        ]
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-full transition-colors flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-white">{title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${percentSaudi >= 40 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {percentSaudi}% ({t('lbl_target')}: 40%)
                </span>
            </div>
            <div className="flex-1 min-h-[250px]">
                <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
            </div>
        </div>
    );
};
