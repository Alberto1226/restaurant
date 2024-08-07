import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownLong } from "@fortawesome/free-solid-svg-icons";
import { Badge, Container } from "react-bootstrap";
import "../../../../scss/styles.scss";
import DataTable from "react-data-table-component";
import { estilos } from "../../../../utils/tableStyled";

function ListIngredientesProductos(props) {
  console.log(props);
  const { listInsumos } = props;

  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: false,
      center: true,
      reorder: false,
    },
    {
      name: "Cantidad",
      selector: (row) => row.cantidad,
      sortable: false,
      center: true,
      reorder: false,
    },
    {
      name: "UM",
      selector: (row) => row.umTrabajo,
      sortable: false,
      center: true,
      reorder: false,
    },
    {
      name: "Precio",
      selector: (row) => (
        <>
          <Badge bg="success" className="estado text-sm">
            ${""}
            {new Intl.NumberFormat("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(row.precioCompra)}{" "}
            MXN
          </Badge>
        </>
      ),
      sortable: false,
      center: true,
      reorder: false,
    },

    {
      name: "Total",
      selector: (row) => (
        <>
          <Badge bg="success" className="estado text-sm">
            ${""}
            {new Intl.NumberFormat("es-MX", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(row.total)}{" "}
            MXN
          </Badge>
        </>
      ),
      sortable: false,
      center: true,
      reorder: false,
    },
  ];

  // Configurando animacion de carga
  const [pending, setPending] = useState(true);
  const [rows, setRows] = useState([]);

  const cargarDatos = () => {
    const timeout = setTimeout(() => {
      setRows(listInsumos);
      setPending(false);
    }, 0);
    return () => clearTimeout(timeout);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
  };

  const [resetPaginationToogle, setResetPaginationToogle] = useState(false);

  return (
    <>
      <Container fluid>
        <DataTable
          columns={columns}
          noDataComponent="No hay registros para mostrar"
          data={listInsumos}
          progressPending={pending}
          paginationComponentOptions={paginationComponentOptions}
          paginationResetDefaultPage={resetPaginationToogle}
          customStyles={estilos}
          sortIcon={<FontAwesomeIcon icon={faArrowDownLong} />}
        />
      </Container>
    </>
  );
}

export default ListIngredientesProductos;
