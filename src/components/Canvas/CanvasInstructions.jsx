import React, { useState } from 'react';
import './CanvasInstructions.css';

const CanvasInstructions = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleInstructions = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="canvas-instructions">
      <button 
        className="canvas-instructions__toggle"
        onClick={toggleInstructions}
        title="Mostrar/Ocultar instrucciones"
      >
        ?
      </button>
      
      {isVisible && (
        <div className="canvas-instructions__panel">
          <h3>Controles del Canvas</h3>
          <div className="canvas-instructions__controls">
            <div className="canvas-instructions__item">
              <strong>Click Izquierdo:</strong>
              <span>Aplicar herramienta seleccionada</span>
            </div>
            <div className="canvas-instructions__item">
              <strong>Click Derecho:</strong>
              <span>Pan (navegación infinita)</span>
            </div>
            <div className="canvas-instructions__item">
              <strong>Arrastrar:</strong>
              <span>Selección de área</span>
            </div>
            <div className="canvas-instructions__item">
              <strong>Herramienta Cerca:</strong>
              <span>Primer click: inicio, segundo click: final</span>
            </div>
            <div className="canvas-instructions__item">
              <strong>Tecla 'R' o 'Home':</strong>
              <span>Volver al centro</span>
            </div>
          </div>
          <button 
            className="canvas-instructions__close"
            onClick={() => setIsVisible(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default CanvasInstructions;
