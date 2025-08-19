import React from "react";
import { FaTimes } from "react-icons/fa";

interface ModalLayoutProps {
  onClose: () => void;
  activeTab: "search" | "favorites" | "custom";
  setActiveTab: (tab: "search" | "favorites" | "custom") => void;
  children: React.ReactNode;
  bottomSection?: React.ReactNode;
}

export const ModalLayout: React.FC<ModalLayoutProps> = ({
  onClose,
  activeTab,
  setActiveTab,
  children,
  bottomSection
}) => {
  const TabButton = ({ 
    tab, 
    label 
  }: { 
    tab: "search" | "favorites" | "custom"; 
    label: string 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium cursor-pointer transition-colors duration-200 ${
        activeTab === tab 
          ? "bg-white text-violet-600 shadow-sm" 
          : "text-gray-600 hover:text-gray-800"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
    >
      <div
        className="bg-white rounded-sm shadow-xl h-[600px] max-h-[90vh] food-search-modal flex flex-col"
        style={{
          width: '60vw',
          minWidth: '320px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add Food</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-sm p-1">
            <TabButton tab="search" label="Search" />
            <TabButton tab="favorites" label="Favorites" />
            <TabButton tab="custom" label="Custom" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Bottom Section */}
        {bottomSection}
      </div>
    </div>
  );
};
