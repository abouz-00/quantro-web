"use client";

interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

export default function ProgressBar({ label, current, goal, unit, color }: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {Math.round(current)} / {goal} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}