import { useState, useEffect } from "react";
import "./ticket.css";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import BasicModal from "../../Modal/BasicModal";
import {
  obtenUltimoNoTiquet,
  registraVentas,
  actualizaTicket,
} from "../../../api/ventas";
import { Col, Button, Row, Image, Table } from "react-bootstrap";
import DatosExtraVenta from "../../Ventas/DatosExtraVenta";
import Descuento from "../../Ventas/Descuento";
import { logoTiquetGris } from "../../../assets/base64/logo-tiquet";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LogsInformativos } from "../../Logs/LogsSistema/LogsSistema";
import { actualizaDeshabilitarMesas } from "../../../api/mesas";

function Tiquet(props) {
  const { idUsuario, products, empty, remove } = props;

  const estadoticket = props.estadoticket;
  const mesaticket = props.mesaticket;
  const idmesa = props.mesaid;
  const idTiketMesa = props.idTicket;
  const add = props.agregar;
  console.log("agregar",add)

  //console.log("productos", props.products);

  //console.log("mesa en ticket", idmesa);

  //update a mesa
  const actualizarEstadoS = async () => {
    try {
      const dataTemp = {
        estado: "0",
        idTicket: numeroTiquet, // Agregar el id del ticket al objeto dataTemp
      };
      actualizaDeshabilitarMesas(idmesa, dataTemp).then((response) => {
        const { data } = response;
        toast.success(data.mensaje);
      });
    } catch (e) {
      console.log(e);
    }
  };

  const actualizarEstadoPagado = async () => {
    try {
      const dataTemp = {
        estado: "1",
        idTicket: "", // Agregar el id del ticket al objeto dataTemp
      };
      actualizaDeshabilitarMesas(idmesa, dataTemp).then((response) => {
        const { data } = response;
        toast.success(data.mensaje);
      });
    } catch (e) {
      console.log(e);
    }
  };

  // Importa el complemento de zona horaria
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(localizedFormat);

  const total = products.reduce(
    (amount, item) => amount + parseFloat(item.precio),
    0
  );

  const [determinaBusquedaTiquet, setDeterminaBusquedaTiquet] = useState(false);

  //Para el modal
  const [showModal, setShowModal] = useState(false);
  const [contentModal, setContentModal] = useState(null);
  const [titulosModal, setTitulosModal] = useState(null);

  const handleEmptyTicket = () => {
    empty();
    setTipoPago("");
    setIVA("0");
    setTipoPedido("");
    setHacerPedido("");
    setNombreCliente("");
    setDineroIngresado("");
    setObservaciones("");
    //setFormDatacantidadPagadaEfectivo();
    //setFormDatacantidadPagadaTarjeta();
    //setFormDatacantidadPagadaTransferencia();
    setTipoDescuento("");
    setFormDatacantidadPagadaEfectivo("");
    setFormDatacantidadPagadaTarjeta("");
    setFormDatacantidadPagadaTransferencia("");
    setPorcentajeDescontado("");
    setDineroDescontado("");
    setTipoDescuento("");
    setTotalFinal("");
  };

  const [IVA, setIVA] = useState("0");

  const handleIVACancel = () => {
    setIVA("0");
  };

  const handleIVAApply = () => {
    setIVA("0.16");
  };

  const handlePrint = () => {
    if (products.length === 0) {
      toast.warning("Debe cargar articulos a la venta");
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
        document.getElementById("ticketGenerado").innerHTML
      );
      tiquetGenerado.document.write("</body></html>");

      tiquetGenerado.document.close();
      tiquetGenerado.focus();
      tiquetGenerado.print();
      tiquetGenerado.close();
    }
  };

  const [numeroTiquet, setNumeroTiquet] = useState("");
  const MAX_INTENTOS_GENERACION = 100;
  //esta funcion verifica el numero anterior para establecer un numero y que no se repita el numero de ticket
  const verificaExistenciaNumeroTiquet = async (numeroTiquet) => {
    try {
      // Obtener el número del último tiquet desde el archivo ventas.js
      const response = await obtenUltimoNoTiquet();
      const ultimoNumeroTiquet = parseInt(response.data.noTiquet);
      // Verificar si el número generado ya existe
      let intentos = 0;
      while (intentos < MAX_INTENTOS_GENERACION) {
        if (ultimoNumeroTiquet === parseInt(numeroTiquet)) {
          // Incrementar el número del tiquet y seguir verificando
          numeroTiquet++;
          intentos++;
        } else {
          // El número generado es único
          return false;
        }
      }
      // Si llegamos a este punto, se ha intentado generar un número único varias veces sin éxito
      console.error(
        "No se pudo generar un número de tiquet único después de varios intentos"
      );
      return true; // Puedes manejar esto según tus necesidades
    } catch (error) {
      console.error(
        "Error al verificar la existencia del número de tiquet:",
        error
      );
      // Puedes manejar este error según tus necesidades
      throw error;
    }
  };

  useEffect(() => {
    if (
      idTiketMesa !== null &&
      idTiketMesa !== undefined &&
      idTiketMesa !== ""
    ) {
      setNumeroTiquet(idTiketMesa);
    } else {
      // Lógica para generar un nuevo número de tiquet
      setDeterminaBusquedaTiquet(false);

      const obtenerNumeroTiquet = async () => {
        try {
          const response = await obtenUltimoNoTiquet();
          const { data } = response;

          let nuevoNumeroTiquet;

          if (data.noTiquet === "0") {
            nuevoNumeroTiquet = "1";
          } else {
            // Incrementar el número hasta encontrar uno único
            let intentos = 0;
            do {
              intentos++;
              nuevoNumeroTiquet = (
                parseInt(data.noTiquet) + intentos
              ).toString();
              const existe = await verificaExistenciaNumeroTiquet(
                nuevoNumeroTiquet
              );
              if (!existe) {
                break; // Salir del bucle si el número es único
              }
            } while (intentos < MAX_INTENTOS_GENERACION);

            if (intentos === MAX_INTENTOS_GENERACION) {
              console.error(
                "No se pudo generar un número de ticket único después de varios intentos."
              );
              // Puedes manejar esta situación según tus necesidades
            }

            // Después de incrementar el número en 1, agregar un guion y cuatro letras aleatorias
            nuevoNumeroTiquet += "-" + generarLetrasAleatorias();
          }

          setNumeroTiquet(nuevoNumeroTiquet);
        } catch (error) {
          console.error("Error al obtener el último número de ticket:", error);
          setNumeroTiquet("1"); // Establecer a 1 en caso de error
        }
      };

      // Función para generar letras aleatorias
      const generarLetrasAleatorias = () => {
        const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let letrasAleatorias = "";
        for (let i = 0; i < 5; i++) {
          const indice = Math.floor(Math.random() * letras.length);
          letrasAleatorias += letras.charAt(indice);
        }
        return letrasAleatorias;
      };

      obtenerNumeroTiquet();
    }
  }, [idTiketMesa, determinaBusquedaTiquet]);

  const handleRegistraVenta = () => {
    let iva = "0";
    let comision = "0";

    if (IVA === "0.16") {
      iva = "0.16";
    }

    if (products.length === 0) {
      toast.warning("Debe cargar articulos a la venta");
    } else {
      const hoy = new Date();
      const grupo = hoy.getMonth() + 1;
      const añoVenta = hoy.getFullYear();

      // Configurar el objeto Date para que tome en cuenta el inicio de semana según tu localidad
      hoy.setHours(0, 0, 0);
      hoy.setDate(hoy.getDate() + 4 - (hoy.getDay() || 7));

      // Calcular el número de la semana
      const yearStart = new Date(hoy.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(((hoy - yearStart) / 86400000 + 1) / 7);
      const formattedDate = dayjs(fechayHoraSinFormato)
        .tz("America/Mexico_City")
        .format("YYYY-MM-DDTHH:mm:ss.SSS");

      const descuentoCalculado =
        parseFloat(porcentajeDescontado) > 0
          ? parseFloat(total) * parseFloat(porcentajeDescontado)
          : parseFloat(dineroDescontado);
      const totalCalculado = parseFloat(total) - descuentoCalculado;

      try {
        const dataTemp = {
          numeroTiquet: numeroTiquet,
          cliente: nombreCliente,
          tipo: "Pedido inicial",
          mesa: mesaticket,
          usuario: idUsuario,
          estado: estadoticket ? estadoticket : "cerrado",
          detalles: observaciones,
          tipoPago: tipoPago,
          tipoPedido: tipoPedido,
          hacerPedido: hacerPedido,
          efectivo: dineroIngresado,
          pagado:
            hacerPedido == "por WhatsApp" || hacerPedido == "por llamada"
              ? "false"
              : tipoPedido == "para comer aquí"
              ? "false"
              : "true",
          cambio:
            parseFloat(dineroIngresado) -
            (parseFloat(total) +
              parseFloat(total) * parseFloat(iva) +
              parseFloat(total) * parseFloat(comision))
              ? parseFloat(dineroIngresado) -
                (parseFloat(total) +
                  parseFloat(total) * parseFloat(iva) +
                  parseFloat(total) * parseFloat(comision))
              : "0",
          productos: products,
          tipoDescuento: tipoDescuento,
          descuento: descuentoCalculado,
          iva: parseFloat(total) * parseFloat(iva),
          comision: parseFloat(total) * parseFloat(comision),
          subtotal: total,
          atendido: "false",
          total:
            totalCalculado +
            parseFloat(totalCalculado) * parseFloat(iva) +
            parseFloat(totalCalculado) * parseFloat(comision),
          agrupar: grupo,
          año: añoVenta,
          semana: weekNumber,

          createdAt: formattedDate,
          metodosPago: formDataCantidadPagada,
        };

        registraVentas(dataTemp).then((response) => {
          const { data } = response;
          setDeterminaBusquedaTiquet(true);
          LogsInformativos(
            "Se ha registrado la venta " + numeroTiquet,
            data.datos
          );
          //console.log("se a registrado la venta");
          handlePrint();
          toast.success(data.mensaje);
          actualizarEstadoS();
          handleEmptyTicket();
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleActualizarVenta = async (idTiket) => {
    let iva = "0";
    let comision = "0";

    if (IVA === "0.16") {
      iva = "0.16";
    }

    if (products.length === 0) {
      toast.warning("Debe cargar artículos para la venta");
    } else {
      try {
        const hoy = new Date();
        const grupo = hoy.getMonth() + 1;
        const añoVenta = hoy.getFullYear();

        // Configurar el objeto Date para que tome en cuenta el inicio de semana según tu localidad
        hoy.setHours(0, 0, 0);
        hoy.setDate(hoy.getDate() + 4 - (hoy.getDay() || 7));

        // Calcular el número de la semana
        const yearStart = new Date(hoy.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((hoy - yearStart) / 86400000 + 1) / 7);
        const formattedDate = dayjs(fechayHoraSinFormato)
          .tz("America/Mexico_City")
          .format("YYYY-MM-DDTHH:mm:ss.SSS");

        const descuentoCalculado =
          parseFloat(porcentajeDescontado) > 0
            ? parseFloat(total) * parseFloat(porcentajeDescontado)
            : parseFloat(dineroDescontado);
        const totalCalculado = parseFloat(total) - descuentoCalculado;

        const datosActualizados = {
          numeroTiquet: numeroTiquet,
          cliente: nombreCliente,
          tipo: "Pedido actualizado",
          mesa: mesaticket,
          usuario: idUsuario,
          estado: estadoticket,
          detalles: observaciones,
          tipoPago: tipoPago,
          tipoPedido: tipoPedido,
          hacerPedido: hacerPedido,
          efectivo: dineroIngresado,
          pagado: "false",
          cambio:
            parseFloat(dineroIngresado) -
            (parseFloat(total) +
              parseFloat(total) * parseFloat(iva) +
              parseFloat(total) * parseFloat(comision))
              ? parseFloat(dineroIngresado) -
                (parseFloat(total) +
                  parseFloat(total) * parseFloat(iva) +
                  parseFloat(total) * parseFloat(comision))
              : "0",
          productos: products,
          tipoDescuento: tipoDescuento,
          descuento: descuentoCalculado,
          iva: parseFloat(total) * parseFloat(iva),
          comision: parseFloat(total) * parseFloat(comision),
          subtotal: total,
          atendido: "false",
          total:
            totalCalculado +
            parseFloat(totalCalculado) * parseFloat(iva) +
            parseFloat(totalCalculado) * parseFloat(comision),
          agrupar: grupo,
          año: añoVenta,
          semana: weekNumber,
          createdAt: formattedDate,
          metodosPago: formDataCantidadPagada,
        };
        console.log("data venta", datosActualizados);

        const response = await actualizaTicket(idTiket, datosActualizados);
        //console.log("respuesta-->",response);
        if (response.request.status == 200) {
          //console.log("respuesta-->",response);
          setDeterminaBusquedaTiquet(true);
          LogsInformativos(
            "Se ha actualizado la venta " + numeroTiquet,
            response.venta
          );
          //console.log("se a actualizado la venta");

          toast.success(response.data.mensaje);
          setShowModal(false);
        } else {
          toast.error(response.data.mensaje);
        }
      } catch (e) {
        console.error(e);
        toast.error("Error al actualizar la venta");
      }
    }
  };

  const handlePagarVenta = async (idTiket) => {
    let iva = "0";
    let comision = "0";

    if (IVA === "0.16") {
      iva = "0.16";
    }

    if (products.length === 0) {
      toast.warning("Debe cargar artículos para la venta");
    } else {
      try {
        const hoy = new Date();
        const grupo = hoy.getMonth() + 1;
        const añoVenta = hoy.getFullYear();

        // Configurar el objeto Date para que tome en cuenta el inicio de semana según tu localidad
        hoy.setHours(0, 0, 0);
        hoy.setDate(hoy.getDate() + 4 - (hoy.getDay() || 7));

        // Calcular el número de la semana
        const yearStart = new Date(hoy.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((hoy - yearStart) / 86400000 + 1) / 7);
        const formattedDate = dayjs(fechayHoraSinFormato)
          .tz("America/Mexico_City")
          .format("YYYY-MM-DDTHH:mm:ss.SSS");

        const descuentoCalculado =
          parseFloat(porcentajeDescontado) > 0
            ? parseFloat(total) * parseFloat(porcentajeDescontado)
            : parseFloat(dineroDescontado);
        const totalCalculado = parseFloat(total) - descuentoCalculado;

        const datosActualizados = {
          numeroTiquet: numeroTiquet,
          cliente: nombreCliente,
          tipo: "Pedido pagado",
          mesa: mesaticket,
          usuario: idUsuario,
          estado: estadoticket,
          detalles: observaciones,
          tipoPago: tipoPago,
          tipoPedido: tipoPedido,
          hacerPedido: hacerPedido,
          efectivo: dineroIngresado,
          pagado: "true",
          cambio:
            parseFloat(dineroIngresado) -
            (parseFloat(total) +
              parseFloat(total) * parseFloat(iva) +
              parseFloat(total) * parseFloat(comision))
              ? parseFloat(dineroIngresado) -
                (parseFloat(total) +
                  parseFloat(total) * parseFloat(iva) +
                  parseFloat(total) * parseFloat(comision))
              : "0",
          productos: products,
          tipoDescuento: tipoDescuento,
          descuento: descuentoCalculado,
          iva: parseFloat(total) * parseFloat(iva),
          comision: parseFloat(total) * parseFloat(comision),
          subtotal: total,
          atendido: "true",
          total:
            totalCalculado +
            parseFloat(totalCalculado) * parseFloat(iva) +
            parseFloat(totalCalculado) * parseFloat(comision),
          agrupar: grupo,
          año: añoVenta,
          semana: weekNumber,
          createdAt: formattedDate,
          metodosPago: formDataCantidadPagada,
        };

        const response = await actualizaTicket(idTiket, datosActualizados);
        //console.log("respuesta-->",response);
        if (response.request.status == 200) {
          //console.log("respuesta-->",response);
          setDeterminaBusquedaTiquet(true);
          LogsInformativos(
            "Se ha actualizado la venta " + numeroTiquet,
            response.venta
          );
          toast.success(response.data.mensaje);
          handlePrint();
          handleEmptyTicket();
          actualizarEstadoPagado();
          setShowModal(false);
        } else {
          toast.error(response.data.mensaje);
        }
      } catch (e) {
        console.error(e);
        toast.error("Error al actualizar la venta");
      }
    }
  };

  // Función para verificar funcion de botón
  const registraOActualiza = () => {
    if (
      idTiketMesa !== null &&
      idTiketMesa !== undefined &&
      idTiketMesa !== ""
    ) {
      // El idTiketMesa no es null, undefined ni una cadena vacía, entonces actualiza la venta
      handleActualizarVenta(idTiketMesa);
    } else {
      // El idTiketMesa es null, undefined o una cadena vacía, entonces registra una nueva venta
      handleRegistraVenta();
    }
  };

  const handleDeleteProduct = (item) => {
    remove(item);
  };

  // Para almacenar el nombre del cliente
  const [tipoDescuento, setTipoDescuento] = useState("");
  // Para almacenar el nombre del cliente
  const [dineroDescontado, setDineroDescontado] = useState("0");
  // Para almacenar el nombre del cliente
  const [porcentajeDescontado, setPorcentajeDescontado] = useState("0");
  // Para almacenar el nombre del cliente
  const [nombreCliente, setNombreCliente] = useState("");
  // Para almacenar el numero de mesa
  const [mesa, setMesa] = useState("");
  // Para alamcenar el dinero ingresado
  const [dineroIngresado, setDineroIngresado] = useState("");
  // Para almacenar el tipo de pago
  const [tipoPago, setTipoPago] = useState("efectivo");
  // Para almacenar el tipo de pedido
  const [tipoPedido, setTipoPedido] = useState("");
  // Para almacenar la forma en la que se hizo el pedido
  const [hacerPedido, setHacerPedido] = useState("");
  // Para almacenar las observaciones
  const [observaciones, setObservaciones] = useState("");
  // para almacenar metodos de pago
  const [formDatacantidadPagadaEfectivo, setFormDatacantidadPagadaEfectivo] =
    useState("");
  const [formDatacantidadPagadaTarjeta, setFormDatacantidadPagadaTarjeta] =
    useState("");
  const [
    formDatacantidadPagadaTransferencia,
    setFormDatacantidadPagadaTransferencia,
  ] = useState("");

  //agrupar metodos de pago
  const [formDataCantidadPagada, setFormDataCantidadPagada] = useState([
    { metodo: "efectivo", cantidadPagada: formDatacantidadPagadaEfectivo },
    { metodo: "tarjeta", cantidadPagada: formDatacantidadPagadaTarjeta },
    {
      metodo: "transferencia",
      cantidadPagada: formDatacantidadPagadaTransferencia,
    },
  ]);

  useEffect(() => {
    setFormDataCantidadPagada([
      { metodo: "efectivo", cantidadPagada: formDatacantidadPagadaEfectivo },
      { metodo: "tarjeta", cantidadPagada: formDatacantidadPagadaTarjeta },
      {
        metodo: "transferencia",
        cantidadPagada: formDatacantidadPagadaTransferencia,
      },
    ]);
    //console.log("Contenido de formDataCantidadPagada:", formDatacantidadPagadaEfectivo);
  }, [
    formDatacantidadPagadaEfectivo,
    formDatacantidadPagadaTarjeta,
    formDatacantidadPagadaTransferencia,
  ]);

  useEffect(() => {
    console.log("Contenido de formDataCantidadPagada:", formDataCantidadPagada);

    // Actualizar el estado de formDataCantidadPagada con sus últimos datos
    setFormDataCantidadPagada((prevState) => prevState);
  }, [formDataCantidadPagada]);

  //console.log(formDatacantidadPagadaEfectivo,formDatacantidadPagadaTarjeta,formDatacantidadPagadaTransferencia);
  // Para el modal de las observaciones
  const datosExtraVenta = (content) => {
    setTitulosModal("Datos extra de la venta");
    setContentModal(content);
    setShowModal(true);
  };
  //Para el modal de descuentos
  const descuento = (content) => {
    setTitulosModal("Descuento");
    setContentModal(content);
    setShowModal(true);
  };

  //Para el modal de descuentos
  const metodosPago = (content) => {
    setTitulosModal("Metodos pago");
    setContentModal(content);
    setShowModal(true);
  };

  const [fechayHora, setFechayHora] = useState("");
  const [fechayHoraSinFormato, setFechayHoraSinFormato] = useState("");

  useEffect(() => {
    const hoy = new Date();
    const adjustedDate = dayjs(hoy).utc().utcOffset(-360).format(); // Ajusta la hora a CST (UTC -6)

    setFechayHora(dayjs(adjustedDate).locale("es").format("dddd, LL hh:mm A"));
    setFechayHoraSinFormato(adjustedDate);
  }, []);

  const [totalFinal, setTotalFinal] = useState(0);

  useEffect(() => {
    setTotalFinal(
      parseFloat(porcentajeDescontado) > 0
        ? parseFloat(total) -
            parseFloat(total) * parseFloat(porcentajeDescontado)
        : parseFloat(dineroDescontado) > 0
        ? parseFloat(total) - parseFloat(dineroDescontado)
        : total
    );
  }, [total, porcentajeDescontado, dineroDescontado]);

  const Encabezado = ({
    logo,
    logoRappi,
    numeroTiquet,
    mesa,
    nombreCliente,
    tipoPedido,
    hacerPedido,
    fechayHora,
  }) => {
    return (
      <div className="cafe">
        {/**/}
        <div id="logoFinal" className="logotipo">
          <Image src={logo} alt="logo" />
        </div>
        <div className="card card-widget widget-user">
          <div className="card-body">
            <div className="row">
              <div className="col-sm-4 border-right">
                <div className="description-block">
                  <h5 className="description-header">Tel</h5>
                  <span className="description-text">442-714-09-79</span>
                </div>
              </div>
              <div className="col-sm-4 border-right">
                <div className="description-block">
                  <h5 className="description-header">Ticket</h5>
                  <span className="description-text">#{numeroTiquet}</span>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="description-block">
                  <h5 className="description-header">Mesa</h5>
                  <span className="description-text">
                    {tipoPedido !== "para llevar" && (
                      <>
                        <p className="invoice__cliente">{mesaticket}</p>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/**/}
        <div className="detallesTitulo">
          <p className="invoice__cliente">Pedido {tipoPedido}</p>
          <p className="invoice__cliente">Hecho {hacerPedido}</p>
          <p className="cafe__number">{fechayHora}</p>
        </div>
      </div>
    );
  };

  const Cuerpo = ({ products, onClick }) => {
    return (
      <div className="ticket__table">
        <Table>
          <thead>
            <tr>
              <th className="items__numeracion">#</th>
              <th className="items__description">Descripción</th>
              <th className="items__qty">Cantidad</th>
              <th className="items__price">Precio</th>
              <th className="remove-icono">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}.- </td>
                <td className="items__description">{item.nombre}</td>
                <td>1</td>
                <td>
                  ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(item.precio)}{" "}
                  MXN
                </td>
                <td
                  title="Quitar producto"
                  onClick={() => onClick(item)}
                  className="remove-icon"
                >
                  ❌
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  const Pie = ({ observaciones, tipoPago, total, IVA, dineroIngresado }) => {
    return (
      <div className="subtotal">
        <hr />
        <Row>
          <Col>
            <p className="observaciones__tiquet">{observaciones}</p>
          </Col>
          <Col>
            <div className="subtotal__cambio">
              {formDatacantidadPagadaEfectivo && (
                <div>
                  Pago realizado con Efectivo: {formDatacantidadPagadaEfectivo}
                </div>
              )}
              {formDatacantidadPagadaTarjeta && (
                <div>
                  Pago realizado con Tarjeta: {formDatacantidadPagadaTarjeta}
                </div>
              )}
              {formDatacantidadPagadaTransferencia && (
                <div>
                  Pago realizado con Transferencia:{" "}
                  {formDatacantidadPagadaTransferencia}
                </div>
              )}
            </div>

            <div className="subtotal__cambio">
              Descuento{" "}
              {parseFloat(porcentajeDescontado) > 0
                ? parseFloat(porcentajeDescontado) * 100 + "%"
                : parseFloat(dineroDescontado) > 0
                ? "$" + parseFloat(dineroDescontado)
                : "0"}
            </div>

            <div className="subtotal__IVA"></div>

            <div className="subtotal__price">
              Subtotal ${""}
              {new Intl.NumberFormat("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(
                parseFloat(porcentajeDescontado) > 0
                  ? parseFloat(total) -
                      parseFloat(total) * parseFloat(porcentajeDescontado)
                  : parseFloat(dineroDescontado) > 0
                  ? parseFloat(total) - parseFloat(dineroDescontado)
                  : total
              )}{" "}
              MXN
            </div>

            {tipoPago === "Efectivo" && IVA === "0.16" && (
              <>
                <div className="subtotal__IVA">
                  IVA ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(total) * parseFloat(IVA)
                      ? parseFloat(total) * parseFloat(IVA)
                      : "0"
                  )}{" "}
                  MXN
                </div>

                <div className="subtotal__total">
                  Total ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(total) + parseFloat(total) * parseFloat(IVA)
                      ? parseFloat(total) + parseFloat(total) * parseFloat(IVA)
                      : "0"
                  )}{" "}
                  MXN
                </div>
              </>
            )}

            {tipoPago === "Efectivo" && IVA === "0" && (
              <>
                <div className="subtotal__total">
                  Total ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(parseFloat(total) ? parseFloat(total) : "0")}{" "}
                  MXN
                </div>
              </>
            )}

            {tipoPago === "Tarjeta" && IVA === "0.16" && (
              <>
                <div className="subtotal__IVA">
                  IVA ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(total) * parseFloat(IVA)
                      ? parseFloat(total) * parseFloat(IVA)
                      : "0"
                  )}{" "}
                  MXN
                </div>

                <div className="subtotal__total">
                  Total ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(total) + parseFloat(total) * parseFloat(IVA)
                      ? parseFloat(total) + parseFloat(total) * parseFloat(IVA)
                      : "0"
                  )}{" "}
                  MXN
                </div>
              </>
            )}

            {tipoPago === "Tarjeta" && IVA === "0" && (
              <>
                <div className="subtotal__total">
                  Total ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(parseFloat(total) ? parseFloat(total) : "0")}{" "}
                  MXN
                </div>
              </>
            )}

            {tipoPago === "Transferencia" && IVA === "0.16" && (
              <>
                <div className="subtotal__total">
                  IVA ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(total) * parseFloat(IVA)
                      ? parseFloat(total) * parseFloat(IVA)
                      : "0"
                  )}{" "}
                  MXN
                </div>
                <div className="subtotal__total">
                  Total ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(total) + parseFloat(total) * parseFloat(IVA)
                      ? parseFloat(total) + parseFloat(total) * parseFloat(IVA)
                      : "0"
                  )}{" "}
                  MXN
                </div>
              </>
            )}

            {tipoPago === "Transferencia" && IVA === "0" && (
              <>
                <div className="subtotal__total">
                  Total ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(parseFloat(total) ? parseFloat(total) : "0")}{" "}
                  MXN
                </div>
              </>
            )}

            {tipoPago === "Efectivo" && (
              <>
                <div className="subtotal__cambio">
                  Efectivo ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(dineroIngresado)
                      ? parseFloat(dineroIngresado)
                      : "0"
                  )}{" "}
                  MXN
                </div>
                <div className="subtotal__cambio">
                  Cambio ${""}
                  {new Intl.NumberFormat("es-MX", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(
                    parseFloat(dineroIngresado) -
                      (parseFloat(total) + parseFloat(total) * parseFloat(IVA))
                      ? parseFloat(dineroIngresado) -
                          (parseFloat(total) +
                            parseFloat(total) * parseFloat(IVA))
                      : "0"
                  )}{" "}
                  MXN
                </div>
              </>
            )}
          </Col>
        </Row>
        <hr />
      </div>
    );
  };

  const Opciones = ({ icon }) => {
    return (
      <div className="ticket__actions">
        <button
          title="Descuento"
          onClick={() =>
            datosExtraVenta(
              <DatosExtraVenta
                tipoDescuento={tipoDescuento}
                setTipoDescuento={setTipoDescuento}
                dineroDescontado={dineroDescontado}
                setDineroDescontado={setDineroDescontado}
                porcentajeDescontado={porcentajeDescontado}
                setPorcentajeDescontado={setPorcentajeDescontado}
                setTipoPago={setTipoPago}
                setDineroIngresado={setDineroIngresado}
                setTipoPedido={setTipoPedido}
                setHacerPedido={setHacerPedido}
                setNombreCliente={setNombreCliente}
                setObservaciones={setObservaciones}
                setFormDatacantidadPagadaEfectivo={
                  setFormDatacantidadPagadaEfectivo
                }
                setFormDatacantidadPagadaTarjeta={
                  setFormDatacantidadPagadaTarjeta
                }
                setFormDatacantidadPagadaTransferencia={
                  setFormDatacantidadPagadaTransferencia
                }
                setMesa={setMesa}
                tipoPago={tipoPago}
                dineroIngresado={dineroIngresado}
                tipoPedido={tipoPedido}
                hacerPedido={hacerPedido}
                nombreCliente={nombreCliente}
                observaciones={observaciones}
                cantidadPagadaEfectivo={formDatacantidadPagadaEfectivo}
                cantidadPagadaTarjeta={formDatacantidadPagadaTarjeta}
                cantidadPagadaTransferencia={
                  formDatacantidadPagadaTransferencia
                }
                mesa={mesa}
                setShowModal={setShowModal}
                total={totalFinal}
              />
            )
          }
        >
          <i className="fas fa-check"></i>
        </button>

        {tipoPago && tipoPago.trim() !== "" && (
          <>
            {add === "true" ? (
               <>
               {(formDatacantidadPagadaEfectivo !== undefined && formDatacantidadPagadaEfectivo.trim() !== "" ||
                formDatacantidadPagadaTarjeta !== undefined && formDatacantidadPagadaTarjeta.trim() !== "" ||
                formDatacantidadPagadaTransferencia !== undefined && formDatacantidadPagadaTransferencia.trim() !== "") ? (
                  
                  <button
                  title="Cobrar"
                  onClick={() => handlePagarVenta(idTiketMesa)}
                >
                  <i className="fas fa-money-bill"></i>
                </button>
                 
               ) : (
                <button
                title="Registrar venta"
                onClick={() => registraOActualiza()}
              >
                <i className="fas fa-plus"></i>
              </button>
               )}
             </>
            ) : add == undefined ? (
              <button
                title="Cobrar"
                onClick={() => registraOActualiza()}
              >
                <i className="fas fa-money-bill"></i>
              </button>
            ) : null}
          </>
        )}
        
        <button title="Limpiar el ticket" onClick={() => handleEmptyTicket()}>
          🗑️
        </button>

        <button title="Aplicar IVA" onClick={() => handleIVAApply()}>
          🧾
        </button>

        <button title="Cancelar IVA" onClick={() => handleIVACancel()}>
          🚫️
        </button>
      </div>
    );
  };

  return (
    <>
      <div id="ticketGenerado" className="ticket">
        <div className="ticket__information">
          {/**/}
          <Encabezado
            logo={logoTiquetGris}
            numeroTiquet={numeroTiquet}
            nombreCliente={nombreCliente}
            mesa={mesa}
            tipoPedido={tipoPedido}
            hacerPedido={hacerPedido}
            fechayHora={fechayHora}
          />

          {/**/}
          <Cuerpo products={products} onClick={handleDeleteProduct} />

          {/**/}
          <Pie
            observaciones={observaciones}
            tipoPago={tipoPago}
            total={totalFinal}
            IVA={IVA}
            dineroIngresado={dineroIngresado}
          />
        </div>
        <Opciones icon={faCircleInfo} />
      </div>

      <BasicModal show={showModal} setShow={setShowModal} title={titulosModal}>
        {contentModal}
      </BasicModal>
    </>
  );
}

export default Tiquet;
