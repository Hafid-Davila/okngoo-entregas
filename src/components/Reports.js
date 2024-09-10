import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Reports.css';

const Reports = () => {
    return (
      <div className="reports-container">
        <h2 className='subtitle'>Generar Reportes</h2>
        <Link to="/reports/specific">
          <button className="back-button">Reporte de Entrega Específica</button>
        </Link>
        <Link to="/reports/daily">
          <button className="back-button">Reporte de Entregas del Día</button>
        </Link>
        <Link to="/reports/weekly">
          <button className="back-button">Reporte de Caja Semanal</button>
        </Link>
        <div className="back-button-container">
          <Link to="/">
            <button className="back-button">Regresar a Inicio</button>
          </Link>
        </div>
      </div>
    );
  };
  
  export default Reports;