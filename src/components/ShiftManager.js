import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/ShiftManager.css';

function ShiftManager({ currentShift, onStartShift, onEndShift, workers, updateWorkers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');

  const handleStartShift = () => {
    console.log('Starting shift...');
    console.log('Selected worker ID:', selectedWorker);
    console.log('Workers:', workers);

    if (selectedWorker && workers) {
      const worker = workers.find(w => w.id === selectedWorker);
      console.log('Found worker:', worker);

      if (worker) {
        const shiftData = {
          workerId: worker.id,
          workerName: worker.name,
          startTime: new Date().toISOString(),
          tables: []
        };
        console.log('Shift data:', shiftData);
        onStartShift(shiftData);
        localStorage.setItem('currentShift', JSON.stringify(shiftData));
      }
    }
  };

  const handleEndShift = () => {
    if (currentShift) {
      // Просто завершаем смену без скачивания файла
      onEndShift();
      localStorage.removeItem('currentShift');
      setSelectedWorker('');
    }
  };

  const handleAddWorker = () => {
    if (newWorker.trim()) {
      const worker = {
        id: Date.now().toString(),
        name: newWorker.trim()
      };
      const updatedWorkers = [...(workers || []), worker];
      updateWorkers(updatedWorkers);
      localStorage.setItem('workers', JSON.stringify(updatedWorkers));
      setNewWorker('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="shift-manager">
      {!currentShift ? (
        <div className="start-shift">
          <div className="worker-select">
            <select 
              value={selectedWorker} 
              onChange={(e) => setSelectedWorker(e.target.value)}
            >
              <option value="">Выберите работника</option>
              {workers && workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
            <button onClick={() => setIsModalOpen(true)}>
              <i className="fas fa-plus"></i> Добавить работника
            </button>
          </div>
          {selectedWorker && (
            <button 
              className="start-shift-btn"
              onClick={handleStartShift}
            >
              Начать смену
            </button>
          )}
        </div>
      ) : (
        <div className="current-shift">
          <div className="shift-info">
            <span className="worker-name">
              Работник: {currentShift.workerName}
            </span>
            <span className="shift-time">
              Начало смены: {new Date(currentShift.startTime).toLocaleTimeString()}
            </span>
          </div>
          <button 
            className="end-shift-btn"
            onClick={handleEndShift}
          >
            Завершить смену
          </button>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="add-worker-modal">
          <h2>Добавить работника</h2>
          <input
            type="text"
            value={newWorker}
            onChange={(e) => setNewWorker(e.target.value)}
            placeholder="Имя работника"
            autoFocus
          />
          <div className="modal-actions">
            <button onClick={() => setIsModalOpen(false)}>Отмена</button>
            <button onClick={handleAddWorker}>Добавить</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ShiftManager; 