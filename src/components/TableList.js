import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import EndGameModal from './EndGameModal';
import OrderModal from './OrderModal';

function TableList({ tables, addTable, menuItems, updateTable, history, updateHistory, updateMenuItem, currentShift }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    type: 'billiard',
    priceBeforeEvening: '',
    priceAfterEvening: '',
    description: ''
  });
  const [endGameModal, setEndGameModal] = useState({ isOpen: false, tableId: null });
  const [orderModal, setOrderModal] = useState({ isOpen: false, tableId: null });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, tableId: null });
  const [gameLimits, setGameLimits] = useState({});

  // Обновляем время каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      tables.forEach(table => {
        if (table.isActive) {
          const gameCost = calculateCost(table.startTime, table);
          const ordersCost = table.orders?.reduce((sum, order) => 
            sum + (Number(order.price) * (order.quantity || 1)), 0) || 0;
          const currentTotalCost = gameCost + ordersCost;

          // Если есть лимит и текущая стоимость превысила его
          if (gameLimits[table.id] && currentTotalCost >= gameLimits[table.id]) {
            // Сохраняем финальные значения
            const endTime = new Date();
            const duration = (endTime - new Date(table.startTime)) / (1000 * 3600);
            
            // Обновляем стол с финальными значениями
            const updatedTable = {
              ...table,
              isActive: false,
              endTime: endTime,
              duration: duration,
              gameCost: gameCost,
              totalCost: currentTotalCost
            };

            // Сохраняем обновленный стол
            updateTable(table.id, updatedTable);

            // Открываем модальное окно с финальными значениями
            setEndGameModal({ 
              isOpen: true, 
              tableId: table.id,
              finalData: {
                gameCost,
                ordersCost,
                totalCost: currentTotalCost,
                duration
              }
            });

            // Сбрасываем лимит
            setGameLimits(prev => ({
              ...prev,
              [table.id]: 0
            }));
          } else {
            updateTable(table.id);
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [tables, updateTable, gameLimits]);

  const calculateCost = (startTime, table) => {
    if (!startTime) return 0;
    
    const currentTime = new Date();
    const gameStartTime = new Date(startTime);
    const duration = (currentTime - gameStartTime) / 1000 / 3600; // в часах
    
    // Определяем цену за час в зависимости от времени начала игры
    const startHour = gameStartTime.getHours();
    const pricePerHour = startHour < 18 ? table.priceBeforeEvening : table.priceAfterEvening;
    
    return Math.round(duration * pricePerHour);
  };

  const formatDuration = (startTime) => {
    if (!startTime) return '0:00:00';
    const diff = Math.floor((currentTime - new Date(startTime)) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTable({
      ...newTable,
      startTime: null,
      orders: [],
      isActive: false,
      totalCost: 0
    });
    setIsModalOpen(false);
    setNewTable({
      name: '',
      type: 'billiard',
      priceBeforeEvening: '',
      priceAfterEvening: '',
      description: ''
    });
  };

  const handleStartGame = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    updateTable(tableId, {
      ...table,
      startTime: new Date(),
      isActive: true
    });
  };

  const handleStopGame = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    const endTime = new Date(); // Фиксируем время окончания
    const duration = (endTime - new Date(table.startTime)) / (1000 * 3600); // в часах
    
    // Рассчитываем финальную стоимость на момент остановки
    const startHour = new Date(table.startTime).getHours();
    const pricePerHour = startHour < 18 ? table.priceBeforeEvening : table.priceAfterEvening;
    const gameCost = Math.round(duration * pricePerHour);
    
    // Считаем стоимость заказов
    const ordersCost = table.orders?.reduce((sum, order) => 
      sum + (Number(order.price) * (order.quantity || 1)), 0) || 0;
    
    // Фиксируем финальную стоимость
    const finalCost = gameCost + ordersCost;

    // Обновляем стол с финальными значениями
    const updatedTable = {
      ...table,
      isActive: false,
      endTime: endTime,
      duration: duration,
      gameCost: gameCost,
      totalCost: finalCost
    };

    // Сохраняем обновленный стол
    updateTable(tableId, updatedTable);

    // Открываем модальное окно с финальными значениями
    setEndGameModal({ 
      isOpen: true, 
      tableId,
      finalData: {
        gameCost,
        ordersCost,
        totalCost: finalCost,
        duration
      }
    });
  };

  const addOrder = (tableId, item) => {
    const table = tables.find(t => t.id === tableId);
    const existingOrder = table.orders.find(order => order.name === item.name);

    if (existingOrder) {
      // Если заказ уже существует, увеличиваем количество
      updateTable(tableId, {
        ...table,
        orders: table.orders.map(order => 
          order.name === item.name 
            ? { ...order, quantity: (order.quantity || 1) + 1 }
            : order
        )
      });
    } else {
      // Если это новый заказ
      updateTable(tableId, {
        ...table,
        orders: [...table.orders, { ...item, id: Date.now(), quantity: 1 }]
      });
    }
  };

  const updateOrderQuantity = (tableId, orderId, newQuantity) => {
    const table = tables.find(t => t.id === tableId);
    const order = table.orders.find(o => o.id === orderId);
    const menuItem = menuItems.find(mi => mi.name === order.name);
    
    if (newQuantity > order.quantity) {
      // Проверяем, есть ли достаточно товара для увеличения
      const difference = newQuantity - order.quantity;
      if (!menuItem || menuItem.quantity < difference) {
        alert(`Недостаточно товара "${order.name}" на складе`);
        return;
      }
      // Уменьшаем количество в меню
      updateMenuItem(menuItem.id, {
        ...menuItem,
        quantity: menuItem.quantity - difference
      });
    } else if (newQuantity < order.quantity) {
      // Возвращаем товар на склад при уменьшении количества
      const difference = order.quantity - newQuantity;
      updateMenuItem(menuItem.id, {
        ...menuItem,
        quantity: menuItem.quantity + difference
      });
    }

    if (newQuantity <= 0) {
      // Удаляем заказ
      updateTable(tableId, {
        ...table,
        orders: table.orders.filter(o => o.id !== orderId)
      });
    } else {
      // Обновляем количество
      updateTable(tableId, {
        ...table,
        orders: table.orders.map(o =>
          o.id === orderId ? { ...o, quantity: newQuantity } : o
        )
      });
    }
  };

  const removeOrder = (tableId, orderId) => {
    const table = tables.find(t => t.id === tableId);
    const order = table.orders.find(o => o.id === orderId);
    const menuItem = menuItems.find(mi => mi.name === order.name);

    // Возвращаем товар на склад
    if (menuItem) {
      updateMenuItem(menuItem.id, {
        ...menuItem,
        quantity: menuItem.quantity + (order.quantity || 1)
      });
    }

    // Удаляем заказ
    updateTable(tableId, {
      ...table,
      orders: table.orders.filter(o => o.id !== orderId)
    });
  };

  const handleConfirmPayment = () => {
    const tableId = endGameModal.tableId;
    const table = tables.find(t => t.id === tableId);
    const finalData = endGameModal.finalData; // Используем сохраненные финальные данные
    
    // Получаем актуальную информацию о работнике из localStorage
    const currentShiftData = JSON.parse(localStorage.getItem('currentShift'));
    
    // Проверяем, есть ли запись за сегодняшний день
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = history.find(record => 
      record.date.split('T')[0] === today
    );

    let updatedHistory;
    if (todayRecord) {
      updatedHistory = history.map(record => {
        if (record.date.split('T')[0] === today) {
          return {
            ...record,
            workerName: currentShiftData?.workerName || 'Нет данных',
            workerId: currentShiftData?.workerId,
            tables: [...record.tables, {
              name: table.name,
              gameType: table.type,
              duration: finalData.duration.toFixed(2),
              gameCost: finalData.gameCost,
              orders: table.orders,
              totalCost: finalData.totalCost,
              workerName: currentShiftData?.workerName || 'Нет данных',
              workerId: currentShiftData?.workerId,
              closedAt: table.endTime.toISOString()
            }]
          };
        }
        return record;
      });
    } else {
      // Создаем новую запись за сегодня
      updatedHistory = [...history, {
        id: Date.now(),
        date: new Date().toISOString(),
        workerName: currentShiftData?.workerName || 'Нет данных',
        workerId: currentShiftData?.workerId,
        tables: [{
          name: table.name,
          gameType: table.type,
          duration: finalData.duration.toFixed(2),
          gameCost: finalData.gameCost,
          orders: table.orders,
          totalCost: finalData.totalCost,
          workerName: currentShiftData?.workerName || 'Нет данных',
          workerId: currentShiftData?.workerId,
          closedAt: table.endTime.toISOString()
        }]
      }];
    }

    // Сохраняем историю
    localStorage.setItem('history', JSON.stringify(updatedHistory));
    updateHistory(updatedHistory);

    // Сбрасываем состояние стола
    updateTable(tableId, {
      ...table,
      isActive: false,
      startTime: null,
      endTime: null,
      orders: [],
      totalCost: 0,
      duration: 0
    });

    setEndGameModal({ isOpen: false, tableId: null, finalData: null });
  };

  const handleAddOrder = (items) => {
    if (orderModal.tableId) {
      const table = tables.find(t => t.id === orderModal.tableId);
      const updatedOrders = [...table.orders];
      const updatedMenuItems = [...menuItems];
      
      items.forEach(item => {
        // Находим товар в меню
        const menuItem = updatedMenuItems.find(mi => mi.id === item.id);
        if (!menuItem || menuItem.quantity < item.quantity) {
          alert(`Недостаточно товара "${item.name}" на складе`);
          return;
        }

        // У��еньшаем количество в меню
        menuItem.quantity -= item.quantity;

        // Добавляем в заказы
        const existingOrder = updatedOrders.find(order => order.name === item.name);
        if (existingOrder) {
          existingOrder.quantity = (existingOrder.quantity || 1) + item.quantity;
        } else {
          updatedOrders.push({
            ...item,
            id: Date.now() + Math.random(),
          });
        }
      });

      // Обновляем стол и меню
      updateTable(orderModal.tableId, {
        ...table,
        orders: updatedOrders
      });

      // Обновляем количество товаров в меню
      updatedMenuItems.forEach(item => {
        updateMenuItem(item.id, item);
      });
    }
    setOrderModal({ isOpen: false, tableId: null });
  };

  const handleDeleteTable = (tableId) => {
    const updatedTables = tables.filter(table => table.id !== tableId);
    localStorage.setItem('tables', JSON.stringify(updatedTables));
    window.location.reload(); // Перезагружаем страницу для обновления списка
  };

  return (
    <div className="table-list">
      <button className="add-table-btn" onClick={() => setIsModalOpen(true)}>
        <span>+</span> Добавить новый стол
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="table-form">
          <h2>Создание нового стола</h2>
          
          <div className="form-group">
            <label>Название:</label>
            <input
              type="text"
              value={newTable.name}
              onChange={(e) => setNewTable({...newTable, name: e.target.value})}
              placeholder="Например: Бильярд 1"
              required
            />
          </div>

          <div className="form-group">
            <label>Тип:</label>
            <select
              value={newTable.type}
              onChange={(e) => setNewTable({...newTable, type: e.target.value})}
              required
            >
              <option value="billiard">Бильярд</option>
              <option value="ps">PlayStation</option>
              <option value="sales">Продажи</option>
            </select>
          </div>

          {newTable.type !== 'sales' && (
            <>
              <div className="form-group">
                <label>Цена за час (до 18:00):</label>
                <input
                  type="number"
                  value={newTable.priceBeforeEvening}
                  onChange={(e) => setNewTable({...newTable, priceBeforeEvening: e.target.value})}
                  placeholder="Стоимость в час до 18:00"
                  required={newTable.type !== 'sales'}
                />
              </div>

              <div className="form-group">
                <label>Цена за час (после 18:00):</label>
                <input
                  type="number"
                  value={newTable.priceAfterEvening}
                  onChange={(e) => setNewTable({...newTable, priceAfterEvening: e.target.value})}
                  placeholder="Стоимость в час после 18:00"
                  required={newTable.type !== 'sales'}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Описание:</label>
            <textarea
              value={newTable.description}
              onChange={(e) => setNewTable({...newTable, description: e.target.value})}
              placeholder="Дополнительная информация"
            />
          </div>

          <button type="submit" className="submit-btn">Создать стол</button>
        </form>
      </Modal>

      <div className="tables">
        {tables.map(table => (
          <div key={table.id} className="table-card">
            <div className="table-header">
              <h3>{table.name}</h3>
              <div className="table-header-actions">
                <span className={`table-status ${table.isActive ? 'active' : ''}`}>
                  {table.isActive ? 'Активен' : 'Свободен'}
                </span>
                {!table.isActive && (
                  <button 
                    className="delete-table-btn"
                    onClick={() => setDeleteConfirmModal({ isOpen: true, tableId: table.id })}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="table-info">
              <div className="info-item">
                <i className={`fas ${
                  table.type === 'billiard' 
                    ? 'fa-circle' 
                    : table.type === 'ps' 
                      ? 'fa-gamepad'
                      : 'fa-shopping-cart'
                }`}></i>
                <span>
                  {table.type === 'billiard' 
                    ? 'Бильярд' 
                    : table.type === 'ps' 
                      ? 'PlayStation'
                      : 'Продажи'
                  }
                </span>
              </div>
              
              {table.type !== 'sales' && (
                <>
                  {table.isActive && (
                    <div className="info-item time-active">
                      <i className="fas fa-clock"></i>
                      <span>
                        Активен: {formatDuration(table.startTime)}
                      </span>
                    </div>
                  )}
                  
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>
                      {table.startTime 
                        ? `Начало: ${new Date(table.startTime).toLocaleTimeString()}`
                        : 'Не активен'
                      }
                    </span>
                  </div>
                  
                  <div className="info-item cost">
                    <i className="fas fa-ruble-sign"></i>
                    <span>
                      {table.isActive 
                        ? `Текущая стоимость: ${calculateCost(table.startTime, table)} ֏`
                        : `${new Date().getHours() < 18 ? table.priceBeforeEvening : table.priceAfterEvening} ֏/час`
                      }
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="orders">
              <div className="orders-header">
                <h4>Заказы:</h4>
                <button 
                  className="add-order-btn"
                  onClick={() => setOrderModal({ isOpen: true, tableId: table.id })}
                >
                  <i className="fas fa-plus"></i> Добавить заказ
                </button>
              </div>
              <div className="orders-list">
                {table.orders.map(order => (
                  <div key={order.id} className="order-item">
                    {order.image && (
                      <div className="order-item-thumb">
                        <img src={order.image} alt={order.name} />
                      </div>
                    )}
                    <span className="order-name">{order.name}</span>
                    <div className="order-quantity-controls">
                      <button 
                        onClick={() => updateOrderQuantity(table.id, order.id, (order.quantity || 1) - 1)}
                      >
                        -
                      </button>
                      <span>{order.quantity || 1}</span>
                      <button 
                        onClick={() => updateOrderQuantity(table.id, order.id, (order.quantity || 1) + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="order-price">{order.price * (order.quantity || 1)} ֏</span>
                    <button 
                      className="remove-order-btn"
                      onClick={() => removeOrder(table.id, order.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="table-actions">
              {table.type !== 'sales' ? (
                !table.isActive ? (
                  <div className="game-start-controls">
                    <div className="limit-input">
                      <input
                        type="number"
                        placeholder="Лимит суммы"
                        value={gameLimits[table.id] || ''}
                        onChange={(e) => setGameLimits(prev => ({
                          ...prev,
                          [table.id]: Number(e.target.value)
                        }))}
                      />
                      <span className="limit-currency">֏</span>
                    </div>
                    <button 
                      className="start-btn"
                      onClick={() => handleStartGame(table.id)}
                    >
                      Начать игру
                    </button>
                  </div>
                ) : (
                  <div className="game-info">
                    {gameLimits[table.id] > 0 && (
                      <div className="limit-warning">
                        <i className="fas fa-clock"></i>
                        Лимит: {gameLimits[table.id]} ֏
                      </div>
                    )}
                    <button 
                      className="stop-btn"
                      onClick={() => handleStopGame(table.id)}
                    >
                      Завершить игру
                    </button>
                  </div>
                )
              ) : (
                <button 
                  className="pay-btn"
                  onClick={() => handleStopGame(table.id)}
                  disabled={!table.orders || table.orders.length === 0}
                >
                  Оплатить заказ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <EndGameModal
        isOpen={endGameModal.isOpen}
        onClose={() => setEndGameModal({ isOpen: false, tableId: null })}
        table={tables.find(t => t.id === endGameModal.tableId) || {}}
        onConfirm={handleConfirmPayment}
      />

      <OrderModal
        isOpen={orderModal.isOpen}
        onClose={() => setOrderModal({ isOpen: false, tableId: null })}
        menuItems={menuItems}
        onAddOrder={handleAddOrder}
      />

      <Modal 
        isOpen={deleteConfirmModal.isOpen} 
        onClose={() => setDeleteConfirmModal({ isOpen: false, tableId: null })}
      >
        <div className="delete-confirm-modal">
          <h2>Удаление стола</h2>
          <p>Вы уверены, что хотите удалить этот стол?</p>
          <div className="modal-actions">
            <button 
              className="cancel-btn"
              onClick={() => setDeleteConfirmModal({ isOpen: false, tableId: null })}
            >
              Отмена
            </button>
            <button 
              className="delete-btn"
              onClick={() => {
                handleDeleteTable(deleteConfirmModal.tableId);
                setDeleteConfirmModal({ isOpen: false, tableId: null });
              }}
            >
              Удалить
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TableList; 