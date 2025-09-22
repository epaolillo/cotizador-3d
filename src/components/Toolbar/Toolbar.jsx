import React from 'react';
import ToolbarItem from '../ToolbarItem/ToolbarItem';
import { TOOLS_CONFIG } from '../../utils/constants';
import './Toolbar.css';

const Toolbar = ({
  selectedTool,
  onToolSelect
}) => {
  return (
    <div className="toolbar">
      <div className="toolbar__header">
        <h1 className="toolbar__title">STEINBACH</h1>
        <div className="toolbar__subtitle">Cotización en tiempo real</div>
      </div>
      <div className="toolbar__items">
        {TOOLS_CONFIG.map((tool) => (
          <ToolbarItem
            key={tool.id}
            tool={tool}
            isSelected={selectedTool === tool.id}
            onClick={onToolSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
