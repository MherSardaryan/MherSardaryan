import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/AddItemModal.css';

function AddItemModal({ isOpen, onClose, onAdd, categories }) {
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    buyPrice: '',
    sellPrice: '',
    category: '',
    imageUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newItem.name && newItem.sellPrice && newItem.category) {
      onAdd({
        name: newItem.name,
        quantity: Number(newItem.quantity) || 0,
        buyPrice: Number(newItem.buyPrice) || 0,
        price: Number(newItem.sellPrice),
        category: newItem.category,
        image: newItem.imageUrl
      });
      setNewItem({
        name: '',
        quantity: '',
        buyPrice: '',
        sellPrice: '',
        category: '',
        imageUrl: ''
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="add-item-modal">
        <h2>Добавить новый товар</h2>
        
        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-left">
            <div className="form-group">
              <label>Название товара</label>
              <input
                type="text"
                placeholder="Введите название"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Категория</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ссылка на изображение</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={newItem.imageUrl}
                onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Количество на складе</label>
              <input
                type="number"
                placeholder="0"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              />
            </div>

            <div className="price-inputs">
              <div className="form-group">
                <label>Цена закупки</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newItem.buyPrice}
                  onChange={(e) => setNewItem({ ...newItem, buyPrice: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Цена продажи</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newItem.sellPrice}
                  onChange={(e) => setNewItem({ ...newItem, sellPrice: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-right">
            <div className="image-preview-section">
              {newItem.imageUrl && (
                <div className="image-preview">
                  <img src={newItem.imageUrl} alt="Preview" />
                </div>
              )}
              {!newItem.imageUrl && (
                <div className="image-placeholder">
                  <i className="fas fa-image"></i>
                  <span>Предпросмотр изображения</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="submit-btn">
              Добавить товар
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AddItemModal; 