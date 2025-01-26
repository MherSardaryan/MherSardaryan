import React from 'react';

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle}>
      <i className={`fas fa-${isDark ? 'sun' : 'moon'}`}></i>
    </button>
  );
}

export default ThemeToggle; 