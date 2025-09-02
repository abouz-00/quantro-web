// src/components/landing/FeaturesSection.tsx
import React from 'react';
import { ChartPieIcon, BeakerIcon, CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { FeatureCard } from './FeatureCard';

export const FeaturesSection = () => {
  return (
    <div className="w-full max-w-7xl mb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        <FeatureCard
          icon={BeakerIcon}
          title="Smart Tracking"
          description="Intelligent food logging with comprehensive nutrition data and AI-powered insights"
          delay={0.2}
        />

        <FeatureCard
          icon={ChartPieIcon}
          title="Analytics"
          description="Detailed insights into your nutritional patterns with beautiful visualizations"
          delay={0.4}
        />

        <FeatureCard
          icon={CursorArrowRaysIcon}
          title="Goals"
          description="Personalized targets and progress tracking with smart recommendations"
          delay={0.6}
        />
      </div>
    </div>
  );
};
