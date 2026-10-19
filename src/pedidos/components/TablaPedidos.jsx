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
    const CONFIG_ESTADOS = {
        pendiente: {
            label: 'Pendiente',
            bg: '#fef3c7',
            color: '#92400e',
            border: '#fcd34d',
            icon: 'fa-clock',
            impact: 'El pedido queda en cola de espera listo para ser asignado a preparación en taller.'
        },
        preparado: {
            label: 'Preparado',
            bg: '#ede9fe',
            color: '#6d28d9',
            border: '#c4b5fd',
            icon: 'fa-box-open',
            impact: 'Se confirma que los productos han sido confeccionados y alistados en planta para su despacho.'
        },
        enviado: {
            label: 'Enviado',
            bg: '#e0f2fe',
            color: '#0369a1',
            border: '#7dd3fc',
            icon: 'fa-truck-fast',
            impact: 'El pedido queda marcado como despachado por transportadora y se asocia el número de guía de seguimiento.'
        },
        entregado: {
            label: 'Entregado',
            bg: '#dcfce7',
            color: '#15803d',
            border: '#86efac',
            icon: 'fa-circle-check',
            impact: 'Se confirma la recepción satisfactoria de los paquetes por parte del cliente en su destino.'
        },
        pagado: {
            label: 'Pagado',
            bg: '#ccfbf1',
            color: '#0f766e',
            border: '#99f6e4',
            icon: 'fa-money-bill-wave',
            impact: 'El saldo del pedido queda liquidado en su totalidad y marcado como pagado contablemente.'
        },
        anulado: {
            label: 'Anulado',
            bg: '#fee2e2',
            color: '#991b1b',
            border: '#fca5a5',
            icon: 'fa-ban',
            impact: 'El pedido queda cancelado permanentemente en el sistema y no procederá a despacho.'
        },
        devuelto: {
            label: 'Devuelto',
            bg: '#ffedd5',
            color: '#c2410c',
            border: '#fdba74',
            icon: 'fa-rotate-left',
            impact: 'Se registra novedad en entrega o devolución de los paquetes a fábrica.'
        }
    };

    const editarPedido = async (pedido, event) => {
        const nuevoEstado = event.target.value;
        if (!nuevoEstado || nuevoEstado === pedido.estado) return;

        onInputChange(event);

        const idMostrar = String(pedido.pedido_id || pedido._id || '').slice(-8).toUpperCase();
        const clienteNombre = pedido.cliente?.nombre || 'Cliente sin nombre';
        const clienteCiudad = pedido.cliente?.ciudad || '';
        const estadoAnt = CONFIG_ESTADOS[pedido.estado] || { label: pedido.estado || 'Sin estado', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
        const estadoNuevo = CONFIG_ESTADOS[nuevoEstado] || { label: nuevoEstado, bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', impact: 'Se actualizará el estado del pedido.' };

        // Calcular unidades totales si están disponibles
        let totalItems = 0;
        if (pedido.itemPedido && Array.isArray(pedido.itemPedido)) {
            pedido.itemPedido.forEach(block => {
                const mapa = block.itemPedido || {};
                Object.values(mapa).forEach(cat => {
                    const arr = Array.isArray(cat?.pedido) ? cat.pedido : (Array.isArray(cat) ? cat : []);
                    arr.forEach(p => {
                        totalItems += Number(p.cantidad) || 0;
                    });
                });
            });
        }

        const ahora = new Date().toISOString();
        const userEdit = `${user.name} - ${user.uid}`;
        const creadorId = pedido.user?._id || pedido.user?.uid || pedido.user;
        const esCreador = creadorId === user.uid;

        // CASO 1: Cambio a estado "ENVIADO" (Requiere guía)
        if (nuevoEstado === 'enviado') {
            const { value: numeroGuia, isConfirmed } = await Swal.fire({
                title: 'Despacho de Pedido',
                html: `
                    <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <!-- Badge de Transición -->
                        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 14px; padding: 10px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <span style="padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; background: ${estadoAnt.bg}; color: ${estadoAnt.color}; border: 1px solid ${estadoAnt.border};">
                                ${estadoAnt.label}
                            </span>
                            <span style="color: #94a3b8; font-weight: bold;">➔</span>
                            <span style="padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 12px; background: ${estadoNuevo.bg}; color: ${estadoNuevo.color}; border: 1px solid ${estadoNuevo.border};">
                                🚚 ${estadoNuevo.label}
                            </span>
                        </div>

                        <!-- Ficha de Datos del Pedido Afectado -->
                        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
                                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Remisión / Pedido</span>
                                <span style="font-family: monospace; font-weight: 800; font-size: 12px; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 6px;">#${idMostrar}</span>
                            </div>
                            <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">
                                ${clienteNombre}
                                ${clienteCiudad ? `<span style="font-size: 11.5px; font-weight: 500; color: #64748b;"> • ${clienteCiudad}</span>` : ''}
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #64748b; margin-top: 6px;">
                                <span>Transportadora: <strong style="color: #0f172a;">${pedido.tipoDespacho || 'Por definir'}</strong></span>
                                <span>Total: <strong style="color: #0f172a;">${totalItems > 0 ? `${totalItems} unds` : 'Ítems reg.'}</strong></span>
                            </div>
                        </div>

                        <!-- Campo para número de guía -->
                        <div style="margin-top: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; color: #0f172a; margin-bottom: 5px;">
                                📦 Ingrese el Número de Guía:
                            </label>
                            <input id="swal-input-guia" class="form-control form-control-sm" placeholder="Ej: 700123456" value="${pedido.numeroGuia || '7001'}" style="font-family: monospace; font-size: 13.5px; font-weight: bold; border: 1.5px solid #0284c7;" />
                            <small style="color: #64748b; font-size: 11px; display: block; margin-top: 4px;">
                                El cliente y el equipo podrán rastrear el paquete con esta guía.
                            </small>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0284c7',
                cancelButtonColor: '#64748b',
                confirmButtonText: '<i class="fa-solid fa-truck me-1"></i> Despachar y Guardar',
                cancelButtonText: 'Cancelar',
                focusConfirm: false,
                preConfirm: () => {
                    const input = document.getElementById('swal-input-guia');
                    const guia = input ? input.value.trim() : '';
                    if (!guia) {
                        Swal.showValidationMessage('Por favor ingrese el número de guía para despachar');
                        return false;
                    }
                    return guia;
                }
            });

            if (isConfirmed && numeroGuia) {
                const nuevoPedidoConGuia = {
                    ...pedido,
                    estado: 'enviado',
                    numeroGuia,
                    userEdit,
                    fechaModificacionEstado: ahora
                };

                try {
                    Swal.fire({
                        title: 'Actualizando pedido...',
                        html: `<div style="font-size: 13px; color: #64748b;">Guardando guía <strong>${numeroGuia}</strong> en la base de datos...</div>`,
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });

                    await startEditarPedido(nuevoPedidoConGuia);

                    Swal.fire({
                        icon: 'success',
                        title: '¡Pedido Despachado!',
                        html: `
                            <div style="text-align: center; font-size: 13px; color: #475569;">
                                <p style="margin: 0 0 8px 0;">El pedido <strong style="color: #0284c7;">#${idMostrar}</strong> de <strong>${clienteNombre}</strong> fue marcado como <strong>ENVIADO</strong>.</p>
                                <div style="display: inline-block; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; padding: 6px 16px; border-radius: 20px; font-weight: 800; margin-top: 4px;">
                                    🚚 Guía: <span style="font-family: monospace;">${numeroGuia}</span>
                                </div>
                            </div>
                        `,
                        confirmButtonColor: '#0284c7',
                        confirmButtonText: 'Entendido',
                        timer: 2800,
                        timerProgressBar: true
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar',
                        text: 'No fue posible guardar los cambios en la base de datos. Intente nuevamente.',
                        confirmButtonColor: '#dc2626'
                    });
                }
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'Cambio cancelado',
                    text: `El pedido #${idMostrar} se mantiene en "${estadoAnt.label}"`,
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        }

        // CASO 2: Cambio a cualquier otro estado
        else {
            const confirmacion = await Swal.fire({
                title: '¿Cambiar estado del pedido?',
                html: `
                    <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <!-- Badge de Transición -->
                        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 14px; padding: 10px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <span style="padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; background: ${estadoAnt.bg}; color: ${estadoAnt.color}; border: 1px solid ${estadoAnt.border};">
                                ${estadoAnt.label}
                            </span>
                            <span style="color: #94a3b8; font-weight: bold;">➔</span>
                            <span style="padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 12px; background: ${estadoNuevo.bg}; color: ${estadoNuevo.color}; border: 1px solid ${estadoNuevo.border};">
                                ${estadoNuevo.label}
                            </span>
                        </div>

                        <!-- Ficha de Datos del Pedido Afectado -->
                        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
                                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Remisión / Pedido</span>
                                <span style="font-family: monospace; font-weight: 800; font-size: 12px; color: #0284c7; background: #f0f9ff; border: 1px solid #bae6fd; padding: 2px 8px; border-radius: 6px;">#${idMostrar}</span>
                            </div>
                            <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">
                                ${clienteNombre}
                                ${clienteCiudad ? `<span style="font-size: 11.5px; font-weight: 500; color: #64748b;"> • ${clienteCiudad}</span>` : ''}
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #64748b; margin-top: 6px;">
                                <span>Unidades: <strong style="color: #0f172a;">${totalItems > 0 ? `${totalItems} productos` : 'Ítems reg.'}</strong></span>
                                <span>Operador: <strong style="color: #0f172a;">${user.name}</strong></span>
                            </div>
                        </div>

                        <!-- Impacto Operativo -->
                        <div style="background: ${estadoNuevo.bg}; border-left: 4px solid ${estadoNuevo.color}; padding: 10px 12px; border-radius: 8px;">
                            <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${estadoNuevo.color}; margin-bottom: 2px;">
                                📋 Impacto del proceso
                            </div>
                            <div style="font-size: 12px; color: #334155; line-height: 1.4;">
                                ${estadoNuevo.impact}
                            </div>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: estadoNuevo.color,
                cancelButtonColor: '#64748b',
                confirmButtonText: `Sí, cambiar a ${estadoNuevo.label}`,
                cancelButtonText: 'Cancelar'
            });

            if (confirmacion.isConfirmed) {
                const nuevoPedido = {
                    ...pedido,
                    estado: nuevoEstado,
                    userEdit,
                    fechaModificacionEstado: ahora,
                    ...(nuevoEstado === 'pagado' ? { fechaPagado: ahora } : {})
                };

                try {
                    Swal.fire({
                        title: 'Guardando en la base de datos...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });

                    await startEditarPedido(nuevoPedido);

                    Swal.fire({
                        icon: 'success',
                        title: '¡Estado Actualizado!',
                        html: `
                            <div style="text-align: center; font-size: 13px; color: #475569;">
                                <p style="margin: 0 0 10px 0;">El pedido <strong style="color: #0284c7;">#${idMostrar}</strong> de <strong>${clienteNombre}</strong> ahora se encuentra en estado:</p>
                                <div style="display: inline-block; padding: 6px 18px; border-radius: 20px; font-weight: 800; font-size: 13.5px; background: ${estadoNuevo.bg}; color: ${estadoNuevo.color}; border: 1px solid ${estadoNuevo.border};">
                                    ${estadoNuevo.label}
                                </div>
                                <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
                                    Registro guardado exitosamente en la base de datos
                                </div>
                            </div>
                        `,
                        confirmButtonColor: '#0284c7',
                        confirmButtonText: 'Aceptar',
                        timer: 2600,
                        timerProgressBar: true
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al actualizar',
                        text: 'No fue posible guardar el cambio de estado en el servidor. Intente de nuevo.',
                        confirmButtonColor: '#dc2626'
                    });
                }
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'Cambio cancelado',
                    text: `El pedido #${idMostrar} se mantiene en "${estadoAnt.label}"`,
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        }
    };

    const eliminarPedido = async (pedido) => {
        const idMostrar = String(pedido.pedido_id || pedido._id || '').slice(-8).toUpperCase();
        const clienteNombre = pedido.cliente?.nombre || 'Cliente sin nombre';
        const clienteCiudad = pedido.cliente?.ciudad || '';
        const fecha = pedido.fechaCreacion || 'No registrada';
        const creadorId = pedido.user?._id || pedido.user?.uid || pedido.user;

        if (user.uid !== creadorId) {
            Swal.fire({
                icon: 'error',
                title: 'Acción no permitida',
                html: `
                    <div style="text-align: left; font-size: 13px; color: #475569;">
                        <p>No tienes privilegios para eliminar el pedido <strong>#${idMostrar}</strong> de <strong>${clienteNombre}</strong>.</p>
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; font-size: 12px; color: #334155;">
                            <strong>Regla de seguridad:</strong> Solo el usuario asesor que creó el pedido originalmente tiene permiso para eliminarlo.
                        </div>
                    </div>
                `,
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        const confirm = await Swal.fire({
            title: '¿Eliminar este pedido?',
            html: `
                <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
                        <div style="font-weight: 800; color: #991b1b; font-size: 12px; text-transform: uppercase;">
                            ⚠️ Acción Irreversible
                        </div>
                        <div style="font-size: 12.5px; color: #7f1d1d; margin-top: 2px;">
                            Esta acción removerá definitivamente el pedido del sistema junto con todos sus productos e historial.
                        </div>
                    </div>

                    <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 12px 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
                            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Remisión / Pedido</span>
                            <span style="font-family: monospace; font-weight: 800; font-size: 12px; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 6px;">#${idMostrar}</span>
                        </div>
                        <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
                            ${clienteNombre}
                            ${clienteCiudad ? `<span style="font-size: 12px; font-weight: 500; color: #64748b;"> • ${clienteCiudad}</span>` : ''}
                        </div>
                        <div style="margin-top: 6px; font-size: 12px; color: #64748b;">
                            Fecha de Creación: <strong style="color: #334155;">${fecha}</strong>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> Sí, eliminar pedido',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Eliminando pedido...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });

                await startDeletePedido(pedido);

                Swal.fire({
                    icon: 'success',
                    title: '¡Pedido Eliminado!',
                    html: `<p style="font-size: 13px; color: #475569;">El pedido <strong style="color: #dc2626;">#${idMostrar}</strong> ha sido removido exitosamente del sistema.</p>`,
                    confirmButtonColor: '#0284c7',
                    timer: 2200,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar',
                    text: 'No fue posible eliminar el pedido en el servidor.',
                    confirmButtonColor: '#dc2626'
                });
            }
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
