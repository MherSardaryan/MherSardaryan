import React, { useState } from 'react';

function MenuAuth({ onAuth }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '33Olimot') {
      onAuth(true);
    } else {
      setError('Неверный пароль');
      setPassword('');
    }
  };

  return (
    <div className="inventory-auth">
      <div className="auth-card">
        <i className="fas fa-lock"></i>
        <h2>Доступ к меню</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
          />
          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  );
}

export default MenuAuth; 