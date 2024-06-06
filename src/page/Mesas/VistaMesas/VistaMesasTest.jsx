import React, { useState, useEffect } from "react";
import "../style.css";
import BasicModal from "../../../components/Modal/BasicModal";
import RegistoMesas from "../RegistroMesas/RegistoMesas";
import { obtenerMesas } from "../../../api/mesas";
import { toast } from "react-toastify";
import TerminalPVprev from "../../TerminalPV/TerminalPVprev";

const VistaMesasVenta = () => {
  // Para guardar el listado de categorias
  const [listMesas, setListMesas] = useState([]);

  const cargarMesas = () => {
    try {
      obtenerMesas()
        .then((response) => {
          const { data } = response;
          //console.log("mesas", data);
          if (!listMesas && data) {
            setListMesas(formatModelMesas(data));
          } else {
            const datosMesas = formatModelMesas(data);
            setListMesas(datosMesas);
            //console.log("mesas", datosMesas);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [contentModal, setContentModal] = useState(null);
  const [titulosModal, setTitulosModal] = useState(null);

  const actModal = (content) => {
    setTitulosModal("Hacer venta");
    setContentModal(content);
    setShowModal(true);
  };

  const clicMesa = (content) => {
    setTitulosModal("Tomar Orden");
    setContentModal(content);
    setShowModal(true);
  };
  useEffect(() => {
    if (!showModal) {
      cargarMesas();
    }
  }, [showModal]);

  return (
    <>
      <div className="card card-outline card-danger m-3">
        <div className="card-header align-items-center align-items-center">
          <div className="">
            <div className="row">
              <div className="col-md-10 align-middle">
                <h4 className="align-middle">Mesas del establecimiento</h4>
              </div>
              <div className="col-md-2">
                <button
                className="btn btn-danger"
                  onClick={() =>
                    actModal(<TerminalPVprev 
                        setShow={setShowModal} 
                        // PENDIENTE
                      />)
                  }
                >
                  🧾 Hacer Venta
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="divMesasView">
            {listMesas.map((mesa, index) => (
              <div
                class="info-box"
                onClick={() =>
                  mesa.idTicket
                    ? clicMesa(
                        <TerminalPVprev
                          agregar={"true"}
                          setShow={setShowModal}
                          estado={"abierto"}
                          mesaticket={mesa.numeroMesa}
                          idmesa={mesa.id}
                          idTicket={mesa.idTicket}
                          tipoPedido = {"Para comer aquí"}
                          hacerPedido = {"Presencial"}
                        />
                      )
                    : clicMesa(
                        <TerminalPVprev
                          agregar={"false"}
                          setShow={setShowModal}
                          estado={"cerrado"}
                          mesaticket={mesa.numeroMesa}
                          idmesa={mesa.id}
                          idTicket={mesa.idTicket}
                          tipoPedido = {"para comer aquí"}
                        />
                      )
                }
              >
                <span
                  class={
                    "info-box-icon " +
                    (mesa.estado == "1" ? "mesaDisponible" : "bg-secondary")
                  }
                >
                  <i class="fas fa-utensils"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-number titMesa">
                    N. Mesa: {mesa.numeroMesa}
                  </span>
                  <span class="info-box-text">
                    N. Personas: {mesa.numeroPersonas}
                  </span>
                  <span class="info-box-text descMesa">{mesa.descripcion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BasicModal
        show={showModal}
        setShow={setShowModal}
        title={titulosModal}
        size={"xl"}
        fullscreen={"true"}
      >
        {contentModal}
      </BasicModal>
    </>
  );
};



const VistaMesas = () => {

  const [listMesas, setListMesas] = useState([]);

  const cargarMesas = () => {
    try {
      obtenerMesas()
        .then((response) => {
          const { data } = response;
          //console.log("mesas", data);
          if (!listMesas && data) {
            setListMesas(formatModelMesas(data));
          } else {
            const datosMesas = formatModelMesas(data);
            setListMesas(datosMesas);
            //console.log("mesas", datosMesas);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    cargarMesas();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [contentModal, setContentModal] = useState(null);
  const [titulosModal, setTitulosModal] = useState(null);

  const registroUsuarios = (content) => {
    setTitulosModal("Registar mesa");
    setContentModal(content);
    setShowModal(true);
  };

  return (
    <>
      <div className="card card-outline card-danger m-3">
        <div className="card-header d-flex justify-content-between">
          <div className="col-md-10 align-self-center">
            <h4>Mesas del establecimiento</h4>
          </div>
          <div className="col-md-2">
            <button
              className="btn btn-danger"
              onClick={() =>
                registroUsuarios(<RegistoMesas setShow={setShowModal} />)
              }
            >
              <i class="fa fa-solid fa-plus" /> Agregar
            </button>
          </div>
        </div>
        <div className="card-body">
        <div className="divMesasView">
            {listMesas.map((mesa, index) => (
              <div
                class="info-box"
              >
                <span class= "info-box-icon bg-primary">
                  <i class="fas fa-utensils"></i>
                </span>
                <div class="info-box-content">
                  <span class="info-box-number titMesa">
                    N. Mesa: {mesa.numeroMesa}
                  </span>
                  <span class="info-box-text">
                    N. Personas: {mesa.numeroPersonas}
                  </span>
                  <span class="info-box-text descMesa">{mesa.descripcion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BasicModal
        show={showModal}
        setShow={setShowModal}
        title={titulosModal}
        size={"xl"}
        fullscreen={"true"}
      >
        {contentModal}
      </BasicModal>
    </>
  );
  
}

export { VistaMesas, VistaMesasVenta };

function formatModelMesas(mesas) {
  const tempmesas = [];
  mesas.forEach((mesas) => {
    tempmesas.push({
      id: mesas._id,
      numeroMesa: mesas.numeroMesa,
      descripcion: mesas.descripcion,
      numeroPersonas: mesas.numeroPersonas,
      estado: mesas.estado,
      idTicket: mesas.idTicket,
    });
  });
  return tempmesas;
}

