import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import { FaInfoCircle } from 'react-icons/fa';  // Icono de información
import '../styles/DailyReport.css';
import { Link } from 'react-router-dom';

const DailyReport = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [date, setDate] = useState(''); // Se utiliza para filtrar por fecha de registro

  useEffect(() => {
    if (date) {
      const fetchDeliveries = async () => {
        // Filtrar por la fecha de registro "date"
        const q = query(collection(db, "deliveries"), where("date", "==", date)); 
        const querySnapshot = await getDocs(q);
        const deliveriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeliveries(deliveriesData);
      };

      fetchDeliveries();
    }
  }, [date]);

  const showDeliveryInfo = (delivery) => {
    Swal.fire({
      title: `Información de Entrega`,
      html: `
        <strong>Cliente:</strong> ${delivery.client} <br/>
        <strong>Producto:</strong> ${delivery.product} <br/>
        <strong>Cantidad:</strong> ${delivery.quantity} <br/>
        <strong>Total:</strong> ${delivery.total} <br/>
        <strong>Dirección:</strong> ${delivery.address} <br/>
        <strong>Teléfono:</strong> ${delivery.phone} <br/>
        <strong>Receptor:</strong> ${delivery.receiver} <br/>
        <strong>Estado:</strong> ${delivery.status} <br/>
        <strong>Fecha de Registro:</strong> ${delivery.date} <br/>
        <strong>Fecha de Entrega:</strong> ${delivery.deliveryDate || 'Sin especificar'} <br/>  <!-- Mostrar deliveryDate si está disponible -->
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
    });
  };

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

  const exportToPDF = async () => {
    const doc = new jsPDF();

    // Cargar el logo en formato base64
    const logoBase64 = await loadImageAsBase64("/images/okngoo logo main.png");

    // Añadir el logo al PDF
    doc.addImage(logoBase64, 'PNG', 14, 10, 50, 15);  // (imgData, format, x, y, width, height)

    const tableColumn = [
      "Cliente",
      "Producto",
      "Cantidad",
      "Total",
      "Dirección",
      "Teléfono",
      "Receptor",
      "Estado",
      "Fecha de Entrega"  // Solo se mostrará la fecha de entrega en el PDF
    ];

    const tableRows = [];

    deliveries.forEach(delivery => {
      const rowData = [
        delivery.client,
        delivery.product,
        delivery.quantity,
        delivery.total,
        delivery.address,
        delivery.phone,
        delivery.receiver,
        delivery.status,
        delivery.deliveryDate || 'Sin especificar'  // Usar deliveryDate o mostrar "Sin especificar" si no está disponible
      ];
      tableRows.push(rowData);
    });

    // Añadir encabezado debajo del logo
    doc.text(`Reporte de Entregas del Día: ${date}`, 14, 35);
    
    // Generar la tabla
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
    });

    // Descargar el PDF
    doc.save(`Reporte_Entregas_${date}.pdf`);
  };

  return (
    <div className="daily-report-container">
      <h2 className='subtitle'>Reporte de Entregas del Día</h2>
      <div>
        <label htmlFor="date">Seleccione la Fecha de Registro:</label> {/* Filtrado por fecha de registro */}
        <input 
          type="date" 
          id="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
        />
      </div>

      <div className="delivery-list">
        {deliveries.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Receptor</th>
                <th>Estado</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id}>
                  <td>{delivery.receiver}</td>
                  <td>{delivery.status}</td>
                  <td>
                    <FaInfoCircle 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => showDeliveryInfo(delivery)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay entregas registradas para esta fecha.</p>
        )}
      </div>

      <div className="back-button-container">
        <button onClick={exportToPDF} disabled={deliveries.length === 0}>
          Descargar Reporte en PDF
        </button>
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

export default DailyReport;
