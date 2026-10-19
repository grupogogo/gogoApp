/**
 * historicalOrdersHelper.js
 * Unificador y calculador de métricas, reportes ejecutivos y estadísticas para pedidos históricos (pre-2025)
 * y pedidos modernos del sistema (2025 en adelante).
 */

export const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const MONTH_NAMES_FULL = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CATEGORIAS_DEFINICION = [
    { id: 'KCG', nombre: 'Kit Comunión Grande', grupo: 'Kits', unidad: 'Kits', color: '#3b82f6' },
    { id: 'KCP', nombre: 'Kit Comunión Pequeño', grupo: 'Kits', unidad: 'Kits', color: '#60a5fa' },
    { id: 'KCE', nombre: 'Kit Comunión Económico', grupo: 'Kits', unidad: 'Kits', color: '#93c5fd' },
    { id: 'KB', nombre: 'Kit de Bautizo', grupo: 'Kits', unidad: 'Kits', color: '#10b981' },
    { id: 'CC', nombre: 'Cirio de Comunión', grupo: 'Kits', unidad: 'Kits', color: '#f59e0b' },
    { id: 'CCON', nombre: 'Cirio de Confirmación', grupo: 'Kits', unidad: 'Kits', color: '#f97316' },
    { id: 'CB', nombre: 'Cirio de Bautizo', grupo: 'Kits', unidad: 'Kits', color: '#fbbf24' },
    { id: 'G_BLANCOS', nombre: 'Guantes Blancos', grupo: 'Guantes', unidad: 'Docenas', color: '#8b5cf6' },
    { id: 'G_MITON', nombre: 'Guantes Mitón', grupo: 'Guantes', unidad: 'Docenas', color: '#a855f7' },
    { id: 'G_NEGROS', nombre: 'Guantes Negros', grupo: 'Guantes', unidad: 'Docenas', color: '#475569' },
    { id: 'GUANTES', nombre: 'Guantes', grupo: 'Guantes', unidad: 'Docenas', color: '#8b5cf6' },
    { id: 'OTR', nombre: 'Otros / Accesorios', grupo: 'Otros', unidad: 'Unidades', color: '#6b7280' },
];

/**
 * Formatea un texto a Title Case para nombres de producto en la matriz
 */
export const formatearTituloProducto = (str = '') => {
    if (!str) return 'Otros Accesorios';
    const clean = str.trim();
    return clean
        .toLowerCase()
        .replace(/_/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
};

/**
 * Identifica la subcategoría específica de un guante:
 * - Blancos (G_BLANCOS)
 * - Mitón (G_MITON)
 * - Negros (G_NEGROS)
 * - Cualquier variante especial detectada (G_${slug})
 */
export const obtenerSubcategoriaGuante = (prodName = '', subcat = '', cod = '', rawCat = '') => {
    const text = `${subcat} ${prodName} ${cod} ${rawCat}`.toLowerCase();

    if (text.includes('negro')) {
        return {
            id: 'G_NEGROS',
            nombre: 'Guantes Negros',
            subcat: 'Negros',
            color: '#475569'
        };
    }
    if (text.includes('miton') || text.includes('mitón')) {
        return {
            id: 'G_MITON',
            nombre: 'Guantes Mitón',
            subcat: 'Mitón',
            color: '#a855f7'
        };
    }
    if (text.includes('blanco')) {
        return {
            id: 'G_BLANCOS',
            nombre: 'Guantes Blancos',
            subcat: 'Blancos',
            color: '#8b5cf6'
        };
    }

    // Variantes especiales encontradas (ej. "Guantes Satin", "Guantes Encaje", o ítems de otros)
    let clean = (prodName || subcat || rawCat || '').trim();
    if (clean.toLowerCase().startsWith('inputguantes')) {
        const parts = clean.split('-');
        if (parts.length > 2) clean = parts.slice(2).join(' ');
        else clean = 'Blancos';
    }

    if (clean && !clean.toLowerCase().startsWith('inputguantes')) {
        const slug = clean.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20);
        const nameFormatted = clean.toLowerCase().startsWith('guante')
            ? (clean.charAt(0).toUpperCase() + clean.slice(1))
            : `Guantes ${clean.charAt(0).toUpperCase() + clean.slice(1)}`;
        return {
            id: `G_${slug}`,
            nombre: nameFormatted,
            subcat: clean,
            color: '#7c3aed'
        };
    }

    return {
        id: 'G_BLANCOS',
        nombre: 'Guantes Blancos',
        subcat: 'Blancos',
        color: '#8b5cf6'
    };
};

/**
 * Convierte un string de fecha en formato DD/MM/YYYY o ISO a un objeto Date seguro
 */
export const parsearFechaSegura = (fechaStr) => {
    if (!fechaStr) return null;
    if (fechaStr instanceof Date) return isNaN(fechaStr.getTime()) ? null : fechaStr;

    if (typeof fechaStr === 'string') {
        const clean = fechaStr.trim();

        // Formato DD/MM/YYYY o DD/MM/YY
        if (clean.includes('/')) {
            const parts = clean.split('/');
            if (parts.length === 3) {
                const dia = parseInt(parts[0], 10);
                const mes = parseInt(parts[1], 10) - 1;
                let anio = parseInt(parts[2], 10);
                if (anio < 100) anio += 2000;
                const d = new Date(anio, mes, dia);
                if (!isNaN(d.getTime())) return d;
            }
        }

        // Formato YYYY-MM-DD o DD-MM-YYYY o DD-MM-YY
        if (clean.includes('-')) {
            const parts = clean.split('T')[0].split('-');
            if (parts.length === 3) {
                let anio, mes, dia;
                if (parts[0].length === 4) {
                    // Formato ISO: YYYY-MM-DD
                    anio = parseInt(parts[0], 10);
                    mes = parseInt(parts[1], 10) - 1;
                    dia = parseInt(parts[2], 10);
                } else {
                    // Formato Latinoamericano: DD-MM-YYYY o DD-MM-YY
                    dia = parseInt(parts[0], 10);
                    mes = parseInt(parts[1], 10) - 1;
                    anio = parseInt(parts[2], 10);
                    if (anio < 100) anio += 2000;
                }
                const d = new Date(anio, mes, dia);
                if (!isNaN(d.getTime())) return d;
            }
        }

        // Formatos con nombre de mes en español (ej. "septiembre 30, 2025 15:57")
        const mesesES = {
            enero: 'January', febrero: 'February', marzo: 'March', abril: 'April',
            mayo: 'May', junio: 'June', julio: 'July', agosto: 'August',
            septiembre: 'September', octubre: 'October', noviembre: 'November', diciembre: 'December'
        };
        let englishStr = clean.toLowerCase();
        Object.entries(mesesES).forEach(([es, en]) => {
            englishStr = englishStr.replace(es, en);
        });
        const parsed = new Date(englishStr);
        if (!isNaN(parsed.getTime())) return parsed;
    }

    const fallback = new Date(fechaStr);
    return isNaN(fallback.getTime()) ? null : fallback;
};

/**
 * Mapea códigos antiguos (KGCA, KGCO, KPCA, KPCO, KBNA, etc.) a categorías unificadas
 */
export const mapearCodigoAntiguo = (codigo = '', producto = '') => {
    const cod = String(codigo).toUpperCase().trim();
    const prod = String(producto).toLowerCase();

    if (cod === 'KGCA' || cod === 'KGCO') {
        return {
            categoriaId: 'KCG',
            subcategoria: cod === 'KGCA' ? 'Niña' : 'Niño',
            genero: cod === 'KGCA' ? '1' : '0',
            nombre: `Kit Comunión Grande ${cod === 'KGCA' ? 'Niña' : 'Niño'}`
        };
    }
    if (cod === 'KPCA' || cod === 'KPCO') {
        return {
            categoriaId: 'KCP',
            subcategoria: cod === 'KPCA' ? 'Niña' : 'Niño',
            genero: cod === 'KPCA' ? '1' : '0',
            nombre: `Kit Comunión Pequeño ${cod === 'KPCA' ? 'Niña' : 'Niño'}`
        };
    }
    if (cod === 'KBNA' || cod === 'KBNO' || cod === 'KBA' || cod === 'KBO') {
        return {
            categoriaId: 'KB',
            subcategoria: (cod === 'KBNA' || cod === 'KBA') ? 'Niña' : 'Niño',
            genero: (cod === 'KBNA' || cod === 'KBA') ? '1' : '0',
            nombre: `Kit Bautizo ${(cod === 'KBNA' || cod === 'KBA') ? 'Niña' : 'Niño'}`
        };
    }
    if (cod === 'CCNA' || cod === 'CCNO' || cod === 'CCA' || cod === 'CCO') {
        return {
            categoriaId: 'CC',
            subcategoria: (cod === 'CCNA' || cod === 'CCA') ? 'Niña' : 'Niño',
            genero: (cod === 'CCNA' || cod === 'CCA') ? '1' : '0',
            nombre: `Cirio Comunión ${(cod === 'CCNA' || cod === 'CCA') ? 'Niña' : 'Niño'}`
        };
    }
    if (cod === 'CBNA' || cod === 'CBNO' || cod === 'CBA' || cod === 'CBO') {
        return {
            categoriaId: 'CB',
            subcategoria: (cod === 'CBNA' || cod === 'CBA') ? 'Niña' : 'Niño',
            genero: (cod === 'CBNA' || cod === 'CBA') ? '1' : '0',
            nombre: `Cirio Bautizo ${(cod === 'CBNA' || cod === 'CBA') ? 'Niña' : 'Niño'}`
        };
    }

    if (cod.includes('GUANT') || prod.includes('guante')) {
        const gloveInfo = obtenerSubcategoriaGuante(producto, '', codigo);
        return {
            categoriaId: 'GUANTES',
            idMatriz: gloveInfo.id,
            subcategoria: gloveInfo.subcat,
            genero: '',
            nombre: gloveInfo.nombre
        };
    }

    // Libros, cintas, etc.
    if (cod === 'LBC' || cod === 'LBCP') {
        return {
            categoriaId: 'OTR',
            idMatriz: 'OTR_LIBRO_COMUNION',
            subcategoria: 'Libros',
            genero: '',
            nombre: producto || 'Libro Comunión'
        };
    }
    if (cod === 'CTC') {
        return {
            categoriaId: 'OTR',
            idMatriz: 'OTR_CINTA_COMUNION',
            subcategoria: 'Cintas',
            genero: '',
            nombre: producto || 'Cinta Comunión'
        };
    }

    const cleanProd = formatearTituloProducto(producto || cod || 'Otros');
    const slug = cleanProd.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 25);
    return {
        categoriaId: 'OTR',
        idMatriz: `OTR_${slug || 'ACCESORIO'}`,
        subcategoria: cleanProd,
        genero: '',
        nombre: cleanProd
    };
};

/**
 * Normaliza un pedido histórico (pre-2025) a la estructura unificada
 */
