"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
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

interface FoodEntry {
  id: string;
  description: string;
  amount: string;
  unit: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "other";
}

interface NutrientDonutChartProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  entries?: FoodEntry[]; // Food entries for showing breakdown on hover
}

export default function NutrientDonutChart({ label, current, goal, unit, color, entries = [] }: NutrientDonutChartProps) {
  const [showPopout, setShowPopout] = useState<boolean>(false);
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  const remaining = Math.max(goal - current, 0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Add an event handler for clicks as a fallback for touch devices
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPopout && popoutRef.current && !popoutRef.current.contains(event.target as Node) && 
          chartContainerRef.current && !chartContainerRef.current.contains(event.target as Node)) {
        setShowPopout(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopout]);

  // Handle window resize to update popout position
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render when window resizes to update popout position
      setShowPopout(showPopout);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [showPopout]);

  // Get relevant entries sorted by the nutrient value (descending)
  const sortedEntries = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    
    return [...entries].sort((a, b) => {
      const valueA = getNutrientValueByLabel(a, label);
      const valueB = getNutrientValueByLabel(b, label);
      return valueB - valueA;
    });
  }, [entries, label]);

  // Helper function to capitalize the first letter of each word
  function capitalizeWords(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to get the appropriate nutrient value based on label
  function getNutrientValueByLabel(entry: FoodEntry, label: string): number {
    switch (label.toLowerCase()) {
      case 'calories': return entry.calories;
      case 'protein': return entry.protein;
      case 'carbs': return entry.carbs;
      case 'fat': return entry.fat;
      default: return 0;
    }
  }
  
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

  const popoutRef = useRef<HTMLDivElement>(null);

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
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
    <div 
      className="mb-4 select-none flex-1 min-w-[150px] px-2 mx-1 bg-white rounded-lg shadow-sm p-3 relative"
      onMouseEnter={() => entries && entries.length > 0 && setShowPopout(true)}
      onMouseLeave={() => setShowPopout(false)}
      onClick={() => entries && entries.length > 0 && setShowPopout(!showPopout)}
      ref={chartContainerRef}
    >
      <div className="text-center mb-2">
        <span className="font-medium text-lg" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="h-[140px] relative">
        <div className="h-full w-full cursor-help">
          <Doughnut data={data} options={options} />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {Math.round(current)}
          </span>
          <span className="text-sm text-gray-500 font-bold">
            /{goal} {unit}
          </span>
        </div>
      </div>
      
      {/* Popout with entries breakdown */}
      {showPopout && (
        <div 
          ref={popoutRef}
          className="fixed z-50 w-80 max-h-[350px] overflow-y-auto bg-white rounded-md shadow-2xl border border-gray-300 p-3"
          style={{ 
            left: chartContainerRef.current ? 
              `${chartContainerRef.current.getBoundingClientRect().left + (chartContainerRef.current.offsetWidth / 2) - 160}px` : '50%',
            bottom: chartContainerRef.current ? 
              `${window.innerHeight - chartContainerRef.current.getBoundingClientRect().top + 20}px` : '50%'
          }}
        >
          {/* Arrow pointing down to the donut */}
          <div 
            className="absolute w-4 h-4 bg-white border-r border-b border-gray-300 transform rotate-45"
            style={{ 
              bottom: '-8px', 
              left: '50%', 
              marginLeft: '-8px',
              boxShadow: '2px 2px 2px rgba(0,0,0,0.1)'
            }}
          ></div>
          <h3 className="text-sm font-semibold p-2 border-b border-gray-200 mb-1" style={{ color }}>
            {capitalizeWords(label)} Breakdown
          </h3>
          
          {entries && entries.length > 0 ? (
            <ul className="divide-y divide-gray-100 overflow-y-auto">
              {sortedEntries.map((entry) => {
                const value = getNutrientValueByLabel(entry, label);
                if (value <= 0) return null; // Skip entries with no contribution
                
                const contribution = Math.round((value / (current || 1)) * 100); // Avoid division by zero
                
                return (
                  <li key={entry.id} className="py-2 px-2 flex items-center justify-between hover:bg-gray-50 rounded">
                    <div className="flex-1 truncate mr-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {capitalizeWords(entry.description)}
                      </span>
                    </div>
                    <div className="flex items-center whitespace-nowrap">
                      <span className="text-sm font-semibold" style={{ color }}>
                        {Math.round(value)} {unit}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({contribution}%)
                      </span>
                    </div>
                  </li>
                );
              })}
              {sortedEntries.filter(entry => getNutrientValueByLabel(entry, label) > 0).length === 0 && (
                <li className="py-4 text-center text-gray-500 text-sm">
                  No Entries Contribute To {capitalizeWords(label)}
                </li>
              )}
            </ul>
          ) : (
            <div className="py-4 text-center text-gray-500 text-sm">
              No Entries To Display
            </div>
          )}
        </div>
      )}
    </div>
  );
}
