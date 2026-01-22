import { useState, useEffect } from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { usePedidosStore } from '../../../hooks';
import Swal from 'sweetalert2';

export const ModalEditarPedido = ({ show, handleClose, pedido }) => {
    const [items, setItems] = useState([]);
    const { startUpdatePedidoItems } = usePedidosStore();

    useEffect(() => {
        if (pedido && pedido.itemPedido) {
            // Aplanar la estructura de items para facilitar la edición
            // La estructura actual parece ser: pedido.itemPedido[0].itemPedido[CATEGORIA].pedido -> array de items
            // Necesitamos reconstruir esto para mostrarlo y luego guardarlo

            // Sin embargo, el backend espera recibir la estructura completa para reemplazarla.
            // Así que trabajaremos sobre una copia profunda de la estructura original.
            setItems(JSON.parse(JSON.stringify(pedido.itemPedido)));
        }
    }, [pedido]);

    const handleQuantityChange = (pedidoIndex, categoria, itemIndex, newQuantity) => {
        if (newQuantity < 0) return;

        const newItems = [...items];
        newItems[pedidoIndex].itemPedido[categoria].pedido[itemIndex].cantidad = parseInt(newQuantity, 10);
        setItems(newItems);
    };

    const handleDeleteItem = (pedidoIndex, categoria, itemIndex) => {
        const newItems = [...items];
        newItems[pedidoIndex].itemPedido[categoria].pedido.splice(itemIndex, 1);

        // Si la categoría queda vacía, podríamos querer eliminarla o dejarla vacía.
        // Por ahora la dejamos vacía.

        setItems(newItems);
    };

    const handleSave = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Se actualizarán las cantidades y items del pedido.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar cambios'
        });

        if (result.isConfirmed) {
            await startUpdatePedidoItems(pedido.pedido_id, items);
            handleClose();
        }
    };

    // Helper para renderizar los items de manera plana en la tabla
    const renderItems = () => {
        if (!items || items.length === 0) return null;

        const rows = [];

        items.forEach((pedidoGroup, pedidoIndex) => {
            Object.keys(pedidoGroup.itemPedido).forEach(categoria => {
                const categoriaData = pedidoGroup.itemPedido[categoria];
                if (categoriaData && categoriaData.pedido) {
                    categoriaData.pedido.forEach((item, itemIndex) => {
                        rows.push(
                            <tr key={`${pedidoIndex}-${categoria}-${itemIndex}`}>
                                <td>{categoria}</td>
                                <td>{item.nombre || item.referencia}</td> {/* Ajustar según nombre real del campo */}
                                <td>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={item.cantidad}
                                        onChange={(e) => handleQuantityChange(pedidoIndex, categoria, itemIndex, e.target.value)}
                                        style={{ width: '80px' }}
                                    />
                                </td>
                                <td>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteItem(pedidoIndex, categoria, itemIndex)}
                                    >
                                        <i className="fa fa-trash"></i>
                                    </Button>
                                </td>
                            </tr>
                        );
                    });
                }
            });
        });

        return rows;
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Editar Items del Pedido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderItems()}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Guardar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
