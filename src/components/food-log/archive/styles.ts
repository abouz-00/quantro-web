// Clean CSS styles for the food table

export const createTableStyles = () => {
  // Remove existing styles first
  const existingStyle = document.getElementById('food-table-drag-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = 'food-table-drag-styles';
  style.textContent = `
    .food-table-row {
      position: relative;
      background: white;
      cursor: pointer;
    }
    
    .food-table-row.selected {
      background-color: #E8D5E8 !important;
    }
    
    .food-table-row:hover:not(.selected):not(.dragging-item) {
      background-color: #f9fafb;
    }
    
    .food-table-row.dragging-item {
      background-color: #f3f4f6 !important;
      opacity: 0.8;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: move !important;
      z-index: 1000;
    }
    
    body.dragging {
      user-select: none;
    }
  `;
  
  document.head.appendChild(style);
};
