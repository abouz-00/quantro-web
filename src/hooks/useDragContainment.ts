import { useEffect } from 'react';

export const useDragContainment = () => {
  useEffect(() => {
    const handleGlobalDragStart = (e: DragEvent) => {
      // Check if this drag originates from our food table
      const target = e.target as HTMLElement;
      const foodTableContainer = document.querySelector('.food-table-container');
      
      if (foodTableContainer && !foodTableContainer.contains(target)) {
        // Drag started outside food table, allow it
        return;
      }
      
      // This is a food table drag - set up strict boundary enforcement
      const handleGlobalDragOver = (dragEvent: DragEvent) => {
        if (!foodTableContainer) return;
        
        const containerRect = foodTableContainer.getBoundingClientRect();
        const isOutside = 
          dragEvent.clientX < containerRect.left ||
          dragEvent.clientX > containerRect.right ||
          dragEvent.clientY < containerRect.top ||
          dragEvent.clientY > containerRect.bottom;
        
        if (isOutside) {
          dragEvent.preventDefault();
          dragEvent.stopPropagation();
          document.body.style.cursor = 'not-allowed';
        }
      };
      
      const handleGlobalDrop = (dropEvent: DragEvent) => {
        if (!foodTableContainer) return;
        
        const containerRect = foodTableContainer.getBoundingClientRect();
        const isOutside = 
          dropEvent.clientX < containerRect.left ||
          dropEvent.clientX > containerRect.right ||
          dropEvent.clientY < containerRect.top ||
          dropEvent.clientY > containerRect.bottom;
        
        if (isOutside) {
          dropEvent.preventDefault();
          dropEvent.stopPropagation();
        }
        
        // Cleanup
        document.removeEventListener('dragover', handleGlobalDragOver);
        document.removeEventListener('drop', handleGlobalDrop);
        document.body.style.cursor = '';
      };
      
      document.addEventListener('dragover', handleGlobalDragOver);
      document.addEventListener('drop', handleGlobalDrop);
    };
    
    document.addEventListener('dragstart', handleGlobalDragStart);
    
    return () => {
      document.removeEventListener('dragstart', handleGlobalDragStart);
    };
  }, []);
};
