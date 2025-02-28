import { useEffect, useState } from 'react';
import { useAuthStore, usePedidosStore } from '../../hooks'
import Swal from 'sweetalert2';
import { ModalDetallePedido } from './modals/ModalDetallePedido';
import { ListarPedidos } from './ListarPedidos';
import { ModalImprimirPedido } from './modals/ModalImprimirPedido';
import { useForm } from '../../hooks/useForm';
import { ModalGuia } from './modals/MoldalGuia';



export const TablaPedidos = () => {
    const { pedidos } = usePedidosStore();
    const { user } = useAuthStore();
    const { startEditarPedido, startDeletePedido } = usePedidosStore();
    const [show, setShow] = useState(false);
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [pedido, setPedido] = useState({});
    const { onInputChange } = useForm();



    const direccionarPedido = (pedido) => {
        //console.log(JSON.stringify(pedido));
    }
    const editarPedido = async (pedido, event) => {
        if (event.target.value === 'pendiente' || event.target.value === 'preparado') {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "El pedido no se puede editar si ya ha sido despachado!",
            });
            return;
        }

        onInputChange(event);

        const userEdit = user.name + '-' + user.uid;
        const estado = event.target.value;
        const nuevoPedido = { ...pedido, estado, userEdit }

        try {
            const result = await Swal.fire({
                title: `Está seguro de cambiar el estado a "${estado.charAt(0).toUpperCase() + estado.slice(1)}"`,
                cancelButtonColor: "#3085d6",
                confirmButtonColor: "red",
                showCancelButton: true,
                confirmButtonText: "Guardar",
            });

            if (result.isConfirmed) {
                await startEditarPedido(nuevoPedido);
                Swal.fire("Guardado!", "", "success");
            } else {
                Swal.fire("Los cambios no han sido almacenados", "", "info");
            }
        } catch (error) {
            console.error("Error al editar el pedido:", error);
            Swal.fire("Error", "No se pudo editar el pedido", "error");
        }
    };

    const eliminarPedido = (pedido) => {

        if (user.uid === pedido.user._id) {
            Swal.fire({
                icon: "warning",
                title: `Está seguro de ELIMINAR el pedido del: "${pedido.fechaCreacion} | Cliente: ${pedido.cliente.nombre}"`,
                showCancelButton: true,
                cancelButtonColor: "#3085d6",
                confirmButtonColor: "red",
                confirmButtonText: "Eliminar",
            }).then((result) => {
                if (result.isConfirmed) {
                    startDeletePedido(pedido); // Llama a la función para eliminar
                    Swal.fire("Eliminado!", "", "success");
                }
            });
        } else {
            Swal.fire({
                title: "El usuario NO tiene permiso para eliminar un pedido que no ha creado",
                text: "Sólo el usuario que creó el pedido puede eliminarlo",
                icon: "error",
                confirmButtonColor: "red",
            });
        }
    };

    const detallePedido = (pedido) => {
        setPedido(pedido);
        setShow(true);
    }
    const abrirModalImprimir = (pedido) => {
        setPedido(pedido);
        setShow1(true);
    }
    const abrirModalGuia = (pedido) => {
        setPedido(pedido);
        setShow2(true);
    }
    useEffect(() => {
    }, [pedidos]);

    return (
        <>
            <ModalDetallePedido show={show} setShow={setShow} pedido={pedido} />
            <ModalImprimirPedido show={show1} setShow={setShow1} pedido={pedido} />
            <ModalGuia show={show2} setShow={setShow2} pedido={pedido} />
            <ListarPedidos editarPedido={editarPedido} eliminarPedido={eliminarPedido} detallePedido={detallePedido} abrirModalImprimir={abrirModalImprimir} direccionarPedido={direccionarPedido} abrirModalGuia={abrirModalGuia} />
        </>
    )
}