export const normalizarOldOrder = (order) => {
    const fecha = parsearFechaSegura(order.FECHA || order.fecha);
    const anio = fecha ? fecha.getFullYear() : null;
    const mes = fecha ? fecha.getMonth() : null;

    const itemsNormalizados = (order.items || []).map((item, idx) => {
        const codigo = item.CODIGO || item.codigo || 'S/C';
        const prod = item.PRODUCTO || item.producto || '';
        const mapping = mapearCodigoAntiguo(codigo, prod);
        const cantidad = Number(item.CANTIDAD || item.cantidad || 0);
        const precio = Number(item.PRECIO || item.precio || 0);
        const total = Number(item.TOTAL || item.total || (cantidad * precio));

        return {
            id: `old_item_${idx}`,
            codigo,
            producto: prod || mapping.nombre,
            categoriaId: mapping.categoriaId,
            idMatriz: mapping.idMatriz || mapping.categoriaId,
            subcategoria: mapping.subcategoria,
            genero: mapping.genero || '',
            cantidad,
            precio,
            total
        };
    });

    const cantidadPrendas = itemsNormalizados.reduce((acc, curr) => acc + curr.cantidad, 0);
    const sumItemsTotal = itemsNormalizados.reduce((acc, curr) => acc + curr.total, 0);
    const totalVenta = sumItemsTotal > 0 ? sumItemsTotal : Number(order.TOTAL || order.total || 0);

    const clienteNombre = (order.CLIENTE || order.cliente || 'Sin Cliente').trim();
    const nitStr = String(order.NIT || order.nit || '').trim();
    const esBrandDesign = /brand\s*design/i.test(clienteNombre) || nitStr.includes('900879470');
    const userId = esBrandDesign ? UID_LEONARDO : UID_OSCAR;
    const userName = esBrandDesign ? 'Leonardo Gómez' : 'Oscar Gómez';
    const userObj = {
        _id: userId,
        uid: userId,
        id: userId,
        name: userName,
        email: esBrandDesign ? 'leonardo@branddesign.com' : 'oscar@gogo.com',
        esBrandDesign
    };

    return {
        id: String(order.REMISION || order.remision || order._id || Math.random()),
        remision: String(order.REMISION || order.remision || 'S/R'),
        fecha,
        fechaStr: fecha ? fecha.toLocaleDateString('es-CO') : (order.FECHA || order.fecha || ''),
        anio,
        mes,
        cliente: clienteNombre,
        nit: nitStr,
        total: totalVenta,
        cantidadPrendas,
        itemsCount: itemsNormalizados.length,
        items: itemsNormalizados,
        origen: 'HISTORICO',
        user: userObj,
        userId,
        userName,
        esBrandDesign,
        raw: order
    };
};

/**
 * Normaliza un pedido moderno (2025 en adelante de MongoDB) a la estructura unificada
 */
export const normalizarModernPedido = (pedido) => {
    const fecha = parsearFechaSegura(pedido.fechaCreacion || pedido.createdAt);
    const anio = fecha ? fecha.getFullYear() : null;
    const mes = fecha ? fecha.getMonth() : null;

    const esKarolOrder = esUsuarioKarol(pedido.user);
    const itemsNormalizados = [];

    (pedido.itemPedido || []).forEach((wrap) => {
        const categoriesObj = wrap.itemPedido || {};
        Object.entries(categoriesObj).forEach(([categoriaKey, catData]) => {
            const itemsArray = catData?.pedido || [];
            if (!Array.isArray(itemsArray)) return;

            itemsArray.forEach((item, idx) => {
                const prodName = (item.producto || item.nombreInput || item.nombre || '').trim();
                const rawCat = (item.categoria || '').trim();
                const checkText = `${categoriaKey} ${prodName} ${rawCat}`.toLowerCase();
                const esGuante = categoriaKey === 'GUANTES' || categoriaKey.includes('GUANTE') || checkText.includes('guant');

                let categoriaId = 'OTR';
                let idMatriz = 'OTR';
                let subcategoria = '';
                let nombreItem = prodName;
                const genero = String(item.genero || '');

                if (categoriaKey === 'KCG') {
                    categoriaId = 'KCG';
                    idMatriz = 'KCG';
                    subcategoria = genero === '1' ? 'Niña' : 'Niño';
                    nombreItem = 'Kit Comunión Grande';
                } else if (categoriaKey === 'KCP') {
                    categoriaId = 'KCP';
                    idMatriz = 'KCP';
                    subcategoria = genero === '1' ? 'Niña' : 'Niño';
                    nombreItem = 'Kit Comunión Pequeño';
                } else if (categoriaKey === 'KCE') {
                    categoriaId = 'KCE';
                    idMatriz = 'KCE';
                    subcategoria = genero === '1' ? 'Niña' : 'Niño';
                    nombreItem = 'Kit Comunión Económico';
                } else if (categoriaKey === 'KB') {
                    categoriaId = 'KB';
                    idMatriz = 'KB';
                    subcategoria = genero === '1' ? 'Niña' : 'Niño';
                    nombreItem = 'Kit de Bautizo';
                } else if (categoriaKey === 'CC') {
                    categoriaId = 'CC';
                    idMatriz = 'CC';
                    subcategoria = genero === '1' ? 'Niña' : 'Niño';
                    nombreItem = 'Cirio de Comunión';
                } else if (categoriaKey === 'CCON') {
                    categoriaId = 'CCON';
                    idMatriz = 'CCON';
                    subcategoria = genero === '1' ? 'Niña' : 'Niño';
                    nombreItem = 'Cirio de Confirmación';
                } else if (categoriaKey === 'CB') {
                    categoriaId = 'CB';
                    idMatriz = 'CB';
                    subcategoria = genero === '1' ? 'Niña' : 'Niño';
                    nombreItem = 'Cirio de Bautizo';
                } else if (esGuante) {
                    categoriaId = 'GUANTES';
                    const gloveInfo = obtenerSubcategoriaGuante(prodName, rawCat, categoriaKey, rawCat);
                    idMatriz = gloveInfo.id;
                    subcategoria = gloveInfo.subcat;
                    nombreItem = gloveInfo.nombre;
                } else {
                    categoriaId = 'OTR';
                    const cleanName = formatearTituloProducto(prodName || rawCat || 'Otros Accesorios');
                    const slug = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 25);
                    idMatriz = `OTR_${slug || 'ACCESORIO'}`;
                    subcategoria = cleanName;
                    nombreItem = cleanName;
                }

                const rawCatStr = String(rawCat || '').toLowerCase();
                const prodNameStr = String(prodName || '').toLowerCase();
                const esDeGuantes = esGuante || rawCatStr.includes('guante') || prodNameStr.includes('guante') || prodNameStr.includes('miton');
                const categoriaNegocio = item.categoria || item.categoriaNegocio || (esDeGuantes ? 'Guantes' : 'Kits');

                const cantidad = Number(item.cantidad || 0);
                const precio = Number(item.precioUnitario || item.precio || 0);
                const total = cantidad * precio;

                itemsNormalizados.push({
                    id: `${pedido._id}_item_${categoriaKey}_${idx}`,
                    codigo: categoriaKey,
                    producto: nombreItem || `${categoriaId} ${subcategoria}`.trim(),
                    categoriaId,
                    idMatriz,
                    subcategoria,
                    genero,
                    cantidad,
                    precio,
                    total,
                    categoriaNegocio
                });
            });
        });
    });

    const cantidadPrendas = itemsNormalizados.reduce((acc, curr) => acc + curr.cantidad, 0);
    const totalCalculado = itemsNormalizados.reduce((acc, curr) => acc + curr.total, 0);

    const clienteNombre = pedido.cliente?.nombre || pedido.cliente?.name || 'Cliente sin nombre';
    const nit = pedido.cliente?.nitCC || pedido.cliente?.documento || pedido.cliente?.nit || '';
    const remision = pedido._id ? String(pedido._id).slice(-6).toUpperCase() : (pedido.numeroGuia || 'S/R');

    return {
        id: pedido._id || pedido.pedido_id || Math.random().toString(),
        remision,
        fecha,
        fechaStr: fecha ? fecha.toLocaleDateString('es-CO') : '',
        anio,
        mes,
        cliente: clienteNombre.trim(),
        nit: String(nit).trim(),
        total: totalCalculado,
        cantidadPrendas,
        itemsCount: itemsNormalizados.length,
        items: itemsNormalizados,
        origen: 'SISTEMA',
        estado: pedido.estado || 'pendiente',
        user: pedido.user || null,
        userId: (pedido.user?._id || pedido.user)?.toString() || null,
        userName: pedido.user?.name || '',
        raw: pedido
    };
};

/**
 * Obtiene y unifica todos los pedidos correspondientes a un año específico
 */
export const obtenerPedidosPorAnio = (oldOrders = [], pedidos = [], anioFiltro) => {
    const anio = parseInt(anioFiltro, 10);
    const resultados = [];

    // Si es 2024 o anterior, la fuente principal es oldOrders
    if (anio <= 2024) {
        oldOrders.forEach(ord => {
            const norm = normalizarOldOrder(ord);
            if (norm.anio === anio) {
                resultados.push(norm);
            }
        });
    } else {
        // 2025 en adelante: la fuente principal es pedidos de MongoDB
        pedidos.forEach(ped => {
            const norm = normalizarModernPedido(ped);
            if (norm.anio === anio) {
                resultados.push(norm);
            }
        });

        // Por seguridad, si existen pedidos en oldOrders con este año (ej. migrados o pruebas)
        oldOrders.forEach(ord => {
            const norm = normalizarOldOrder(ord);
            if (norm.anio === anio) {
                resultados.push(norm);
            }
        });
    }

    // Ordenar de más antiguo a más nuevo
    return resultados.sort((a, b) => {
        if (!a.fecha) return -1;
        if (!b.fecha) return 1;
        return a.fecha - b.fecha;
    });
};

/**
 * Agrupa los gastos de la base de datos por año y mes
 */
export const obtenerGastosPorAnio = (gastos = [], anioFiltro) => {
    const anio = parseInt(anioFiltro, 10);
    const mensual = Array(12).fill(0);
    let total = 0;
    const desgloseCategorias = {};
    const lista = [];

    (Array.isArray(gastos) ? gastos : (gastos?.lista || [])).forEach(gasto => {
        const fecha = parsearFechaSegura(gasto.fecha || gasto.createdAt);
        if (!fecha || fecha.getFullYear() !== anio) return;

        const mes = fecha.getMonth();
        const precio = Number(gasto.precio || 0);
        const cantidad = Number(gasto.cantidad || 1);
        const subtotal = precio * cantidad;

        mensual[mes] += subtotal;
        total += subtotal;

        const cat = gasto.categoria || 'GENERAL';
        desgloseCategorias[cat] = (desgloseCategorias[cat] || 0) + subtotal;
        lista.push(gasto);
    });

    return {
        total,
        mensual,
        desgloseCategorias,
        lista
    };
};

/**
 * Calcula todas las estadísticas y reportes ejecutivos para el año seleccionado
 */
