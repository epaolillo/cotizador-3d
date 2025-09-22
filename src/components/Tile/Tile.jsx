import React from 'react';
import { TOOLS_CONFIG } from '../../utils/constants';
import './Tile.css';

const Tile = ({
  cell,
  topLayer,
  fences,
  isSelected,
  isInSelection,
  onMouseDown,
  onMouseEnter,
  onMouseUp
}) => {
  // Get tool configuration for the top layer
  const layerConfig = topLayer ? TOOLS_CONFIG.find(tool => tool.id === topLayer) : null;

  // Handle mouse events
  const handleMouseDown = (event) => {
    event.preventDefault();
    if (onMouseDown) {
      onMouseDown(cell, event);
    }
  };

  const handleMouseEnter = (event) => {
    if (onMouseEnter) {
      onMouseEnter(cell, event);
    }
  };

  const handleMouseUp = (event) => {
    if (onMouseUp) {
      onMouseUp(cell, event);
    }
  };

  return (
    <div
      className={`tile ${topLayer ? `tile--${topLayer}` : ''} ${
        isSelected ? 'tile--selected' : ''
      } ${isInSelection ? 'tile--in-selection' : ''}`}
      style={{
        left: `${cell.style.left}px`,
        top: `${cell.style.top}px`,
        width: `${cell.style.width}px`,
        height: `${cell.style.height}px`
      }}
      data-x={cell.x}
      data-y={cell.y}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
    >
      {/* 3D Layer Structure */}
      {layerConfig && layerConfig.layer && (
        <div className="tile__layer-container">
          <div
            className="tile__layer-top"
            style={{
              background: layerConfig.layer.colors.top
            }}
          />
          <div
            className="tile__layer-front"
            style={{
              background: layerConfig.layer.colors.sides,
              height: `${layerConfig.layer.height}px`
            }}
          />
          <div
            className="tile__layer-side"
            style={{
              background: layerConfig.layer.colors.sides,
              width: `${layerConfig.layer.height}px`
            }}
          />
        </div>
      )}

      {/* Fence Elements */}
      {fences.map((fence) => (
        <div
          key={fence.id}
          className={`tile__fence tile__fence--${fence.orientation}`}
        />
      ))}

      {/* Selection Preview */}
      {isInSelection && <div className="tile__selection-preview" />}
    </div>
  );
};

export default Tile;
