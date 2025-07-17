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

interface MacroChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

export default function MacroChart({ protein, carbs, fat }: MacroChartProps) {
  const data = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [
          protein * 4, // 4 calories per gram
          carbs * 4,   // 4 calories per gram
          fat * 9,     // 9 calories per gram
        ],
        backgroundColor: [
          '#7EE081',
          '#F0E15B',
          '#E55640'
        ],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return (
    <div className="h-[200px]">
      <Doughnut data={data} options={options} />
    </div>
  );
}