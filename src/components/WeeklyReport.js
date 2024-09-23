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
  const [totalTransferSales, setTotalTransferSales] = useState(0);
  const [totalCashSales, setTotalCashSales] = useState(0);
  const [totalDeliveryCost, setTotalDeliveryCost] = useState(0);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [netTotal, setNetTotal] = useState(0);

  useEffect(() => {
    if (startDate && endDate) {
      const fetchWeeklyDeliveries = async () => {
        try {
          const q = query(
            collection(db, "deliveries"),
            where("date", ">=", startDate),
            where("date", "<=", endDate)
          );
          const querySnapshot = await getDocs(q);
          const deliveriesData = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(delivery => delivery.status === "Entregado")  // Filtrar por estado "Entregado"
            .sort((a, b) => new Date(a.deliveryDate) - new Date(b.deliveryDate));  // Ordenar por fecha de entrega

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
        } catch (error) {
          console.error("Error fetching deliveries:", error);
          alert("Hubo un error al obtener los datos.");
        }
      };

      if (new Date(startDate) > new Date(endDate)) {
        alert("La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
      }

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

    const logoBase64 = await loadImageAsBase64("/images/okngoo logo main.png");
    doc.addImage(logoBase64, 'PNG', 14, 10, 50, 15);

    const tableColumn = [
      "Receptor", "Producto", "Precio", "Cantidad", "Cantidad por Cobrar", 
      "Fuera de Cobertura", "Costo de Entrega", "Monto después de Costo de Entrega", 
      "Fecha de Entrega", "Estatus", "Método de Pago"
    ];

    const tableRows = deliveries.map(delivery => [
      delivery.receiver, delivery.product, `$${delivery.price.toFixed(2)}`,
      delivery.quantity, `$${delivery.total.replace(/[$,]/g, '')}`, delivery.outOfCoverage,
      delivery.outOfCoverage === "Sí" ? "$100.00" : "$65.00",
      `$${(parseFloat(delivery.total.replace(/[$,]/g, '')) - (delivery.outOfCoverage === "Sí" ? 100 : 65)).toFixed(2)}`,
      delivery.deliveryDate || 'Sin especificar', delivery.status, delivery.paymentMethod || "No especificado"
    ]);

    doc.text(`Reporte de Entregas Semanales: ${startDate} a ${endDate}`, 14, 35);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: {
        fontSize: 8,  // Cambia el tamaño del texto (puedes ajustar el valor según necesites)
      },
    });

    // Agregar todos los montos visibles al PDF
    doc.text(`Total de Ventas: $${totalSales.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 10);
    doc.text(`Ventas por Transferencia: $${totalTransferSales.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 20);
    doc.text(`Ventas por Efectivo: $${totalCashSales.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 30);
    doc.text(`Total de Costo de Entrega: $${totalDeliveryCost.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 40);
    doc.text(`Total de Entregas: ${totalDeliveries}`, 14, doc.autoTable.previous.finalY + 50);
    doc.text(`Monto Total después de Costo de Entrega: $${netTotal.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 60);

    doc.save(`Reporte_Entregas_Semana_${startDate}_a_${endDate}.pdf`);
  };

  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

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
        {deliveries.length === 0 ? "No hay datos para exportar" : "Descargar Reporte en PDF"}
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
