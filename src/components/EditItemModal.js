import React, { useState } from 'react';
import Modal from './Modal';
import '../styles/AddItemModal.css'; // Используем те же стили

function EditItemModal({ isOpen, onClose, item, onSave, categories }) {
  const [editedItem, setEditedItem] = useState({
    name: item.name,
    quantity: item.quantity,
    buyPrice: item.buyPrice,
    sellPrice: item.price,
    category: item.category,
    imageUrl: item.image
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...item,
      name: editedItem.name,
      quantity: Number(editedItem.quantity) || 0,
      buyPrice: Number(editedItem.buyPrice) || 0,
      price: Number(editedItem.sellPrice),
      category: editedItem.category,
      image: editedItem.imageUrl
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="add-item-modal">
        <h2>Редактировать товар</h2>
        
        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-left">
            <div className="form-group">
              <label>Название товара</label>
              <input
                type="text"
                placeholder="Введите название"
                value={editedItem.name}
                onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Категория</label>
              <select
                value={editedItem.category}
                onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
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
                value={editedItem.imageUrl}
                onChange={(e) => setEditedItem({ ...editedItem, imageUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Количество на складе</label>
              <input
                type="number"
                placeholder="0"
                value={editedItem.quantity}
                onChange={(e) => setEditedItem({ ...editedItem, quantity: e.target.value })}
              />
            </div>

            <div className="price-inputs">
              <div className="form-group">
                <label>Цена закупки</label>
                <input
                  type="number"
                  placeholder="0"
                  value={editedItem.buyPrice}
                  onChange={(e) => setEditedItem({ ...editedItem, buyPrice: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Цена продажи</label>
                <input
                  type="number"
                  placeholder="0"
                  value={editedItem.sellPrice}
                  onChange={(e) => setEditedItem({ ...editedItem, sellPrice: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-right">
            <div className="image-preview-section">
              {editedItem.imageUrl && (
                <div className="image-preview">
                  <img src={editedItem.imageUrl} alt="Preview" />
                </div>
              )}
              {!editedItem.imageUrl && (
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
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default EditItemModal; 