import { useAuthStore } from './useAuthStore';
import { useClientesStore } from './useClientesStore';
import numalet from 'numalet';


export const useFuntions = () => {
    const { clienteActivo } = useClientesStore();
    const { user } = useAuthStore();
    const {
        precioKits: {
            kcg = 0,
            kcp = 0,
            kb = 0,
        } = {},
        precioCirios: {
            cc = 0,
            cb = 0,
        } = {},
        precioGuantes: {
            gb = 0,
            gn = 0,
            gm = 0,
        } = {},
    } = clienteActivo?.precios || {};
    const number_format = (number, decimals, dec_point, thousands_sep) => {
        number = (number + '').replace(',', '').replace(' ', '');
        const n = !isFinite(+number) ? 0 : +number;
        const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
        const sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep;
        const dec = (typeof dec_point === 'undefined') ? '.' : dec_point;
        let s = '';
        const toFixedFix = (n, prec) => {
            const k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };

        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    };
    // Función para convertir "enero 7, 2025 23:26" a un objeto Date válido
    const convertirFecha = (fechaStr) => {
        const meses = {
            enero: 0,
            febrero: 1,
            marzo: 2,
            abril: 3,
            mayo: 4,
            junio: 5,
            julio: 6,
            agosto: 7,
            septiembre: 8,
            octubre: 9,
            noviembre: 10,
            diciembre: 11,
        };

        // Dividir fecha en partes (mes, día, año y hora)
        const [mes, dia, anioHora] = fechaStr.split(' '); // Divide por espacios
        const [anio, hora] = (anioHora || "").split(' '); // Divide el año y hora, si existe

        // Crear el objeto Date (hora por defecto: 00:00)
        return new Date(
            parseInt(anio, 10), // Año
            meses[mes.toLowerCase()], // Mes
            parseInt(dia.replace(',', ''), 10), // Día (remover coma)
            ...(hora ? hora.split(':').map((h) => parseInt(h, 10)) : [0, 0]) // Hora (si existe)
        );
    };
    function obtenerImagen(categoria, genero) {
        if (categoria === 'kcg' || categoria === 'kcp' || categoria === 'cc' || categoria === 'KCG' || categoria === 'KCP' || categoria === 'CC') {
            return 'comunion-nin' + (genero === '0' ? 'o' : 'a')
        } else {
            return 'bautizo-nin' + (genero === '0' ? 'o' : 'a')
        }
    }
    const handleBlur = ({ target }) => {
        // Eliminar ceros a la izquierda cuando el campo pierde el foco
        return (target.value).replace(/^0+/, '');
    };
    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(precio);
    };
    const buscarPrecio = (categoria) => {
        switch (categoria) {
            case 'cb':
                return cb;
            case 'cc':
                return cc;
            case 'kb':
                return kb;
            case 'kcp':
                return kcp;
            case 'kcg':
                return kcg;
            case 'BLANCOS':
                return gb;
            case 'NEGROS':
                return gn;
            case 'MITON':
                return gm;
            default:
                return 0;
        }

    };
    const capitalize = (word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };
    const buscarNombre = (categoria) => {
        console.log(categoria)
        const nombre = (categoria === 'KCG') ? 'KIT COMUNIÓN GRANDE' :
            (categoria === 'KCP') ? 'KIT COMUNIÓN PEQUEÑO' :
                (categoria === 'KB') ? 'KIT DE BAUTIZO' :
                    (categoria === 'CC') ? 'CIRIO DE COMUNIÓN' :
                        (categoria === 'CB') ? 'CIRIO DE BAUTIZO' :
                            (categoria === 'BLANCOS') ? 'GUANTES BLANCOS' :
                                (categoria === 'NEGROS') ? 'GUANTES NEGROS' :
                                    (categoria === 'MITON') ? 'GUANTES MITON' :
                                        (categoria === 'GUANTES') ? 'GUANTES' :
                                            'OTROS PRODUCTOS';

        return nombre;
    }
    const convertirNumeroATexto = (numero) => {
        const numaletInstance = numalet({
            moneda: 'PESOS',       // Aquí especificamos 'PESOS' como moneda
            prefijo: 'PESOS',           // Sin prefijo
            sufijo: 'PESOS.',        // Agregar 'M.N.' al final
            mayusculas: true       // Convertir todo a mayúsculas
        });

        return (numaletInstance(numero)).replace('MXN', 'PESOS');;
    };
    const calcularTotalesPedidos = (cat, pedidos, setData, setLables, datosUsuario) => {
        // Objeto para almacenar las sumas por categoría
        const totalesPorCategoria = {};
        const labels = [];
        const data = [];

        pedidos.forEach((pedido) => {
            if (datosUsuario !== true) {
                if (pedido.user._id === user.uid) {
                    const items = pedido?.itemPedido || [];
                    items.forEach(({ itemPedido }) => {
                        Object.entries(itemPedido).forEach(([categoria, { pedido }]) => {
                            if (categoria === 'GUANTES') {
                                if (cat === 'guantes' || cat === 'todos') {
                                    const subcategorias = {};

                                    pedido.forEach(item => {
                                        const subcategoria = item.categoria;
                                        if (!subcategorias[subcategoria]) {
                                            subcategorias[subcategoria] = { cantidad: 0, totalPrecio: 0, precioUnitario: item.precioUnitario };
                                        }
                                        subcategorias[subcategoria].cantidad += parseInt(item.cantidad || 0);
                                        subcategorias[subcategoria].totalPrecio += item.precioUnitario * parseInt(item.cantidad || 0);
                                    });

                                    Object.entries(subcategorias).forEach(([subcategoria, datosSubcategoria]) => {
                                        if (!totalesPorCategoria[categoria]) {
                                            totalesPorCategoria[categoria] = {};
                                        }

                                        if (!totalesPorCategoria[categoria][subcategoria]) {
                                            totalesPorCategoria[categoria][subcategoria] = { cantidad: 0, totalPrecio: 0 };
                                        }

                                        totalesPorCategoria[categoria][subcategoria].cantidad += datosSubcategoria.cantidad;
                                        totalesPorCategoria[categoria][subcategoria].totalPrecio += datosSubcategoria.totalPrecio;
                                    });
                                }
                            } else if (categoria === 'OTR') {
                                if (cat === 'otros' || cat === 'todos') {
                                    const productos = {};

                                    pedido.forEach(item => {
                                        const producto = item.producto;
                                        if (!productos[producto]) {
                                            productos[producto] = { cantidad: 0, totalPrecio: 0, precioUnitario: item.precio };
                                        }
                                        productos[producto].cantidad += parseInt(item.cantidad || 0);
                                        productos[producto].totalPrecio += item.precio * parseInt(item.cantidad || 0);
                                    });
                                    Object.entries(productos).forEach(([producto, datosProducto]) => {
                                        if (!totalesPorCategoria[categoria]) {
                                            totalesPorCategoria[categoria] = {};
                                        }

                                        if (!totalesPorCategoria[categoria][producto]) {
                                            totalesPorCategoria[categoria][producto] = { cantidad: 0, totalPrecio: 0 };
                                        }
                                        totalesPorCategoria[categoria][producto].cantidad += datosProducto.cantidad;
                                        totalesPorCategoria[categoria][producto].totalPrecio += datosProducto.totalPrecio;
                                    });
                                }
                            } else {
                                if (cat === 'kits' || cat === 'todos') {
                                    if (!totalesPorCategoria[categoria]) {
                                        totalesPorCategoria[categoria] = { cantidad: 0, totalPrecio: 0 };
                                    }

                                    pedido.forEach(item => {
                                        totalesPorCategoria[categoria].cantidad += parseInt(item.cantidad || 0);
                                        totalesPorCategoria[categoria].totalPrecio += (item.precioUnitario || item.precio) * parseInt(item.cantidad || 0);
                                    });
                                }
                            }
                        });
                    });
                }
            } else {
                const items = pedido?.itemPedido || [];
                items.forEach(({ itemPedido }) => {
                    Object.entries(itemPedido).forEach(([categoria, { pedido }]) => {
                        if (categoria === 'GUANTES') {
                            if (cat === 'guantes' || cat === 'todos') {
                                const subcategorias = {};

                                pedido.forEach(item => {
                                    const subcategoria = item.categoria;
                                    if (!subcategorias[subcategoria]) {
                                        subcategorias[subcategoria] = { cantidad: 0, totalPrecio: 0, precioUnitario: item.precioUnitario };
                                    }
                                    subcategorias[subcategoria].cantidad += parseInt(item.cantidad || 0);
                                    subcategorias[subcategoria].totalPrecio += item.precioUnitario * parseInt(item.cantidad || 0);
                                });

                                Object.entries(subcategorias).forEach(([subcategoria, datosSubcategoria]) => {
                                    if (!totalesPorCategoria[categoria]) {
                                        totalesPorCategoria[categoria] = {};
                                    }

                                    if (!totalesPorCategoria[categoria][subcategoria]) {
                                        totalesPorCategoria[categoria][subcategoria] = { cantidad: 0, totalPrecio: 0 };
                                    }

                                    totalesPorCategoria[categoria][subcategoria].cantidad += datosSubcategoria.cantidad;
                                    totalesPorCategoria[categoria][subcategoria].totalPrecio += datosSubcategoria.totalPrecio;
                                });
                            }
                        } else if (categoria === 'OTR') {
                            if (cat === 'otros' || cat === 'todos') {
                                const productos = {};

                                pedido.forEach(item => {
                                    const producto = item.producto;
                                    if (!productos[producto]) {
                                        productos[producto] = { cantidad: 0, totalPrecio: 0, precioUnitario: item.precio };
                                    }
                                    productos[producto].cantidad += parseInt(item.cantidad || 0);
                                    productos[producto].totalPrecio += item.precio * parseInt(item.cantidad || 0);
                                });
                                Object.entries(productos).forEach(([producto, datosProducto]) => {
                                    if (!totalesPorCategoria[categoria]) {
                                        totalesPorCategoria[categoria] = {};
                                    }

                                    if (!totalesPorCategoria[categoria][producto]) {
                                        totalesPorCategoria[categoria][producto] = { cantidad: 0, totalPrecio: 0 };
                                    }
                                    totalesPorCategoria[categoria][producto].cantidad += datosProducto.cantidad;
                                    totalesPorCategoria[categoria][producto].totalPrecio += datosProducto.totalPrecio;
                                });
                            }
                        } else {
                            if (cat === 'kits' || cat === 'todos') {
                                if (!totalesPorCategoria[categoria]) {
                                    totalesPorCategoria[categoria] = { cantidad: 0, totalPrecio: 0 };
                                }

                                pedido.forEach(item => {
                                    totalesPorCategoria[categoria].cantidad += parseInt(item.cantidad || 0);
                                    totalesPorCategoria[categoria].totalPrecio += (item.precioUnitario || item.precio) * parseInt(item.cantidad || 0);
                                });
                            }
                        }
                    });
                });
            }
        });

        const resultadoTotales = [];
        Object.entries(totalesPorCategoria).forEach(([categoria, subcategorias]) => {
            if (categoria === 'GUANTES') {
                if (cat === 'guantes' || cat === 'todos') {
                    Object.entries(subcategorias).forEach(([subcategoria, datosSubcategoria]) => {
                        resultadoTotales.push({
                            categoria: `${subcategoria}`,
                            cantidad: datosSubcategoria.cantidad,
                            totalPrecio: datosSubcategoria.totalPrecio,
                        });
                        labels.push(`${buscarNombre(subcategoria)}`);
                        data.push(datosSubcategoria.cantidad);
                    });
                }
            } else if (categoria === 'OTR') {
                if (cat === 'otros' || cat === 'todos') {
                    Object.entries(subcategorias).forEach(([producto, datosProducto]) => {
                        resultadoTotales.push({
                            categoria: `OTR - ${producto}`,
                            cantidad: datosProducto.cantidad,
                            totalPrecio: datosProducto.totalPrecio,
                        });
                        labels.push(`OTR - ${producto}`);
                        data.push(datosProducto.cantidad);
                    });
                }
            } else {
                if (cat === 'kits' || cat === 'todos') {
                    resultadoTotales.push({
                        categoria,
                        cantidad: subcategorias.cantidad,
                        totalPrecio: subcategorias.totalPrecio,
                    });
                    labels.push(buscarNombre(categoria));
                    data.push(subcategorias.cantidad);
                }
            }
        });

        setLables(labels);
        setData(data);

        return resultadoTotales;
    };
    const totalesPedidos = (pedidos, datosUsuario) => {// Esto es para las estadisticas
        let totalSales = 0;
        let totalOrders = 0;
        let currentMonthSales = 0;
        let pendientes = 0;
        let pagado = 0;
        let enviado = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySales2025 = Array(12).fill(0);
        const monthlyProductCounts = Array(12).fill(0);

        pedidos.forEach(order => {
            if (datosUsuario !== true) {
                if (order.user._id === user.uid) {
                    const orderDate2 = (convertirFecha(order.fechaCreacion)).getFullYear();
                    if (orderDate2 === currentYear) {
                        if (order.estado === "pendiente") { pendientes++ }
                        if (order.estado === "pagado") { pagado++ }
                        if (order.estado === 'enviado') { enviado++ }
                        totalOrders++;
                        order.itemPedido.forEach(item => {
                            Object.values(item.itemPedido).forEach(category => {
                                category.pedido.forEach(product => {
                                    const price = product.precioUnitario || product.precio;
                                    const quantity = parseInt(product.cantidad, 10);
                                    const sale = price * quantity;
                                    totalSales += sale;

                                    const orderDate = convertirFecha(order.fechaCreacion);
                                    if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                                        currentMonthSales += sale;
                                    }
                                    if (orderDate.getFullYear() === currentYear) {
                                        monthlySales2025[orderDate.getMonth()] += sale;
                                        monthlyProductCounts[orderDate.getMonth()] += quantity;
                                    }
                                });
                            });
                        });
                    }
                }
            } else {
                const orderDate2 = (convertirFecha(order.fechaCreacion)).getFullYear();
                if (orderDate2 === currentYear) {
                    if (order.estado === "pendiente") { pendientes++ }
                    if (order.estado === "pagado") { pagado++ }
                    if (order.estado === 'enviado') { enviado++ }
                    totalOrders++;
                    order.itemPedido.forEach(item => {
                        Object.values(item.itemPedido).forEach(category => {
                            category.pedido.forEach(product => {
                                const price = product.precioUnitario || product.precio;
                                const quantity = parseInt(product.cantidad, 10);
                                const sale = price * quantity;
                                totalSales += sale;

                                const orderDate = convertirFecha(order.fechaCreacion);
                                if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                                    currentMonthSales += sale;
                                }
                                if (orderDate.getFullYear() === currentYear) {
                                    monthlySales2025[orderDate.getMonth()] += sale;
                                    monthlyProductCounts[orderDate.getMonth()] += quantity;
                                }
                            });
                        });
                    });
                }
            }
        });
        return {
            totalSales,
            totalOrders,
            currentMonthSales,
            monthlySales2025,
            monthlyProductCounts,
            pendientes,
            pagado,
            enviado
        };
    }
    const totalesPedidosAnuales = (pedidos, datosUsuario) => { //Para calculos por años
        let totalSales = 0;

        const monthlySales2021 = [0, ...Array(13).fill(0)];
        const monthlySales2022 = [0, ...Array(13).fill(0)];
        const monthlySales2023 = [0, ...Array(13).fill(0)];
        const monthlySales2024 = [0, ...Array(13).fill(0)];
        const monthlySales2025 = [0, ...Array(13).fill(0)];
        const currentYear = new Date().getFullYear();


        pedidos.forEach(order => {
            if (datosUsuario !== true) {
                if (order.user._id === user.uid) {
                    order.itemPedido.forEach(item => {
                        Object.values(item.itemPedido).forEach(category => {
                            category.pedido.forEach(product => {
                                const price = product.precioUnitario || product.precio;
                                const quantity = parseInt(product.cantidad, 10);
                                const sale = price * quantity;
                                totalSales += sale;
                                const orderDate = convertirFecha(order.fechaCreacion);
                                if (orderDate.getFullYear() === currentYear) {
                                    monthlySales2025[orderDate.getMonth() + 1] += sale; //guarda 2025
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 1) {
                                    monthlySales2024[orderDate.getMonth() + 1] += sale; //guarda 2024
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 2) {
                                    monthlySales2023[orderDate.getMonth() + 1] += sale; //guarda 2023
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 3) {
                                    monthlySales2022[orderDate.getMonth() + 1] += sale; //guarda 2022
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 4) {
                                    monthlySales2021[orderDate.getMonth() + 1] += sale; //guarda 2021
                                    return;
                                }
                            });
                        });
                    });
                }
            } else {
                order.itemPedido.forEach(item => {
                    Object.values(item.itemPedido).forEach(category => {
                        category.pedido.forEach(product => {
                            const price = product.precioUnitario || product.precio;
                            const quantity = parseInt(product.cantidad, 10);
                            const sale = price * quantity;
                            totalSales += sale;
                            const orderDate = convertirFecha(order.fechaCreacion);
                            if (orderDate.getFullYear() === currentYear) {
                                monthlySales2025[orderDate.getMonth() + 1] += sale; //guarda 2025
                                return;
                            }
                            if (orderDate.getFullYear() === currentYear - 1) {
                                monthlySales2024[orderDate.getMonth() + 1] += sale; //guarda 2024
                                return;
                            }
                            if (orderDate.getFullYear() === currentYear - 2) {
                                monthlySales2023[orderDate.getMonth() + 1] += sale; //guarda 2023
                                return;
                            }
                            if (orderDate.getFullYear() === currentYear - 3) {
                                monthlySales2022[orderDate.getMonth() + 1] += sale; //guarda 2022
                                return;
                            }
                            if (orderDate.getFullYear() === currentYear - 4) {
                                monthlySales2021[orderDate.getMonth() + 1] += sale; //guarda 2021
                                return;
                            }
                        });
                    });
                });
            }
        });
        return {
            monthlySales2025,
            monthlySales2024,
            monthlySales2023,
            monthlySales2022,
            monthlySales2021,
        };
    }
    const totalesPedidosAnualesPorCategoria = (pedidos, datosUsuario, categoria) => { //Para calculos por años

        let totalSales = 0;
        const monthlySales2021 = [0, ...Array(13).fill(0)];
        const monthlySales2022 = [0, ...Array(13).fill(0)];
        const monthlySales2023 = [0, ...Array(13).fill(0)];
        const monthlySales2024 = [0, ...Array(13).fill(0)];
        const monthlySales2025 = [0, ...Array(13).fill(0)];
        const currentYear = new Date().getFullYear();


        pedidos.forEach(order => {
            if (datosUsuario !== true) {
                if (order.user._id === user.uid) {
                    order.itemPedido.forEach(item => {
                        Object.values(item.itemPedido).forEach(category => {
                            const categoriaItem = Object.keys(item.itemPedido)[0];
                            if (categoriaItem === 'KCG' || categoriaItem === 'KCP' || categoriaItem === 'KB' || categoriaItem === 'CC' || categoriaItem === 'CB' || categoriaItem === 'OTR') {

                                if (categoriaItem !== categoria) { return }
                                category.pedido.forEach(product => {
                                    const price = product.precioUnitario || product.precio;
                                    const quantity = parseInt(product.cantidad, 10);
                                    const sale = price * quantity;
                                    totalSales += sale;
                                    const orderDate = convertirFecha(order.fechaCreacion);
                                    if (orderDate.getFullYear() === currentYear) {
                                        monthlySales2025[orderDate.getMonth() + 1] += quantity; //guarda 2025
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 1) {
                                        monthlySales2024[orderDate.getMonth() + 1] += quantity; //guarda 2024
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 2) {
                                        monthlySales2023[orderDate.getMonth() + 1] += quantity; //guarda 2023
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 3) {
                                        monthlySales2022[orderDate.getMonth() + 1] += quantity; //guarda 2022
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 4) {
                                        monthlySales2021[orderDate.getMonth() + 1] += quantity; //guarda 2021
                                        return;
                                    }
                                });
                            } else {
                                category.pedido.forEach(product => {
                                    if (product.categoria !== categoria.split('-')[1]) {
                                        return
                                    }
                                    const price = product.precioUnitario || product.precio;
                                    const quantity = parseInt(product.cantidad, 10);
                                    const sale = price * quantity;
                                    totalSales += sale;
                                    const orderDate = convertirFecha(order.fechaCreacion);
                                    if (orderDate.getFullYear() === currentYear) {
                                        monthlySales2025[orderDate.getMonth() + 1] += quantity; //guarda 2025
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 1) {
                                        monthlySales2024[orderDate.getMonth() + 1] += quantity; //guarda 2024
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 2) {
                                        monthlySales2023[orderDate.getMonth() + 1] += quantity; //guarda 2023
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 3) {
                                        monthlySales2022[orderDate.getMonth() + 1] += quantity; //guarda 2022
                                        return;
                                    }
                                    if (orderDate.getFullYear() === currentYear - 4) {
                                        monthlySales2021[orderDate.getMonth() + 1] += quantity; //guarda 2021
                                        return;
                                    }
                                });
                            }

                        });
                    });
                }
            } else {
                order.itemPedido.forEach(item => {
                    Object.values(item.itemPedido).forEach(category => {
                        const categoriaItem = Object.keys(item.itemPedido)[0];

                        if (categoriaItem === 'KCG' || categoriaItem === 'KCP' || categoriaItem === 'KB' || categoriaItem === 'CC' || categoriaItem === 'CB' || categoriaItem === 'OTR') {
                            if (categoriaItem !== categoria) {
                                return
                            }
                            category.pedido.forEach(product => {
                                const price = product.precioUnitario || product.precio;
                                const quantity = parseInt(product.cantidad, 10);
                                const sale = price * quantity;
                                totalSales += sale;
                                const orderDate = convertirFecha(order.fechaCreacion);


                                if (orderDate.getFullYear() === currentYear) {
                                    monthlySales2025[orderDate.getMonth() + 1] += quantity; //guarda 2025
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 1) {
                                    monthlySales2024[orderDate.getMonth() + 1] += quantity; //guarda 2024
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 2) {
                                    monthlySales2023[orderDate.getMonth() + 1] += quantity; //guarda 2023
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 3) {
                                    monthlySales2022[orderDate.getMonth() + 1] += quantity; //guarda 2022
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 4) {
                                    monthlySales2021[orderDate.getMonth() + 1] += quantity; //guarda 2021
                                    return;
                                }
                            });
                            return
                        } else {
                            category.pedido.forEach(product => {
                                if (product.categoria !== categoria.split('-')[1]) {
                                    return
                                }
                                const price = product.precioUnitario || product.precio;
                                const quantity = parseInt(product.cantidad, 10);
                                const sale = price * quantity;
                                totalSales += sale;
                                const orderDate = convertirFecha(order.fechaCreacion);


                                if (orderDate.getFullYear() === currentYear) {
                                    monthlySales2025[orderDate.getMonth() + 1] += quantity; //guarda 2025
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 1) {
                                    monthlySales2024[orderDate.getMonth() + 1] += quantity; //guarda 2024
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 2) {
                                    monthlySales2023[orderDate.getMonth() + 1] += quantity; //guarda 2023
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 3) {
                                    monthlySales2022[orderDate.getMonth() + 1] += quantity; //guarda 2022
                                    return;
                                }
                                if (orderDate.getFullYear() === currentYear - 4) {
                                    monthlySales2021[orderDate.getMonth() + 1] += quantity; //guarda 2021
                                    return;
                                }
                            });
                        }
                    });
                });
            }
        });
        return {
            monthlySales2025,
            monthlySales2024,
            monthlySales2023,
            monthlySales2022,
            monthlySales2021,
        };
    }
    const calculaTotalPedido = (pedido, costoEnvio = 0) => {
        if (pedido?.itemPedido) {
            // Calcular el total general
            const total = pedido.itemPedido.reduce((acc, item) => {
                const totalPorItem = Object.values(item?.itemPedido || {}).reduce((subAcc, { pedido }) => {
                    const totalPorCategoria = pedido?.reduce((catAcc, pedidoItem) => {
                        const total = pedidoItem?.precioUnitario
                            ? pedidoItem?.precioUnitario * pedidoItem?.cantidad
                            : pedidoItem?.precio * pedidoItem?.cantidad || 0;
                        return catAcc + total;
                    }, 0);
                    return subAcc + totalPorCategoria;
                }, 0);
                return acc + totalPorItem;
            }, 0);
            return formatearPrecio(total + costoEnvio);
        }
    }
    return {
        //*Parameters


        //*Methods
        buscarPrecio,
        formatearPrecio,
        obtenerImagen,
        capitalize,
        handleBlur,
        convertirFecha,
        buscarNombre,
        convertirNumeroATexto,
        calcularTotalesPedidos,
        totalesPedidos,
        totalesPedidosAnuales,
        totalesPedidosAnualesPorCategoria,
        number_format,
        calculaTotalPedido
    }

}
