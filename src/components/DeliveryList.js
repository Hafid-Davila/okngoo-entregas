import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { FaInfoCircle } from 'react-icons/fa';
import '../styles/DeliveryList.css';

const DeliveryList = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchDeliveries = async () => {
      const querySnapshot = await getDocs(collection(db, "deliveries"));
      const deliveriesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeliveries(deliveriesData);
      setFilteredDeliveries(deliveriesData);
    };

    fetchDeliveries();
  }, []);

  // Filtrar entregas por rango de fechas de registro
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = deliveries.filter(delivery => {
        const deliveryDate = new Date(delivery.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return deliveryDate >= start && deliveryDate <= end;
      });
      setFilteredDeliveries(filtered);
    } else {
      setFilteredDeliveries(deliveries);
    }
  }, [startDate, endDate, deliveries]);

  const handlePaymentChange = async (id, paymentMethod) => {
    try {
      const deliveryDoc = doc(db, "deliveries", id);
      await updateDoc(deliveryDoc, { paymentMethod });
      setDeliveries(deliveries.map(delivery =>
        delivery.id === id ? { ...delivery, paymentMethod } : delivery
      ));
      setFilteredDeliveries(filteredDeliveries.map(delivery =>
        delivery.id === id ? { ...delivery, paymentMethod } : delivery
      ));

      Swal.fire({
        title: 'Método de pago actualizado',
        text: `El método de pago ha sido actualizado a ${paymentMethod}.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al actualizar el método de pago.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

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
        <strong>Fecha de Entrega:</strong> ${delivery.deliveryDate || 'Pendiente'} <br/>
        <strong>Método de Pago:</strong> ${delivery.paymentMethod || 'No especificado'} <br/>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
    });
  };

  const handleActionChange = async (id, action) => {
    if (action === 'delete') {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await deleteDoc(doc(db, "deliveries", id));
          setDeliveries(deliveries.filter(delivery => delivery.id !== id));
          setFilteredDeliveries(filteredDeliveries.filter(delivery => delivery.id !== id));

          Swal.fire(
            '¡Borrado!',
            'La entrega ha sido borrada.',
            'success'
          );
        }
      });
    } else if (action === 'Entregado') {
      Swal.fire({
        title: '¿Estás seguro?',
        text: "El estado será cambiado a 'Entregado'.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const currentDate = new Date().toISOString().split('T')[0]; // Obtener la fecha actual
          const deliveryDoc = doc(db, "deliveries", id);

          // Actualizar estado a "Entregado" y agregar la fecha de entrega
          await updateDoc(deliveryDoc, { status: action, deliveryDate: currentDate });

          setDeliveries(deliveries.map(delivery =>
            delivery.id === id ? { ...delivery, status: action, deliveryDate: currentDate } : delivery
          ));
          setFilteredDeliveries(filteredDeliveries.map(delivery =>
            delivery.id === id ? { ...delivery, status: action, deliveryDate: currentDate } : delivery
          ));

          Swal.fire({
            title: 'Estado actualizado',
            text: `El estado ha sido cambiado a ${action}.`,
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      try {
        const deliveryDoc = doc(db, "deliveries", id);
        await updateDoc(deliveryDoc, { status: action });
        setDeliveries(deliveries.map(delivery =>
          delivery.id === id ? { ...delivery, status: action } : delivery
        ));
        setFilteredDeliveries(filteredDeliveries.map(delivery =>
          delivery.id === id ? { ...delivery, status: action } : delivery
        ));

        Swal.fire({
          title: 'Estado actualizado',
          text: `El estado ha sido cambiado a ${action}.`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un error al actualizar el estado.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  return (
    <div className="delivery-list-container">
      <h2 className='subtitle'>Seguimiento de Entregas</h2>

      {/* Filtro por rango de fechas */}
      <div className="filter-container">
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
      </div>

      <table>
        <thead>
          <tr>
            <th>Receptor</th>
            <th>Producto</th>
            <th>Estado</th>
            <th>Fecha de Registro</th>
            <th>Fecha de Entrega</th>  {/* Nueva columna para la fecha de entrega */}
            <th>Método de Pago</th>
            <th>Acciones</th>
            <th>Info</th>
          </tr>
        </thead>
        <tbody>
          {filteredDeliveries.map(delivery => (
            <tr key={delivery.id}>
              <td data-label="Receptor">{delivery.receiver}</td>
              <td data-label="Producto">{delivery.product}</td>
              <td data-label="Estado">{delivery.status}</td>
              <td data-label="Fecha de Registro">{delivery.date}</td>
              <td data-label="Fecha de Entrega">{delivery.deliveryDate || 'Pendiente'}</td>  {/* Mostrar la fecha de entrega */}
              <td data-label="Método de Pago">
                <select 
                  onChange={(e) => handlePaymentChange(delivery.id, e.target.value)} 
                  value={delivery.paymentMethod || ''}
                >
                  <option value="" disabled>Seleccione método</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </td>

              <td data-label="Acciones">
                <select onChange={(e) => handleActionChange(delivery.id, e.target.value)} value={delivery.status}>
                  <option value="" disabled>Seleccione una acción</option>
                  <option value="Entregado">Marcar como Entregado</option>
                  <option value="Cancelado">Marcar como Cancelado</option>
                  <option value="Pendiente">Marcar como Pendiente</option>
                  <option value="delete">Borrar</option>
                </select>
              </td>

              <td data-label="Info">
                <FaInfoCircle 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => showDeliveryInfo(delivery)} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="back-button-container">
        <Link to="/">
          <button className="back-button">Regresar a Inicio</button>
        </Link>
      </div>
    </div>
  );
};

export default DeliveryList;

