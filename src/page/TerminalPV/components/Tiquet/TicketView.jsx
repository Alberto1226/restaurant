import React from 'react';

const TicketView = ({ ticket }) => {
  if (!ticket) {
    return <div>No hay datos del ticket disponibles.</div>;
  }

  const handlePrint = () => {
    if (ticket.productos.length === 0) {
      console.log("agregue productos");
    } else {
      const tiquetGenerado = window.open(
        "Tiquet",
        "PRINT",
        "height=800,width=1200"
      );
      tiquetGenerado.document.write("<html><head>");
      tiquetGenerado.document.write(
        "<style>.tabla{width:100%;border-collapse:collapse;margin:16px 0 16px 0;}.tabla th{border:1px solid #ddd;padding:4px;background-color:#d4eefd;text-align:left;font-size:30px;}.tabla td{border:1px solid #ddd;text-align:left;padding:6px;} p {margin-top: -10px !important;} .cafe__number {margin-top: -10px !important;} .logotipo {width: 91px !important; margin: 0 auto;} img {width: 91px !important; margin: 0 auto;} .logotipoRappi {width: 91px !important; margin: 0 auto;} img {width: 91px !important; margin: 0 auto;}  .detallesTitulo {margin-top: 10px !important;} .ticket__actions {display: none !important;} .remove-icon {display: none !important;} .remove-icono {display: none !important;} .items__price {color: #000000 !important;} </style>"
      );
      tiquetGenerado.document.write("</head><body>");
      tiquetGenerado.document.write(
        document.getElementById("ticket-view").innerHTML
      );
      tiquetGenerado.document.write("</body></html>");

      tiquetGenerado.document.close();
      tiquetGenerado.focus();
      tiquetGenerado.print();
      tiquetGenerado.close();
    }
  };

  return (
    <>
      <div className="ticket-view" id="ticket-view">
        <h2>Ticket {ticket.numeroTiquet}</h2>
        <p><strong>Cliente:</strong> {ticket.cliente}</p>
        <p><strong>Fecha:</strong> {ticket.fecha ? new Date(ticket.fecha).toLocaleString() : 'Fecha no disponible'}</p>
        <p><strong>Forma de Pago:</strong> {ticket.tipoPago}</p>
        <p><strong>Total:</strong> {ticket.total}</p>
        <h3>Productos:</h3>
        <ul>
          {ticket.productos && Array.isArray(ticket.productos) ? (
            ticket.productos.map((producto, index) => (
              <li key={index}>
                {producto.nombre} - {producto.cantidad} x ${producto.precio}
              </li>
            ))
          ) : (
            <li>No hay productos disponibles</li>
          )}
        </ul>
        <p><strong>Observaciones:</strong> {ticket.observaciones}</p>
      </div>
      <div className="d-flex justify-content-center">
        <button className="btn btn-primary" onClick={() => handlePrint()}>
          <i className="fas fa-print"></i> Imp
        </button>
      </div>
    </>
  );
};

export default TicketView;
