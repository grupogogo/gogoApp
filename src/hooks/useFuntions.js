import { useSelector } from 'react-redux';
import { useAuthStore } from './useAuthStore';
import { useClientesStore } from './useClientesStore';
import numalet from 'numalet';


export const useFuntions = () => {
    const { clienteActivo } = useClientesStore();
    const { user } = useAuthStore();
    const precios = useSelector(state => state.precios);


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

    function limpiarFecha(fecha) {
        if (fecha !== undefined) {
            return capitalize(fecha.split(",")[0].trim()); // Toma solo la parte antes de la primera coma y elimina espacios extra
        } else {
            return fecha
        }
    }
    const convertirFechaIngles = (fechaStr) => {
        const meses = {
            enero: 'Jan',
            febrero: 'Feb',
            marzo: 'Mar',
            abril: 'Apr',
            mayo: 'May',
            junio: 'Jun',
            julio: 'Jul',
            agosto: 'Aug',
            septiembre: 'Sep',
            octubre: 'Oct',
            noviembre: 'Nov',
            diciembre: 'Dec',
        };

        // Reemplazar el nombre del mes en español por su versión en inglés
        const regexMes = new RegExp(Object.keys(meses).join("|"), "gi");
        const fechaIngles = fechaStr.replace(regexMes, (matched) => meses[matched.toLowerCase()]);

        return new Date(fechaIngles);
    };
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
            enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
            julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
        };

        // Dividir fecha en partes (mes, día y resto)
        const partes = fechaStr.split(' ');
        const mes = partes[0].toLowerCase(); // Primer elemento es el mes
        const dia = parseInt(partes[1].replace(',', ''), 10); // Día sin coma
        const anio = parseInt(partes[2], 10); // Año

        // Verificar si hay hora
        let hora = 0, minutos = 0;
        if (partes.length > 3) {
            const [h, m] = partes[3].split(':'); // Separar hora y minutos
            hora = parseInt(h, 10);
            minutos = parseInt(m, 10);
        }

        // Crear objeto Date con la información
        return new Date(anio, meses[mes], dia, hora, minutos);
    };
    function capitalizarPrimeraLetra(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
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
    const totalizarPreciosFabrica = (categorias, cantidad, anio = 2025) => {
        let totalFabrica = 0;
        if (categorias) {
            categorias.forEach((categoria, index) => {
                totalFabrica += buscarPrecioxCategoriaAnio(categoria, anio) * (cantidad[index] || 0);
            });
        }
        return totalFabrica;
    }
    const buscarPrecioxCategoriaAnio = (categoria, anio) => { //Trae el precio de fabricacion segun el año y la categoria 

        // Buscar el precio según el año y la categoría
        const anioKey = `A${anio}`;
        const preciosAnio = precios[anioKey];
        let precioProducto = 0;

        if (!preciosAnio) return '';
        // Normalizar la categoría a minúsculas para coincidir con las claves

        precioProducto = (categoria === 'KIT COMUNIÓN GRANDE') ? preciosAnio.precioKits.kcg :
            (categoria === 'KIT COMUNIÓN PEQUEÑO') ? preciosAnio.precioKits.kcp :
                (categoria === 'KIT DE BAUTIZO') ? preciosAnio.precioKits.kb :
                    (categoria === 'CIRIO DE COMUNIÓN') ? preciosAnio.precioCirios.cc :
                        (categoria === 'CIRIO DE BAUTIZO') ? preciosAnio.precioCirios.cb :
                            (categoria === 'GUANTES BLANCOS') ? preciosAnio.precioGuantes.gb :
                                (categoria === 'GUANTES NEGROS') ? preciosAnio.precioGuantes.gn :
                                    (categoria === 'GUANTES MITON') ? preciosAnio.precioGuantes.gm : 0;

        return precioProducto;
    }
    const buscarNombre = (categoria) => { //Busca el nombre de la categoria por la categoria que llegue
        const nombre = (categoria === 'KCG') ? 'KIT COMUNIÓN GRANDE' :
            (categoria === 'KCP') ? 'KIT COMUNIÓN PEQUEÑO' :
                (categoria === 'KB') ? 'KIT DE BAUTIZO' :
                    (categoria === 'CC') ? 'CIRIO DE COMUNIÓN' :
                        (categoria === 'CB') ? 'CIRIO DE BAUTIZO' :
                            (categoria === 'BLANCOS' || categoria === 'GUANTES-BLANCOS' || categoria === 'GB') ? 'GUANTES BLANCOS' :
                                (categoria === 'NEGROS' || categoria === 'GN' || categoria === 'GUANTES-NEGROS') ? 'GUANTES NEGROS' :
                                    (categoria === 'MITON' || categoria === 'GM' || categoria === 'GUANTES-MITON') ? 'GUANTES MITON' :
                                        (categoria === 'GUANTES') ? 'GUANTES' :
                                            (categoria === 'G') ? 'GENERAL' :
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
    const calcularTotalesPedidos = (cat, pedidos, setData, setLables, datosUsuario, anio) => {// label y datas
        // Objeto para almacenar las sumas por categoría
        const totalesPorCategoria = {};
        const labels = [];
        const data = [];

        pedidos.forEach((pedido) => {
            const idUserPedido = pedido.user._id;
            const fecha = convertirFecha(pedido.fechaCreacion);
            const aniofiltro = parseInt(fecha.getFullYear());
            if (aniofiltro !== anio) { return; }
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
                            if (idUserPedido === user.uid) {
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
                            }
                        } else if (categoria === 'OTR') {
                            if (idUserPedido === user.uid) {

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
    const totalesPedidos = (pedidos, datosUsuario, anioFiltro) => {// Esto es para las estadisticas mensuales
        let totalSales = 0;
        let totalOrders = 0;
        let currentMonthSales = 0;
        let pendientes = 0;
        let pagado = 0;
        let enviado = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = anioFiltro;
        const monthlySales2025 = Array(12).fill(0);
        const monthlyProductCounts = Array(12).fill(0);

        pedidos.forEach(order => {

            const orderDate = convertirFecha(order.fechaCreacion);

            if (orderDate.getFullYear() !== anioFiltro) {
                return; // Si el año de la orden no coincide con el año filtrado, salta a la siguiente orden
            }
            if (order.user._id !== user.uid) return;

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
    const totalKitsXAnio = (pedidos, datosUsuario, anioFiltro) => {
        let totalSales = 0;
        const monthlySales = [...Array(11).fill(0)]; // Inicializa directamente con 12 meses

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== anioFiltro) {
                return; // Si el año de la orden no coincide con el año filtrado, salta a la siguiente orden
            }
            const perteneceAlUsuario = datosUsuario !== true
                ? order.user._id === user.uid
                : true;

            if (!perteneceAlUsuario) return;

            order.itemPedido.forEach(item => {
                Object.entries(item.itemPedido).forEach(([categoriaItem, category]) => {
                    if (['KCG', 'KCP', 'KB', 'CC', 'CB'].includes(categoriaItem)) {
                        category.pedido.forEach(product => {
                            const price = Number(product.precioUnitario || product.precio || 0);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price * quantity;

                            totalSales += sale;

                            const orderDate = convertirFecha(order.fechaCreacion);
                            const month = orderDate.getMonth();
                            monthlySales[month + 1] += sale;
                        });
                    }
                });
            });
        });
        return {
            monthlySales,
            totalSales
        };
    };
    const totalGuantesXAnio = (pedidos, datosUsuario, anioFiltro) => {
        let totalSales = 0;
        const monthlySales = [...Array(11).fill(0)]; // 12 meses, índice 0 = enero

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== anioFiltro) {
                return; // Si el año de la orden no coincide con el año filtrado, salta a la siguiente orden
            }
            if (order.user._id !== user.uid) return;

            order.itemPedido.forEach(item => {
                Object.entries(item.itemPedido).forEach(([categoriaItem, category]) => {
                    if (categoriaItem === 'GUANTES') {
                        category.pedido.forEach(product => {
                            const price = Number(product.precioUnitario || product.precio || 0);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price * quantity;
                            totalSales += sale;
                            const month = orderDate.getMonth();
                            monthlySales[month + 1] += sale;

                        });
                    }
                });
            });
        });
        return {
            monthlySales,
            totalSales
        };
    };
    const totalOtrosXAnio = (pedidos, datosUsuario, anioFiltro) => {
        let totalSales = 0;
        const monthlySales = Array(12).fill(0); // 12 meses

        pedidos.forEach(order => {
            const orderDate = convertirFecha(order.fechaCreacion);
            if (orderDate.getFullYear() !== anioFiltro) {
                return; // Si el año de la orden no coincide con el año filtrado, salta a la siguiente orden
            }
            if (order.user._id !== user.uid) return;

            order.itemPedido.forEach(item => {
                Object.entries(item.itemPedido).forEach(([categoriaItem, category]) => {
                    if (categoriaItem === 'OTR' || categoriaItem === 'OTROS') {
                        category.pedido.forEach(product => {
                            const price = Number(product.precioUnitario || product.precio || 0);
                            const quantity = parseInt(product.cantidad, 10) || 0;
                            const sale = price * quantity;

                            totalSales += sale;

                            const orderDate = convertirFecha(order.fechaCreacion);

                            const month = orderDate.getMonth();
                            monthlySales[month] += sale;
                        });
                    }
                });
            });
        });

        return {
            monthlySales,
            totalSales
        };
    };
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
        let cont = 0;
        pedidos.forEach(order => {
            if (datosUsuario !== true) {
                if (order.user._id === user.uid) {
                    order.itemPedido.forEach(item => {
                        Object.entries(item.itemPedido).forEach(([categoriaItem, category]) => {
                            if (['KCG', 'KCP', 'KB', 'CC', 'CB', 'OTR'].includes(categoriaItem)) {
                                if (categoriaItem !== categoria) return;
                                category.pedido.forEach(product => {
                                    const price = parseInt(product.precioUnitario) || parseInt(product.precio);
                                    const quantity = parseInt(product.cantidad, 10);
                                    const sale = price * quantity;
                                    totalSales += sale;

                                    const orderDate = convertirFecha(order.fechaCreacion);

                                    const year = orderDate.getFullYear();
                                    const month = orderDate.getMonth() + 1;

                                    if (year === currentYear) {
                                        monthlySales2025[month] += quantity;
                                    } else if (year === currentYear - 1) {
                                        monthlySales2024[month] += quantity;
                                    } else if (year === currentYear - 2) {
                                        monthlySales2023[month] += quantity;
                                    } else if (year === currentYear - 3) {
                                        monthlySales2022[month] += quantity;
                                    } else if (year === currentYear - 4) {
                                        monthlySales2021[month] += quantity;
                                    }

                                    //console.log('cont:', cont, '-', 'categoria: ', categoriaItem, '-', 'quantity: ', quantity, '- price: ', price, '- orderDate: ', orderDate);
                                    cont++;
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
                    Object.entries(item.itemPedido).forEach(([categoriaItem, category]) => {
                        if (['KCG', 'KCP', 'KB', 'CC', 'CB', 'OTR'].includes(categoriaItem)) {
                            if (categoriaItem !== categoria) return;
                            category.pedido.forEach(product => {
                                const price = parseInt(product.precioUnitario) || parseInt(product.precio);
                                const quantity = parseInt(product.cantidad, 10);
                                const sale = price * quantity;
                                totalSales += sale;

                                const orderDate = convertirFecha(order.fechaCreacion);

                                const year = orderDate.getFullYear();
                                const month = orderDate.getMonth() + 1;

                                if (year === currentYear) {
                                    monthlySales2025[month] += quantity;
                                } else if (year === currentYear - 1) {
                                    monthlySales2024[month] += quantity;
                                } else if (year === currentYear - 2) {
                                    monthlySales2023[month] += quantity;
                                } else if (year === currentYear - 3) {
                                    monthlySales2022[month] += quantity;
                                } else if (year === currentYear - 4) {
                                    monthlySales2021[month] += quantity;
                                }

                                //console.log('cont:', cont, '-', 'categoria: ', categoriaItem, '-', 'quantity: ', quantity, '- price: ', price, '- orderDate: ', orderDate);
                                cont++;
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
        });
        //console.log(monthlySales2025);
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
    const totalGastosUsuarios = (gastos, anioComparar, datosUsuario, categoria) => {
        if (gastos) {
            let totalGastos = 0;
            let gastosOG = 0;
            let gastosLG = 0;

            const gastosPorAnio = [];


            if (datosUsuario) {
                gastos.forEach(gasto => {
                    if (gasto.categoria !== categoria) return;
                    const fechaGasto = convertirFecha(gasto.fecha);
                    const anio = fechaGasto.getFullYear();
                    if (parseInt(anio) === anioComparar) {
                        totalGastos += gasto.precio * gasto.cantidad;
                        if (gasto.user === '679fce0ee8d1ed66d21d18c2') {
                            gastosOG += gasto.precio * gasto.cantidad;
                            return;
                        }
                        if (gasto.user === '6789ce1b48932f890985d1f7') {
                            gastosLG += gasto.precio * gasto.cantidad;
                            return;
                        }
                    }
                })
            }
            else {
                if (user.uid === '679fce0ee8d1ed66d21d18c2') {
                    gastos.forEach(gasto => {
                        const fechaGasto = convertirFecha(gasto.fecha);
                        const anio = fechaGasto.getFullYear();
                        if (anio === anioComparar) {
                            if (gasto.user === '679fce0ee8d1ed66d21d18c2') {
                                totalGastos += gasto.precio * gasto.cantidad;
                                if (gasto.categoria === 'K') {
                                    gastosOG += gasto.precio * gasto.cantidad;
                                    return;
                                } else if (gasto.categoria === 'G') {
                                    gastosLG += gasto.precio * gasto.cantidad;
                                    return;
                                }
                            }
                        }
                    }
                    );
                }
                if (user.uid === '6789ce1b48932f890985d1f7') {
                    gastos.forEach(gasto => {
                        const fechaGasto = convertirFecha(gasto.fecha);
                        const anio = fechaGasto.getFullYear();
                        if (anio === anioComparar) {
                            if (gasto.user === '6789ce1b48932f890985d1f7') {
                                if (gasto.categoria === 'K') {
                                    totalGastos += gasto.precio * gasto.cantidad;
                                    return;
                                }
                            }
                        }
                    }
                    );
                }
            }
            //console.log(gastosLG, gastosOG, totalGastos);
            gastosPorAnio.push(gastosOG, gastosLG, totalGastos);
            return [
                totalGastos,
                gastosOG,
                gastosLG
            ];
        }
    };
    const calcularTotalesPedidoCxC = (pedido) => { /* retorna el total de cantidades y de venta por pedido */
        if (!pedido?.itemPedido) return;

        let totalItems = 0;
        let totalKits = [0, 0, 0, 0, 0];
        let totalGuantes = [0, 0, 0];
        let totalOtros = 0;

        const total = pedido.itemPedido.reduce((acc, item) => {
            const subTotal = Object.entries(item?.itemPedido || {}).reduce((catAcc, [categoriaKey, categoria]) => {
                const categoriaTotal = (categoria?.pedido || []).reduce((prodAcc, pedidoItem) => {
                    const cantidad = pedidoItem?.cantidad || 0;
                    const precioUnitario = pedidoItem?.precioUnitario ?? pedidoItem?.precio ?? 0;
                    const totalPorProducto = precioUnitario * cantidad;
                    totalItems += parseInt(cantidad); // Contar cada cantidad
                    if (categoriaKey === 'GUANTES') {
                        if (pedidoItem.categoria === 'BLANCOS') {
                            totalGuantes[0] += totalPorProducto;
                        } else if (pedidoItem.categoria === 'NEGROS') {
                            totalGuantes[1] += totalPorProducto;
                        } else if (pedidoItem.categoria === 'MITON') {
                            totalGuantes[2] += totalPorProducto;
                        }
                    } else if (categoriaKey === 'OTR') {
                        totalOtros += totalPorProducto;
                    } else if (categoriaKey === 'KCG') {
                        totalKits[0] += totalPorProducto;
                    } else if (categoriaKey === 'KCP') {
                        totalKits[1] += totalPorProducto;
                    } else if (categoriaKey === 'KB') {
                        totalKits[2] += totalPorProducto;
                    } else if (categoriaKey === 'CC') {
                        totalKits[3] += totalPorProducto;
                    } else if (categoriaKey === 'CB') {
                        totalKits[4] += totalPorProducto;
                    }
                    return prodAcc + totalPorProducto;
                }, 0);
                return catAcc + categoriaTotal;
            }, 0);
            return acc + subTotal;
        }, 0);

        return {
            total,
            totalItems,
            totalKits,
            totalGuantes,
            totalOtros
        };
    };



    return {
        //*Parameters


        //*Methods
        buscarNombre,
        buscarPrecio,
        buscarPrecioxCategoriaAnio,
        calcularTotalesPedidoCxC,
        calcularTotalesPedidos,
        calculaTotalPedido,
        capitalizarPrimeraLetra,
        capitalize,
        convertirFecha,
        convertirFechaIngles,
        convertirNumeroATexto,
        formatearPrecio,
        handleBlur,
        limpiarFecha,
        number_format,
        obtenerImagen,
        totalesPedidos,
        totalesPedidosAnuales,
        totalesPedidosAnualesPorCategoria,
        totalGastosUsuarios,
        totalGuantesXAnio,
        totalizarPreciosFabrica,
        totalKitsXAnio,
        totalOtrosXAnio,
    }

}
