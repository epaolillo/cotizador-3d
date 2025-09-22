import React from 'react';
import { formatPrice, formatNumber } from '../../utils/budgetUtils';
import './BudgetPanel.css';

const BudgetPanel = ({ budget }) => {
  const hasItems = Object.keys(budget.items).length > 0;

  return (
    <div className="budget-panel">
      <div className="budget-panel__header">
        <h2 className="budget-panel__title">PRESUPUESTO</h2>
      </div>
      
      <div className="budget-panel__items">
        {hasItems ? (
          Object.entries(budget.items).map(([type, item]) => (
            <div key={type} className="budget-item">
              <div className="budget-item__description">
                <span className="budget-item__name">{item.name}</span>
                <span className="budget-item__quantity">
                  {formatNumber(item.quantity)} {item.unit}
                </span>
              </div>
              <div className="budget-item__price">
                <span className="budget-item__unit-price">
                  {formatPrice(item.price)}/{item.unit}
                </span>
                <span className="budget-item__total-price">
                  {formatPrice(item.total)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="budget-panel__empty">
            <p>Selecciona herramientas y dibuja en el canvas para ver el presupuesto</p>
          </div>
        )}
      </div>

      {hasItems && (
        <div className="budget-panel__total">
          <span>TOTAL</span>
          <span>{formatPrice(budget.total)}</span>
        </div>
      )}
    </div>
  );
};

export default BudgetPanel;
