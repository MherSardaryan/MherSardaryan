import React, { useState, useEffect } from 'react';
import './App.css';
import TableList from './components/TableList';
import Menu from './components/Menu';
import History from './components/History';
import EndDayModal from './components/EndDayModal';
import Inventory from './components/Inventory';
import InventoryAuth from './components/InventoryAuth';
import ThemeToggle from './components/ThemeToggle';
import ShiftManager from './components/ShiftManager';
import SalesReport from './components/SalesReport';
import SalesReportAuth from './components/SalesReportAuth';
import MenuAuth from './components/MenuAuth';
import HistoryAuth from './components/HistoryAuth';

function App() {
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [isEndDayModalOpen, setIsEndDayModalOpen] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [isInventoryAuthed, setIsInventoryAuthed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [currentShift, setCurrentShift] = useState(
    JSON.parse(localStorage.getItem('currentShift')) || null
  );
  const [workers, setWorkers] = useState(
    JSON.parse(localStorage.getItem('workers')) || []
  );
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [isSalesReportAuthed, setIsSalesReportAuthed] = useState(false);
  const [isMenuAuthed, setIsMenuAuthed] = useState(false);
  const [isHistoryAuthed, setIsHistoryAuthed] = useState(false);

  useEffect(() => {
    const savedTables = localStorage.getItem('tables');
    const savedMenu = localStorage.getItem('menuItems');
    const savedHistory = localStorage.getItem('history');
    
    if (savedTables) setTables(JSON.parse(savedTables));
    if (savedMenu) setMenuItems(JSON.parse(savedMenu));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    const savedWorkers = localStorage.getItem('workers');
    if (savedWorkers) {
      setWorkers(JSON.parse(savedWorkers));
    }
  }, []);

  const addTable = (tableData) => {
    const newTable = {
      id: Date.now(),
      ...tableData
    };
    
    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    localStorage.setItem('tables', JSON.stringify(updatedTables));
  };

  const updateTable = (tableId, newData) => {
    try {
      const updatedTables = tables.map(table => 
        table.id === tableId ? { ...table, ...newData } : table
      );
      setTables(updatedTables);
      localStorage.setItem('tables', JSON.stringify(updatedTables));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert('Превышен лимит хранилища. Пожалуйста, очистите историю или уменьшите размер изображений.');
        clearOldData();
      }
    }
  };

  const clearOldData = () => {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const filteredHistory = history.filter(record => 
      new Date(record.date) > monthAgo
    );
    
    setHistory(filteredHistory);
    localStorage.setItem('history', JSON.stringify(filteredHistory));
  };

  const addMenuItem = (item) => {
    const updatedMenu = [...menuItems, { id: Date.now(), ...item }];
    setMenuItems(updatedMenu);
    localStorage.setItem('menuItems', JSON.stringify(updatedMenu));
  };

  const updateWorkers = (newWorkers) => {
    console.log('Updating workers:', newWorkers);
    setWorkers(newWorkers);
    localStorage.setItem('workers', JSON.stringify(newWorkers));
  };

  const handleStartShift = (shiftData) => {
    console.log('Starting shift with data:', shiftData);
    if (shiftData && shiftData.workerId && shiftData.workerName) {
      const newShift = {
        workerId: shiftData.workerId,
        workerName: shiftData.workerName,
        startTime: new Date().toISOString()
      };
      console.log('New shift:', newShift);
      setCurrentShift(newShift);
      localStorage.setItem('currentShift', JSON.stringify(newShift));
      
      const updatedWorkers = workers.map(worker => 
        worker.id === shiftData.workerId 
          ? { ...worker, isActive: true }
          : worker
      );
      setWorkers(updatedWorkers);
      localStorage.setItem('workers', JSON.stringify(updatedWorkers));
    }
  };

  const handleEndShift = () => {
    if (currentShift) {
      const shiftEnd = new Date().toISOString();
      const shiftHistory = JSON.parse(localStorage.getItem('shiftHistory') || '[]');
      
      const shiftRecord = {
        ...currentShift,
        endTime: shiftEnd,
        tables: tables.map(table => ({
          id: table.id,
          totalEarnings: table.totalCost || 0
        }))
      };
      
      shiftHistory.push(shiftRecord);
      localStorage.setItem('shiftHistory', JSON.stringify(shiftHistory));
      
      const updatedWorkers = workers.map(worker => 
        worker.id === currentShift.workerId 
          ? { ...worker, isActive: false }
          : worker
      );
      setWorkers(updatedWorkers);
      localStorage.setItem('workers', JSON.stringify(updatedWorkers));
      
      setCurrentShift(null);
      localStorage.removeItem('currentShift');
    }
  };

  const handleEndDay = () => {
    const updatedTables = tables.map(table => {
      if (table.isActive) {
        const duration = (new Date() - new Date(table.startTime)) / 1000 / 3600;
        const gameCost = Math.round(duration * table.pricePerHour);
        const ordersCost = table.orders.reduce((sum, order) => sum + Number(order.price), 0);
        return {
          ...table,
          isActive: false,
          totalCost: gameCost + ordersCost
        };
      }
      return table;
    });

    const dailyReport = {
      id: Date.now(),
      date: new Date().toISOString(),
      workerName: currentShift?.workerName,
      workerId: currentShift?.workerId,
      tables: updatedTables.map(table => ({
        name: table.name,
        gameType: table.type,
        duration: table.duration,
        gameCost: table.totalCost || 0,
        orders: table.orders || [],
        totalCost: table.totalCost || 0
      })),
      totalEarnings: updatedTables.reduce((sum, table) => sum + (table.totalCost || 0), 0)
    };

    const updatedHistory = [...history, dailyReport];
    setHistory(updatedHistory);
    localStorage.setItem('history', JSON.stringify(updatedHistory));

    const resetTables = updatedTables.map(table => ({
      ...table,
      startTime: null,
      isActive: false,
      orders: [],
      totalCost: 0
    }));
    setTables(resetTables);
    localStorage.setItem('tables', JSON.stringify(resetTables));

    if (currentShift) {
      handleEndShift();
    }

    setIsEndDayModalOpen(false);
  };

  const updateHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('history', JSON.stringify(newHistory));
  };

  const updateMenuItem = (itemId, newData) => {
    const updatedMenu = menuItems.map(item =>
      item.id === itemId ? { ...item, ...newData } : item
    );
    setMenuItems(updatedMenu);
    localStorage.setItem('menuItems', JSON.stringify(updatedMenu));
  };

  return (
    <div className="App">
      <header>
        <div className="header-left">
          <h1>GameZone</h1>
          <ThemeToggle 
            isDark={isDarkTheme} 
            onToggle={() => setIsDarkTheme(!isDarkTheme)} 
          />
        </div>
        <ShiftManager
          currentShift={currentShift}
          onStartShift={handleStartShift}
          onEndShift={handleEndShift}
          workers={workers}
          updateWorkers={updateWorkers}
        />
        <div className="header-buttons">
          <button 
            className={showInventory ? 'active' : ''}
            onClick={() => {
              if (!showInventory) {
                setIsInventoryAuthed(false);
              }
              setShowMenu(false);
              setShowHistory(false);
              setShowSalesReport(false);
              setShowInventory(!showInventory);
            }}
          >
            Склад
          </button>
          <button 
            className={showHistory ? 'active' : ''}
            onClick={() => {
              if (!showHistory) {
                setIsHistoryAuthed(false);
              }
              setShowMenu(false);
              setShowInventory(false);
              setShowSalesReport(false);
              setShowHistory(!showHistory);
            }}
          >
            История
          </button>
          <button 
            className={showMenu ? 'active' : ''}
            onClick={() => {
              if (!showMenu) {
                setIsMenuAuthed(false);
              }
              setShowHistory(false);
              setShowInventory(false);
              setShowSalesReport(false);
              setShowMenu(!showMenu);
            }}
          >
            Меню
          </button>
          <button 
            className={showSalesReport ? 'active' : ''}
            onClick={() => {
              if (!showSalesReport) {
                setIsSalesReportAuthed(false);
              }
              setShowMenu(false);
              setShowInventory(false);
              setShowHistory(false);
              setShowSalesReport(!showSalesReport);
            }}
          >
            Отчет продаж
          </button>
          <button 
            className={!showMenu && !showHistory && !showInventory && !showSalesReport ? 'active' : ''}
            onClick={() => {
              setShowMenu(false);
              setShowInventory(false);
              setShowHistory(false);
              setShowSalesReport(false);
            }}
          >
            Столы
          </button>
        </div>
      </header>
      
      {showMenu ? (
        isMenuAuthed ? (
          <Menu 
            menuItems={menuItems} 
            addMenuItem={addMenuItem}
            updateMenuItem={updateMenuItem}
          />
        ) : (
          <MenuAuth onAuth={setIsMenuAuthed} />
        )
      ) : showHistory ? (
        isHistoryAuthed ? (
          <History 
            history={history} 
            menuItems={menuItems}
            currentShift={currentShift}
            updateHistory={updateHistory}
          />
        ) : (
          <HistoryAuth onAuth={setIsHistoryAuthed} />
        )
      ) : showInventory ? (
        isInventoryAuthed ? (
          <Inventory 
            menuItems={menuItems}
            updateMenuItem={updateMenuItem}
          />
        ) : (
          <InventoryAuth onAuth={setIsInventoryAuthed} />
        )
      ) : showSalesReport ? (
        isSalesReportAuthed ? (
          <SalesReport 
            history={history}
            menuItems={menuItems}
          />
        ) : (
          <SalesReportAuth onAuth={setIsSalesReportAuthed} />
        )
      ) : (
        <TableList 
          tables={tables} 
          addTable={addTable}
          updateTable={updateTable}
          menuItems={menuItems}
          history={history}
          updateHistory={updateHistory}
          updateMenuItem={updateMenuItem}
          currentShift={currentShift}
        />
      )}

      <EndDayModal
        isOpen={isEndDayModalOpen}
        onClose={() => setIsEndDayModalOpen(false)}
        tables={tables}
        onConfirm={handleEndDay}
      />
    </div>
  );
}

export default App; 