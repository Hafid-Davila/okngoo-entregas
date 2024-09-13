import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Asegúrate de que este archivo esté vinculado correctamente
import '../styles/Home.css'; // Asegúrate de que este archivo esté vinculado correctamente

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="overlay"></div> {/* Fondo con transparencia */}
      
      {/* Added content-overlay for semi-transparent effect */}
      <div className="content-overlay">
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
    </div>
  );
};

export default Home;
