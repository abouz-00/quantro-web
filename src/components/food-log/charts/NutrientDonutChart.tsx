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

import { FoodEntry, getNutrientValueByLabel as getNutrientValue } from '../../../types/foodEntry';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const popoutRef = useRef<HTMLDivElement>(null);
  
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

  const [popoutPosition, setPopoutPosition] = useState({ left: '50%', bottom: '50%' });

  // Update popout position
  const updatePopoutPosition = () => {
    if (chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      setPopoutPosition({
        left: `${rect.left + (rect.width / 2) - 160}px`,
        bottom: `${window.innerHeight - rect.top + 20}px`
      });
    }
  };

  // Handle window resize and scroll to update popout position
  useEffect(() => {
    if (showPopout) {
      updatePopoutPosition();
      
      const handleResizeOrScroll = () => {
        updatePopoutPosition();
      };

      window.addEventListener('resize', handleResizeOrScroll);
      window.addEventListener('scroll', handleResizeOrScroll, true);
      return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        window.removeEventListener('scroll', handleResizeOrScroll, true);
      };
    }
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
    return getNutrientValue(entry, label);
  }

  const remaining = Math.max(0, goal - current);
  
  const data = {
    labels: ['Current', 'Remaining'],
    datasets: [
      {
        data: [current, remaining],
        backgroundColor: [color, '#E5E7EB'],
        borderWidth: 0,
        hoverBackgroundColor: [color, '#E5E7EB'], // Prevent color change on hover
      }
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false, // Disable default tooltip since we're using our own
      }
    },
    elements: {
      arc: {
        hoverBorderWidth: 0, // Prevent border on hover
      }
    }
  };

  return (
    <div 
      className="mb-4 select-none flex-1 min-w-[150px] px-2 mx-1 bg-white rounded-lg p-3 relative"
      ref={chartContainerRef}
    >
      <div className="text-center mb-2">
        <span className="font-medium text-lg" style={{ color: '#2E2E2E' }}>
          {label}
        </span>
      </div>
      <div 
        className="h-[140px] relative"
        onMouseEnter={() => entries && entries.length > 0 && setShowPopout(true)}
        onMouseLeave={() => setShowPopout(false)}
      >
        <div className="h-full w-full cursor-help">
          <Doughnut data={data} options={options} />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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
          className="fixed z-50 w-80 max-h-[400px] overflow-hidden bg-white rounded-md shadow-2xl border border-gray-300 p-3"
          style={popoutPosition}
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
          <h3 className="text-xs font-bold p-2 mb-1 text-white" style={{ backgroundColor: '#2E2E2E' }}>
            {capitalizeWords(label)} Breakdown
          </h3>
          
          {entries && entries.length > 0 ? (
            <ul className="overflow-hidden">
              {sortedEntries.map((entry, index) => {
                const value = getNutrientValueByLabel(entry, label);
                if (value <= 0) return null; // Skip entries with no contribution
                
                const contribution = Math.round((value / (current || 1)) * 100); // Avoid division by zero
                
                return (
                  <li key={entry.id} className={`py-2 px-2 flex items-center justify-between rounded ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                    <div className="flex-1 truncate mr-2">
                      <span className="text-xs font-medium text-gray-900 truncate">
                        {capitalizeWords(entry.description)}
                      </span>
                    </div>
                    <div className="flex items-center whitespace-nowrap">
                      <span className="text-xs font-semibold" style={{ color }}>
                        {Math.round(value)} {unit}
                      </span>
                      <span className="text-[10px] text-gray-500 ml-1">
                        ({contribution}%)
                      </span>
                    </div>
                  </li>
                );
              })}
              {sortedEntries.filter(entry => getNutrientValueByLabel(entry, label) > 0).length === 0 && (
                <li className="py-4 text-center text-gray-500 text-xs">
                  No Entries Contribute To {capitalizeWords(label)}
                </li>
              )}
            </ul>
          ) : (
            <div className="py-4 text-center text-gray-500 text-xs">
              No Entries To Display
            </div>
          )}
        </div>
      )}
    </div>
  );
}
