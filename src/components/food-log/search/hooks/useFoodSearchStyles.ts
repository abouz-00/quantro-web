import { useEffect } from "react";

const MODAL_STYLES = `
  .food-search-modal .food-table-row {
    position: relative;
    background: white;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .food-search-modal .food-table-row:hover {
    background-color: #f9fafb;
  }
  
  .food-search-modal .food-table-row.selected {
    background-color: #f3f4f6 !important;
    border-left: 4px solid #7c3aed;
  }
`;

export const useFoodSearchStyles = () => {
  useEffect(() => {
    const styleId = 'food-search-modal-styles';
    
    // Check if styles already exist
    if (document.getElementById(styleId)) {
      return;
    }
    
    // Create and inject styles
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = MODAL_STYLES;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);
};
