import React from 'react';
import Modal from './Modal';
import '../styles/EndDayModal.css';

function EndDayModal({ isOpen, onClose, tables, onConfirm }) {
  const totalEarnings = tables.reduce((sum, table) => sum + (table.totalCost || 0), 0);
  const activeTables = tables.filter(table => table.isActive);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="end-day-modal">
        <h2>Завершение дня</h2>
        
        {activeTables.length > 0 ? (
          <div className="warning-message">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Внимание! У вас есть активные столы. Они будут автоматически завершены.</p>
          </div>
        ) : null}

        <div className="daily-summary">
          <h3>Итоги дня:</h3>
          
          <div className="tables-summary">
            {tables.map(table => (
              <div key={table.id} className="table-summary">
                <h4>{table.name}</h4>
                <div className="summary-details">
                  <p>Выручка за игру: {table.totalCost || 0} ֏</p>
                  <p>Заказы: {table.orders?.reduce((sum, order) => sum + Number(order.price), 0) || 0} ֏</p>
                </div>
              </div>
            ))}
          </div>

          <div className="total-summary">
            <h3>Общая выручка за день: {totalEarnings} ֏</h3>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Подтвердить
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default EndDayModal; 