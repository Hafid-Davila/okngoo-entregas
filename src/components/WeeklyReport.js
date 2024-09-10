import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../styles/WeeklyReport.css';

const WeeklyReport = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransferSales, setTotalTransferSales] = useState(0); // Ventas por transferencia
  const [totalCashSales, setTotalCashSales] = useState(0);         // Ventas en efectivo
  const [totalDeliveryCost, setTotalDeliveryCost] = useState(0);   // Costo de entrega
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [netTotal, setNetTotal] = useState(0);                     // Total neto

  useEffect(() => {
    if (startDate && endDate) {
      const fetchWeeklyDeliveries = async () => {
        const q = query(
          collection(db, "deliveries"),
          where("date", ">=", startDate),  // Usamos la fecha de registro para el filtro
          where("date", "<=", endDate)
        );
        const querySnapshot = await getDocs(q);
        const deliveriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calcular el total de ventas, ventas por transferencia, efectivo, entregas y el costo de entrega
        let transferSales = 0;
        let cashSales = 0;

        const salesTotal = deliveriesData.reduce((acc, curr) => {
          const parsedTotal = parseFloat(curr.total.replace(/[$,]/g, '')) || 0;
          if (curr.paymentMethod === "Transferencia") {
            transferSales += parsedTotal;
          } else if (curr.paymentMethod === "Efectivo") {
            cashSales += parsedTotal;
          }
          return acc + parsedTotal;
        }, 0);

        const deliveryCount = deliveriesData.length;

        const deliveryCostTotal = deliveriesData.reduce((acc, curr) => {
          const deliveryCost = curr.outOfCoverage === "Sí" ? 100 : 65;
          return acc + deliveryCost;
        }, 0);

        const netTotalAmount = salesTotal - deliveryCostTotal;

        setDeliveries(deliveriesData);
        setTotalSales(salesTotal);
        setTotalTransferSales(transferSales);
        setTotalCashSales(cashSales);
        setTotalDeliveryCost(deliveryCostTotal);
        setTotalDeliveries(deliveryCount);
        setNetTotal(netTotalAmount);
      };

      fetchWeeklyDeliveries();
    }
  }, [startDate, endDate]);

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
      "Precio",
      "Cantidad",
      "Cantidad por Cobrar",
      "Fuera de Cobertura",
      "Costo de Entrega",
      "Monto después de Costo de Entrega",
      "Fecha de Entrega",  // Usamos deliveryDate solo en el reporte PDF
      "Estatus",
      "Método de Pago"
    ];

    const tableRows = [];

    deliveries.forEach(delivery => {
      const rowData = [
        delivery.receiver,
        delivery.product,
        `$${delivery.price.toFixed(2)}`,
        delivery.quantity,
        `$${delivery.total.replace(/[$,]/g, '')}`,
        delivery.outOfCoverage,
        delivery.outOfCoverage === "Sí" ? "$100.00" : "$65.00",
        `$${(parseFloat(delivery.total.replace(/[$,]/g, '')) - (delivery.outOfCoverage === "Sí" ? 100 : 65)).toFixed(2)}`,
        delivery.deliveryDate || 'Sin especificar',  // Mostramos deliveryDate en el PDF
        delivery.status,
        delivery.paymentMethod || "No especificado"
      ];
      tableRows.push(rowData);
    });

    // Añadir encabezado debajo del logo
    doc.text(`Reporte de Entregas Semanales: ${startDate} a ${endDate}`, 14, 35);
    
    // Generar la tabla
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
    });

    // Añadir totales al final del documento
    doc.text(`Total de Ventas: $${totalSales.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 10);
    doc.text(`Ventas por Transferencia: $${totalTransferSales.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 20);
    doc.text(`Ventas por Efectivo: $${totalCashSales.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 30);
    doc.text(`Total de Costo de Entrega: $${totalDeliveryCost.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 40);
    doc.text(`Total de Entregas: ${totalDeliveries}`, 14, doc.autoTable.previous.finalY + 50);
    doc.text(`Monto Total después de Costo de Entrega: $${netTotal.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 60);

    // Descargar el PDF
    doc.save(`Reporte_Entregas_Semana_${startDate}_a_${endDate}.pdf`);
  };

  return (
    <div className="weekly-report-container">
      <h2 className='subtitle'>Reporte de Caja Semanal</h2>
      <div>
        <label htmlFor="startDate">Fecha de Inicio:</label>
        <input 
          type="date" 
          id="startDate" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
      </div>

      <div>
        <label htmlFor="endDate">Fecha de Fin:</label>
        <input 
          type="date" 
          id="endDate" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />
      </div>

      <button onClick={exportToPDF} disabled={deliveries.length === 0}>
        Descargar Reporte en PDF
      </button>

      <div className="back-button-container">
        <Link to="/reports">
          <button className="back-button">Regresar a Reportes</button>
        </Link>
        <Link to="/">
          <button className="back-button">Regresar a Inicio</button>
        </Link>
      </div>

      {deliveries.length > 0 ? (
        <div className="totals-section">
          <p><strong>Total de Ventas:</strong> ${totalSales.toFixed(2)}</p>
          <p><strong>Ventas por Transferencia:</strong> ${totalTransferSales.toFixed(2)}</p>
          <p><strong>Ventas en Efectivo:</strong> ${totalCashSales.toFixed(2)}</p>
          <p><strong>Total de Costo de Entrega:</strong> ${totalDeliveryCost.toFixed(2)}</p>
          <p><strong>Total de Entregas:</strong> {totalDeliveries}</p>
          <p><strong>Deposito Semanal Para El Cliente:</strong> ${netTotal.toFixed(2)}</p>
        </div>
      ) : (
        <p>No hay entregas registradas para el rango de fechas seleccionado.</p>
      )}
    </div>
  );
};

export default WeeklyReport;
