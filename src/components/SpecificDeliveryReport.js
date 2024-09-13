import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';  // Importar autotable
import '../styles/SpecificDeliveryReport.css';

const SpecificDeliveryReport = () => {
  const [client, setClient] = useState('');
  const [date, setDate] = useState('');
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (client && date) {
        const q = query(
          collection(db, "deliveries"),
          where("client", "==", client),
          where("date", "==", date)  // Filtrado por la fecha de registro
        );
        const querySnapshot = await getDocs(q);
        const filteredDeliveries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveries(filteredDeliveries);
      }
    };

    fetchDeliveries();
  }, [client, date]);

  const loadImageAsBase64 = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePDF = async (delivery) => {
    const doc = new jsPDF();

    // Cargar el logo en formato base64
    const logoBase64 = await loadImageAsBase64("/images/okngoo logo main.png");

    // Añadir el logo al PDF
    doc.addImage(logoBase64, 'PNG', 10, 10, 50, 15);  // Ajusta las coordenadas y el tamaño según sea necesario

    // Agregar el título debajo del logo
    doc.setFontSize(18);  // Tamaño de fuente para el título
    doc.text(`Reporte de entrega: ${delivery.receiver}`, 20, 40);

    // Crear la tabla con los detalles de la entrega
    doc.autoTable({
      startY: 50,  // Donde inicia la tabla
      head: [['Campo', 'Valor']],  // Encabezado de la tabla
      body: [
        ['Cliente', delivery.client],
        ['Producto', delivery.product],
        ['Cantidad', delivery.quantity],
        ['Total', delivery.total],
        ['Estado', delivery.status],
        ['Fecha de Entrega', delivery.deliveryDate || 'Sin especificar'],  // Usar la fecha de entrega en el PDF
        ['Dirección', delivery.address],
        ['Teléfono', delivery.phone],
        ['Receptor', delivery.receiver]
      ]
    });

    // Guardar el PDF
    doc.save(`Entrega_${delivery.id}.pdf`);
  };

  return (
    <div className="report-form-container">
      <h2 className='subtitle'>Reporte de Entrega Específica</h2>
      <div>
        <label htmlFor="client">Cliente:</label>
        <select id="client" value={client} onChange={(e) => setClient(e.target.value)}>
          <option value="">Seleccione un cliente</option>
          <option value="Natural Care">Natural Care</option>
          <option value="Givaan">Givaan</option>
        </select>
      </div>
      <div>
        <label htmlFor="date">Fecha de Registro:</label>
        <input 
          type="date" 
          id="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>
      <div className="delivery-list">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="delivery-item">
            <p>Producto: {delivery.product}</p>
            <p>Cantidad: {delivery.quantity}</p>
            <p>Total: {delivery.total}</p>
            <p>Estado: {delivery.status}</p>
            <p>Dirección: {delivery.address}</p>
            <p>Teléfono: {delivery.phone}</p>
            <p>Receptor: {delivery.receiver}</p>
            <button onClick={() => generatePDF(delivery)}>Generar PDF</button>
          </div>
        ))}
      </div>
      <div className="back-button-container">
        <Link to="/reports">
          <button className="back-button">Regresar a Reportes</button>
        </Link>
        <Link to="/">
          <button className="back-button">Regresar a Inicio</button>
        </Link>
      </div>
    </div>
  );
};

export default SpecificDeliveryReport;