export const calcularEstadisticasAnio = (
    pedidosDelAnio = [],
    gastosDelAnio = { total: 0, mensual: Array(12).fill(0) },
    pedidosAnioAnterior = [],
    listaPrecios = []
) => {
    const totalVentas = pedidosDelAnio.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalVentasAnterior = pedidosAnioAnterior.reduce((acc, curr) => acc + (curr.total || 0), 0);

    // Crecimiento año contra año (YoY)
    let crecimientoYoY = 0;
    if (totalVentasAnterior > 0) {
        crecimientoYoY = ((totalVentas - totalVentasAnterior) / totalVentasAnterior) * 100;
    }

    const totalGastos = gastosDelAnio.total || 0;
    const utilidadOperativa = totalVentas - totalGastos;
    const margenOperativoPorcentaje = totalVentas > 0 ? (utilidadOperativa / totalVentas) * 100 : 0;

    const totalPedidos = pedidosDelAnio.length;
    const totalPrendas = pedidosDelAnio.reduce((acc, curr) => acc + (curr.cantidadPrendas || 0), 0);
    const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;

    // Ventas, gastos, prendas y pedidos mensuales
    const ventasMensuales = Array(12).fill(0);
    const unidadesMensuales = Array(12).fill(0);
    const pedidosMensuales = Array(12).fill(0);

    // Separación mensual de Kits (incluye cirios) y Guantes
    const kitsMensuales = Array(12).fill(0);
    const ventasKitsMensuales = Array(12).fill(0);
    const guantesMensuales = Array(12).fill(0);
    const ventasGuantesMensuales = Array(12).fill(0);
    const otrosMensuales = Array(12).fill(0);
    const ventasOtrosMensuales = Array(12).fill(0);

    // Desglose de Género (Niña vs Niño)
    const desgloseGenero = {
        prendasNina: 0,
        prendasNino: 0,
        prendasNeutro: 0,
        ventasNina: 0,
        ventasNino: 0,
        ventasNeutro: 0,
        kitsNina: 0,
        kitsNino: 0,
        ciriosNina: 0,
        ciriosNino: 0,
        porcentajeNina: 0,
        porcentajeNino: 0
    };

    pedidosDelAnio.forEach(ord => {
        if (ord.mes !== null && ord.mes >= 0 && ord.mes <= 11) {
            ventasMensuales[ord.mes] += ord.total;
            unidadesMensuales[ord.mes] += ord.cantidadPrendas;
            pedidosMensuales[ord.mes] += 1;
        }

        const fechaOrder = ord.fecha || ord.fechaCreacion || ord.fechaStr || (ord.anio ? new Date(ord.anio, ord.mes ?? 0, 1) : null);
        const esModernoFabrica = (ord.anio >= 2025);
        const tarifaVigente = esModernoFabrica ? obtenerTarifaVigente(fechaOrder, listaPrecios) : null;

        ord.items.forEach(it => {
            const m = ord.mes;
            const gen = String(it.genero);
            // Regla de negocio: Cirios (CC, CB) hacen parte de Kits
            const esKit = esCategoriaKits(it.categoriaId, it.codigo) ||
                ['KCG', 'KCP', 'KCE', 'KB', 'CC', 'CB', 'CCON', 'K'].includes(String(it.categoriaId || '').toUpperCase()) ||
                String(it.producto || '').toLowerCase().includes('cirio') ||
                String(it.producto || '').toLowerCase().includes('kit');
            const esCirio = ['CC', 'CB', 'CCON'].includes(it.categoriaId) || String(it.producto || '').toLowerCase().includes('cirio');
            const esGuante = esCategoriaGuantes(it.categoriaId, it.codigo, it.producto);

            if (m !== null && m >= 0 && m <= 11) {
                const cant = Number(it.cantidad || 0);
                let tot = Number(it.total || 0);
                const tipoKit = clasificarItemKit(it);
                if (esKit && esModernoFabrica && tipoKit) {
                    const precioTarifa = obtenerPrecioFabricaItem(tipoKit, tarifaVigente);
                    if (precioTarifa > 0) {
                        tot = cant * precioTarifa;
                    } else if (PRECIOS_FABRICA_KITS_DEFAULT[tipoKit]) {
                        tot = cant * PRECIOS_FABRICA_KITS_DEFAULT[tipoKit];
                    }
                }

                if (esKit) {
                    kitsMensuales[m] += cant;
                    ventasKitsMensuales[m] += tot;
                } else if (esGuante) {
                    guantesMensuales[m] += cant;
                    ventasGuantesMensuales[m] += tot;
                } else {
                    otrosMensuales[m] += cant;
                    ventasOtrosMensuales[m] += tot;
                }
            }

            if (gen === '1' || it.subcategoria === 'Niña') {
                desgloseGenero.prendasNina += it.cantidad;
                desgloseGenero.ventasNina += it.total;
                if (esKit && !esCirio) desgloseGenero.kitsNina += it.cantidad;
                if (esCirio) desgloseGenero.ciriosNina += it.cantidad;
            } else if (gen === '0' || it.subcategoria === 'Niño') {
                desgloseGenero.prendasNino += it.cantidad;
                desgloseGenero.ventasNino += it.total;
                if (esKit && !esCirio) desgloseGenero.kitsNino += it.cantidad;
                if (esCirio) desgloseGenero.ciriosNino += it.cantidad;
            } else {
                desgloseGenero.prendasNeutro += it.cantidad;
                desgloseGenero.ventasNeutro += it.total;
            }
        });
    });

    const totalConGenero = desgloseGenero.prendasNina + desgloseGenero.prendasNino;
    if (totalConGenero > 0) {
        desgloseGenero.porcentajeNina = (desgloseGenero.prendasNina / totalConGenero) * 100;
        desgloseGenero.porcentajeNino = (desgloseGenero.prendasNino / totalConGenero) * 100;
    }

    // Utilidad mensual
    const utilidadMensual = ventasMensuales.map((v, idx) => v - (gastosDelAnio.mensual[idx] || 0));

    // REPORTE ESTADO DE RESULTADOS MENSUAL (P&L Detallado)
    const reporteMensualPL = MONTH_LABELS.map((nom, idx) => {
        const v = ventasMensuales[idx];
        const g = gastosDelAnio.mensual[idx] || 0;
        const u = v - g;
        const m = v > 0 ? (u / v) * 100 : 0;
        const peds = pedidosMensuales[idx];
        const prend = unidadesMensuales[idx];
        const ticket = peds > 0 ? v / peds : 0;
        const share = totalVentas > 0 ? (v / totalVentas) * 100 : 0;

        return {
            mesIndex: idx,
            nombre: nom,
            nombreCompleto: MONTH_NAMES_FULL[idx],
            ventas: v,
            gastos: g,
            utilidad: u,
            margen: m,
            pedidos: peds,
            prendas: prend,
            ticketPromedio: ticket,
            participacionAnual: share,
            rentable: u > 0,
            rendimiento: u > 0 ? (m >= 35 ? 'Excelente' : 'Positivo') : (v > 0 ? 'Déficit' : 'Sin Actividad')
        };
    });

    // REPORTE POR TRIMESTRES (Q1 - Q4) Y SEMESTRES
    const calcTrimestre = (nombre, mesesIndices) => {
        const ventas = mesesIndices.reduce((acc, m) => acc + ventasMensuales[m], 0);
        const gastos = mesesIndices.reduce((acc, m) => acc + (gastosDelAnio.mensual[m] || 0), 0);
        const utilidad = ventas - gastos;
        const margen = ventas > 0 ? (utilidad / ventas) * 100 : 0;
        const prendas = mesesIndices.reduce((acc, m) => acc + unidadesMensuales[m], 0);
        const pedidos = mesesIndices.reduce((acc, m) => acc + pedidosMensuales[m], 0);
        const ticket = pedidos > 0 ? ventas / pedidos : 0;
        const participacion = totalVentas > 0 ? (ventas / totalVentas) * 100 : 0;

        const kits = mesesIndices.reduce((acc, m) => acc + kitsMensuales[m], 0);
        const ventasKits = mesesIndices.reduce((acc, m) => acc + ventasKitsMensuales[m], 0);
        const guantes = mesesIndices.reduce((acc, m) => acc + guantesMensuales[m], 0);
        const ventasGuantes = mesesIndices.reduce((acc, m) => acc + ventasGuantesMensuales[m], 0);
        const otros = mesesIndices.reduce((acc, m) => acc + otrosMensuales[m], 0);
        const ventasOtros = mesesIndices.reduce((acc, m) => acc + ventasOtrosMensuales[m], 0);

        return {
            nombre,
            ventas,
            gastos,
            utilidad,
            margen,
            prendas,
            pedidos,
            ticket,
            participacion,
            kits,
            ventasKits,
            guantes,
            ventasGuantes,
            otros,
            ventasOtros
        };
    };

    const reporteTrimestres = {
        Q1: calcTrimestre('Trimestre 1 (Ene - Mar)', [0, 1, 2]),
        Q2: calcTrimestre('Trimestre 2 (Abr - Jun)', [3, 4, 5]),
        Q3: calcTrimestre('Trimestre 3 (Jul - Sep)', [6, 7, 8]),
        Q4: calcTrimestre('Trimestre 4 (Oct - Dic)', [9, 10, 11]),
        S1: calcTrimestre('Semestre 1 (Ene - Jun)', [0, 1, 2, 3, 4, 5]),
        S2: calcTrimestre('Semestre 2 (Jul - Dic)', [6, 7, 8, 9, 10, 11]),
    };

    // Mejor y peor mes en ventas
    let mejorMesIdx = 0;
    let mejorMesVenta = 0;
    let peorMesIdx = 0;
    let peorMesVenta = Infinity;

    ventasMensuales.forEach((v, idx) => {
        if (v > mejorMesVenta) {
            mejorMesVenta = v;
            mejorMesIdx = idx;
        }
        if (v > 0 && v < peorMesVenta) {
            peorMesVenta = v;
            peorMesIdx = idx;
        }
    });
    if (peorMesVenta === Infinity) peorMesVenta = 0;

    // Top clientes y Métricas de Concentración
    const clientesMap = {};
    pedidosDelAnio.forEach(ord => {
        const nitOCliente = ord.cliente || ord.nit || 'Sin Nombre';
        if (!clientesMap[nitOCliente]) {
            clientesMap[nitOCliente] = {
                nombre: ord.cliente,
                nit: ord.nit,
                pedidos: 0,
                prendas: 0,
                total: 0
            };
        }
        clientesMap[nitOCliente].pedidos += 1;
        clientesMap[nitOCliente].prendas += ord.cantidadPrendas;
        clientesMap[nitOCliente].total += ord.total;
    });

    const todosClientes = Object.values(clientesMap).sort((a, b) => b.total - a.total);
    const totalClientesUnicos = todosClientes.length;

    todosClientes.forEach(cli => {
        cli.participacion = totalVentas > 0 ? (cli.total / totalVentas) * 100 : 0;
        cli.ticketPromedio = cli.pedidos > 0 ? cli.total / cli.pedidos : 0;
        cli.prendasPromedio = cli.pedidos > 0 ? cli.prendas / cli.pedidos : 0;
    });

    const topClientes = todosClientes.slice(0, 15);

    // Concentración
    const ventasTop3 = todosClientes.slice(0, 3).reduce((acc, c) => acc + c.total, 0);
    const ventasTop5 = todosClientes.slice(0, 5).reduce((acc, c) => acc + c.total, 0);
    const concentracionTop3 = totalVentas > 0 ? (ventasTop3 / totalVentas) * 100 : 0;
    const concentracionTop5 = totalVentas > 0 ? (ventasTop5 / totalVentas) * 100 : 0;

    // Desglose por Categoría Unificada y Subcategorías
    const baseCategorias = [
        { id: 'KCG', nombre: 'Kit Comunión Grande', grupo: 'Kits', unidad: 'Kits', color: '#3b82f6' },
        { id: 'KCP', nombre: 'Kit Comunión Pequeño', grupo: 'Kits', unidad: 'Kits', color: '#60a5fa' },
        { id: 'KCE', nombre: 'Kit Comunión Económico', grupo: 'Kits', unidad: 'Kits', color: '#93c5fd' },
        { id: 'KB', nombre: 'Kit de Bautizo', grupo: 'Kits', unidad: 'Kits', color: '#10b981' },
        { id: 'CC', nombre: 'Cirio de Comunión', grupo: 'Kits', unidad: 'Kits', color: '#f59e0b' },
        { id: 'CCON', nombre: 'Cirio de Confirmación', grupo: 'Kits', unidad: 'Kits', color: '#f97316' },
        { id: 'CB', nombre: 'Cirio de Bautizo', grupo: 'Kits', unidad: 'Kits', color: '#fbbf24' },
        { id: 'G_BLANCOS', nombre: 'Guantes Blancos', grupo: 'Guantes', unidad: 'Docenas', color: '#8b5cf6' },
        { id: 'G_MITON', nombre: 'Guantes Mitón', grupo: 'Guantes', unidad: 'Docenas', color: '#a855f7' },
        { id: 'G_NEGROS', nombre: 'Guantes Negros', grupo: 'Guantes', unidad: 'Docenas', color: '#475569' },
    ];

    const categoriasMatriz = {};
    baseCategorias.forEach(c => {
        categoriasMatriz[c.id] = {
            ...c,
            unidades: 0,
            totalVenta: 0,
            precioPromedio: 0,
            porcentajeUnidades: 0,
            porcentajeVenta: 0,
            mensualUnidades: Array(12).fill(0),
            mensualVenta: Array(12).fill(0),
        };
    });

    const paletteOTR = ['#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#64748b', '#d946ef', '#0ea5e9'];
    let otrColorIdx = 0;

    pedidosDelAnio.forEach(ord => {
        const esKarol = ord.atribuidoKarol || esUsuarioKarol(ord.user) || esUsuarioKarol(ord.raw?.user);
        const fechaOrder = ord.fecha || ord.fechaCreacion || ord.fechaStr || (ord.anio ? new Date(ord.anio, ord.mes ?? 0, 1) : null);
        const esModernoFabrica = (ord.anio >= 2025);
        const tarifaVigente = esModernoFabrica ? obtenerTarifaVigente(fechaOrder, listaPrecios) : null;

        ord.items.forEach(item => {
            const esKit = esCategoriaKits(item.categoriaId, item.codigo);
            const esGuante = esCategoriaGuantes(item.categoriaId, item.codigo, item.producto);
            const esOtros = !esKit && !esGuante;

            // Regla estricta: de la categoría Otros NO sumar nada de Karol
            if (esKarol && esOtros) {
                return;
            }

            // Determinar ID en la Matriz
            let mId = item.idMatriz;
            if (!mId) {
                if (esKit) {
                    mId = item.categoriaId;
                } else if (esGuante) {
                    const gInfo = obtenerSubcategoriaGuante(item.producto, item.subcategoria, item.codigo);
                    mId = gInfo.id;
                } else {
                    const clean = item.producto || item.subcategoria || 'Otros';
                    const slug = clean.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 25);
                    mId = `OTR_${slug || 'ACCESORIO'}`;
                }
            }

            // Si es un guante especial o producto dinámico de Otros que aún no existe en la matriz, crearlo
            if (!categoriasMatriz[mId]) {
                if (esGuante || mId.startsWith('G_')) {
                    const gInfo = obtenerSubcategoriaGuante(item.producto, item.subcategoria, item.codigo);
                    categoriasMatriz[mId] = {
                        id: mId,
                        nombre: gInfo.nombre || item.producto || 'Guantes Especiales',
                        grupo: 'Guantes',
                        unidad: 'Docenas',
                        color: gInfo.color || '#7c3aed',
                        unidades: 0,
                        totalVenta: 0,
                        precioPromedio: 0,
                        porcentajeUnidades: 0,
                        porcentajeVenta: 0,
                        mensualUnidades: Array(12).fill(0),
                        mensualVenta: Array(12).fill(0),
                    };
                } else {
                    const prodTitle = formatearTituloProducto(item.producto || item.subcategoria || 'Accesorio');
                    const col = paletteOTR[otrColorIdx % paletteOTR.length];
                    otrColorIdx++;
                    categoriasMatriz[mId] = {
                        id: mId,
                        nombre: prodTitle,
                        grupo: 'Otros',
                        unidad: 'Unidades',
                        color: col,
                        unidades: 0,
                        totalVenta: 0,
                        precioPromedio: 0,
                        porcentajeUnidades: 0,
                        porcentajeVenta: 0,
                        mensualUnidades: Array(12).fill(0),
                        mensualVenta: Array(12).fill(0),
                    };
                }
            }

            const cant = Number(item.cantidad || 0);
            let itemTotal = Number(item.total || 0);
            const tipoKit = clasificarItemKit(item);
            if (esKit && esModernoFabrica && tipoKit) {
                const precioTarifa = obtenerPrecioFabricaItem(tipoKit, tarifaVigente);
                if (precioTarifa > 0) {
                    itemTotal = cant * precioTarifa;
                } else if (PRECIOS_FABRICA_KITS_DEFAULT[tipoKit]) {
                    itemTotal = cant * PRECIOS_FABRICA_KITS_DEFAULT[tipoKit];
                }
            }

            categoriasMatriz[mId].unidades += cant;
            categoriasMatriz[mId].totalVenta += itemTotal;

            if (ord.mes !== null && ord.mes >= 0 && ord.mes <= 11) {
                categoriasMatriz[mId].mensualUnidades[ord.mes] += cant;
                categoriasMatriz[mId].mensualVenta[ord.mes] += itemTotal;
            }
        });
    });

    Object.values(categoriasMatriz).forEach(cat => {
        cat.precioPromedio = cat.unidades > 0 ? cat.totalVenta / cat.unidades : 0;
        cat.porcentajeUnidades = totalPrendas > 0 ? (cat.unidades / totalPrendas) * 100 : 0;
        cat.porcentajeVenta = totalVentas > 0 ? (cat.totalVenta / totalVentas) * 100 : 0;
    });

    // Totales por macro-grupo (Kits, Cirios, Guantes, Otros)
    // Kits y Cirios hacen parte unificada de la categoría KITS
    const gruposResumen = {
        Kits: { unidades: 0, unidadLabel: 'kits', total: 0 },
        Cirios: { unidades: 0, unidadLabel: 'cirios', total: 0 },
        Guantes: { unidades: 0, unidadLabel: 'docenas', total: 0 },
        Otros: { unidades: 0, unidadLabel: 'unidades', total: 0 }
    };

    Object.values(categoriasMatriz).forEach(cat => {
        if (gruposResumen[cat.grupo]) {
            gruposResumen[cat.grupo].unidades += cat.unidades;
            gruposResumen[cat.grupo].total += cat.totalVenta;
        }
    });

    // Ordenar categorías para visualización en la matriz:
    // 1. Kits
    // 2. Guantes (subcategorías)
    // 3. Otros (productos individuales agrupados)
    const categoriasMatrizOrdenadas = Object.values(categoriasMatriz).filter(cat => {
        if (['KCG', 'KCP', 'KCE', 'KB', 'CC', 'CB', 'CCON', 'G_BLANCOS', 'G_MITON', 'G_NEGROS'].includes(cat.id)) {
            return true;
        }
        return cat.unidades > 0 || cat.totalVenta > 0;
    }).sort((a, b) => {
        const grupoOrder = { Kits: 1, Guantes: 2, Otros: 3 };
        const gA = grupoOrder[a.grupo] || 99;
        const gB = grupoOrder[b.grupo] || 99;
        if (gA !== gB) return gA - gB;
        return b.totalVenta - a.totalVenta;
    });

    return {
        totalVentas,
        totalVentasAnterior,
        crecimientoYoY,
        totalGastos,
        utilidadOperativa,
        margenOperativoPorcentaje,
        totalPedidos,
        totalPrendas,
        ticketPromedio,
        ventasMensuales,
        gastosMensuales: gastosDelAnio.mensual,
        utilidadMensual,
        unidadesMensuales,
        pedidosMensuales,
        mejorMes: {
            index: mejorMesIdx,
            nombre: MONTH_NAMES_FULL[mejorMesIdx],
            total: mejorMesVenta
        },
        peorMes: {
            index: peorMesIdx,
            nombre: MONTH_NAMES_FULL[peorMesIdx],
            total: peorMesVenta
        },
        desgloseGenero,
        reporteMensualPL,
        reporteTrimestres,
        topClientes,
        totalClientesUnicos,
        concentracionTop3,
        concentracionTop5,
        categoriasMatriz: categoriasMatrizOrdenadas,
        gruposResumen,
        totalVentasKits: (gruposResumen.Kits?.total || 0) + (gruposResumen.Cirios?.total || 0),
        totalUnidadesKits: (gruposResumen.Kits?.unidades || 0) + (gruposResumen.Cirios?.unidades || 0),
    };
};

