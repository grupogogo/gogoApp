import React from 'react';
import { useSelector } from 'react-redux';
import { KpiCard } from './KpiCard';
import { CardComparativaUsuarios } from './CardComparativaUsuarios';
import { useFuntions } from '../../hooks';

export const KpiGrid = ({
  dashboardState,
  datosUsuario,
  anioFiltro = new Date().getFullYear(),
  userRole,
  userName,
  userUid
}) => {
  const {
    formatearPrecio,
    buscarPrecioxCategoriaAnio,
    totalizarPreciosFabrica,
    aTitulo,
    esOscar,
    esLeonardo,
    esKarol
  } = useFuntions();
  const pedidos = useSelector(state => state.pedidos.pedidos) || [];
  const gastos = useSelector(state => state.gastos.gastos) || [];

  // 1. Preparar datos para "GENERAL"
  const totalVentasGeneral = Number(dashboardState.totales?.totalSales || 0);
  const totalGastosAnual = Number(dashboardState.totalGastosAnual || 0);
  const utilidadBruta = totalVentasGeneral - totalGastosAnual;
  const margenUtilidad = totalVentasGeneral > 0
    ? Math.round((utilidadBruta / totalVentasGeneral) * 100)
    : 0;

  const itemsGeneral = (dashboardState.lablesTodos || []).map((label, idx) => {
    const cantidad = Number(dashboardState.dataTodos?.[idx] || 0);
    const precio = buscarPrecioxCategoriaAnio(label, anioFiltro);
    const monto = label.includes('OTR') ? cantidad : (precio > 0 ? cantidad * precio : cantidad);
    const pct = totalVentasGeneral > 0 && !label.includes('OTR')
      ? Math.round((monto / totalVentasGeneral) * 100)
      : undefined;

    return {
      label: aTitulo(label),
      value: cantidad,
      amount: monto > cantidad ? monto : undefined,
      percentage: pct,
    };
  }).sort((a, b) => (b.amount || b.value) - (a.amount || a.value));

  // 2. Preparar datos para "VENTA KITS"
  const totalVentasKits = Number(dashboardState.totalSalesKits || 0);
  const totalFabricaKits = totalizarPreciosFabrica
    ? totalizarPreciosFabrica(dashboardState.lablesKits || [], dashboardState.dataKits || [])
    : 0;
  const margenKits = totalVentasKits > 0 && totalFabricaKits > 0
    ? Math.round(((totalVentasKits - totalFabricaKits) / totalVentasKits) * 100)
    : 0;

  const itemsKits = (dashboardState.lablesKits || []).map((label, idx) => {
    const cantidad = Number(dashboardState.dataKits?.[idx] || 0);
    const precio = buscarPrecioxCategoriaAnio(label, anioFiltro);
    const monto = precio * cantidad;
    const pct = totalVentasKits > 0 ? ((monto / totalVentasKits) * 100) : 0;

    return {
      label: aTitulo(label),
      value: cantidad,
      amount: monto,
      percentage: pct,
    };
  }).sort((a, b) => b.value - a.value);

  // 3. Preparar datos para "VENTA GUANTES" (incluyendo guantes de categoría Otros)
  const totalVentasGuantes = Number(dashboardState.totalSalesGuantes || 0);
  const totalSalesLeo = Number(dashboardState.totalSalesLeo || 0);
  const totalSalesKarol = Number(dashboardState.totalSalesKarol || 0);
  const totalSalesGuantesLeo = Number(dashboardState.totalSalesGuantesLeo || 0);
  const unidadesLeo = Number(dashboardState.unidadesLeo || 0);
  const unidadesKarol = Number(dashboardState.unidadesKarol || 0);
  const unidadesGuantesLeo = Number(dashboardState.unidadesGuantesLeo || 0);

  let guantesTitle = "Venta Guantes";
  let guantesSubtitle = !datosUsuario ? 'Ventas propias de guantes' : 'Ventas globales de guantes';
  let guantesFooter = undefined;

  if (esLeonardo) {
    guantesTitle = "Venta Guantes (Leo & Karol)";
    guantesSubtitle = "Ventas Leonardo Gómez + Karol Gómez";
    guantesFooter = `Leonardo: ${formatearPrecio(totalSalesLeo)} (${unidadesLeo} doc) • Karol: ${formatearPrecio(totalSalesKarol)} (${unidadesKarol} doc) • Total Sumado: ${formatearPrecio(totalVentasGuantes)}`;
  } else if (esOscar) {
    guantesTitle = "Venta Guantes";
    guantesSubtitle = "Ventas globales de guantes";
    if (totalSalesGuantesLeo > 0) {
      guantesFooter = `Ventas Guantes Leonardo (GUANTES + OTR): ${formatearPrecio(totalSalesGuantesLeo)} (${unidadesGuantesLeo} doc)`;
    }
  } else if (esKarol) {
    guantesTitle = "Venta Guantes";
    guantesSubtitle = "Mis ventas de guantes";
  }
  const itemsGuantes = (dashboardState.detallesGuantes && dashboardState.detallesGuantes.length > 0)
    ? dashboardState.detallesGuantes.map(it => {
        const monto = Number(it.totalPrecio || 0);
        const pct = totalVentasGuantes > 0 && monto > 0
          ? Math.round((monto / totalVentasGuantes) * 100)
          : 0;
        const cleanLabel = (it.categoria || '')
          .replace(/^OTR\s*-\s*/i, '')
          .replace(/^GUANTES-\s*/i, '')
          .replace(/^GUANTES\s+/i, '');

        return {
          label: aTitulo(cleanLabel || it.categoria),
          value: it.cantidad,
          amount: monto > 0 ? monto : undefined,
          percentage: pct
        };
      }).sort((a, b) => b.value - a.value)
    : (dashboardState.lablesGuantes || []).map((label, idx) => {
        const cantidad = Number(dashboardState.dataGuantes?.[idx] || 0);
        const precio = buscarPrecioxCategoriaAnio(label, anioFiltro);
        const monto = precio * cantidad;
        const pct = totalVentasGuantes > 0 && monto > 0 ? Math.round((monto / totalVentasGuantes) * 100) : 0;
        const cleanLabel = (label || '')
          .replace(/^OTR\s*-\s*/i, '')
          .replace(/^GUANTES-\s*/i, '')
          .replace(/^GUANTES\s+/i, '');

        return {
          label: aTitulo(cleanLabel || label),
          value: cantidad,
          amount: monto > 0 ? monto : undefined,
          percentage: pct,
        };
      }).sort((a, b) => b.value - a.value);

  // 4. Preparar datos para "VENTA OTROS"
  const totalVentasOtros = Number(dashboardState.totalSalesOtros || 0);
  const itemsOtros = (dashboardState.lablesOtros || []).map((label, idx) => {
    const cantidad = Number(dashboardState.dataOtros?.[idx] || 0);
    return {
      label: aTitulo(label),
      value: cantidad,
      amount: undefined, // En otros solo se computan unidades
    };
  }).sort((a, b) => b.value - a.value);

  // 5. Preparar datos para "GASTOS"
  const totalGastosKits = Number(dashboardState.gastosXusuario?.[0] || 0);
  const gastosData = dashboardState.gastosXusuario?.data || dashboardState.gastosXusuario || [];
  const gastosLabels = dashboardState.gastosLabels || (datosUsuario ? ['OG', 'LG'] : ['KITS', 'GUANTES']);

  const itemsGastos = (gastosLabels || []).map((label, idx) => {
    const valor = Array.isArray(gastosData)
      ? (gastosData.length === gastosLabels.length ? Number(gastosData[idx] || 0) : Number(gastosData[idx + 1] || 0))
      : 0;
    const totalG = totalGastosKits > 0 ? totalGastosKits : 1;
    const pct = totalGastosKits > 0 ? Math.round((valor / totalG) * 100) : 0;

    return {
      label: aTitulo(label),
      value: valor,
      amount: valor,
      percentage: pct,
    };
  }).filter(it => it.value > 0);

  const isAdmin = userRole === 'admin' || userRole === 'superAdmin';

  return (
    <div className="row g-3 mb-4">
      {/* COMPARATIVA VENTAS VS GASTOS (OSCAR VS LEONARDO) */}
      {isAdmin && (
        <div className="col-12">
          <CardComparativaUsuarios
            pedidos={pedidos}
            gastos={gastos}
            anioFiltro={anioFiltro}
          />
        </div>
      )}

      {/* 1. GENERAL */}
      <div className="col-12 col-md-6 col-xl-4">
        <KpiCard
          title="Resumen General"
          subtitle={`Ventas totales año ${anioFiltro}`}
          totalValue={formatearPrecio(totalVentasGeneral)}
          badgeText={datosUsuario ? 'Global' : 'Mi Usuario'}
          badgeBg={datosUsuario ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'}
          icon="fas fa-wallet"
          items={itemsGeneral}
          footerText={`Gastos: ${formatearPrecio(totalGastosAnual)} • Utilidad Estimada: ${formatearPrecio(utilidadBruta)} (${margenUtilidad}%)`}
          unitLabel="unds"
        />
      </div>

      {/* 2. KITS */}
      <div className="col-12 col-md-6 col-xl-4">
        <KpiCard
          title="Venta de Kits"
          subtitle={totalFabricaKits > 0 ? `Fábrica: ${formatearPrecio(totalFabricaKits)} • Margen: ${margenKits}%` : 'Modelos de kits'}
          totalValue={formatearPrecio(totalVentasKits)}
          badgeText={`${itemsKits.reduce((acc, it) => acc + (Number(it.value) || 0), 0)} kits`}
          badgeBg="bg-info-subtle text-info"
          icon="fas fa-box-open"
          items={itemsKits}
          unitLabel="kits"
        />
      </div>

      {/* 3. GUANTES */}
      <div className="col-12 col-md-6 col-xl-4">
        <KpiCard
          title={guantesTitle}
          subtitle={guantesSubtitle}
          totalValue={formatearPrecio(totalVentasGuantes)}
          badgeText={`${itemsGuantes.reduce((acc, it) => acc + (Number(it.value) || 0), 0)} docenas`}
          badgeBg="bg-warning-subtle text-warning"
          icon="fas fa-hand-sparkles"
          items={itemsGuantes}
          footerText={guantesFooter}
          unitLabel="docenas"
        />
      </div>

      {/* 4. OTROS */}
      <div className={`col-12 col-md-6 ${isAdmin ? 'col-xl-6' : 'col-xl-12'}`}>
        <KpiCard
          title="Otros Productos"
          subtitle="Accesorios y referencias adicionales"
          totalValue={`${formatearPrecio(totalVentasOtros)}`}
          badgeText={`${itemsOtros.reduce((acc, it) => acc + it.value, 0)} unds`}
          badgeBg="bg-secondary-subtle text-secondary"
          icon="fas fa-tags"
          items={itemsOtros}
          showAmount={false}
          unitLabel="unds"
          maxHeight="220px"
        />
      </div>

      {/* 5. GASTOS (Admin / SuperAdmin) */}
      {isAdmin && (
        <div className="col-12 col-md-12 col-xl-6">
          <KpiCard
            title={!datosUsuario ? `Gastos (${aTitulo(userName) || 'Usuario'})` : 'Gastos Kits (Oscar vs Leonardo)'}
            subtitle={datosUsuario ? 'Distribución entre Oscar Gómez y Leonardo Gómez' : 'Desglose por categorías del usuario'}
            totalValue={formatearPrecio(totalGastosKits)}
            badgeText="Operativo"
            badgeBg="bg-danger-subtle text-danger"
            icon="fas fa-receipt"
            items={itemsGastos}
            showAmount={true}
            unitLabel="$"
            maxHeight="220px"
          />
        </div>
      )}
    </div>
  );
};
