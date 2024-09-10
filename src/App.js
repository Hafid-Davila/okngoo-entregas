import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import AddDelivery from './components/AddDelivery';
import DailyReport from './components/DailyReport';
import DeliveryList from './components/DeliveryList';
import Reports from './components/Reports';
import SpecificDeliveryReport from './components/SpecificDeliveryReport';
import WeeklyReport from './components/WeeklyReport';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-delivery" element={<AddDelivery />} />
          <Route path="/daily-report" element={<DailyReport />} />
          <Route path="/delivery-list" element={<DeliveryList />} />
          <Route path="/reports" element={<Reports />} />
          {/* Cambiamos las rutas de los reportes */}
          <Route path="/reports/specific" element={<SpecificDeliveryReport />} />
          <Route path="/reports/daily" element={<DailyReport />} />
          <Route path="/reports/weekly" element={<WeeklyReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