/**
 * Función comparativa cara a cara entre dos años seleccionados
 */
export const compararDosAnios = (statsA, statsB, anioA, anioB) => {
    const calcVar = (valA, valB) => {
        const dif = valA - valB;
        const pct = valB > 0 ? (dif / valB) * 100 : 0;
        return { valA, valB, dif, pct };
    };

    return {
        anioA,
        anioB,
        ventas: calcVar(statsA.totalVentas, statsB.totalVentas),
        gastos: calcVar(statsA.totalGastos, statsB.totalGastos),
        utilidad: calcVar(statsA.utilidadOperativa, statsB.utilidadOperativa),
        margen: {
            valA: statsA.margenOperativoPorcentaje,
            valB: statsB.margenOperativoPorcentaje,
            dif: statsA.margenOperativoPorcentaje - statsB.margenOperativoPorcentaje
        },
        prendas: calcVar(statsA.totalPrendas, statsB.totalPrendas),
        pedidos: calcVar(statsA.totalPedidos, statsB.totalPedidos),
        ticket: calcVar(statsA.ticketPromedio, statsB.ticketPromedio)
    };
};

export const ANIO_INICIO_HISTORICO = 2017;

/**
 * Genera la lista continua de años desde 2017 hasta el año en curso (o el más reciente registrado).
 * A medida que avance el tiempo (ej. 2026, 2027, etc.), se incorporará automáticamente sin intervención.
 */
export const obtenerAniosDisponibles = (oldOrders = [], pedidos = []) => {
    const currentYear = new Date().getFullYear();
    let maxYear = Math.max(currentYear, 2025);

    oldOrders.forEach(ord => {
        const fecha = parsearFechaSegura(ord.FECHA || ord.fecha);
        if (fecha && fecha.getFullYear() > maxYear) {
            maxYear = fecha.getFullYear();
        }
    });

    pedidos.forEach(ped => {
        const fecha = parsearFechaSegura(ped.fechaCreacion || ped.createdAt);
        if (fecha && fecha.getFullYear() > maxYear) {
            maxYear = fecha.getFullYear();
        }
    });

    // Secuencia continua desde maxYear descendiendo hasta 2017
    const anios = [];
    for (let y = maxYear; y >= ANIO_INICIO_HISTORICO; y--) {
        anios.push(y);
    }

    return anios;
};

// ============================================================================
// DIVISIÓN DE CUENTAS POR USUARIO / SOCIO (LEONARDO, OSCAR & REGLA KAROL)
// ============================================================================

export const UID_OSCAR = '679fce0ee8d1ed66d21d18c2';
export const UID_LEONARDO = '6789ce1b48932f890985d1f7';
export const UID_KAROL = '68cc3a0265f2a9ce640ba630';

export const esUsuarioLeo = (user) => {
    if (!user) return false;
    const id = (user._id || user.uid || user.id || user)?.toString?.() || '';
    const name = (user.name || user.nombre || '').toLowerCase();
    return id === UID_LEONARDO || name.includes('leonardo');
};

export const esUsuarioOscar = (user) => {
    if (!user) return false;
    const id = (user._id || user.uid || user.id || user)?.toString?.() || '';
    const name = (user.name || user.nombre || '').toLowerCase();
    return id === UID_OSCAR || name.includes('oscar');
};

