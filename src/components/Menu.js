import React, { useState } from 'react';
import AddItemModal from './AddItemModal';
import EditItemModal from './EditItemModal';

function Menu({ menuItems, addMenuItem, updateMenuItem }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const categories = [
    'Напитки',
    'Снеки',
    'Еда',
    'Кальяны',
    'Прочее'
  ];

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleSaveEdit = (updatedItem) => {
    updateMenuItem(updatedItem.id, updatedItem);
    setEditingItem(null);
  };

  // Группировка товаров по категориям
  const groupedItems = menuItems.reduce((groups, item) => {
    const category = item.category || 'Прочее';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  return (
    <div className="menu">
      <div className="menu-header">
        <h2>Меню</h2>
        <button 
          className="add-item-btn"
          onClick={() => setIsAddModalOpen(true)}
        >
          <i className="fas fa-plus"></i> Добавить товар
        </button>
      </div>
      
      <div className="menu-categories">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="menu-category">
            <h3 className="category-title">{category}</h3>
            <div className="menu-items">
              {items.map(item => (
                <div key={item.id} className="menu-item">
                  {item.image && (
                    <div className="menu-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                  <div className="menu-item-info">
                    <h3>{item.name}</h3>
                    <div className="menu-item-details">
                      <div className="menu-item-stock">
                        <i className="fas fa-box"></i>
                        <span>В наличии: {item.quantity} шт.</span>
                      </div>
                      <div className="menu-item-prices">
                        <div className="price-row buy-price">
                          <i className="fas fa-shopping-cart"></i>
                          <span>Закупка: {item.buyPrice} ֏</span>
                        </div>
                        <div className="price-row sell-price">
                          <i className="fas fa-tag"></i>
                          <span>Продажа: {item.price} ֏</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="edit-item-btn"
                      onClick={() => handleEditItem(item)}
                    >
                      <i className="fas fa-edit"></i> Редактировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addMenuItem}
        categories={categories}
      />

      {editingItem && (
        <EditItemModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          onSave={handleSaveEdit}
          categories={categories}
        />
      )}
    </div>
  );
}

export default Menu; 