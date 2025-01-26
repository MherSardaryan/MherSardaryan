import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/OrderModal.css';

function OrderModal({ isOpen, onClose, menuItems, onAddOrder }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItems, setSelectedItems] = useState({});

  // Группировка товаров по категориям
  const groupedItems = menuItems.reduce((groups, item) => {
    const category = item.category || 'Прочее';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const currentQuantity = prev[item.id]?.quantity || 0;
      if (currentQuantity === 0) {
        return {
          ...prev,
          [item.id]: { ...item, quantity: 1 }
        };
      } else {
        return {
          ...prev,
          [item.id]: { ...item, quantity: currentQuantity + 1 }
        };
      }
    });
  };

  const updateQuantity = (itemId, value) => {
    setSelectedItems(prev => {
      if (value <= 0) {
        const newSelected = { ...prev };
        delete newSelected[itemId];
        return newSelected;
      }
      return {
        ...prev,
        [itemId]: { ...prev[itemId], quantity: value }
      };
    });
  };

  const handleAddOrders = () => {
    const selectedProducts = Object.values(selectedItems);
    onAddOrder(selectedProducts);
    onClose();
    setSelectedItems({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="order-modal">
        <div className="order-modal-header">
          <h2>Добавить заказы</h2>
          <div className="category-tabs">
            <button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              Все
            </button>
            {Object.keys(groupedItems).map(category => (
              <button
                key={category}
                className={selectedCategory === category ? 'active' : ''}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="order-modal-content">
          {Object.values(selectedItems).length > 0 && (
            <div className="selected-items-summary">
              <div className="selected-count">
                Выбрано товаров: {Object.values(selectedItems).length}
              </div>
            </div>
          )}

          <div className="order-items">
            {(selectedCategory === 'all' ? menuItems : groupedItems[selectedCategory] || [])
              .map(item => (
                <div 
                  key={item.id} 
                  className={`order-item-card ${selectedItems[item.id] ? 'selected' : ''}`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="order-item-content">
                    {item.image && (
                      <div className="order-item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                    )}
                    <div className="order-item-info">
                      <h3>{item.name}</h3>
                      <p className="order-item-price">{item.price} ֏</p>
                      <p className="order-item-stock">В наличии: {item.quantity}</p>
                    </div>
                  </div>
                  
                  {selectedItems[item.id] && (
                    <div className="order-item-actions" onClick={e => e.stopPropagation()}>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, (selectedItems[item.id].quantity || 1) - 1)}>
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={selectedItems[item.id].quantity || 1}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        />
                        <button onClick={() => updateQuantity(item.id, (selectedItems[item.id].quantity || 1) + 1)}>
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        {Object.keys(selectedItems).length > 0 && (
          <div className="order-modal-footer">
            <button 
              className="add-all-orders-btn"
              onClick={handleAddOrders}
            >
              Добавить выбранные товары
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default OrderModal; 