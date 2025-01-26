import React, { useState } from 'react';
import '../styles/Inventory.css';

function Inventory({ menuItems, updateMenuItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Группировка товаров по категориям
  const groupedItems = menuItems.reduce((groups, item) => {
    const category = item.category || 'Прочее';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const categories = ['all', ...Object.keys(groupedItems)];

  // Фильтрация товаров
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (itemId, newQuantity) => {
    const item = menuItems.find(i => i.id === itemId);
    if (item) {
      updateMenuItem(itemId, {
        ...item,
        quantity: Math.max(0, Number(newQuantity))
      });
    }
  };

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Управление складом</h2>
        
        {/* Поиск вверху */}
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Поиск товара..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Категории под поиском */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'Все' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Изображение</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Количество</th>
              <th>Цена закупки</th>
              <th>Цена продажи</th>
              <th>Прибыль</th>
              <th>Стоимость склада</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>
                  {item.image && (
                    <div className="inventory-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>
                  <div className="quantity-editor">
                    <button onClick={() => handleQuantityChange(item.id, (item.quantity || 0) - 1)}>
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity || 0}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                    <button onClick={() => handleQuantityChange(item.id, (item.quantity || 0) + 1)}>
                      +
                    </button>
                  </div>
                </td>
                <td>{item.buyPrice} ֏</td>
                <td>{item.price} ֏</td>
                <td>{item.price - item.buyPrice} ֏</td>
                <td>{item.buyPrice * (item.quantity || 0)} ֏</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4">Итого:</td>
              <td>
                {filteredItems.reduce((sum, item) => sum + Number(item.buyPrice), 0)} ֏
              </td>
              <td>
                {filteredItems.reduce((sum, item) => sum + Number(item.price), 0)} ֏
              </td>
              <td>
                {filteredItems.reduce((sum, item) => 
                  sum + (Number(item.price) - Number(item.buyPrice)), 0)} ֏
              </td>
              <td>
                {filteredItems.reduce((sum, item) => 
                  sum + (Number(item.buyPrice) * (item.quantity || 0)), 0)} ֏
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default Inventory; 