export const esUsuarioKarol = (user) => {
    if (!user) return false;
    const id = (user._id || user.uid || user.id || user)?.toString?.() || '';
    const name = (user.name || user.nombre || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return id === UID_KAROL || name.includes('karol') || email.includes('karol');
};

/**
 * Identifica si un cliente corresponde a Brand Design SAS
 */
export const esClienteBrandDesign = (cliente = '', nit = '') => {
    const c = String(cliente || '').toUpperCase();
    const n = String(nit || '');
    return c.includes('BRAND DESIGN') || n.includes('900879470');
};

/**
 * Determina si un pedido pertenece a Leonardo Gómez.
 * Regla de negocio:
 * - Para pedidos de 2024 hacia atrás (históricos): SÓLO los pedidos de BRAND DESIGN SAS son de Leonardo.
 * - Para pedidos modernos (2025 en adelante): los asignados al usuario Leonardo.
 */
export const esOrdenDeLeonardo = (order) => {
    if (!order) return false;
    if (order.esBrandDesign) return true;
    const userObj = order.user || order.raw?.user;
    if (esUsuarioLeo(userObj)) return true;
    const cliente = order.cliente || order.CLIENTE || order.raw?.CLIENTE || '';
    const nit = order.nit || order.NIT || order.raw?.NIT || '';
    if (esClienteBrandDesign(cliente, nit)) return true;
    return false;
};

/**
 * Determina si un pedido pertenece a Oscar Gómez.
 * Regla de negocio:
 * - Para pedidos de 2024 hacia atrás (históricos): TODAS las ventas diferentes a BRAND DESIGN SAS son de Oscar.
 * - Para pedidos modernos (2025 en adelante): los asignados al usuario Oscar.
 */
export const esOrdenDeOscar = (order) => {
    if (!order) return false;
    if (esOrdenDeLeonardo(order)) return false;
    const userObj = order.user || order.raw?.user;
    if (esUsuarioOscar(userObj)) return true;
    if (order.origen === 'HISTORICO' || (order.anio && order.anio <= 2024)) return true;
    return false;
};

export const esCategoriaKits = (catId = '', codigo = '') => {
    const c = String(catId || '').toUpperCase().trim();
    const cod = String(codigo || '').toUpperCase().trim();
    return ['KCG', 'KCP', 'KCE', 'KB', 'CC', 'CB', 'CCON', 'K'].includes(c) ||
        ['KCG', 'KCP', 'KCE', 'KB', 'CC', 'CB', 'CCON', 'KGCA', 'KGCO', 'KPCA', 'KPCO', 'KBNA', 'KBNO', 'CCNA', 'CCNO', 'CBNA', 'CBNO', 'CCONA', 'CCONO'].includes(cod);
};

export const esCategoriaGuantes = (catId = '', codigo = '', prodName = '') => {
    const c = String(catId || '').toUpperCase().trim();
    const cod = String(codigo || '').toUpperCase().trim();
    const p = String(prodName || '').toLowerCase();
    return c === 'GUANTES' || c === 'G' || c.startsWith('G_') || cod.includes('GUANTE') || cod.startsWith('G_') || p.includes('guante');
};

export const esOtrDeGuantes = (item = {}) => {
    const p = String(item.producto || item.nombre || item.nombreItem || '').toLowerCase();
    const c = String(item.categoriaId || item.categoria || item.codigo || '').toLowerCase();
    const raw = String(item.categoriaNegocio || '').toLowerCase();
    return raw === 'guantes' || c.includes('guante') || p.includes('guante') || p.includes('miton') || p.includes('mitón');
};

export const esOtrDeKit = (item = {}) => {
    const raw = String(item.categoriaNegocio || item.categoria || '').toLowerCase();
    if (raw === 'kits' || raw === 'kit') return true;
    if (esOtrDeGuantes(item)) return false;
    // En GogoApp todos los accesorios OTR (libros, cintas, velas, biblias, cirios, denarios) complementan kits
    return true;
};

export const esItemKit = (it = {}) => {
    const c = String(it.categoriaId || '').toUpperCase().trim();
    const cod = String(it.codigo || '').toUpperCase().trim();
    const mat = String(it.idMatriz || '').toUpperCase().trim();
    if (c === 'OTR' || c === 'OTROS' || cod.startsWith('OTR') || mat.startsWith('OTR')) {
        return false;
    }
    return esCategoriaKits(it.categoriaId, it.codigo) ||
        ['KCG', 'KCP', 'KCE', 'KB', 'CC', 'CB', 'CCON', 'K'].includes(c) ||
        String(it.producto || '').toLowerCase().includes('cirio') ||
        String(it.producto || '').toLowerCase().includes('kit');
};

export const esItemGuante = (it = {}) => {
    return esCategoriaGuantes(it.categoriaId, it.codigo, it.producto);
};

export const esItemOtro = (it = {}) => {
    const c = String(it.categoriaId || '').toUpperCase().trim();
    const cod = String(it.codigo || '').toUpperCase().trim();
    const mat = String(it.idMatriz || '').toUpperCase().trim();
    if (c === 'OTR' || c === 'OTROS' || cod.startsWith('OTR') || mat.startsWith('OTR')) {
        return true;
    }
    return !esItemKit(it) && !esItemGuante(it);
};

export const esGastoCategoriaKits = (categoria = '') => {
    const c = String(categoria || '').toUpperCase().trim();
    return c === 'K' || c === 'KITS' || c === 'KIT';
};

export const esGastoCategoriaGuantes = (categoria = '') => {
    const c = String(categoria || '').toUpperCase().trim();
    return c === 'G' || c === 'GUANTES' || c === 'GUANTE';
};

export const esGastoCategoriaOtros = (categoria = '') => {
    return !esGastoCategoriaKits(categoria) && !esGastoCategoriaGuantes(categoria);
};

/**
 * Filtra y particiona pedidos y gastos según la vista seleccionada ('GENERAL', 'LEONARDO', 'OSCAR', 'KAROL')
 * y la categoría elegida ('TODOS', 'KITS', 'GUANTES', 'OTROS').
 * 
 * Reglas de negocio:
 * 1. 'GENERAL' (Estándar): 100% de la facturación y egresos del negocio. Las ventas de Karol se computan una sola vez.
 * 2. 'GENERAL' (Para Leonardo): Filtrado exclusivamente a:
 *    - Todos los Kits de la empresa (vendidos por Leo, Oscar, Karol o en histórico).
 *    - Guantes vendidos por Leonardo (excluye guantes vendidos por Oscar o Karol).
 *    - Venta de Otros con categoría Kits (accesorios de kits).
 *    - Gastos de Kits globales + Guantes de Leo + Operativos/Kits de Leo.
 * 3. 'LEONARDO': Ventas propias de Leonardo + Ítems de KITS vendidos por Karol Gómez (Karol actúa como su cliente).
 *                Gastos de Leonardo en categoría KITS ('K').
 * 4. 'OSCAR': Ventas propias de Oscar + Ítems de GUANTES vendidos por Karol Gómez (los guantes que venda son de Oscar).
 *             Gastos operativos de Oscar (Kits, Guantes, Otros).
 * 5. 'filtroCategoria': Permite ver únicamente Kits, únicamente Guantes o únicamente Otros en cualquier vista.
 */
export const filtrarPedidosYGastosPorUsuario = (
    pedidos = [],
    gastosInput = {},
    filtroUsuario = 'GENERAL',
    esLeonardo = false,
    filtroCategoria = 'TODOS'
) => {
    // Extrae array seguro de gastos crudos sin importar si se pasó el array o el objeto de obtenerGastosPorAnio
    const listaGastosRaw = Array.isArray(gastosInput)
        ? gastosInput
        : (Array.isArray(gastosInput?.lista) ? gastosInput.lista : []);

    let candidateOrders = [];
    let candidateExpenses = [];
    let descripcionFiltro = '';

    if (filtroUsuario === 'GENERAL') {
        if (esLeonardo) {
            // Consolidado General específico para Leonardo:
            // 1. Todos los Kits de la empresa.
            // 2. Guantes únicamente los vendidos por Leonardo (o Brand Design en histórico).
            // 3. Otros con categoría Kits (accesorios de kits).
            pedidos.forEach(order => {
                const esLeo = esOrdenDeLeonardo(order);

                const matchingItems = (order.items || []).filter(it => {
                    if (esItemKit(it)) return true;
                    if (esItemGuante(it)) return esLeo;
                    if (esItemOtro(it)) return esOtrDeKit(it);
                    return false;
                });

                if (matchingItems.length > 0) {
                    const cant = matchingItems.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
                    const tot = matchingItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
                    candidateOrders.push({
                        ...order,
                        items: matchingItems,
                        total: tot,
                        cantidadPrendas: cant,
                        itemsCount: matchingItems.length
                    });
                }
            });

            // Gastos para Leonardo en General: Kits de todos + Guantes de Leo + Gastos operativos de Leo
            candidateExpenses = listaGastosRaw.filter(g => {
                const esLeo = esUsuarioLeo(g.user);
                if (esGastoCategoriaKits(g.categoria)) return true;
                if (esGastoCategoriaGuantes(g.categoria)) return esLeo;
                return esLeo || String(g.categoriaNegocio || g.categoria || '').toLowerCase().includes('kit');
            });

            descripcionFiltro = 'Consolidado General (Kits globales, Guantes de Leonardo y Otros de Kits)';
        } else {
            // General Estándar (100% de la empresa)
            candidateOrders = [...pedidos];
            candidateExpenses = [...listaGastosRaw];
            descripcionFiltro = 'Consolidado General (Todo el Negocio)';
        }
    } else if (filtroUsuario === 'KAROL') {
        candidateOrders = pedidos.filter(order => {
            const userObj = order.user || order.raw?.user;
            return esUsuarioKarol(userObj);
        });
        candidateExpenses = listaGastosRaw.filter(g => esUsuarioKarol(g.user));
        descripcionFiltro = 'Karol Gómez (Exclusivamente sus ventas y estadísticas)';
    } else if (filtroUsuario === 'LEONARDO') {
        pedidos.forEach(order => {
            const userObj = order.user || order.raw?.user;
            const esLeo = esOrdenDeLeonardo(order);
            const esKarol = esUsuarioKarol(userObj);

            if (esLeo) {
                candidateOrders.push(order);
            } else if (esKarol) {
                // Karol: Solo los productos de Kits se atribuyen a Leonardo
                const kitItems = (order.items || []).filter(it => esCategoriaKits(it.categoriaId, it.codigo));
                if (kitItems.length > 0) {
                    const cant = kitItems.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
                    const tot = kitItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

                    candidateOrders.push({
                        ...order,
                        id: `${order.id}_karol_kits`,
                        total: tot,
                        cantidadPrendas: cant,
                        itemsCount: kitItems.length,
                        items: kitItems,
                        cliente: `${order.cliente} [Kits Karol]`,
                        atribuidoKarol: true,
                        tipoAtribucion: 'Kits (Cliente de Leonardo)'
                    });
                }

                // Karol: Guantes visibles para Leonardo (separados con etiqueta)
                const gloveItems = (order.items || []).filter(it => esCategoriaGuantes(it.categoriaId, it.codigo, it.producto));
                if (gloveItems.length > 0) {
                    const cant = gloveItems.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
                    const tot = gloveItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

                    candidateOrders.push({
                        ...order,
                        id: `${order.id}_karol_guantes_leo`,
                        total: tot,
                        cantidadPrendas: cant,
                        itemsCount: gloveItems.length,
                        items: gloveItems,
                        cliente: `${order.cliente} [Guantes Karol]`,
                        atribuidoKarol: true,
                        tipoAtribucion: 'Guantes (Karol Gómez)'
                    });
                }
            }
        });

        // Filtrar gastos para Leonardo (propios de Leo + Kits de Karol)
        candidateExpenses = listaGastosRaw.filter(g => {
            const esLeo = esUsuarioLeo(g.user);
            const esKarol = esUsuarioKarol(g.user);
            return esLeo || (esKarol && g.categoria === 'K');
        });
        descripcionFiltro = 'Leonardo Gómez (Incluye Brand Design SAS y Kits de Karol)';
    } else if (filtroUsuario === 'OSCAR') {
        pedidos.forEach(order => {
            const userObj = order.user || order.raw?.user;
            const esOscar = esOrdenDeOscar(order);
            const esKarol = esUsuarioKarol(userObj);

            if (esOscar) {
                candidateOrders.push(order);
            } else if (esKarol) {
                // Karol: Solo los productos de Guantes se atribuyen a Oscar
                const gloveItems = (order.items || []).filter(it => esCategoriaGuantes(it.categoriaId, it.codigo, it.producto));
                if (gloveItems.length > 0) {
                    const cant = gloveItems.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
                    const tot = gloveItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);

                    candidateOrders.push({
                        ...order,
                        id: `${order.id}_karol_guantes`,
                        total: tot,
                        cantidadPrendas: cant,
                        itemsCount: gloveItems.length,
                        items: gloveItems,
                        cliente: `${order.cliente} [Guantes Karol]`,
                        atribuidoKarol: true,
                        tipoAtribucion: 'Guantes (Karol para Oscar)'
                    });
                }
            }
        });

        // Filtrar gastos para Oscar (propios de Oscar + Guantes de Karol)
        candidateExpenses = listaGastosRaw.filter(g => {
            const esOscar = esUsuarioOscar(g.user);
            const esKarol = esUsuarioKarol(g.user);
            return esOscar || (esKarol && g.categoria === 'G');
        });
        descripcionFiltro = 'Oscar Gómez (Incluye Clientes generales históricos y Guantes de Karol)';
    } else {
        candidateOrders = [...pedidos];
        candidateExpenses = [...listaGastosRaw];
        descripcionFiltro = 'General';
    }

    // 2. Filtro Secundario por Categoría de Producto ('TODOS', 'KITS', 'GUANTES', 'OTROS')
    let finalOrders = [];
    let finalExpenses = [];

    if (filtroCategoria === 'KITS') {
        candidateOrders.forEach(order => {
            const matchingItems = (order.items || []).filter(it => esItemKit(it));
            if (matchingItems.length > 0) {
                const cant = matchingItems.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
                const tot = matchingItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
                finalOrders.push({
                    ...order,
                    items: matchingItems,
                    total: tot,
                    cantidadPrendas: cant,
                    itemsCount: matchingItems.length
                });
            }
        });
        finalExpenses = candidateExpenses.filter(g => esGastoCategoriaKits(g.categoria));
        descripcionFiltro += ' — Solo Kits';
    } else if (filtroCategoria === 'GUANTES') {
        candidateOrders.forEach(order => {
            const matchingItems = (order.items || []).filter(it => esItemGuante(it));
            if (matchingItems.length > 0) {
                const cant = matchingItems.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
                const tot = matchingItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
                finalOrders.push({
                    ...order,
                    items: matchingItems,
                    total: tot,
                    cantidadPrendas: cant,
                    itemsCount: matchingItems.length
                });
            }
        });
        finalExpenses = candidateExpenses.filter(g => esGastoCategoriaGuantes(g.categoria));
        descripcionFiltro += ' — Solo Guantes';
    } else if (filtroCategoria === 'OTROS') {
        candidateOrders.forEach(order => {
            const matchingItems = (order.items || []).filter(it => esItemOtro(it));
            if (matchingItems.length > 0) {
                const cant = matchingItems.reduce((acc, curr) => acc + (Number(curr.cantidad) || 0), 0);
                const tot = matchingItems.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0);
                finalOrders.push({
                    ...order,
                    items: matchingItems,
                    total: tot,
                    cantidadPrendas: cant,
                    itemsCount: matchingItems.length
                });
            }
        });
        finalExpenses = candidateExpenses.filter(g => esGastoCategoriaOtros(g.categoria));
        descripcionFiltro += ' — Solo Otros';
    } else {
        // 'TODOS'
        finalOrders = candidateOrders;
        finalExpenses = candidateExpenses;
    }

    // Calcular estructura de gastos mensual y desglose de categorías
    const mensual = Array(12).fill(0);
    let totalGastos = 0;
    const desgloseCategorias = {};

    finalExpenses.forEach(g => {
        const subtotal = Number(g.precio || 0) * Number(g.cantidad || 1);
        totalGastos += subtotal;
        const f = parsearFechaSegura(g.fecha || g.createdAt);
        if (f && f.getMonth() >= 0 && f.getMonth() <= 11) {
            mensual[f.getMonth()] += subtotal;
        }
        const cat = g.categoria || 'GENERAL';
        desgloseCategorias[cat] = (desgloseCategorias[cat] || 0) + subtotal;
    });

    return {
        pedidosFiltrados: finalOrders,
        gastosFiltrados: { total: totalGastos, mensual, desgloseCategorias, lista: finalExpenses },
        descripcionFiltro
    };
};

