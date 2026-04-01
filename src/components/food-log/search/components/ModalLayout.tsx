import React, { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

interface ModalLayoutProps {
  onClose: () => void;
  activeTab: "search" | "favorites" | "custom";
  setActiveTab: (tab: "search" | "favorites" | "custom") => void;
  children: React.ReactNode;
  bottomSection?: React.ReactNode;
}

// Move TabButton outside to avoid creating components during render
const TabButton = ({ 
  tab, 
  label,
  activeTab,
  setActiveTab
}: { 
  tab: "search" | "favorites" | "custom"; 
  label: string;
  activeTab: "search" | "favorites" | "custom";
  setActiveTab: (tab: "search" | "favorites" | "custom") => void;
}) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`flex-1 py-2 px-4 rounded-sm text-sm font-medium cursor-pointer transition-all duration-200 ${
      activeTab === tab 
        ? "bg-white text-violet-600 shadow-sm" 
        : "text-gray-700 hover:text-gray-900"
    }`}
  >
    {label}
  </button>
);

export const ModalLayout: React.FC<ModalLayoutProps> = ({
  onClose,
  activeTab,
  setActiveTab,
  children,
  bottomSection
}) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    // Save original styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;
    
    // Get current scroll position
    const scrollY = window.scrollY;
    
    // Lock body in place
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore body styles
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      document.body.style.overflow = originalBodyOverflow;
      
      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-modal-backdrop" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={(e) => {
        // Only close if clicking on the backdrop itself
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-sm shadow-xl h-[600px] max-h-[90vh] food-search-modal flex flex-col animate-modal-content"
        style={{
          width: '60vw',
          minWidth: '320px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
        onClick={(e) => e.stopPropagation()}
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
            <TabButton tab="search" label="Search" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton tab="favorites" label="Favorites" activeTab={activeTab} setActiveTab={setActiveTab} />
            <TabButton tab="custom" label="Custom" activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-hidden"
          style={{ minHeight: 0 }}
        >
          <div 
            className="h-full p-4"
            onWheel={(e) => {
              const target = e.currentTarget;
              const scrollTop = target.scrollTop;
              const scrollHeight = target.scrollHeight;
              const clientHeight = target.clientHeight;
              const wheelDelta = e.deltaY;
              
              // Prevent scroll chaining when at boundaries
              if ((wheelDelta < 0 && scrollTop === 0) || 
                  (wheelDelta > 0 && scrollTop + clientHeight >= scrollHeight)) {
                e.preventDefault();
              }
            }}
          >
            {children}
          </div>
        </div>

        {/* Bottom Section */}
        {bottomSection}
      </div>
    </div>
  );
};
