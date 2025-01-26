import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import '../styles/History.css';
import HistoryManager from './HistoryManager';

function History({ history, menuItems, updateHistory }) {
  const [period, setPeriod] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}ч ${m}м`;
  };

  const formatMoney = (amount) => {
    return Math.round(amount).toLocaleString('ru-RU');
  };

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    return history.filter(record => {
      const recordDate = new Date(record.date);
      const matchesSearch = searchTerm === '' || 
        record.tables.some(table => 
          table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          table.gameType.toLowerCase().includes(searchTerm.toLowerCase())
        );

      let matchesPeriod = true;
      if (period === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // Устанавливаем конец дня
        matchesPeriod = recordDate >= start && recordDate <= end;
      } else {
        switch (period) {
          case 'today':
            matchesPeriod = recordDate >= today;
            break;
          case 'week':
            matchesPeriod = recordDate >= weekAgo;
            break;
          case 'month':
            matchesPeriod = recordDate >= monthAgo;
            break;
          case 'year':
            matchesPeriod = recordDate >= yearAgo;
            break;
          default:
            matchesPeriod = true;
        }
      }

      return matchesSearch && matchesPeriod;
    });
  }, [history, period, searchTerm, startDate, endDate]);

  const flattenedData = useMemo(() => {
    const data = [];
    filteredHistory.forEach(day => {
      day.tables.forEach(table => {
        const ordersCost = table.orders?.reduce((sum, order) => 
          sum + (Number(order.price) * (order.quantity || 1)), 0) || 0;
        
        const ordersProfit = table.orders?.reduce((sum, order) => {
          const menuItem = menuItems.find(item => item.name === order.name);
          if (menuItem) {
            return sum + ((order.price - menuItem.buyPrice) * (order.quantity || 1));
          }
          return sum;
        }, 0) || 0;

        data.push({
          date: formatDate(day.date),
          tableName: table.name || 'Неизвестный стол',
          gameType: table.type || 'Неизвестный тип',
          startTime: table.type === 'sales' ? '-' : (table.startTime ? new Date(table.startTime).toLocaleTimeString() : '-'),
          endTime: table.type === 'sales' ? '-' : (table.closedAt ? new Date(table.closedAt).toLocaleTimeString() : '-'),
          duration: table.type === 'ps' ? '-' : (table.duration ? formatDuration(Number(table.duration)) : '-'),
          gameCost: table.type === 'sales' ? 0 : (Number(table.gameCost) || 0),
          ordersCount: table.orders?.length || 0,
          ordersCost: ordersCost,
          ordersProfit: ordersProfit,
          totalCost: table.type === 'sales' ? ordersCost : ((Number(table.gameCost) || 0) + ordersCost),
          totalProfit: table.type === 'sales' ? ordersProfit : ((Number(table.gameCost) || 0) + ordersProfit),
          orders: table.orders || [],
          workerName: table.workerName || 'Нет данных'
        });
      });
    });
    return data;
  }, [filteredHistory, menuItems]);

  const totals = useMemo(() => {
    return flattenedData.reduce((acc, row) => ({
      gameCost: acc.gameCost + row.gameCost,
      ordersCost: acc.ordersCost + row.ordersCost,
      ordersProfit: acc.ordersProfit + row.ordersProfit,
      totalCost: acc.totalCost + row.totalCost,
      totalProfit: acc.totalProfit + row.totalProfit,
      ordersCount: acc.ordersCount + row.ordersCount
    }), { 
      gameCost: 0, 
      ordersCost: 0, 
      ordersProfit: 0, 
      totalCost: 0, 
      totalProfit: 0, 
      ordersCount: 0 
    });
  }, [flattenedData]);

  const downloadExcel = () => {
    // Создаем данные для Excel
    const excelData = flattenedData.map(row => ({
      'Дата': row.date,
      'Работник': row.workerName,
      'Стол': row.tableName,
      'Тип игры': row.gameType === 'sales' ? '-' : (row.gameType === 'billiard' ? 'Бильярд' : '-'),
      'Начало': row.startTime,
      'Конец': row.endTime,
      'Длительность': row.gameType === 'ps' ? '-' : row.duration,
      'Стоимость игры': row.gameType === 'sales' ? '-' : formatMoney(row.gameCost),
      'Количество заказов': row.ordersCount,
      'Сумма заказов': formatMoney(row.ordersCost),
      'Прибыль с заказов': formatMoney(row.ordersProfit),
      'Общая выручка': formatMoney(row.totalCost),
      'Общая прибыль': formatMoney(row.totalProfit)
    }));

    // Добавляем итоговую строку
    excelData.push({
      'Дата': 'ИТОГО:',
      'Работник': '',
      'Стол': '',
      'Тип игры': '',
      'Начало': '',
      'Конец': '',
      'Длительность': '',
      'Стоимость игры': formatMoney(totals.gameCost),
      'Количество заказов': totals.ordersCount,
      'Сумма заказов': formatMoney(totals.ordersCost),
      'Прибыль с заказов': formatMoney(totals.ordersProfit),
      'Общая выручка': formatMoney(totals.totalCost),
      'Общая прибыль': formatMoney(totals.totalProfit)
    });

    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();
    
    // Создаем лист
    const ws = XLSX.utils.json_to_sheet(excelData, { origin: 'A2' });

    // Добавляем заголовок
    XLSX.utils.sheet_add_aoa(ws, [['Отчет GameZone ' + new Date().toLocaleDateString()]], { origin: 'A1' });

    // Объединяем ячейки для заголовка
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } });

    // Устанавливаем ширину столбцов
    const colWidths = [
      { wch: 20 }, // Дата
      { wch: 15 }, // Работник
      { wch: 15 }, // Стол
      { wch: 15 }, // Тип игры
      { wch: 15 }, // Начало
      { wch: 15 }, // Конец
      { wch: 15 }, // Длительность
      { wch: 15 }, // Стоимость игры
      { wch: 15 }, // Количество заказов
      { wch: 15 }, // Сумма заказов
      { wch: 15 }, // Прибыль с заказов
      { wch: 15 }, // Общая выручка
      { wch: 15 }  // Общая прибыль
    ];
    ws['!cols'] = colWidths;

    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(wb, ws, "Отчет");

    // Генерируем имя файла с текущей датой
    const fileName = `Отчет_GameZone_${new Date().toLocaleDateString().replace(/\./g, '-')}.xlsx`;

    // Сохраняем файл
    XLSX.writeFile(wb, fileName);
  };

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <i className="fas fa-history"></i>
        <h2>История пуста</h2>
        <p>Здесь будет отображаться история всех заказов</p>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-header">
        <div className="history-title">
          <h2>История заказов</h2>
          <div className="history-actions">
            <button className="excel-download-btn" onClick={downloadExcel}>
              <i className="fas fa-file-excel"></i>
              Скачать Excel
            </button>
            <HistoryManager 
              history={history}
              updateHistory={updateHistory}
            />
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="period-selector">
          <button className={period === 'today' ? 'active' : ''} onClick={() => setPeriod('today')}>
            Сегодня
          </button>
          <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>
            Неделя
          </button>
          <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>
            Месяц
          </button>
          <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>
            Год
          </button>
          <button className={period === 'all' ? 'active' : ''} onClick={() => setPeriod('all')}>
            Все время
          </button>
          <button className={period === 'custom' ? 'active' : ''} onClick={() => setPeriod('custom')}>
            Выбрать даты
          </button>
        </div>

        {period === 'custom' && (
          <div className="date-range-picker">
            <div className="date-input">
              <label>С:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-input">
              <label>По:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="history-summary">
        <div className="summary-card">
          <i className="fas fa-coins"></i>
          <div className="summary-info">
            <span>Общая выручка</span>
            <strong>{formatMoney(totals.totalCost)} ֏</strong>
          </div>
        </div>
        <div className="summary-card">
          <i className="fas fa-chart-line"></i>
          <div className="summary-info">
            <span>Общая прибыль</span>
            <strong>{formatMoney(totals.totalProfit)} ֏</strong>
          </div>
        </div>
        <div className="summary-card">
          <i className="fas fa-gamepad"></i>
          <div className="summary-info">
            <span>Выручка с игр</span>
            <strong>{formatMoney(totals.gameCost)} ֏</strong>
          </div>
        </div>
        <div className="summary-card">
          <i className="fas fa-shopping-cart"></i>
          <div className="summary-info">
            <span>Выручка с заказов</span>
            <strong>{formatMoney(totals.ordersCost)} ֏</strong>
          </div>
        </div>
        <div className="summary-card">
          <i className="fas fa-dollar-sign"></i>
          <div className="summary-info">
            <span>Прибыль с заказов</span>
            <strong>{formatMoney(totals.ordersProfit)} ֏</strong>
          </div>
        </div>
      </div>

      <div className="excel-table-container">
        <table className="excel-style-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Работник</th>
              <th>Стол</th>
              <th>Тип игры</th>
              <th>Начало</th>
              <th>Конец</th>
              <th>Длительность</th>
              <th>Стоимость игры</th>
              <th>Кол-во заказов</th>
              <th>Сумма заказов</th>
              <th>Прибыль с заказов</th>
              <th>Общая выручка</th>
              <th>Общая прибыль</th>
            </tr>
          </thead>
          <tbody>
            {flattenedData.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                <td>{row.date}</td>
                <td>{row.workerName}</td>
                <td>{row.tableName}</td>
                <td>{row.gameType === 'sales' ? '-' : (row.gameType === 'billiard' ? 'Бильярд' : '-')}</td>
                <td>{row.startTime}</td>
                <td>{row.endTime}</td>
                <td>{row.gameType === 'ps' ? '-' : row.duration}</td>
                <td className="number-cell">{row.gameType === 'sales' ? '-' : `${formatMoney(row.gameCost)} ֏`}</td>
                <td className="number-cell">{row.ordersCount}</td>
                <td className="number-cell">{formatMoney(row.ordersCost)} ֏</td>
                <td className="number-cell">{formatMoney(row.ordersProfit)} ֏</td>
                <td className="number-cell">{formatMoney(row.totalCost)} ֏</td>
                <td className="number-cell total-cell">{formatMoney(row.totalProfit)} ֏</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="7" className="total-label">Итого:</td>
              <td className="number-cell">{formatMoney(totals.gameCost)} ֏</td>
              <td className="number-cell">{totals.ordersCount}</td>
              <td className="number-cell">{formatMoney(totals.ordersCost)} ֏</td>
              <td className="number-cell">{formatMoney(totals.ordersProfit)} ֏</td>
              <td className="number-cell">{formatMoney(totals.totalCost)} ֏</td>
              <td className="number-cell total-cell">{formatMoney(totals.totalProfit)} ֏</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default History; 