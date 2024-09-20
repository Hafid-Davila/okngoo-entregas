import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import '../styles/AddDelivery.css';

const AddDelivery = () => {
  const [client, setClient] = useState('');
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [formattedPrice, setFormattedPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [total, setTotal] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [receiver, setReceiver] = useState('');
  const [outOfCoverage, setOutOfCoverage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [products, setProducts] = useState([]);

  const productOptions = {
    "Natural Care": ["Santo Remedio", "Dúo Santo Remedio", "Super Promo Santo Remedio", "Funjifin", "Dúo Funjifin", "Super Promo Funjifin", "Gastriless"],
    "Givaan": ["Producto X", "Producto Y", "Producto Z"],
  };

  useEffect(() => {
    if (client) {
      setProducts(productOptions[client]);
      setProduct('');
    }
  }, [client]);

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);

    const formatted = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);

    setFormattedPrice(formatted);
    calculateTotal(value, quantity);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    calculateTotal(price, value);
  };

  const calculateTotal = (price, quantity) => {
    const numericPrice = parseFloat(price) || 0;
    const numericQuantity = parseInt(quantity, 10) || 0;
    const result = numericPrice * numericQuantity;

    const formattedTotal = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(result);

    setTotal(formattedTotal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación: Verificar que todos los campos estén completos
    if (!client || !product || !price || !quantity || !address || !phone || !date || !receiver || !outOfCoverage || !total) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor, complete todos los campos antes de registrar la entrega.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return; // No continúa si hay campos vacíos
    }

    try {
      await addDoc(collection(db, "deliveries"), {
        client,
        product,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        total,
        address,
        phone,
        date,
        receiver,
        outOfCoverage,
        paymentMethod,
        status: "Pendiente"
      });
      
      // Mostrar alerta de éxito con SweetAlert2
      Swal.fire({
        title: '¡Entrega registrada!',
        text: 'La entrega ha sido registrada correctamente con estado pendiente.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

      // Limpiar los campos después del registro
      setClient('');
      setProduct('');
      setPrice('');
      setFormattedPrice('');
      setQuantity('');
      setTotal('');
      setAddress('');
      setPhone('');
      setDate('');
      setReceiver('');
      setOutOfCoverage('');
      setPaymentMethod('');
      
    } catch (e) {
      console.error("Error al agregar la entrega: ", e);

      // Mostrar alerta de error con SweetAlert2
      Swal.fire({
        title: 'Error',
        text: 'Hubo un error al registrar la entrega.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="delivery-form-container">
      <h2 className='subtitle' >Registro de Entregas</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="client">Cliente:</label>
          <select id="client" value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="" disabled>Seleccione un cliente</option>
            <option value="Natural Care">Natural Care</option>
            <option value="Givaan">Givaan</option>
          </select>
        </div>
        <div>
          <label htmlFor="product">Producto:</label>
          <select id="product" value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="" disabled>Seleccione un producto</option>
            {products.map((prod, index) => (
              <option key={prod} value={prod}>{prod}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity">Cantidad:</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
          />
        </div>
        <div>
          <label htmlFor="price">Precio:</label>
          <input
            id="price"
            type="number"
            value={price}
            onChange={handlePriceChange}
          />
          <p>{formattedPrice}</p>
        </div>
        <div>
          <p><strong>Por Cobrar:</strong> {total}</p>
        </div>
        <div>
          <label htmlFor="receiver">Nombre del receptor:</label>
          <input
            id="receiver"
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="address">Dirección:</label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
         {/* Dropdown de fuera de cobertura */}
         <div>
          <label htmlFor="outOfCoverage">¿Entrega fuera de cobertura?</label>
          <select id="outOfCoverage" value={outOfCoverage} onChange={(e) => setOutOfCoverage(e.target.value)}>
            <option value="" disabled>Seleccione una opción</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label htmlFor="phone">Teléfono:</label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="date">Fecha de Registro:</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button type="submit">Registrar</button>
      </form>

      <div className="back-button-container">
        <Link to="/">
          <button className="back-button">Regresar a Inicio</button>
        </Link>
      </div>
    </div>
  );
};

export default AddDelivery;