/**
 * Realiza la división integral de cuentas entre los socios para un conjunto de pedidos y gastos.
 */
export const calcularDivisionSocios = (pedidos = [], gastos = []) => {
    const { pedidosFiltrados: pedidosLeo, gastosFiltrados: gastosLeo } = filtrarPedidosYGastosPorUsuario(pedidos, gastos, 'LEONARDO');
    const { pedidosFiltrados: pedidosOscar, gastosFiltrados: gastosOscar } = filtrarPedidosYGastosPorUsuario(pedidos, gastos, 'OSCAR');

    const statsLeo = calcularEstadisticasAnio(pedidosLeo, gastosLeo);
    const statsOscar = calcularEstadisticasAnio(pedidosOscar, gastosOscar);
    const statsGeneral = calcularEstadisticasAnio(pedidos, gastos);

    let karolKitsVenta = 0;
    let karolKitsPrendas = 0;
    let karolGuantesVenta = 0;
    let karolGuantesDocenas = 0;

    pedidos.forEach(order => {
        const userObj = order.user || order.raw?.user;
        if (esUsuarioKarol(userObj)) {
            (order.items || []).forEach(it => {
                if (esCategoriaKits(it.categoriaId, it.codigo)) {
                    karolKitsVenta += Number(it.total) || 0;
                    karolKitsPrendas += Number(it.cantidad) || 0;
                } else if (esCategoriaGuantes(it.categoriaId, it.codigo, it.producto)) {
                    karolGuantesVenta += Number(it.total) || 0;
                    karolGuantesDocenas += Number(it.cantidad) || 0;
                }
            });
        }
    });

    // Desglose de Gastos por Categoría ('K' para Kits, 'G' para Guantes, Otros)
    const listaGastosRaw = Array.isArray(gastos) ? gastos : (gastos?.lista || []);
    let gastosKits = 0;
    let gastosGuantes = 0;
    let gastosOtros = 0;
    let karolKitsGastos = 0;
    let karolGuantesGastos = 0;

    listaGastosRaw.forEach(g => {
        const subtotal = Number(g.precio || 0) * Number(g.cantidad || 1);
        if (g.categoria === 'K') {
            gastosKits += subtotal;
            if (esUsuarioKarol(g.user)) karolKitsGastos += subtotal;
        } else if (g.categoria === 'G') {
            gastosGuantes += subtotal;
            if (esUsuarioKarol(g.user)) karolGuantesGastos += subtotal;
        } else {
            gastosOtros += subtotal;
        }
    });

    const totalVentasSocios = statsLeo.totalVentas + statsOscar.totalVentas;
    const shareLeo = totalVentasSocios > 0 ? Math.round((statsLeo.totalVentas / totalVentasSocios) * 100) : 0;
    const shareOscar = totalVentasSocios > 0 ? Math.round((statsOscar.totalVentas / totalVentasSocios) * 100) : 0;

    // Totales por Línea de Negocio / Categoría (Negocio Kits vs Negocio Guantes vs Consolidado)
    // Kits y Cirios hacen parte unificada de la misma categoría KITS
    const ventasKitsTotal = (statsGeneral.gruposResumen.Kits?.total || 0) + (statsGeneral.gruposResumen.Cirios?.total || 0);
    const unidadesKitsTotal = (statsGeneral.gruposResumen.Kits?.unidades || 0) + (statsGeneral.gruposResumen.Cirios?.unidades || 0);

    const utilidadKits = ventasKitsTotal - gastosKits;
    const margenKits = ventasKitsTotal > 0 ? (utilidadKits / ventasKitsTotal) * 100 : 0;

    const ventasGuantesTotal = statsGeneral.gruposResumen.Guantes?.total || 0;
    const unidadesGuantesTotal = statsGeneral.gruposResumen.Guantes?.unidades || 0;
    const utilidadGuantes = ventasGuantesTotal - gastosGuantes;
    const margenGuantes = ventasGuantesTotal > 0 ? (utilidadGuantes / ventasGuantesTotal) * 100 : 0;

    const ventasOtrosTotal = statsGeneral.gruposResumen.Otros?.total || 0;
    const unidadesOtrosTotal = statsGeneral.gruposResumen.Otros?.unidades || 0;
    const utilidadOtros = ventasOtrosTotal - gastosOtros;
    const margenOtros = ventasOtrosTotal > 0 ? (utilidadOtros / ventasOtrosTotal) * 100 : 0;

    const totalVentasGeneral = statsGeneral.totalVentas || 0;
    const totalGastosGeneral = statsGeneral.totalGastos || 0;
    const utilidadGeneral = statsGeneral.utilidadOperativa || 0;
    const margenGeneral = statsGeneral.margenOperativoPorcentaje || 0;
    const totalProductosGeneral = statsGeneral.totalPrendas || 0;

    const negociosPorCategoria = {
        kits: {
            id: 'KITS',
            nombre: 'Negocio Kits',
            socioPrincipal: 'Leonardo Gómez',
            ventas: ventasKitsTotal,
            gastos: gastosKits,
            utilidad: utilidadKits,
            margen: margenKits,
            unidades: unidadesKitsTotal,
            unidadMedida: 'productos (uds)',
            participacion: totalVentasGeneral > 0 ? (ventasKitsTotal / totalVentasGeneral) * 100 : 0
        },
        guantes: {
            id: 'GUANTES',
            nombre: 'Negocio Guantes',
            socioPrincipal: 'Oscar Gómez',
            ventas: ventasGuantesTotal,
            gastos: gastosGuantes,
            utilidad: utilidadGuantes,
            margen: margenGuantes,
            unidades: unidadesGuantesTotal,
            unidadMedida: 'docenas (doc.)',
            participacion: totalVentasGeneral > 0 ? (ventasGuantesTotal / totalVentasGeneral) * 100 : 0
        },
        otros: {
            id: 'OTROS',
            nombre: 'Otros / Accesorios',
            socioPrincipal: 'General',
            ventas: ventasOtrosTotal,
            gastos: gastosOtros,
            utilidad: utilidadOtros,
            margen: margenOtros,
            unidades: unidadesOtrosTotal,
            unidadMedida: 'unidades (uds)',
            participacion: totalVentasGeneral > 0 ? (ventasOtrosTotal / totalVentasGeneral) * 100 : 0
        },
        consolidado: {
            id: 'CONSOLIDADO',
            nombre: 'Consolidado General',
            socioPrincipal: 'Ambos Socios',
            ventas: totalVentasGeneral,
            gastos: totalGastosGeneral,
            utilidad: utilidadGeneral,
            margen: margenGeneral,
            unidades: totalProductosGeneral,
            unidadMedida: 'múltiples unidades',
            participacion: 100
        }
    };

    // Cálculos específicos para Leonardo: Kits vs Guantes
    const leoVentasKits = (statsLeo.gruposResumen.Kits?.total || 0) + (statsLeo.gruposResumen.Cirios?.total || 0);
    const leoUnidadesKits = (statsLeo.gruposResumen.Kits?.unidades || 0) + (statsLeo.gruposResumen.Cirios?.unidades || 0);
    const leoGastosKits = gastosLeo.desgloseCategorias?.['K'] || 0;
    const leoUtilidadKits = leoVentasKits - leoGastosKits;
    const leoMargenKits = leoVentasKits > 0 ? (leoUtilidadKits / leoVentasKits) * 100 : 0;

    const leoVentasGuantes = statsLeo.gruposResumen.Guantes?.total || 0;
    const leoUnidadesGuantes = statsLeo.gruposResumen.Guantes?.unidades || 0;
    const leoGastosGuantes = gastosLeo.desgloseCategorias?.['G'] || 0;
    const leoUtilidadGuantes = leoVentasGuantes - leoGastosGuantes;
    const leoMargenGuantes = leoVentasGuantes > 0 ? (leoUtilidadGuantes / leoVentasGuantes) * 100 : 0;

    // Cálculos específicos para Oscar: Kits vs Guantes
    const oscarVentasKits = (statsOscar.gruposResumen.Kits?.total || 0) + (statsOscar.gruposResumen.Cirios?.total || 0);
    const oscarUnidadesKits = (statsOscar.gruposResumen.Kits?.unidades || 0) + (statsOscar.gruposResumen.Cirios?.unidades || 0);
    const oscarGastosKits = gastosOscar.desgloseCategorias?.['K'] || 0;
    const oscarUtilidadKits = oscarVentasKits - oscarGastosKits;
    const oscarMargenKits = oscarVentasKits > 0 ? (oscarUtilidadKits / oscarVentasKits) * 100 : 0;

    const oscarVentasGuantes = statsOscar.gruposResumen.Guantes?.total || 0;
    const oscarUnidadesGuantes = statsOscar.gruposResumen.Guantes?.unidades || 0;
    const oscarGastosGuantes = gastosOscar.desgloseCategorias?.['G'] || 0;
    const oscarUtilidadGuantes = oscarVentasGuantes - oscarGastosGuantes;
    const oscarMargenGuantes = oscarVentasGuantes > 0 ? (oscarUtilidadGuantes / oscarVentasGuantes) * 100 : 0;

    // Colección y Desglose Integral de la Categoría OTR (Otros / Accesorios)
    const otrKitsItems = [];
    const otrTodosItems = [];
    const otrPorUsuarioMap = {};

    pedidos.forEach(order => {
        const userObj = order.user || order.raw?.user;
        let vendedorNombre = 'Desconocido';
        let vendedorId = '';
        let rolVendedor = 'Asesor';

        if (esUsuarioOscar(userObj)) {
            vendedorNombre = 'Oscar Gómez';
            vendedorId = UID_OSCAR;
            rolVendedor = 'Socio / Admin';
        } else if (esUsuarioLeo(userObj)) {
            vendedorNombre = 'Leonardo Gómez';
            vendedorId = UID_LEONARDO;
            rolVendedor = 'Socio / SuperAdmin';
        } else if (esUsuarioKarol(userObj)) {
            vendedorNombre = 'Karol Gómez';
            vendedorId = UID_KAROL;
            rolVendedor = 'Vendedora';
        } else {
            vendedorNombre = order.userName || userObj?.name || 'Otro Asesor';
            vendedorId = (userObj?._id || userObj?.uid || userObj)?.toString() || 'otro';
        }

        if (!otrPorUsuarioMap[vendedorId]) {
            otrPorUsuarioMap[vendedorId] = {
                usuarioId: vendedorId,
                nombre: vendedorNombre,
                rol: rolVendedor,
                totalVentas: 0,
                totalUnidades: 0,
                items: [],
                productosResumen: {}
            };
        }

        (order.items || []).forEach(it => {
            const esOtr = it.categoriaId === 'OTR' || it.codigo === 'OTR' || it.codigo === 'OTROS';
            if (!esOtr) return;

            const esDeKit = esOtrDeKit(it);

            const itemDetalle = {
                id: it.id,
                producto: it.producto,
                cantidad: Number(it.cantidad) || 0,
                precio: Number(it.precio) || 0,
                total: Number(it.total) || 0,
                categoriaNegocio: esDeKit ? 'Kits' : 'Guantes',
                vendedor: vendedorNombre,
                vendedorId,
                cliente: order.cliente || 'Sin Cliente',
                remision: order.remision || 'S/R',
                fecha: order.fechaStr || ''
            };

            // Todos los OTR (para la vista de Oscar)
            otrTodosItems.push(itemDetalle);
            otrPorUsuarioMap[vendedorId].totalVentas += itemDetalle.total;
            otrPorUsuarioMap[vendedorId].totalUnidades += itemDetalle.cantidad;
            otrPorUsuarioMap[vendedorId].items.push(itemDetalle);

            const prodKey = itemDetalle.producto.trim();
            if (!otrPorUsuarioMap[vendedorId].productosResumen[prodKey]) {
                otrPorUsuarioMap[vendedorId].productosResumen[prodKey] = {
                    producto: prodKey,
                    cantidad: 0,
                    total: 0,
                    categoriaNegocio: esDeKit ? 'Kits' : 'Guantes'
                };
            }
            otrPorUsuarioMap[vendedorId].productosResumen[prodKey].cantidad += itemDetalle.cantidad;
            otrPorUsuarioMap[vendedorId].productosResumen[prodKey].total += itemDetalle.total;

            // OTR pertenecientes a la línea Kits (para la vista de Leonardo)
            if (esDeKit) {
                otrKitsItems.push(itemDetalle);
            }
        });
    });

    // Consolidado OTR Kits (Todos los usuarios) para Leonardo
    const totalVentasOtrKits = otrKitsItems.reduce((acc, curr) => acc + curr.total, 0);
    const totalUnidadesOtrKits = otrKitsItems.reduce((acc, curr) => acc + curr.cantidad, 0);
    const productosOtrKitsMap = {};
    otrKitsItems.forEach(it => {
        const k = it.producto.trim();
        if (!productosOtrKitsMap[k]) {
            productosOtrKitsMap[k] = {
                producto: k,
                cantidad: 0,
                total: 0,
                vendedores: new Set()
            };
        }
        productosOtrKitsMap[k].cantidad += it.cantidad;
        productosOtrKitsMap[k].total += it.total;
        productosOtrKitsMap[k].vendedores.add(it.vendedor);
    });

    const productosOtrKitsList = Object.values(productosOtrKitsMap)
        .map(p => ({ ...p, vendedores: Array.from(p.vendedores) }))
        .sort((a, b) => b.total - a.total);

    const otrKitsTodos = {
        totalVentas: totalVentasOtrKits,
        totalUnidades: totalUnidadesOtrKits,
        items: otrKitsItems,
        productos: productosOtrKitsList,
        totalItemsCount: otrKitsItems.length
    };

    // Desglose OTR por Usuario para Oscar
    const totalVentasOtrGlobal = otrTodosItems.reduce((acc, curr) => acc + curr.total, 0);
    const totalUnidadesOtrGlobal = otrTodosItems.reduce((acc, curr) => acc + curr.cantidad, 0);
    const usuariosOtrList = Object.values(otrPorUsuarioMap)
        .filter(u => u.totalUnidades > 0 || u.totalVentas > 0 || u.items.length > 0)
        .map(u => ({
            ...u,
            productos: Object.values(u.productosResumen).sort((a, b) => b.total - a.total)
        }))
        .sort((a, b) => b.totalVentas - a.totalVentas);

    const otrPorUsuario = {
        totalVentasGlobal: totalVentasOtrGlobal,
        totalUnidadesGlobal: totalUnidadesOtrGlobal,
        usuarios: usuariosOtrList,
        totalUsuarios: usuariosOtrList.length,
        items: otrTodosItems
    };

    // Oscar visto por Leonardo: Estrictamente datos de KITS (excluye Guantes)
    const pedidosOscarKitsCount = pedidosOscar.filter(order =>
        (order.items || []).some(it => esCategoriaKits(it.categoriaId, it.codigo) || (it.categoriaId === 'OTR' && esOtrDeKit(it)))
    ).length;

    const totalVentasKitsAmbos = leoVentasKits + oscarVentasKits;
    const shareOscarKits = totalVentasKitsAmbos > 0 ? Math.round((oscarVentasKits / totalVentasKitsAmbos) * 100) : 0;

    const oscarParaLeonardo = {
        totalVentas: oscarVentasKits,
        totalGastos: oscarGastosKits,
        utilidadOperativa: oscarUtilidadKits,
        margenOperativoPorcentaje: oscarMargenKits,
        pedidosCount: pedidosOscarKitsCount,
        share: shareOscarKits,
        shareKits: shareOscarKits,
        kits: {
            ventas: oscarVentasKits,
            unidades: oscarUnidadesKits,
            gastos: oscarGastosKits,
            utilidad: oscarUtilidadKits,
            margen: oscarMargenKits
        }
    };

    return {
        general: statsGeneral,
        negociosPorCategoria,
        leonardo: {
            ...statsLeo,
            pedidosCount: pedidosLeo.length,
            karolKitsVenta,
            karolKitsPrendas,
            karolKitsGastos,
            share: shareLeo,
            kits: {
                ventas: leoVentasKits,
                unidades: leoUnidadesKits,
                gastos: leoGastosKits,
                utilidad: leoUtilidadKits,
                margen: leoMargenKits
            },
            guantes: {
                ventas: leoVentasGuantes,
                unidades: leoUnidadesGuantes,
                gastos: leoGastosGuantes,
                utilidad: leoUtilidadGuantes,
                margen: leoMargenGuantes
            },
            gastosKits: leoGastosKits,
            gastosGuantes: leoGastosGuantes,
            utilidadKits: leoUtilidadKits,
            margenKits: leoMargenKits
        },
        oscar: {
            ...statsOscar,
            pedidosCount: pedidosOscar.length,
            karolGuantesVenta,
            karolGuantesDocenas,
            karolGuantesGastos,
            share: shareOscar,
            kits: {
                ventas: oscarVentasKits,
                unidades: oscarUnidadesKits,
                gastos: oscarGastosKits,
                utilidad: oscarUtilidadKits,
                margen: oscarMargenKits
            },
            guantes: {
                ventas: oscarVentasGuantes,
                unidades: oscarUnidadesGuantes,
                gastos: oscarGastosGuantes,
                utilidad: oscarUtilidadGuantes,
                margen: oscarMargenGuantes
            },
            gastosKits: oscarGastosKits,
            gastosGuantes: oscarGastosGuantes,
            utilidadGuantes: oscarUtilidadGuantes,
            margenGuantes: oscarMargenGuantes
        },
        oscarParaLeonardo,
        otrKitsTodos,
        otrPorUsuario,
        atribucionKarol: {
            karolKitsVenta,
            karolKitsPrendas,
            karolKitsGastos,
            karolGuantesVenta,
            karolGuantesDocenas,
            karolGuantesGastos,
            totalKarol: karolKitsVenta + karolGuantesVenta
        }
    };
};

