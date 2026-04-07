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
import { FoodEntry, getNutrientValueByLabel } from '../../../types/food';

// Register Chart.js components conditionally to avoid errors in test environment
if (typeof ChartJS.register === 'function') {
  try {
    ChartJS.register(
      ArcElement,
      Tooltip,
      Legend
    );
  } catch (error) {
    // Chart.js components may already be registered in test environment
    console.warn('Chart.js registration failed:', error);
  }
}

interface MicronutrientDonutProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
  entries?: FoodEntry[]; // Food entries for showing breakdown on hover
}

export default function MicronutrientDonut({ label, current, goal, unit, color, entries = [] }: MicronutrientDonutProps) {
  const [showPopout, setShowPopout] = useState<boolean>(false);
  const [isPopoutMounted, setIsPopoutMounted] = useState<boolean>(false);
  const [isPopoutClosing, setIsPopoutClosing] = useState<boolean>(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const popoutRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpenPopout = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsPopoutClosing(false);
    setIsPopoutMounted(true);
    setShowPopout(true);
  };

  const handleClosePopout = () => {
    setIsPopoutClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setIsPopoutMounted(false);
      setIsPopoutClosing(false);
      setShowPopout(false);
    }, 150);
  };

  // Add an event handler for clicks as a fallback for touch devices
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPopoutMounted && popoutRef.current && !popoutRef.current.contains(event.target as Node) && 
          chartContainerRef.current && !chartContainerRef.current.contains(event.target as Node)) {
        handleClosePopout();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoutMounted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const [popoutPosition, setPopoutPosition] = useState({ left: '50%', bottom: '50%' });

  // Update popout position
  const updatePopoutPosition = () => {
    if (chartContainerRef.current) {
      const rect = chartContainerRef.current.getBoundingClientRect();
      setPopoutPosition({
        left: `${rect.left + (rect.width / 2) - 160}px`, // Updated for w-80 (320px / 2 = 160px)
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
    cutout: '65%',
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
      className="relative"
      ref={chartContainerRef}
    >
      {/* Chart title */}
      <div className="text-center mb-1">
        <span className="text-xs font-medium text-gray-700 leading-tight">
          {label}
        </span>
      </div>
      
      {/* Chart container */}
      <div 
        className="h-[80px] w-[80px] mx-auto relative"
        onMouseEnter={handleOpenPopout}
        onMouseLeave={handleClosePopout}
      >
        <div className="h-full w-full cursor-help">
          <Doughnut data={data} options={options} />
        </div>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-bold text-gray-600">
            {Math.min(Math.round((current / goal) * 100), 100)}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            %
          </span>
        </div>
      </div>

      {/* Proper popout with entries breakdown */}
      {isPopoutMounted && (
        <div 
          ref={popoutRef}
          className="fixed z-50 w-80 max-h-[500px] overflow-hidden bg-white rounded-md shadow-2xl border border-gray-300"
          style={{
            ...popoutPosition,
            transformOrigin: 'bottom center',
            animation: isPopoutClosing
              ? 'popoverOut 0.15s cubic-bezier(0.4, 0, 0.2, 1) forwards'
              : 'popoverIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Arrow pointing down to the donut */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
              filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))'
            }}
          />
          
          <h3 className="font-bold text-xs text-white px-3 py-2 rounded-t-md" style={{backgroundColor: color}}>
            {capitalizeWords(label)} Breakdown
          </h3>
          
          {entries && entries.length > 0 ? (
            <div className="p-3">
              <ul className="divide-y divide-gray-100 overflow-hidden">
                {sortedEntries.map((entry, index) => {
                  const value = getNutrientValueByLabel(entry, label);
                  if (value <= 0) return null; // Skip entries with no contribution
                  
                  return (
                    <li key={entry.id} className={`py-2 flex justify-between items-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {capitalizeWords(entry.description)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-2">
                        <span className="text-xs font-medium" style={{color: color}}>
                          {value.toFixed(1)} {unit}
                        </span>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {((value / goal) * 100).toFixed(0)}%
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
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500 text-xs">
              No Entries Contribute To {capitalizeWords(label)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}