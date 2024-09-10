// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <img src="/images/okngoo logo main.png" alt="logo" className="logo" />

      <h1 className="title">Bienvenido a Okngoo Delivery</h1>

      <button className="button" onClick={() => navigate('/add-delivery')}>
        Registrar entrega
      </button>
      <button className="button" onClick={() => navigate('/delivery-list')}>
        Seguimiento de entregas
      </button>
      <button className="button" onClick={() => navigate('/reports')}>
        Generar reportes
      </button>
    </div>
  );
};

export default Home;
