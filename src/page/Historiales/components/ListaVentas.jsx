import { useEffect, useState } from "react";
import { listarVentasRangoFechas } from "../../../api/ventas";
import CancelarVenta from "../../Ventas/components/CancelarVenta/CancelarVenta";
import dayjs from "dayjs";
import DataTable from "react-data-table-component";
import { estilos } from "../../../utils/tableStyled";
import { Badge, Button, Card, Col, Container, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import BasicModal from "../../../components/Modal/BasicModal";
import DetallesListaVentas from "./DetallesListaVentas";
import { listarCategorias} from "../../../api/categorias";
import ReporteCSV from "./GenerarDocs/ReportePDF";
import { Bar } from "react-chartjs-2";
import Utilidades from "./Utilidades";
import {
  getTokenApi,
  isExpiredToken,
  logoutApi,
  obtenidusuarioLogueado,
} from "../../api/auth";

function ListVentas(props) {
  console.log(props);
  const { fechaInicial, fechaFinal, filtros } = props;

  const [tipoUsuario, setTipoUsuario] = useState("");

  const obtenerDatosUsuario = () => {
    try {
      obtenerUsuario(obtenidusuarioLogueado(getTokenApi()))
        .then((response) => {
          const { data } = response;
          //console.log(data)
          setTipoUsuario(data.admin);
        })
        .catch((e) => {
          if (e.message === "Network Error") {
            //console.log("No hay internet")
            toast.error("Conexión al servidor no disponible");
          }
        });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    obtenerDatosUsuario();
  }, []);

  const [listCategorias, setListCategorias] = useState([]);
  const [categoriasCargadas, setCategoriasCargadas] = useState(false);
  const [listVentas, setListVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [contadorVentas, setContadorVentas] = useState(0);
  const [totalTotal, setTotalTotal] = useState(0);
  const [totalEfectivo, setTotalEfectivo] = useState(0);
  const [totalTransferencia, setTotalTransferencia] = useState(0);
  const [totalTDC, setTotalTDC] = useState(0);

  // PARA EL MODAL
  const [showModal, setShowModal] = useState(false);
  const [contentModal, setContentModal] = useState(null);
  const [titulosModal, setTitulosModal] = useState(null);

  const cargarCategorias = async () => {
    try {
      const response = await listarCategorias();
      const { data } = response;

      const categoriasConProds = data.map((categoria) => ({
        id: categoria._id,
        nombre: categoria.nombre,
        cantProds: 0,
      }));

      setListCategorias(categoriasConProds);
      setCategoriasCargadas(true);
    } catch (error) {
      console.log(error);
    }
  };

  const detallesListaVentas = (content) => {
    setTitulosModal("Detalles Ventas");
    setContentModal(content);
    setShowModal(true);
  };

  const cancelarVenta = (content) => {
    setTitulosModal("Cancelar venta");
    setContentModal(content);
    setShowModal(true);
  };

  const obtenerVentasPorFechas = async () => {
    try {
      // Asegurarse de que las fechas están en el formato correcto
      const fechaInicio = dayjs(fechaInicial).format("YYYY-MM-DD");
      const fechaFin = dayjs(fechaFinal).format("YYYY-MM-DD");

      console.log(fechaInicio, fechaFin);

      const response = await listarVentasRangoFechas(fechaInicio, fechaFin);
      const { data } = response;
      setListVentas(data);
      filtrarVentas(data); // Aplicar filtros a las ventas recibidas
    } catch (error) {
      console.log(error);
    }
  };

  const filtrarVentas = (ventas) => {
    let ventasFiltradas = ventas;

    if (filtros.efectivo || filtros.tdc || filtros.transferencia) {
      ventasFiltradas = ventasFiltradas.filter((venta) => {
        return (
          (filtros.efectivo && venta.tipoPago === "Efectivo") ||
          (filtros.tdc && venta.tipoPago === "TDC") ||
          (filtros.transferencia && venta.tipoPago === "Transferencia")
        );
      });
    }

    setVentasFiltradas(ventasFiltradas);
    setContadorVentas(ventasFiltradas.length);
    obtenerTotalesVentas(ventasFiltradas);
  };

  const obtenerTotalesVentas = (ventas) => {
    let totalTotal = ventas.reduce((acc, venta) => acc + venta.total, 0);
    let totalEfectivo = ventas
      .filter((venta) => venta.tipoPago === "Efectivo")
      .reduce((acc, venta) => acc + venta.total, 0);
    let totalTransferencia = ventas
      .filter((venta) => venta.tipoPago === "Transferencia")
      .reduce((acc, venta) => acc + venta.total, 0);
    let totalTDC = ventas
      .filter((venta) => venta.tipoPago === "TDC")
      .reduce((acc, venta) => acc + venta.total, 0);

    setTotalTotal(totalTotal);
    setTotalEfectivo(totalEfectivo);
    setTotalTransferencia(totalTransferencia);
    setTotalTDC(totalTDC);
  };

  useEffect(() => {
    if (fechaInicial && fechaFinal) {
      obtenerVentasPorFechas();
      cargarCategorias();
    }
  }, [fechaInicial, fechaFinal, filtros]);

  const columns = [
    {
      name: "No. Ticket",
      selector: (row) => row.numeroTiquet,
      sortable: false,
      center: true,
      reorder: false,
    },
    {
      name: "Tipo pedido",
      selector: (row) => (
        <>
          {row.hacerPedido} / {row.tipoPedido}
        </>
      ),
      sortable: false,
      center: true,
      reorder: false,
    },
    {
      name: "Fecha",
      selector: (row) =>
        dayjs(row.fecha).add(6, "hour").format("DD-MM-YYYY HH:mm A"),
      sortable: true,
      center: true,
      reorder: false,
    },
    {
      name: "Productos",
      selector: (row) => row.productos.length, // Asegúrate de que productos sea un array
      sortable: false,
      center: true,
      reorder: false,
    },
    {
      name: "Método de Pago",
      selector: (row) =>
        row.metodosPago.efectivo.estado
          ? "Efectivo"
          : row.metodosPago.tdc.estado
          ? "TDC"
          : "Transferencia",
      sortable: false,
      center: true,
      reorder: false,
    },
    {
      name: "Total",
      selector: (row) => (
        <>
          <Badge className="text-sm" bg="success">
            $
            {new Intl.NumberFormat("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(row.total)}{" "}
            MXN
          </Badge>
        </>
      ),
      sortable: true,
      center: true,
      reorder: false,
    },
    {
      name: "Acciones",
      selector: (row) => (
        <>
        {tipoUsuario == "true" ? (<>
          <div className="flex justify-end items-center space-x-4">
            <Badge
              className="cursor-pointer"
              bg="danger"
              onClick={() =>
                cancelarVenta(
                  <CancelarVenta
                    datosInsumos={row}
                    setShow={setShowModal}
                    datosVentas={row}
                  />
                )
              }
            >
              <FontAwesomeIcon icon={faTrashCan} className="text-lg" />
            </Badge>
          </div>
          </>) : (
            <>
            No disponibles
            </>
          )}
        </>
      ),
      sortable: false,
      center: true,
      reorder: false,
    },
  ];

  const contarProds = () => {
    const categoriasActualizadas = listCategorias.map((categoria) => ({
      ...categoria,
      cantProds: 0, // Reiniciar el conteo antes de sumar los productos
    }));

    ventasFiltradas.forEach((venta) => {
      venta.productos.forEach((producto) => {
        const encontrado = categoriasActualizadas.find(
          (cat) => cat.id === producto.categoria
        );
        if (encontrado) {
          encontrado.cantProds += 1;
        }
      });
    });

    return categoriasActualizadas;
  };

  const [categoriasContadas, setCategoriasContadas] = useState([]);

  useEffect(() => {
    setCategoriasContadas(contarProds());
  }, [listCategorias, listVentas]);

  const chartData = {
    labels: categoriasContadas.map((cat) => cat.nombre),
    datasets: [
      {
        label: "Productos Vendidos",
        data: categoriasContadas.map((cat) => cat.cantProds),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <Row>
        <Col>
          <Card bg="success" text="white" className="p-0">
            <Card.Body className="p-2">
              <p className="fs-6 mb-0">Total de {contadorVentas} ventas:</p>
              <h3>$ {totalTotal}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="success" text="white" className="p-0">
            <Card.Body className="p-2">
              <p className="fs-6 mb-0">Total en Efectivo:</p>
              <h3>$ {totalEfectivo}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="success" text="white" className="p-0">
            <Card.Body className="p-2">
              <p className="fs-6 mb-0">Total en Transferencia:</p>
              <h3>$ {totalTransferencia}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="success" text="white" className="p-0">
            <Card.Body className="p-2">
              <p className="fs-6 mb-0">Total en TDC:</p>
              <h3>$ {totalTDC}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Container className="p-0" text="black" border="0">
            <div className="d-flex justify-content-around">
              <ReporteCSV
                listCategorias={listCategorias}
                listVentas={listVentas}
                fechaInicial={fechaInicial}
                fechaFinal={fechaFinal}
              />
            </div>
            <div className="mt-2 d-flex justify-content-center">
              <Button
                className=""
                variant="secondary"
                onClick={() =>
                  detallesListaVentas(
                    <DetallesListaVentas
                      listCategorias={categoriasContadas}
                      listVentas={listVentas}
                      setShow={setShowModal}
                      fechaInicial={fechaInicial}
                      fechaFinal={fechaFinal}
                    />
                  )
                }
              >
                <FontAwesomeIcon icon={faCircleInfo} /> Ver detalles
              </Button>
            </div>
          </Container>
        </Col>
      </Row>
      <Row>
        <DataTable
          columns={columns}
          data={ventasFiltradas}
          customStyles={estilos}
          pagination
          paginationPerPage={10} // Cambia este número según tus necesidades
          paginationRowsPerPageOptions={[5, 10, 20, 30]} // Opciones para filas por página
        />
      </Row>

      <hr className="mt-0" />
      <Row className="d-flex justify-content-center">
        <Col md={6}>
          {" "}
          {/* Ajusta el tamaño de la columna */}
          <div className="d-flex justify-content-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </Col>
        <Col
          md={6}
          className="d-flex align-items-center justify-content-center"
        >
          <Utilidades listVentas={ventasFiltradas} totalVentas={totalTotal} />
        </Col>
      </Row>

      <BasicModal show={showModal} setShow={setShowModal} title={titulosModal}>
        {contentModal}
      </BasicModal>
    </>
  );
}

export default ListVentas;
