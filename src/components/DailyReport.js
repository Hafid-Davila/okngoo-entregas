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
  const [date, setDate] = useState(''); // Se utiliza para filtrar por fecha de entrega

  useEffect(() => {
    if (date) {
      const fetchDeliveries = async () => {
        // Filtrar por la fecha de entrega "deliveryDate"
        const q = query(collection(db, "deliveries"), where("deliveryDate", "==", date)); 
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
         <strong>Receptor:</strong> ${delivery.receiver} <br/>
        <strong>Producto:</strong> ${delivery.product} <br/>
        <strong>Cantidad:</strong> ${delivery.quantity} <br/>
        <strong>Total:</strong> ${delivery.total} <br/>
        <strong>Método de pago:</strong> ${delivery.paymentMethod}<br/>
        <strong>Dirección:</strong> ${delivery.address} <br/>
        <strong>Fuera de Cobertura:</strong> ${delivery.outOfCoverage}<br/>
        <strong>Teléfono:</strong> ${delivery.phone} <br/>
        <strong>Estado:</strong> ${delivery.status} <br/>
        <strong>Fecha de Registro:</strong> ${delivery.date} <br/>
        <strong>Fecha de Entrega:</strong> ${delivery.deliveryDate || 'Sin especificar'} <br/>
        <strong>Hora de Entrega:</strong> ${delivery.deliveryTime || 'Pendiente'} <br/>
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
      "Receptor",
      "Producto",
      "Cantidad",
      "Total",
      "Método de Pago",
      "Dirección",
      "Fuera de Cobertura",
      "Estado",
      "Fecha de Registro",  // Índice 8
      "Fecha de Entrega"
    ];

    let tableRows = [];

    deliveries.forEach(delivery => {
      const rowData = [
        delivery.receiver,
        delivery.product,
        delivery.quantity,
        delivery.total,
        delivery.paymentMethod,
        delivery.address,
        delivery.outOfCoverage,
        delivery.status,
        delivery.date,  // Fecha de Registro
        delivery.deliveryDate || 'Sin especificar'  // Fecha de Entrega
      ];
      tableRows.push(rowData);
    });

    // Ordenar las filas por la columna "Fecha de Registro"
    tableRows.sort((a, b) => {
      const dateA = new Date(a[8]);  // Índice 8 corresponde a "Fecha de Registro"
      const dateB = new Date(b[8]);
      return dateA - dateB;
    });

    // Añadir encabezado debajo del logo
    doc.text(`Reporte de Entregas del Día: ${date}`, 14, 35);
    
    // Generar la tabla
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: {
        fontSize: 8,  // Cambia el tamaño del texto (puedes ajustar el valor según necesites)
      },
    });

    // Descargar el PDF
    doc.save(`Reporte_Entregas_${date}.pdf`);
};


  return (
    <div className="daily-report-container">
      <h2 className='subtitle'>Reporte de Entregas del Día</h2>
      <div>
        <label htmlFor="date">Seleccione la Fecha de Entrega:</label> {/* Filtrado por fecha de entrega */}
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
