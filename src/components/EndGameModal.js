import React from 'react';
import Modal from './Modal';

function EndGameModal({ isOpen, onClose, table, onConfirm }) {
  const gameCost = table.totalCost || 0;
  const ordersCost = table.orders?.reduce((sum, order) => 
    sum + (Number(order.price) * (order.quantity || 1)), 0) || 0;
  const totalCost = gameCost + ordersCost;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="end-game-modal">
        <h2>Завершение игры</h2>
        
        <div className="game-summary">
          <div className="summary-item">
            <h4>Детали заказа:</h4>
            <div className="cost-details">
              <div className="cost-row">
                <span>Стоимость игры:</span>
                <span className="cost-value">{gameCost} ֏</span>
              </div>
              <div className="cost-row">
                <span>Доп. заказы:</span>
                <span className="cost-value">{ordersCost} ֏</span>
              </div>
            </div>
          </div>

          <div className="total-amount">
            <div className="total-amount-inner">
              <h3>Итого к оплате:</h3>
              <span className="total-cost">{totalCost} ֏</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            Принять оплату
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default EndGameModal; 