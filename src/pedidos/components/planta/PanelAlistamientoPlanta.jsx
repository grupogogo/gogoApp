import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useFuntions } from '../../../hooks/useFuntions';
import useImage from '../../../hooks/useImage';

export const PanelAlistamientoPlanta = ({ pedidos = [] }) => {
  const { capitalize, aTitulo, obtenerImagen } = useFuntions();

  // Años disponibles para filtrar: desde 2025 hasta el año en curso
  const anioEnCurso = new Date().getFullYear();
  const aniosDisponibles = useMemo(() => {
    const list = [];
    for (let y = anioEnCurso; y >= 2025; y--) {
      list.push(String(y));
    }
    return list;
  }, [anioEnCurso]);

  // Filtros de año y visualización
  const [filtroAnio, setFiltroAnio] = useState(String(anioEnCurso)); // Año en curso por defecto
  const [filtroSeccion, setFiltroSeccion] = useState('todos'); // 'todos', 'surtidos', 'modelos', 'guantes', 'otros', 'logistica'
  const [busqueda, setBusqueda] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [itemsListos, setItemsListos] = useState({}); // Checklist local de alistamiento

  const toggleListo = (id) => {
    setItemsListos(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Nombres cortos y directos para el operario de taller
  const nombresCat = {
    'KCG': 'Kit Comunión Grande',
    'KCP': 'Kit Comunión Pequeño',
    'KCE': 'Kit Económico',
    'KB': 'Kit Bautizo',
    'CC': 'Cirio Comunión',
    'CCON': 'Cirio Confirmación',
    'CB': 'Cirio Bautizo',
    'GUANTES': 'Guantes',
    'GUA': 'Guantes',
    'OTR': 'Otros Accesorios'
  };

  const extractYear = (p) => {
    const str = String(p.fechaCreacion || p.createdAt || '');
    const match = str.match(/\b(20\d\d)\b/);
    if (match) return match[1];
    try {
      const d = new Date(str);
      if (!isNaN(d.getFullYear())) return String(d.getFullYear());
    } catch (e) {}
    return null;
  };

  // Filtrar pedidos: SOLAMENTE ESTADO PENDIENTE y según año
  const pedidosFiltrados = useMemo(() => {
    return (pedidos || []).filter(p => {
      // 1. Estado estrictamente PENDIENTE para alistamiento
      const est = String(p.estado || '').toLowerCase().trim();
      if (est !== 'pendiente') return false;

      // 2. Filtro por Año (desde 2025 hasta año en curso)
      if (filtroAnio !== 'todos') {
        const y = extractYear(p);
        if (y && y !== filtroAnio) return false;
        if (!y && p.fechaCreacion && !p.fechaCreacion.includes(filtroAnio)) return false;
      }

      return true;
    });
  }, [pedidos, filtroAnio]);

  // Consolidación de ítems para el alistamiento en planta
  const consolidado = useMemo(() => {
    let totalUnidadesPendientes = 0;
    const pedidosPorEnvio = [];
    const pedidosPorPunto = [];
    const ciudadesEnvioMap = {};

    // 1. Surtidos agrupados por [categoría + género], idéntica presentación que modelos detallados
    const surtidosMap = {};
    let totalSurtidosNino = 0;
    let totalSurtidosNina = 0;

    // 2. Modelos específicos detallados (con imagen seleccionada, motivo y características)
    const modelosMap = {};

    // 3. Guantes por color y desglose de tallas
    const guantesMap = {
      BLANCOS: { total: 0, tallas: {}, pedidosMap: {} },
      NEGROS: { total: 0, tallas: {}, pedidosMap: {} },
      MITON: { total: 0, tallas: {}, pedidosMap: {} }
    };

    // 4. Otros productos y accesorios
    const otrosMap = {};

    pedidosFiltrados.forEach(pedido => {
      const pId = pedido.pedido_id || pedido._id || '';
      const ref = pId ? `#${pId.slice(-6).toUpperCase()}` : '#---';
      const clienteNombre = pedido.cliente?.nombre || 'Cliente sin nombre';
      const ciudad = pedido.cliente?.ciudad || 'Sin ciudad';
      const despacho = String(pedido.tipoDespacho || 'punto').toLowerCase();
      const estado = pedido.estado || 'pendiente';

      // Logística de envíos vs entrega en punto
      if (despacho === 'envio') {
        pedidosPorEnvio.push({ ref, pId, clienteNombre, ciudad, estado, detalle: pedido.detalleGeneral });
        ciudadesEnvioMap[ciudad] = (ciudadesEnvioMap[ciudad] || 0) + 1;
      } else {
        pedidosPorPunto.push({ ref, pId, clienteNombre, ciudad, despacho, estado, detalle: pedido.detalleGeneral });
      }

      // Extraer bloques de ítems
      const blocks = Array.isArray(pedido.itemPedido)
        ? pedido.itemPedido
        : (pedido.itemPedido ? [pedido.itemPedido] : []);

      blocks.forEach(block => {
        const rawItems = block?.itemPedido || block || {};

        Object.entries(rawItems).forEach(([catKey, catData]) => {
          const catCode = String(catKey).toUpperCase().trim();
          const items = catData?.pedido || [];
          if (!Array.isArray(items)) return;

          items.forEach((item) => {
            const cantidad = parseInt(item.cantidad, 10) || 0;
            if (cantidad <= 0) return;

            totalUnidadesPendientes += cantidad;
            const inputStr = String(item.nombreInput || '').trim();
            const motivoStr = String(item.motivo || '').toLowerCase().trim();
            const productoStr = String(item.producto || '').toLowerCase().trim();

            // ----------------------------------------------------
            // A. GUANTES
            // ----------------------------------------------------
            if (catCode === 'GUANTES' || catCode === 'GUA') {
              let catG = String(item.categoria || '').toUpperCase().trim();
              if (!catG || (!catG.includes('NEGR') && !catG.includes('MIT'))) {
                catG = 'BLANCOS';
              } else if (catG.includes('NEGR')) {
                catG = 'NEGROS';
              } else if (catG.includes('MIT')) {
                catG = 'MITON';
              }

              const rawTalla = String(item.talla || '').trim();
              const numTalla = rawTalla.replace(/\D/g, '') || inputStr.replace(/\D/g, '') || '?';
              const labelTalla = `T-${numTalla}`;

              if (!guantesMap[catG]) {
                guantesMap[catG] = { total: 0, tallas: {}, pedidosMap: {} };
              }
              guantesMap[catG].total += cantidad;
              guantesMap[catG].tallas[labelTalla] = (guantesMap[catG].tallas[labelTalla] || 0) + cantidad;

              const keyPed = `${ref} - ${clienteNombre} (${ciudad})`;
              guantesMap[catG].pedidosMap[keyPed] = (guantesMap[catG].pedidosMap[keyPed] || 0) + cantidad;
              return;
            }

            // ----------------------------------------------------
            // B. OTROS ACCESORIOS
            // ----------------------------------------------------
            if (catCode === 'OTR' || catCode === 'OTROS') {
              const nombreProd = String(item.producto || 'Accesorio').trim();
              if (!otrosMap[nombreProd]) {
                otrosMap[nombreProd] = {
                  producto: nombreProd,
                  total: 0,
                  detalles: [],
                  pedidosMap: {}
                };
              }
              otrosMap[nombreProd].total += cantidad;
              if (item.detalle && !otrosMap[nombreProd].detalles.includes(item.detalle)) {
                otrosMap[nombreProd].detalles.push(item.detalle);
              }

              const keyPed = `${ref} - ${clienteNombre} (${ciudad})`;
              otrosMap[nombreProd].pedidosMap[keyPed] = (otrosMap[nombreProd].pedidosMap[keyPed] || 0) + cantidad;
              return;
            }

            // ----------------------------------------------------
            // C. KITS Y CIRIOS: DETECCIÓN RIGUROSA DE SURTIDO VS DETALLADO
            // ----------------------------------------------------
            const esSurtido =
              inputStr.toLowerCase().includes('inputsurtido') ||
              inputStr.toLowerCase().includes('surtido') ||
              motivoStr === 'surtido' ||
              productoStr === 'surtido';

            if (esSurtido) {
              // En GogoApp NO EXISTE SURTIDO UNISEX: solo Surtido Niño o Surtido Niña
              let generoCod = '0';
              let generoStr = 'Niño';
              if (
                inputStr.includes('inputSurtidoNina') ||
                inputStr.toLowerCase().includes('nina') ||
                item.genero === '1' ||
                item.genero === 1
              ) {
                generoCod = '1';
                generoStr = 'Niña';
              }

              if (generoCod === '0') totalSurtidosNino += cantidad;
              else totalSurtidosNina += cantidad;

              // Clave de agrupación para el surtido por categoría y género
              const surtidoKey = `${catCode}-SURTIDO-G${generoCod}`;
              if (!surtidosMap[surtidoKey]) {
                surtidosMap[surtidoKey] = {
                  key: surtidoKey,
                  tipo: 'surtido',
                  categoria: catCode,
                  nombreCategoria: nombresCat[catCode] || catCode,
                  generoCod,
                  generoStr,
                  total: 0,
                  pedidos: []
                };
              }

              surtidosMap[surtidoKey].total += cantidad;
              surtidosMap[surtidoKey].pedidos.push({
                ref,
                cliente: clienteNombre,
                ciudad,
                despacho,
                cantidad,
                detalle: item.detalle || catData?.detalleGeneral || ''
              });
            } else {
              // ----------------------------------------------------
              // MODELO DETALLADO CON IMAGEN Y CARACTERÍSTICAS
              // ----------------------------------------------------
              let motivoNum = '1';
              const match = inputStr.match(/^[a-zA-Z]+-(\d+)/);
              if (match && match[1]) {
                motivoNum = String(parseInt(match[1], 10));
              } else if (item.motivo && !isNaN(parseInt(item.motivo, 10))) {
                motivoNum = String(parseInt(item.motivo, 10));
              } else {
                const parts = inputStr.split('-');
                if (parts.length >= 2 && !isNaN(parseInt(parts[1], 10))) {
                  motivoNum = String(parseInt(parts[1], 10));
                }
              }

              let generoCod = '0';
              let generoStr = 'Niño';
              if (
                item.genero === '1' ||
                item.genero === 1 ||
                inputStr.includes('-A') ||
                inputStr.toLowerCase().includes('nina')
              ) {
                generoCod = '1';
                generoStr = 'Niña';
              } else {
                generoCod = '0';
                generoStr = 'Niño';
              }

              let tallaDetalle = '';
              const rawT = String(item.talla || '').trim();
              if (rawT && rawT !== 't0' && rawT !== '0' && rawT !== 't-1' && rawT.toLowerCase() !== 'surtido') {
                const num = rawT.replace(/\D/g, '');
                if (num) tallaDetalle = `T-${num}`;
              }
              if (!tallaDetalle && inputStr.includes('t')) {
                const matchT = inputStr.match(/t-?(\d+)/i);
                if (matchT && matchT[1] && matchT[1] !== '0' && matchT[1] !== '1') {
                  tallaDetalle = `T-${matchT[1]}`;
                }
              }

              const modeloKey = `${catCode}-M${motivoNum}-G${generoCod}${tallaDetalle ? `-${tallaDetalle}` : ''}`;

              if (!modelosMap[modeloKey]) {
                modelosMap[modeloKey] = {
                  key: modeloKey,
                  tipo: 'detallado',
                  categoria: catCode,
                  nombreCategoria: nombresCat[catCode] || catCode,
                  motivoNum,
                  generoCod,
                  generoStr,
                  tallaDetalle,
                  total: 0,
                  pedidos: []
                };
              }

              modelosMap[modeloKey].total += cantidad;
              modelosMap[modeloKey].pedidos.push({
                ref,
                cliente: clienteNombre,
                ciudad,
                despacho,
                cantidad,
                detalle: item.detalle || catData?.detalleGeneral || ''
              });
            }
          });
        });
      });
    });

    return {
      totalUnidadesPendientes,
      pedidosPorEnvio,
      pedidosPorPunto,
      ciudadesEnvioMap,
      surtidosList: Object.values(surtidosMap).sort((a, b) => b.total - a.total),
      totalSurtidosNino,
      totalSurtidosNina,
      modelos: Object.values(modelosMap).sort((a, b) => b.total - a.total),
      guantes: guantesMap,
      otros: Object.values(otrosMap).sort((a, b) => b.total - a.total)
    };
  }, [pedidosFiltrados]);

  // Filtro de búsqueda rápida
  const term = busqueda.toLowerCase().trim();

  const surtidosFiltrados = useMemo(() => {
    if (!term) return consolidado.surtidosList;
    return consolidado.surtidosList.filter(s =>
      s.nombreCategoria.toLowerCase().includes(term) ||
      s.generoStr.toLowerCase().includes(term) ||
      'surtido'.includes(term) ||
      s.pedidos.some(p => p.cliente.toLowerCase().includes(term) || p.ciudad.toLowerCase().includes(term) || p.ref.toLowerCase().includes(term))
    );
  }, [consolidado.surtidosList, term]);

  const modelosFiltrados = useMemo(() => {
    if (!term) return consolidado.modelos;
    return consolidado.modelos.filter(m =>
      m.nombreCategoria.toLowerCase().includes(term) ||
      `#${m.motivoNum}`.includes(term) ||
      m.motivoNum === term ||
      m.generoStr.toLowerCase().includes(term) ||
      (m.tallaDetalle && m.tallaDetalle.toLowerCase().includes(term)) ||
      m.pedidos.some(p => p.cliente.toLowerCase().includes(term) || p.ciudad.toLowerCase().includes(term) || p.ref.toLowerCase().includes(term))
    );
  }, [consolidado.modelos, term]);

  const otrosFiltrados = useMemo(() => {
    if (!term) return consolidado.otros;
    return consolidado.otros.filter(o =>
      o.producto.toLowerCase().includes(term) ||
      Object.keys(o.pedidosMap).some(k => k.toLowerCase().includes(term))
    );
  }, [consolidado.otros, term]);

  const countSurtidos = consolidado.totalSurtidosNino + consolidado.totalSurtidosNina;
  const countModelos = consolidado.modelos.reduce((acc, m) => acc + m.total, 0);
  const countGuantes = consolidado.guantes.BLANCOS.total + consolidado.guantes.NEGROS.total + consolidado.guantes.MITON.total;
  const countOtros = consolidado.otros.reduce((acc, o) => acc + o.total, 0);

  // Información estructurada de guantes para renderizado dinámico (solo lo que tenga > 0 unidades)
  const guantesInfo = useMemo(() => [
    {
      key: 'BLANCOS',
      nombre: 'GUANTES BLANCOS',
      icon: 'fa-hand',
      bgIcon: 'bg-white border text-dark',
      total: consolidado.guantes.BLANCOS.total,
      tallas: consolidado.guantes.BLANCOS.tallas,
      pedidosMap: consolidado.guantes.BLANCOS.pedidosMap
    },
    {
      key: 'NEGROS',
      nombre: 'GUANTES NEGROS',
      icon: 'fa-hand',
      bgIcon: 'bg-dark text-white',
      total: consolidado.guantes.NEGROS.total,
      tallas: consolidado.guantes.NEGROS.tallas,
      pedidosMap: consolidado.guantes.NEGROS.pedidosMap
    },
    {
      key: 'MITON',
      nombre: 'GUANTES MITÓN',
      icon: 'fa-mitten',
      bgIcon: 'bg-warning-subtle text-warning-emphasis',
      total: consolidado.guantes.MITON.total,
      tallas: consolidado.guantes.MITON.tallas,
      pedidosMap: consolidado.guantes.MITON.pedidosMap
    }
  ], [consolidado.guantes]);

  const guantesDisponibles = useMemo(() => guantesInfo.filter(g => g.total > 0), [guantesInfo]);

  return (
    <div className="mb-4">
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {/* ENCABEZADO DEL CENTRO DE ALISTAMIENTO */}
        <div
          className="p-3 p-md-4 text-white d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderBottom: '3px solid #3b82f6'
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center bg-primary text-white shadow-sm flex-shrink-0"
              style={{ width: '46px', height: '46px' }}
            >
              <i className="fa-solid fa-industry fs-4"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h5 className="fw-bolder text-white mb-0">Consolidado de Alistamiento en Taller</h5>
                <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 small">
                  Rol Planta
                </span>
                <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-2.5 py-1 small fw-bold">
                  <i className="fa-regular fa-calendar-check me-1"></i>Año: {filtroAnio === 'todos' ? 'Todos' : filtroAnio}
                </span>
              </div>
              <small className="text-slate-300 opacity-75 d-block mt-0.5" style={{ color: '#cbd5e1' }}>
                Cantidades totales agrupadas por surtidos, modelos seleccionados y guantes por talla • {filtroAnio === 'todos' ? 'Todos los años' : `Vigencia ${filtroAnio}`}
              </small>
            </div>
          </div>

          {/* Controles de Vista */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* SELECTOR DE AÑO (DESDE 2025 HASTA AÑO EN CURSO) */}
            <div className="d-flex align-items-center bg-dark bg-opacity-60 px-2.5 py-1 rounded-pill border border-secondary border-opacity-50 shadow-xs">
              <span className="text-slate-300 small me-1.5" style={{ fontSize: '0.73rem', color: '#cbd5e1' }}>
                <i className="fa-regular fa-calendar-days text-info me-1"></i>Año:
              </span>
              <select
                className="form-select form-select-sm bg-transparent text-white border-0 py-0 ps-1 pe-3 fw-bold shadow-none"
                style={{ fontSize: '0.8rem', cursor: 'pointer', color: '#ffffff' }}
                value={filtroAnio}
                onChange={(e) => setFiltroAnio(e.target.value)}
                title="Filtrar por año (desde 2025 hasta el año en curso)"
              >
                {aniosDisponibles.map(y => (
                  <option key={y} value={y} className="text-dark fw-semibold">
                    {y}
                  </option>
                ))}
                <option value="todos" className="text-dark fw-semibold">Todos (2025 - {anioEnCurso})</option>
              </select>
            </div>

            {/* Badge Informativo de Estado Exclusivo Pendiente */}
            <span
              className="badge rounded-pill px-3 py-1.5 fw-bold shadow-xs bg-warning text-dark d-inline-flex align-items-center gap-1.5"
              style={{ fontSize: '0.78rem' }}
              title="Panel configurado exclusivamente para pedidos pendientes por alistar"
            >
              <i className="fa-solid fa-clock"></i>
              Solo Pendientes ({pedidosFiltrados.length})
            </span>

            <button
              type="button"
              className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 d-flex align-items-center gap-1.5"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
              <span className="small">{isCollapsed ? 'Expandir' : 'Colapsar'}</span>
            </button>
          </div>
        </div>

        {/* BARRA SUPERIOR DE RESUMEN LOGÍSTICO */}
        <div className="p-3 bg-light border-bottom">
          <Row className="g-2 g-md-3 text-center align-items-center">
            <Col xs={6} md={3}>
              <div className="p-2.5 rounded-3 bg-white border border-light-subtle shadow-xs text-start">
                <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.68rem' }}>
                  <i className="fa-solid fa-boxes-stacked text-primary me-1"></i> Total a Fabricar ({filtroAnio === 'todos' ? 'Todos' : filtroAnio})
                </span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fs-3 fw-bolder text-dark">{consolidado.totalUnidadesPendientes}</span>
                  <span className="small text-muted">unidades</span>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div className="p-2.5 rounded-3 bg-white border border-light-subtle shadow-xs text-start">
                <span className="small text-muted fw-bold text-uppercase d-block" style={{ fontSize: '0.68rem' }}>
                  <i className="fa-solid fa-clock text-warning me-1"></i> Órdenes en Proceso ({filtroAnio === 'todos' ? 'Todos' : filtroAnio})
                </span>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fs-3 fw-bolder text-warning-emphasis">{pedidosFiltrados.length}</span>
                  <span className="small text-muted">pedidos</span>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div
                className={`p-2.5 rounded-3 bg-white border border-light-subtle shadow-xs text-start ${filtroSeccion === 'logistica' ? 'border-primary' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setFiltroSeccion(filtroSeccion === 'logistica' ? 'todos' : 'logistica')}
                title="Ver ciudades de envío"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem' }}>
                    <i className="fa-solid fa-truck-fast text-info me-1"></i> Envío Nacional
                  </span>
                  <span className="badge bg-info-subtle text-info rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                    {Object.keys(consolidado.ciudadesEnvioMap).length} ciudades
                  </span>
                </div>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fs-3 fw-bolder text-info">{consolidado.pedidosPorEnvio.length}</span>
                  <span className="small text-muted">paquetes</span>
                </div>
              </div>
            </Col>

            <Col xs={6} md={3}>
              <div
                className={`p-2.5 rounded-3 bg-white border border-light-subtle shadow-xs text-start ${filtroSeccion === 'logistica' ? 'border-primary' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setFiltroSeccion(filtroSeccion === 'logistica' ? 'todos' : 'logistica')}
                title="Ver entregas en taller"
              >
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem' }}>
                    <i className="fa-solid fa-shop text-success me-1"></i> Entrega en Punto
                  </span>
                  <span className="badge bg-success-subtle text-success rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                    Recogida local
                  </span>
                </div>
                <div className="d-flex align-items-baseline gap-2 mt-1">
                  <span className="fs-3 fw-bolder text-success">{consolidado.pedidosPorPunto.length}</span>
                  <span className="small text-muted">pedidos</span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* CONTENIDO EXPANDIBLE */}
        {!isCollapsed && (
          <div className="p-3 p-md-4">
            {/* BOTONES DE FILTRADO RÁPIDO Y BÚSQUEDA (SURTIDOS DE PRIMERO) */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                    filtroSeccion === 'todos' ? 'btn-primary text-white shadow-xs' : 'btn-light border text-secondary'
                  }`}
                  onClick={() => setFiltroSeccion('todos')}
                >
                  <i className="fa-solid fa-layer-group me-1.5"></i>
                  Todo ({consolidado.totalUnidadesPendientes})
                </button>

                {/* 1. BOTÓN SURTIDOS DE PRIMERO */}
                {countSurtidos > 0 && (
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${
                      filtroSeccion === 'surtidos' ? 'btn-warning text-dark shadow-xs border-warning' : 'btn-light border text-dark'
                    }`}
                    onClick={() => setFiltroSeccion('surtidos')}
                  >
                    <i className="fa-solid fa-boxes-packing me-1.5 text-warning-emphasis"></i>
                    Surtidos ({countSurtidos})
                  </button>
                )}

                {/* 2. BOTÓN MODELOS DETALLADOS */}
                {countModelos > 0 && (
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${
                      filtroSeccion === 'modelos' ? 'btn-primary text-white shadow-xs' : 'btn-light border text-primary'
                    }`}
                    onClick={() => setFiltroSeccion('modelos')}
                  >
                    <i className="fa-solid fa-image me-1.5"></i>
                    Modelos Detallados ({countModelos})
                  </button>
                )}

                {/* 3. BOTÓN GUANTES */}
                {countGuantes > 0 && (
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${
                      filtroSeccion === 'guantes' ? 'btn-success text-white shadow-xs' : 'btn-light border text-success'
                    }`}
                    onClick={() => setFiltroSeccion('guantes')}
                  >
                    <i className="fa-solid fa-mitten me-1.5"></i>
                    Guantes ({countGuantes})
                  </button>
                )}

                {/* 4. OTROS */}
                {countOtros > 0 && (
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${
                      filtroSeccion === 'otros' ? 'btn-secondary text-white shadow-xs' : 'btn-light border text-secondary'
                    }`}
                    onClick={() => setFiltroSeccion('otros')}
                  >
                    <i className="fa-solid fa-tags me-1.5"></i>
                    Otros ({countOtros})
                  </button>
                )}

                {/* 5. LOGÍSTICA */}
                {pedidosFiltrados.length > 0 && (
                  <button
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                      filtroSeccion === 'logistica' ? 'btn-danger text-white shadow-xs' : 'btn-light border text-secondary'
                    }`}
                    onClick={() => setFiltroSeccion('logistica')}
                  >
                    <i className="fa-solid fa-truck me-1.5 text-danger"></i>
                    Logística ({pedidosFiltrados.length})
                  </button>
                )}
              </div>

              {/* Búsqueda */}
              <div style={{ minWidth: '240px', maxWidth: '340px' }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 shadow-none"
                    placeholder="Buscar surtido, modelo, cliente o ciudad..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                  {busqueda && (
                    <button
                      className="btn btn-light border border-start-0 text-muted"
                      type="button"
                      onClick={() => setBusqueda('')}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ESTADO VACÍO TOTAL: SI NO HAY PEDIDOS PENDIENTES */}
            {consolidado.totalUnidadesPendientes === 0 ? (
              <div className="p-5 text-center bg-light rounded-4 border border-dashed my-3">
                <div className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success mb-3">
                  <i className="fa-solid fa-circle-check fs-2"></i>
                </div>
                <h5 className="fw-bold text-dark mb-1">¡Sin unidades pendientes por alistar!</h5>
                <p className="text-muted mb-0 small">
                  No hay pedidos pendientes para el año o filtro seleccionado. El taller está al día.
                </p>
              </div>
            ) : (
              <>
                {/* ========================================================================= */}
                {/* SECCIÓN 1 (DE PRIMERA): SURTIDOS CON COLOR ÁMBAR Y TEXTO PROTAGÓNICO      */}
                {/* ========================================================================= */}
                {((filtroSeccion === 'todos' && surtidosFiltrados.length > 0) || filtroSeccion === 'surtidos') && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-2 bg-warning text-dark rounded-3 shadow-xs">
                          <i className="fa-solid fa-boxes-packing fs-5"></i>
                        </span>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-black text-dark mb-0">Modelos Surtidos a Preparar</h6>
                            <span className="badge bg-warning text-dark border border-warning-subtle rounded-pill px-2 py-0.5 fw-bolder" style={{ fontSize: '0.72rem' }}>
                              SURTIDO
                            </span>
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Agrupados por categoría y género con texto ampliado y cantidades consolidadas
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span
                          className="badge rounded-pill px-3 py-1.5 fw-bold text-white shadow-xs"
                          style={{ backgroundColor: '#1d4ed8', fontSize: '0.85rem' }}
                        >
                          <i className="fa-solid fa-mars me-1.5"></i>Niño: {consolidado.totalSurtidosNino}
                        </span>
                        <span
                          className="badge rounded-pill px-3 py-1.5 fw-bold text-white shadow-xs"
                          style={{ backgroundColor: '#db2777', fontSize: '0.85rem' }}
                        >
                          <i className="fa-solid fa-venus me-1.5"></i>Niña: {consolidado.totalSurtidosNina}
                        </span>
                        <span className="badge bg-warning text-dark border border-warning rounded-pill px-3 py-1.5 fw-black shadow-xs" style={{ fontSize: '0.85rem' }}>
                          Total: {countSurtidos} unds
                        </span>
                      </div>
                    </div>

                    {surtidosFiltrados.length === 0 ? (
                      <div className="p-4 bg-light rounded-4 text-center text-muted border border-dashed mb-3">
                        <i className="fa-solid fa-boxes-packing fs-3 mb-2 d-block opacity-50"></i>
                        <span>No hay modelos surtidos pendientes de preparar con los filtros seleccionados</span>
                      </div>
                    ) : (
                      /* GRID DE SURTIDOS: SIN IMAGEN, TEXTO "SURTIDO" PROTAGÓNICO Y BORDE ÁMBAR */
                      <div className="row g-2 g-md-3 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">
                        {surtidosFiltrados.map((surt) => {
                          const isListo = !!itemsListos[surt.key];

                          return (
                            <div key={surt.key} className="col">
                              <div
                                className={`card h-100 rounded-4 position-relative shadow-xs overflow-hidden ${
                                  isListo ? 'bg-success-subtle bg-opacity-25' : ''
                                }`}
                                style={{
                                  border: isListo ? '2.5px solid #16a34a' : '2.5px solid #f59e0b',
                                  backgroundColor: isListo ? '#f0fdf4' : '#fffdf5',
                                  boxShadow: isListo ? '0 4px 12px rgba(22, 163, 74, 0.12)' : '0 4px 12px rgba(245, 158, 11, 0.15)',
                                  transition: 'all 0.15s ease-in-out'
                                }}
                              >
                                <div className="p-2.5 d-flex flex-column justify-content-between h-100">
                                  <div>
                                    {/* 1. Header con Badge Surtido y Badge Niño/Niña Grande */}
                                    <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                                      <span
                                        className="badge rounded-pill px-2.5 py-1 fw-black text-dark shadow-xs"
                                        style={{
                                          backgroundColor: '#fbbf24',
                                          border: '1px solid #d97706',
                                          fontSize: '0.78rem',
                                          letterSpacing: '0.4px'
                                        }}
                                      >
                                        <i className="fa-solid fa-boxes-packing me-1"></i>SURTIDO
                                      </span>
                                      <span
                                        className="badge rounded-pill px-2.5 py-1 fw-bold text-white shadow-xs"
                                        style={{
                                          backgroundColor: surt.generoCod === '0' ? '#1d4ed8' : '#db2777',
                                          fontSize: '0.85rem'
                                        }}
                                      >
                                        <i className={`fa-solid ${surt.generoCod === '0' ? 'fa-mars' : 'fa-venus'} me-1.5`}></i>
                                        {surt.generoStr}
                                      </span>
                                    </div>

                                    {/* EN LUGAR DE IMAGEN: BANNER PROTAGÓNICO "SURTIDO" GRANDE */}
                                    <div
                                      className="rounded-3 py-3 px-2 text-center my-2 d-flex flex-column align-items-center justify-content-center shadow-xs"
                                      style={{
                                        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                        border: '2px dashed #f59e0b',
                                        minHeight: '82px'
                                      }}
                                    >
                                      <i className="fa-solid fa-boxes-packing fs-3 text-warning-emphasis mb-1"></i>
                                      <span
                                        className="fw-black text-warning-emphasis text-uppercase"
                                        style={{ fontSize: '1.25rem', letterSpacing: '1px', fontWeight: 900 }}
                                      >
                                        SURTIDO
                                      </span>
                                      <small className="text-dark opacity-75 fw-bold" style={{ fontSize: '0.72rem' }}>
                                        Modelos Variados
                                      </small>
                                    </div>

                                    {/* Título de la Categoría */}
                                    <div className="text-center mb-1">
                                      <div className="fw-bolder text-dark text-truncate" style={{ fontSize: '0.85rem' }} title={surt.nombreCategoria}>
                                        {surt.nombreCategoria}
                                      </div>
                                    </div>

                                    {/* 2. NÚMERO GRANDE DE LA CANTIDAD QUE SE NECESITA */}
                                    <div
                                      className="p-1.5 rounded-3 text-center my-1.5 border shadow-xs"
                                      style={{
                                        backgroundColor: isListo ? '#dcfce7' : '#fef9c3',
                                        borderColor: isListo ? '#86efac' : '#facc15'
                                      }}
                                    >
                                      <span className="text-uppercase fw-bolder text-muted d-block" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                                        A PREPARAR
                                      </span>
                                      <div className="d-flex align-items-baseline justify-content-center gap-1">
                                        <span
                                          className="fw-black"
                                          style={{
                                            fontSize: '2.4rem',
                                            lineHeight: 1,
                                            fontWeight: 900,
                                            color: isListo ? '#15803d' : '#b45309'
                                          }}
                                        >
                                          {surt.total}
                                        </span>
                                        <span className="fw-bold text-muted" style={{ fontSize: '0.78rem' }}>
                                          unds
                                        </span>
                                      </div>
                                    </div>

                                    {/* 3. Pedidos que lo necesitan */}
                                    <div className="mt-1" style={{ fontSize: '0.68rem' }}>
                                      <div className="text-muted fw-semibold mb-0.5 d-flex justify-content-between">
                                        <span>Órdenes ({surt.pedidos.length}):</span>
                                      </div>
                                      <div className="d-flex flex-column gap-1" style={{ maxHeight: '60px', overflowY: 'auto' }}>
                                        {surt.pedidos.map((p, pIdx) => (
                                          <div
                                            key={pIdx}
                                            className="p-1 rounded-2 bg-light border d-flex justify-content-between align-items-center text-truncate"
                                            title={`${p.ref} - ${p.cliente} (${p.ciudad})`}
                                          >
                                            <span className="text-truncate" style={{ maxWidth: '75%' }}>
                                              <strong className="text-warning-emphasis me-1">{p.ref}</strong>
                                              <span className="text-dark">{p.cliente.split(' ')[0]}</span>
                                            </span>
                                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                              {p.cantidad}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 4. Botón de Marcar Listo */}
                                  <div className="mt-2 pt-1.5 border-top text-center">
                                    <button
                                      type="button"
                                      className={`btn btn-xs w-100 rounded-pill py-1 fw-semibold d-flex align-items-center justify-content-center gap-1 ${
                                        isListo ? 'btn-success text-white' : 'btn-outline-secondary'
                                      }`}
                                      style={{ fontSize: '0.72rem' }}
                                      onClick={() => toggleListo(surt.key)}
                                    >
                                      <i className={`fa-solid ${isListo ? 'fa-check-double' : 'fa-check'}`}></i>
                                      <span>{isListo ? 'Alistado' : 'Marcar Listo'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN 2: MODELOS DETALLADOS CON COLOR AZUL Y NÚMERO GRANDE               */}
                {/* ========================================================================= */}
                {((filtroSeccion === 'todos' && modelosFiltrados.length > 0) || filtroSeccion === 'modelos') && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-2 bg-primary text-white rounded-3 shadow-xs">
                          <i className="fa-solid fa-images fs-5"></i>
                        </span>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-black text-dark mb-0">Modelos Detallados a Fabricar</h6>
                            <span className="badge bg-primary text-white border border-primary-subtle rounded-pill px-2 py-0.5 fw-bolder" style={{ fontSize: '0.72rem' }}>
                              DETALLADOS
                            </span>
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Productos con diseño específico seleccionado por el cliente, agrupados por modelo y talla
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-primary text-white rounded-pill px-3 py-1.5 fw-bold shadow-xs" style={{ fontSize: '0.85rem' }}>
                        {modelosFiltrados.length} modelos distintos • {countModelos} unidades
                      </span>
                    </div>

                    {modelosFiltrados.length === 0 ? (
                      <div className="p-4 bg-light rounded-4 text-center text-muted border border-dashed mb-3">
                        <i className="fa-regular fa-image fs-3 mb-2 d-block opacity-50"></i>
                        <span>No hay modelos específicos detallados con los filtros seleccionados</span>
                      </div>
                    ) : (
                      /* GRID DE MODELOS DETALLADOS: CON IMAGEN Y BORDE AZUL */
                      <div className="row g-2 g-md-3 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6">
                        {modelosFiltrados.map((mod) => {
                          const isListo = !!itemsListos[mod.key];
                          const imgCategory = mod.categoria === 'KCE'
                            ? 'economico-unisex'
                            : obtenerImagen(mod.categoria, mod.generoCod);
                          const imgSrc = useImage(imgCategory, mod.motivoNum);

                          return (
                            <div key={mod.key} className="col">
                              <div
                                className={`card h-100 rounded-4 position-relative shadow-xs overflow-hidden ${
                                  isListo ? 'bg-success-subtle bg-opacity-25' : ''
                                }`}
                                style={{
                                  border: isListo ? '2.5px solid #16a34a' : '2.5px solid #2563eb',
                                  backgroundColor: isListo ? '#f0fdf4' : '#f8faff',
                                  boxShadow: isListo ? '0 4px 12px rgba(22, 163, 74, 0.12)' : '0 4px 12px rgba(37, 99, 235, 0.15)',
                                  transition: 'all 0.15s ease-in-out'
                                }}
                              >
                                <div className="p-2.5 d-flex flex-column justify-content-between h-100">
                                  <div>
                                    {/* 1. Header con Motivo y Badge Niño/Niña Grande */}
                                    <div className="d-flex align-items-center justify-content-between gap-1 mb-2">
                                      {(() => {
                                        const usaLetras = ['KCG', 'KCP', 'KCE', 'CC', 'KB', 'CB', 'CCON'].includes(String(mod.categoria || '').toUpperCase());
                                        const num = parseInt(mod.motivoNum, 10);
                                        const label = (usaLetras && !isNaN(num) && num >= 1 && num <= 26)
                                          ? `Modelo ${String.fromCharCode(64 + num)}`
                                          : `Motivo #${mod.motivoNum}`;
                                        return (
                                          <span
                                            className="badge rounded-pill px-2.5 py-1 fw-bold text-white shadow-xs"
                                            style={{
                                              backgroundColor: '#1e40af',
                                              border: '1px solid #1d4ed8',
                                              fontSize: '0.82rem',
                                              letterSpacing: '0.4px'
                                            }}
                                          >
                                            <i className="fa-solid fa-tag me-1"></i>{label}
                                          </span>
                                        );
                                      })()}
                                      <span
                                        className="badge rounded-pill px-2.5 py-1 fw-bold text-white shadow-xs"
                                        style={{
                                          backgroundColor: mod.generoCod === '0' ? '#1d4ed8' : '#db2777',
                                          fontSize: '0.85rem'
                                        }}
                                      >
                                        <i className={`fa-solid ${mod.generoCod === '0' ? 'fa-mars' : 'fa-venus'} me-1.5`}></i>
                                        {mod.generoStr}
                                      </span>
                                    </div>

                                    {/* Contenedor de Imagen de Modelo Detallado con Zoom */}
                                    <div
                                      className="position-relative rounded-3 border overflow-hidden bg-white mx-auto mb-2 d-flex align-items-center justify-content-center shadow-xs"
                                      style={{ height: '78px', width: '100%', cursor: 'zoom-in', borderColor: '#bfdbfe' }}
                                      onClick={() => setPreviewImage({
                                        src: imgSrc,
                                        title: `${mod.nombreCategoria} - Motivo #${mod.motivoNum} (${mod.generoStr})${mod.tallaDetalle ? ` • ${mod.tallaDetalle}` : ''}`
                                      })}
                                      title="Clic para ampliar diseño"
                                    >
                                      <img
                                        src={imgSrc}
                                        alt={`Motivo #${mod.motivoNum}`}
                                        className="w-100 h-100 object-fit-contain p-1"
                                        loading="lazy"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '/images/placeholder.webp';
                                        }}
                                      />
                                      <span
                                        className="position-absolute bottom-0 end-0 p-1 bg-dark bg-opacity-60 text-white rounded-start"
                                        style={{ fontSize: '0.55rem', lineHeight: 1 }}
                                      >
                                        <i className="fa-solid fa-magnifying-glass-plus"></i>
                                      </span>
                                    </div>

                                    {/* Título de la Categoría y Talla */}
                                    <div className="text-center mb-1">
                                      <div className="fw-bolder text-dark text-truncate" style={{ fontSize: '0.85rem' }} title={mod.nombreCategoria}>
                                        {mod.nombreCategoria}
                                      </div>
                                      {mod.tallaDetalle && (
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-0.5 mt-0.5 fw-bolder" style={{ fontSize: '0.78rem' }}>
                                          Talla: {mod.tallaDetalle}
                                        </span>
                                      )}
                                    </div>

                                    {/* 2. NÚMERO GRANDE DE LA CANTIDAD QUE SE NECESITA */}
                                    <div
                                      className="p-1.5 rounded-3 text-center my-1.5 border shadow-xs"
                                      style={{
                                        backgroundColor: isListo ? '#dcfce7' : '#eff6ff',
                                        borderColor: isListo ? '#86efac' : '#93c5fd'
                                      }}
                                    >
                                      <span className="text-uppercase fw-bolder text-muted d-block" style={{ fontSize: '0.62rem', letterSpacing: '0.5px' }}>
                                        A PREPARAR
                                      </span>
                                      <div className="d-flex align-items-baseline justify-content-center gap-1">
                                        <span
                                          className="fw-black"
                                          style={{
                                            fontSize: '2.4rem',
                                            lineHeight: 1,
                                            fontWeight: 900,
                                            color: isListo ? '#15803d' : '#1d4ed8'
                                          }}
                                        >
                                          {mod.total}
                                        </span>
                                        <span className="fw-bold text-muted" style={{ fontSize: '0.78rem' }}>
                                          unds
                                        </span>
                                      </div>
                                    </div>

                                    {/* 3. Pedidos que lo necesitan */}
                                    <div className="mt-1" style={{ fontSize: '0.68rem' }}>
                                      <div className="text-muted fw-semibold mb-0.5 d-flex justify-content-between">
                                        <span>Órdenes ({mod.pedidos.length}):</span>
                                      </div>
                                      <div className="d-flex flex-column gap-1" style={{ maxHeight: '60px', overflowY: 'auto' }}>
                                        {mod.pedidos.map((p, pIdx) => (
                                          <div
                                            key={pIdx}
                                            className="p-1 rounded-2 bg-light border d-flex justify-content-between align-items-center text-truncate"
                                            title={`${p.ref} - ${p.cliente} (${p.ciudad})`}
                                          >
                                            <span className="text-truncate" style={{ maxWidth: '75%' }}>
                                              <strong className="text-primary me-1">{p.ref}</strong>
                                              <span className="text-dark">{p.cliente.split(' ')[0]}</span>
                                            </span>
                                            <span className="badge bg-secondary rounded-pill px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                              {p.cantidad}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 4. Botón de Marcar Listo */}
                                  <div className="mt-2 pt-1.5 border-top text-center">
                                    <button
                                      type="button"
                                      className={`btn btn-xs w-100 rounded-pill py-1 fw-semibold d-flex align-items-center justify-content-center gap-1 ${
                                        isListo ? 'btn-success text-white' : 'btn-outline-secondary'
                                      }`}
                                      style={{ fontSize: '0.72rem' }}
                                      onClick={() => toggleListo(mod.key)}
                                    >
                                      <i className={`fa-solid ${isListo ? 'fa-check-double' : 'fa-check'}`}></i>
                                      <span>{isListo ? 'Alistado' : 'Marcar Listo'}</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN 3: GUANTES CON COLOR VERDE ESMERALDA Y TALLAS AMPLIADAS           */}
                {/* SI NO HAY UNIDADES, NO MOSTRAR NADA (DEJAR LIMPIO)                       */}
                {/* ========================================================================= */}
                {((filtroSeccion === 'todos' && guantesDisponibles.length > 0) || filtroSeccion === 'guantes') && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-2 bg-success text-white rounded-3 shadow-xs">
                          <i className="fa-solid fa-mitten fs-5"></i>
                        </span>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-black text-dark mb-0">Guantes a Alistar por Color y Talla</h6>
                            <span className="badge bg-success text-white border border-success-subtle rounded-pill px-2 py-0.5 fw-bolder" style={{ fontSize: '0.72rem' }}>
                              GUANTES
                            </span>
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Desglose de tallas y cantidades consolidado exclusivamente para lo pendiente
                          </small>
                        </div>
                      </div>
                      <span className="badge bg-success text-white rounded-pill px-3 py-1.5 fw-bold shadow-xs" style={{ fontSize: '0.85rem' }}>
                        Total: {countGuantes} pares de guantes
                      </span>
                    </div>

                    {guantesDisponibles.length === 0 ? (
                      <div className="p-4 bg-light rounded-4 text-center text-muted border border-dashed mb-3">
                        <i className="fa-solid fa-mitten fs-3 mb-2 d-block opacity-50 text-success"></i>
                        <span>No hay guantes pendientes de alistar con los filtros seleccionados</span>
                      </div>
                    ) : (
                      /* CUADRÍCULA DE GUANTES: SOLO SE MUESTRAN LOS COLORES QUE TENGAN TOTAL > 0 */
                      <Row className="g-3">
                        {guantesDisponibles.map((g) => {
                          const colSize = guantesDisponibles.length === 1 ? { xs: 12, md: 6, lg: 5 } : guantesDisponibles.length === 2 ? { xs: 12, md: 6 } : { xs: 12, md: 4 };
                          const tallasConCantidad = Object.entries(g.tallas)
                            .filter(([_, cant]) => cant > 0)
                            .sort((a, b) => parseInt(a[0].replace(/\D/g, ''), 10) - parseInt(b[0].replace(/\D/g, ''), 10));

                          return (
                            <Col key={g.key} {...colSize}>
                              <div
                                className="card h-100 rounded-4 shadow-sm p-3 position-relative overflow-hidden"
                                style={{
                                  border: '2.5px solid #059669',
                                  backgroundColor: '#f0fdf4',
                                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.12)'
                                }}
                              >
                                {/* Header de la tarjeta de guante */}
                                <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom border-success-subtle">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className={`p-2 rounded-circle shadow-xs ${g.bgIcon}`}>
                                      <i className={`fa-solid ${g.icon} fs-5`}></i>
                                    </span>
                                    <div>
                                      <h6 className="fw-black text-dark mb-0" style={{ letterSpacing: '0.5px' }}>{g.nombre}</h6>
                                      <span className="badge bg-success text-white rounded-pill px-2 py-0.5" style={{ fontSize: '0.68rem' }}>
                                        Tallas Solicitadas
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-baseline gap-1 bg-white px-2.5 py-1 rounded-3 border border-success-subtle shadow-xs">
                                    <span className="fw-black text-success" style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1 }}>
                                      {g.total}
                                    </span>
                                    <span className="small text-success-emphasis fw-bold">pares</span>
                                  </div>
                                </div>

                                {/* Cuadrícula de tallas (SOLO TALLAS CON UNIDADES > 0, TALLA Y CANTIDAD MÁS GRANDES) */}
                                <div className="small fw-bold text-success-emphasis mb-2 d-flex justify-content-between align-items-center" style={{ fontSize: '0.78rem' }}>
                                  <span><i className="fa-solid fa-ruler-combined me-1"></i>Pares por Talla:</span>
                                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">{tallasConCantidad.length} tallas</span>
                                </div>

                                <div className="row g-2 mb-3">
                                  {tallasConCantidad.map(([talla, cant]) => (
                                    <div key={talla} className="col-4 col-sm-3">
                                      <div className="p-2 rounded-3 bg-white border border-success-subtle shadow-xs text-center">
                                        <span
                                          className="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill px-2 py-0.5 fw-bold d-inline-block mb-1"
                                          style={{ fontSize: '0.88rem' }}
                                        >
                                          {talla}
                                        </span>
                                        <span
                                          className="d-block fw-black text-success"
                                          style={{ fontSize: '1.75rem', lineHeight: 1.1, fontWeight: 900 }}
                                        >
                                          {cant}
                                        </span>
                                        <span className="text-muted fw-semibold" style={{ fontSize: '0.65rem' }}>
                                          pares
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Pedidos asociados */}
                                <div className="mt-auto pt-2 border-top border-success-subtle small text-muted">
                                  <span className="fw-bold text-success-emphasis d-block mb-1" style={{ fontSize: '0.72rem' }}>
                                    <i className="fa-solid fa-receipt me-1"></i>En órdenes ({Object.keys(g.pedidosMap).length}):
                                  </span>
                                  <div className="d-flex flex-wrap gap-1" style={{ maxHeight: '75px', overflowY: 'auto' }}>
                                    {Object.entries(g.pedidosMap).map(([ped, cant]) => (
                                      <span key={ped} className="badge bg-white text-dark border border-success-subtle px-2 py-1 small text-truncate shadow-xs" style={{ maxWidth: '100%', fontSize: '0.72rem' }}>
                                        {ped}: <strong className="text-success">{cant} pares</strong>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    )}
                  </div>
                )}

                {/* ========================================================================= */}
                {/* SECCIÓN 4: OTROS ACCESORIOS CON COLOR PÚRPURA / VIOLETA                   */}
                {/* ========================================================================= */}
                {(filtroSeccion === 'todos' || filtroSeccion === 'otros') && otrosFiltrados.length > 0 && (
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-2 text-white rounded-3 shadow-xs" style={{ backgroundColor: '#7c3aed' }}>
                          <i className="fa-solid fa-tags fs-5"></i>
                        </span>
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <h6 className="fw-black text-dark mb-0">Otros Productos y Accesorios</h6>
                            <span className="badge rounded-pill px-2 py-0.5 fw-bolder text-white" style={{ backgroundColor: '#7c3aed', fontSize: '0.72rem' }}>
                              ACCESORIOS
                            </span>
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                            Artículos complementarios solicitados en los pedidos
                          </small>
                        </div>
                      </div>
                      <span className="badge rounded-pill px-3 py-1.5 fw-bold text-white shadow-xs" style={{ backgroundColor: '#7c3aed', fontSize: '0.85rem' }}>
                        {otrosFiltrados.length} accesorios • {countOtros} unidades
                      </span>
                    </div>

                    <Row className="g-2 g-md-3">
                      {otrosFiltrados.map((ot, idx) => (
                        <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                          <div
                            className="p-3 rounded-4 bg-white shadow-xs h-100 d-flex flex-column justify-content-between"
                            style={{ border: '2.5px solid #8b5cf6', backgroundColor: '#faf5ff' }}
                          >
                            <div>
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <h6 className="fw-black text-dark mb-0 small text-truncate" title={ot.producto}>{ot.producto}</h6>
                                <div className="d-flex align-items-baseline gap-1 ms-2">
                                  <span className="fw-black" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6d28d9', lineHeight: 1 }}>
                                    {ot.total}
                                  </span>
                                  <span className="small text-muted" style={{ fontSize: '0.7rem' }}>und</span>
                                </div>
                              </div>
                              {ot.detalles.length > 0 && (
                                <div className="small text-muted fst-italic mb-2" style={{ fontSize: '0.72rem' }}>
                                  {ot.detalles.join(' • ')}
                                </div>
                              )}
                            </div>
                            <div className="mt-2 pt-2 border-top small text-muted" style={{ fontSize: '0.7rem' }}>
                              <span className="fw-bold text-secondary d-block mb-1" style={{ fontSize: '0.68rem' }}>En órdenes:</span>
                              <div className="d-flex flex-wrap gap-1">
                                {Object.entries(ot.pedidosMap).map(([p, c]) => (
                                  <span key={p} className="badge bg-white text-dark border px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                    {p}: <strong style={{ color: '#6d28d9' }}>{c}</strong>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </>
            )}

            {/* ========================================================================= */}
            {/* SECCIÓN 5: LOGÍSTICA DE ENVÍOS Y ENTREGAS EN TALLER                       */}
            {/* ========================================================================= */}
            {(filtroSeccion === 'todos' || filtroSeccion === 'logistica') && (
              <div className="mb-2">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="p-1.5 bg-danger-subtle text-danger rounded-2">
                      <i className="fa-solid fa-truck-ramp-box"></i>
                    </span>
                    <h6 className="fw-bold text-dark mb-0">Destinos de Envío y Entregas en Taller</h6>
                  </div>
                  <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1">
                    {consolidado.pedidosPorEnvio.length} a enviar • {consolidado.pedidosPorPunto.length} entrega en punto
                  </span>
                </div>

                <Row className="g-3">
                  {/* Envíos Nacionales */}
                  <Col xs={12} md={7}>
                    <div className="card h-100 rounded-4 border border-light-subtle shadow-xs p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                        <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                          <i className="fa-solid fa-map-location-dot text-primary me-1"></i> Destinos Nacionales ({Object.keys(consolidado.ciudadesEnvioMap).length} ciudades)
                        </span>
                        <span className="badge bg-primary rounded-pill px-2 py-0.5">
                          {consolidado.pedidosPorEnvio.length} paquetes
                        </span>
                      </div>

                      {/* Chips de Ciudades */}
                      <div className="d-flex flex-wrap gap-1.5 mb-2.5">
                        {Object.entries(consolidado.ciudadesEnvioMap)
                          .sort((a, b) => b[1] - a[1])
                          .map(([ciudad, cant]) => (
                            <span key={ciudad} className="badge bg-light text-dark border p-1.5 rounded-2 d-inline-flex align-items-center gap-1">
                              <i className="fa-solid fa-location-dot text-danger small"></i>
                              <strong className="fs-7">{aTitulo(ciudad)}</strong>
                              <span className="badge bg-primary-subtle text-primary rounded-pill px-1.5 py-0.5">{cant}</span>
                            </span>
                          ))}
                      </div>

                      <div className="small fw-semibold text-secondary mb-1" style={{ fontSize: '0.72rem' }}>Listado de paquetes a enviar:</div>
                      <div className="d-flex flex-column gap-1" style={{ maxHeight: '140px', overflowY: 'auto' }}>
                        {consolidado.pedidosPorEnvio.map((p, idx) => (
                          <div key={idx} className="p-1.5 rounded-2 bg-light border small d-flex justify-content-between align-items-center gap-2">
                            <div className="text-truncate">
                              <strong className="text-primary me-1">{p.ref}</strong>
                              <span className="text-dark fw-medium">{p.clienteNombre}</span>
                              <span className="text-muted ms-1.5">• {aTitulo(p.ciudad)}</span>
                            </div>
                            <span className="badge rounded-pill px-2 py-0.5 bg-warning-subtle text-warning-emphasis" style={{ fontSize: '0.65rem' }}>
                              Pendiente
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Col>

                  {/* Entregas en Punto */}
                  <Col xs={12} md={5}>
                    <div className="card h-100 rounded-4 border border-light-subtle shadow-xs p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                        <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.72rem' }}>
                          <i className="fa-solid fa-shop text-success me-1"></i> Entrega en Punto / Recogida
                        </span>
                        <span className="badge bg-success rounded-pill px-2 py-0.5">
                          {consolidado.pedidosPorPunto.length} pedidos
                        </span>
                      </div>

                      {consolidado.pedidosPorPunto.length === 0 ? (
                        <div className="text-muted small fst-italic p-3 bg-light rounded text-center">
                          No hay pedidos para entrega en punto
                        </div>
                      ) : (
                        <div className="d-flex flex-column gap-1" style={{ maxHeight: '210px', overflowY: 'auto' }}>
                          {consolidado.pedidosPorPunto.map((p, idx) => (
                            <div key={idx} className="p-1.5 rounded-2 bg-light border small d-flex justify-content-between align-items-center gap-2">
                              <div className="text-truncate">
                                <strong className="text-success me-1">{p.ref}</strong>
                                <span className="text-dark fw-medium">{p.clienteNombre}</span>
                                {p.detalle && <small className="text-muted d-block text-truncate">{p.detalle}</small>}
                              </div>
                              <span className="badge rounded-pill px-2 py-0.5 bg-warning-subtle text-warning-emphasis" style={{ fontSize: '0.65rem' }}>
                                Pendiente
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para Visualizar Imagen Ampliada de Modelos */}
      {previewImage && (
        <Modal show={true} onHide={() => setPreviewImage(null)} centered size="md">
          <Modal.Header closeButton className="bg-light py-2 px-3">
            <Modal.Title className="fs-6 fw-bold text-dark">
              {previewImage.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-3 text-center bg-white">
            <img
              src={previewImage.src}
              alt="Vista Ampliada"
              className="img-fluid rounded-3 shadow-xs"
              style={{ maxHeight: '420px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.webp';
              }}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};
