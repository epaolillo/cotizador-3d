import React from 'react';
import './ToolbarItem.css';

const ToolbarItem = ({
  tool,
  isSelected,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(tool.id);
    }
  };

  return (
    <div
      className={`toolbar-item ${isSelected ? 'toolbar-item--selected' : ''}`}
      onClick={handleClick}
    >
      <div className={`toolbar-item__icon toolbar-item__icon--${tool.icon}`} />
      <span className="toolbar-item__label">{tool.name}</span>
    </div>
  );
};

export default ToolbarItem;
