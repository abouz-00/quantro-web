"use client";

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface NutrientDonutChartProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

export default function NutrientDonutChart({ label, current, goal, unit, color }: NutrientDonutChartProps) {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  const remaining = Math.max(goal - current, 0);
  
  const data = {
    labels: [label, 'Remaining'],
    datasets: [
      {
        data: [current, remaining],
        backgroundColor: [
          color,
          '#E5E7EB' // light gray for remaining
        ],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: () => '',
          label: function(context) {
            const value = context.raw as number;
            const isConsumed = context.dataIndex === 0;
            return isConsumed 
              ? `${label}: ${Math.round(value)} ${unit} (${percentage}%)` 
              : `Remaining: ${Math.round(value)} ${unit}`;
          }
        }
      }
    }
  };

  return (
    <div className="mb-2 select-none w-full md:w-1/4 min-w-[120px] px-2">
      <div className="text-center mb-1">
        <span className="font-medium text-base" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-[80px] relative">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>
            {Math.round(current)}
          </span>
          <span className="text-xs text-gray-500">
            /{goal} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