// ============================================================================
// HISTÓRICO MULTIANUAL DE VENTAS DE KITS (TODA LA CATEGORÍA)
// ============================================================================

export const SUB_CATEGORIAS_KITS_CONFIG = [
    { id: 'KB', nombre: 'Kit de Bautizo', shortName: 'Kit Bautizo', color: '#0ea5e9' },
    { id: 'KCG', nombre: 'Kit Comunión Grande', shortName: 'Kit Grande', color: '#f97316' },
    { id: 'KCP', nombre: 'Kit Comunión Pequeño', shortName: 'Kit Pequeño', color: '#eab308' },
    { id: 'KCE', nombre: 'Kit Comunión Económico', shortName: 'Kit Económico', color: '#a855f7' },
    { id: 'CB', nombre: 'Cirio de Bautizo', shortName: 'Cirio Bautizo', color: '#ec4899' },
    { id: 'CC', nombre: 'Cirio de Comunión', shortName: 'Cirio Comunión', color: '#14b8a6' },
    { id: 'CCON', nombre: 'Cirio de Confirmación', shortName: 'Cirio Confirmación', color: '#f97316' },
];

/**
 * Precios predeterminados de fábrica para kits y cirios (según configuración de precios de fábrica 2025/2026).
 * Dan como resultado exacto $209.324.360 en 2025 y $75.140.740 en 2026.
 */
export const PRECIOS_FABRICA_KITS_DEFAULT = {
    KCG: 20500,
    KCP: 14500,
    KB: 14500,
    KCE: 7400,
    CC: 9000,
    CCON: 9000,
    CB: 9000
};

/**
 * Dada una fecha de pedido y la lista de tarifas de fábrica (desde MongoDB precios_fabrica),
 * encuentra la tarifa que estaba vigente en esa fecha.
 * 
 * Regla de vigencia por fecha:
 * 1. Las tarifas se ordenan cronológicamente por su fechaVigencia ascendente.
 * 2. Un pedido toma la tarifa cuya fechaVigencia sea MENOR O IGUAL a la fecha del pedido.
 * 3. Si un pedido tiene una fecha anterior a una nueva tarifa registrada en el año,
 *    automáticamente toma la tarifa inmediatamente anterior (que puede ser del año anterior
 *    si no hay tarifas previas en ese mismo año).
 * 4. Si el pedido es anterior a cualquier tarifa registrada en el sistema (ej. antes de 2021),
 *    devuelve null (en cuyo caso se mantienen los precios históricos originales de la remisión).
 */
