import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/HistoryManager.css';

const ADMIN_PASSWORD = '33Olimot';

function HistoryManager({ history, updateHistory }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const handleClearHistory = () => {
    if (password !== ADMIN_PASSWORD) {
      setError('Неверный пароль');
      return;
    }

    const now = new Date();
    let filteredHistory = [...history];

    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHistory = history.filter(record => 
          new Date(record.date) > weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredHistory = history.filter(record => 
          new Date(record.date) > monthAgo
        );
        break;
      case 'all':
        filteredHistory = [];
        break;
      default:
        break;
    }

    updateHistory(filteredHistory);
    localStorage.setItem('history', JSON.stringify(filteredHistory));
    setIsModalOpen(false);
    setPassword('');
    setError('');
  };

  return (
    <>
      <button 
        className="clear-history-btn"
        onClick={() => setIsModalOpen(true)}
      >
        <i className="fas fa-trash-alt"></i>
        Очистить историю
      </button>

      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setPassword('');
        setError('');
      }}>
        <div className="history-manager-modal">
          <h2>Очистка истории</h2>
          
          <div className="period-select">
            <label>Выберите период для очистки:</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="week">Старше недели</option>
              <option value="month">Старше месяца</option>
              <option value="all">Всю историю</option>
            </select>
          </div>

          <div className="password-input">
            <label>Введите пароль администратора:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Пароль"
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-actions">
            <button 
              className="cancel-btn"
              onClick={() => {
                setIsModalOpen(false);
                setPassword('');
                setError('');
              }}
            >
              Отмена
            </button>
            <button 
              className="delete-btn"
              onClick={handleClearHistory}
            >
              Удалить
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default HistoryManager; 