import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import '../styles/SalesReport.css';

function SalesReport({ history, menuItems }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const salesData = useMemo(() => {
    const sales = {};
    
    menuItems.forEach(item => {
      sales[item.name] = {
        name: item.name,
        quantity: 0,
        totalRevenue: 0,
        totalProfit: 0,
        buyPrice: item.buyPrice,
        sellPrice: item.price,
        currentStock: item.quantity || 0,
        image: item.image
      };
    });

    history.forEach(day => {
      // Проверяем, входит ли дата в выбранный период
      const dayDate = new Date(day.date);
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        if (dayDate < start || dayDate > end) return;
      }

      day.tables.forEach(table => {
        table.orders?.forEach(order => {
          if (!sales[order.name]) {
            const menuItem = menuItems.find(item => item.name === order.name);
            sales[order.name] = {
              name: order.name,
              quantity: 0,
              totalRevenue: 0,
              totalProfit: 0,
              buyPrice: menuItem?.buyPrice || 0,
              sellPrice: order.price,
              currentStock: menuItem?.quantity || 0,
              image: menuItem?.image
            };
          }
          
          sales[order.name].quantity += (order.quantity || 1);
          sales[order.name].totalRevenue += (order.price * (order.quantity || 1));
          sales[order.name].totalProfit += ((order.price - sales[order.name].buyPrice) * (order.quantity || 1));
        });
      });
    });

    return Object.values(sales);
  }, [history, menuItems, startDate, endDate]);

  const totals = useMemo(() => {
    return salesData.reduce((acc, item) => ({
      quantity: acc.quantity + item.quantity,
      revenue: acc.revenue + item.totalRevenue,
      profit: acc.profit + item.totalProfit
    }), { quantity: 0, revenue: 0, profit: 0 });
  }, [salesData]);

  const downloadExcel = () => {
    const excelData = salesData.map(item => ({
      'Наименование': item.name,
      'Количество продаж': item.quantity,
      'Цена закупки': item.buyPrice,
      'Цена продажи': item.sellPrice,
      'Общая выручка': item.totalRevenue,
      'Общая прибыль': item.totalProfit
    }));

    // Добавляем итоговую строку
    excelData.push({
      'Наименование': 'ИТОГО:',
      'Количество продаж': totals.quantity,
      'Цена закупки': '',
      'Цена продажи': '',
      'Общая выручка': totals.revenue,
      'Общая прибыль': totals.profit
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Продажи");
    XLSX.writeFile(wb, `Отчет_по_продажам_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="sales-report">
      <div className="sales-header">
        <h2>Отчет по продажам</h2>
        
        <div className="date-filter">
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

        <button className="excel-download-btn" onClick={downloadExcel}>
          <i className="fas fa-file-excel"></i>
          Скачать Excel
        </button>
      </div>

      <div className="sales-summary">
        <div className="summary-card">
          <i className="fas fa-shopping-cart"></i>
          <div className="summary-info">
            <span>Всего продаж</span>
            <strong>{totals.quantity} шт.</strong>
          </div>
        </div>
        <div className="summary-card">
          <i className="fas fa-coins"></i>
          <div className="summary-info">
            <span>Общая выручка</span>
            <strong>{totals.revenue} ֏</strong>
          </div>
        </div>
        <div className="summary-card">
          <i className="fas fa-chart-line"></i>
          <div className="summary-info">
            <span>Общая прибыль</span>
            <strong>{totals.profit} ֏</strong>
          </div>
        </div>
      </div>

      <div className="sales-table">
        <table>
          <thead>
            <tr>
              <th>Изображение</th>
              <th>Наименование</th>
              <th>Количество продаж</th>
              <th>Цена закупки</th>
              <th>Цена продажи</th>
              <th>Общая выручка</th>
              <th>Общая прибыль</th>
              <th>Остаток</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((item, index) => (
              <tr key={index}>
                <td>
                  {item.image && (
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.buyPrice} ֏</td>
                <td>{item.sellPrice} ֏</td>
                <td>{item.totalRevenue} ֏</td>
                <td>{item.totalProfit} ֏</td>
                <td className={item.currentStock < 10 ? 'low-stock' : ''}>
                  {item.currentStock}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>ИТОГО:</td>
              <td>-</td>
              <td>{totals.quantity}</td>
              <td>-</td>
              <td>-</td>
              <td>{totals.revenue} ֏</td>
              <td>{totals.profit} ֏</td>
              <td>-</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default SalesReport; 