export const obtenerTarifaVigente = (fechaOrder, listaPrecios = []) => {
    if (!Array.isArray(listaPrecios) || listaPrecios.length === 0) return null;

    let fechaPedStr = '';
    if (fechaOrder instanceof Date && !isNaN(fechaOrder.getTime())) {
        const y = fechaOrder.getFullYear();
        const m = String(fechaOrder.getMonth() + 1).padStart(2, '0');
        const d = String(fechaOrder.getDate()).padStart(2, '0');
        fechaPedStr = `${y}-${m}-${d}`;
    } else if (typeof fechaOrder === 'string') {
        const parsed = parsearFechaSegura(fechaOrder);
        if (parsed) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2, '0');
            const d = String(parsed.getDate()).padStart(2, '0');
            fechaPedStr = `${y}-${m}-${d}`;
        } else {
            const match = fechaOrder.match(/\d{4}-\d{2}-\d{2}/);
            if (match) fechaPedStr = match[0];
        }
    } else if (typeof fechaOrder === 'number') {
        fechaPedStr = `${fechaOrder}-01-01`;
    }

    if (!fechaPedStr) return null;

    // Ordenar tarifas activas por fechaVigencia ascendente
    const tarifasValidas = listaPrecios
        .filter(t => t && t.activo !== false)
        .map(t => {
            let fStr = '';
            if (t.fechaVigencia) {
                if (typeof t.fechaVigencia === 'string') {
                    fStr = t.fechaVigencia.split('T')[0];
                } else if (t.fechaVigencia instanceof Date) {
                    const y = t.fechaVigencia.getFullYear();
                    const m = String(t.fechaVigencia.getMonth() + 1).padStart(2, '0');
                    const d = String(t.fechaVigencia.getDate()).padStart(2, '0');
                    fStr = `${y}-${m}-${d}`;
                }
            }
            if (!fStr && t.anio) {
                fStr = `${t.anio}-01-01`;
            }
            return {
                ...t,
                _fechaStr: fStr
            };
        })
        .filter(t => t._fechaStr)
        .sort((a, b) => a._fechaStr.localeCompare(b._fechaStr));

    // Buscar la última tarifa cuya fechaVigencia <= fechaPedStr
    let tarifaAplicable = null;
    for (let i = tarifasValidas.length - 1; i >= 0; i--) {
        if (tarifasValidas[i]._fechaStr <= fechaPedStr) {
            tarifaAplicable = tarifasValidas[i];
            break;
        }
    }

    return tarifaAplicable;
};

/**
 * Obtiene el precio unitario de fábrica para una subcategoría de kit según la tarifa vigente
 */
export const obtenerPrecioFabricaItem = (tipoKit, tarifaVigente) => {
    if (!tipoKit || !tarifaVigente) return 0;
    const pk = tarifaVigente.precioKits || {};
    const pc = tarifaVigente.precioCirios || {};

    if (tipoKit === 'KCG') return Number(pk.kcg || 0);
    if (tipoKit === 'KCP') return Number(pk.kcp || 0);
    if (tipoKit === 'KB') return Number(pk.kb || 0);
    if (tipoKit === 'KCE') return Number(pk.kce || 0);
    if (tipoKit === 'CC') return Number(pc.cc || 0);
    if (tipoKit === 'CCON') return Number(pc.ccon || pc.cc || pc.cb || 0);
    if (tipoKit === 'CB') return Number(pc.cb || 0);

    return 0;
};

/**
 * Obtiene el precio unitario de fábrica para una subcategoría de guantes según la tarifa vigente
 */
export const obtenerPrecioFabricaGuante = (item = {}, tarifaVigente = null) => {
    if (!tarifaVigente || !tarifaVigente.precioGuantes) return 0;
    const pg = tarifaVigente.precioGuantes;
    const subcat = obtenerSubcategoriaGuante(item.producto, item.subcategoria, item.codigo, item.categoriaId);
    if (subcat.id === 'G_NEGROS') return Number(pg.gn || 0);
    if (subcat.id === 'G_MITON') return Number(pg.gm || 0);
    return Number(pg.gb || 0);
};

export const obtenerPrecioFabricaKit = (tipoKit) => {
    return PRECIOS_FABRICA_KITS_DEFAULT[tipoKit] || 0;
};

/**
 * Clasifica cualquier ítem a su subcategoría correspondiente dentro de toda la categoría Kits.
 * Devuelve el id de la subcategoría ('KB', 'KCG', 'KCP', 'KCE', 'CB', 'CC') o null si no es de kit.
 */
export const clasificarItemKit = (item = {}) => {
    const c = String(item.categoriaId || '').toUpperCase().trim();
    const cod = String(item.codigo || '').toUpperCase().trim();
    const prod = String(item.producto || item.nombre || item.nombreItem || '').toLowerCase().trim();

    // Descartar guantes y accesorios 'OTR' explícitos
    if (esCategoriaGuantes(c, cod, prod) || c === 'OTR' || c === 'OTROS' || cod.startsWith('OTR')) {
        return null;
    }

    // 1. Kit Comunión Grande
    if (c === 'KCG' || cod === 'KGCA' || cod === 'KGCO' || cod.startsWith('KGC') || cod.startsWith('KCG') ||
        prod.includes('comunión grande') || prod.includes('comunion grande')) {
        return 'KCG';
    }

    // 2. Kit Comunión Pequeño
    if (c === 'KCP' || cod === 'KPCA' || cod === 'KPCO' || cod.startsWith('KPC') || cod.startsWith('KCP') ||
        prod.includes('comunión pequeño') || prod.includes('comunion pequeño') || prod.includes('comunion pequen')) {
        return 'KCP';
    }

    // 3. Kit Comunión Económico
    if (c === 'KCE' || cod.startsWith('KCE') || prod.includes('económico') || prod.includes('economico')) {
        return 'KCE';
    }

    // 4. Kit de Bautizo
    if (c === 'KB' || cod.startsWith('KB') || cod === 'KBNA' || cod === 'KBNO' || cod === 'KBA' || cod === 'KBO' ||
        (prod.includes('bautizo') && (prod.includes('kit') || cod.includes('KB')))) {
        return 'KB';
    }

    // 5. Cirio de Confirmación (evaluar antes de CC para evitar falso positivo con startsWith('CC'))
    if (c === 'CCON' || cod.startsWith('CCON') || cod === 'CCONA' || cod === 'CCONO' ||
        (prod.includes('cirio') && (prod.includes('confirmaci') || prod.includes('confirmación') || prod.includes('confirmacion')))) {
        return 'CCON';
    }

    // 5.1 Cirio de Comunión
    if (c === 'CC' || (cod.startsWith('CC') && !cod.startsWith('CCON')) || cod === 'CCNA' || cod === 'CCNO' || cod === 'CCA' || cod === 'CCO' ||
        (prod.includes('cirio') && (prod.includes('comuni') || prod.includes('comunión') || prod.includes('comunion')))) {
        return 'CC';
    }

    // 6. Cirio de Bautizo
    if (c === 'CB' || cod.startsWith('CB') || cod === 'CBNA' || cod === 'CBNO' || cod === 'CBA' || cod === 'CBO' ||
        (prod.includes('cirio') && prod.includes('bautiz'))) {
        return 'CB';
    }

    // 7. General Kits
    if (c === 'K' || cod === 'K') {
        if (prod.includes('bautiz')) return 'KB';
        if (prod.includes('peque')) return 'KCP';
        if (prod.includes('econ')) return 'KCE';
        return 'KCG';
    }

    return null;
};

/**
 * Obtiene la serie histórica de ventas y unidades de Kits por año para toda la categoría
 */
export const obtenerHistoricoKitsPorAnio = (
    oldOrders = [],
    pedidos = [],
    anios = [],
    filtrarPorEstadoPagado = null,
    filtroUsuario = 'GENERAL',
    listaPrecios = []
) => {
    // Orden cronológico ascendente (2017 a año en curso)
    const aniosOrdenados = [...anios].sort((a, b) => Number(a) - Number(b));

    const datosPorAnio = [];
    let granTotalVenta = 0;
    let granTotalUnidades = 0;
    let maxVenta = { anio: null, total: 0 };

    const acumuladoSubcategorias = {
        KB: { venta: 0, unidades: 0 },
        KCG: { venta: 0, unidades: 0 },
        KCP: { venta: 0, unidades: 0 },
        KCE: { venta: 0, unidades: 0 },
        CB: { venta: 0, unidades: 0 },
        CC: { venta: 0, unidades: 0 },
    };

    aniosOrdenados.forEach((yr, idx) => {
        let raw = obtenerPedidosPorAnio(oldOrders, pedidos, yr);
        if (typeof filtrarPorEstadoPagado === 'function') {
            raw = filtrarPorEstadoPagado(raw);
        }

        let peds = raw;
        if (filtroUsuario && filtroUsuario !== 'GENERAL') {
            peds = filtrarPedidosYGastosPorUsuario(raw, [], filtroUsuario).pedidosFiltrados;
        }

        const subcatVentas = { KB: 0, KCG: 0, KCP: 0, KCE: 0, CB: 0, CC: 0 };
        const subcatUnidades = { KB: 0, KCG: 0, KCP: 0, KCE: 0, CB: 0, CC: 0 };
        let totalVentaAnio = 0;
        let totalUnidadesAnio = 0;
        let pedidosConKitsCount = 0;

        const anioNum = Number(yr);
        const esModernoFabrica = (anioNum >= 2025);

        peds.forEach(order => {
            let tieneKit = false;
            const fechaOrder = order.fecha || order.fechaCreacion || order.fechaStr || (order.anio ? new Date(order.anio, order.mes ?? 0, 1) : null);
            const tarifaVigente = esModernoFabrica ? obtenerTarifaVigente(fechaOrder, listaPrecios) : null;

            (order.items || []).forEach(item => {
                const tipo = clasificarItemKit(item);
                if (!tipo) return;

                tieneKit = true;
                const cant = Number(item.cantidad || 0);

                let tot = 0;
                if (esModernoFabrica) {
                    const precioTarifa = obtenerPrecioFabricaItem(tipo, tarifaVigente);
                    if (precioTarifa > 0) {
                        tot = cant * precioTarifa;
                    } else if (PRECIOS_FABRICA_KITS_DEFAULT[tipo]) {
                        tot = cant * PRECIOS_FABRICA_KITS_DEFAULT[tipo];
                    } else {
                        tot = Number(item.total || (cant * Number(item.precio || item.precioUnitario || 0)));
                    }
                } else {
                    tot = Number(item.total || (cant * Number(item.precio || item.precioUnitario || 0)));
                }

                subcatVentas[tipo] = (subcatVentas[tipo] || 0) + tot;
                subcatUnidades[tipo] = (subcatUnidades[tipo] || 0) + cant;
                totalVentaAnio += tot;
                totalUnidadesAnio += cant;

                if (acumuladoSubcategorias[tipo]) {
                    acumuladoSubcategorias[tipo].venta += tot;
                    acumuladoSubcategorias[tipo].unidades += cant;
                }
            });
            if (tieneKit) pedidosConKitsCount++;
        });

        granTotalVenta += totalVentaAnio;
        granTotalUnidades += totalUnidadesAnio;

        if (totalVentaAnio > maxVenta.total) {
            maxVenta = { anio: yr, total: totalVentaAnio };
        }

        let crecimientoYoY = 0;
        if (idx > 0) {
            const ventaPrevia = datosPorAnio[idx - 1].totalVentaAnio;
            if (ventaPrevia > 0) {
                crecimientoYoY = ((totalVentaAnio - ventaPrevia) / ventaPrevia) * 100;
            }
        }

        datosPorAnio.push({
            anio: String(yr),
            totalVentaAnio,
            totalUnidadesAnio,
            pedidosConKitsCount,
            subcatVentas,
            subcatUnidades,
            crecimientoYoY
        });
    });

    // Determinar subcategoría líder
    let liderSubcat = { id: 'KB', nombre: 'Kit de Bautizo', total: 0 };
    Object.entries(acumuladoSubcategorias).forEach(([id, data]) => {
        if (data.venta > liderSubcat.total) {
            const cfg = SUB_CATEGORIAS_KITS_CONFIG.find(c => c.id === id);
            liderSubcat = {
                id,
                nombre: cfg?.nombre || id,
                total: data.venta,
                unidades: data.unidades
            };
        }
    });

    return {
        anios: aniosOrdenados.map(String),
        datosPorAnio,
        granTotalVenta,
        granTotalUnidades,
        maxVenta,
        acumuladoSubcategorias,
        liderSubcat,
        promedioVentaAnual: aniosOrdenados.length > 0 ? granTotalVenta / aniosOrdenados.length : 0
    };
};

