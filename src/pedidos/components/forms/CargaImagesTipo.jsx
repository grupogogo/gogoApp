import React, { useState, useEffect } from "react";
import useImage from "../../../hooks/useImage";
import { useFuntions } from "../../../hooks";

export const CargaImagesTipo = ({ onInputChangeCont, pedido, imagen, talla = 't-1', genero, categoria }) => {
    const [tamano, setTamano] = useState('mediano'); // 'compacto' | 'mediano' | 'grande'
    const [modalData, setModalData] = useState(null); // { index, imgSrc, inputName, itemVal }

    const gen = (genero === '0') ? '-O' : '-A';

    const itemsImagn = (categoria, genero) => {
        if (categoria === 'ccon') return 3;
        if (categoria === 'kb' || categoria === 'cb') return 6;
        if (categoria === 'kce') return 6;
        if (categoria === 'cc' || categoria === 'kcg' || categoria === 'kcp') return (genero === '0') ? 5 : 7;
        return 6;
    };

    const { obtenerImagen, aTitulo } = useFuntions();
    const count = itemsImagn(categoria, genero);
    const usaLetras = ['kcg', 'kcp', 'cc', 'kce', 'kb', 'cb', 'ccon'].includes(String(categoria || '').toLowerCase());

    const obtenerEtiquetaModelo = (idx) => {
        if (usaLetras) {
            return String.fromCharCode(65 + idx); // 0 -> A, 1 -> B, 2 -> C, ...
        }
        return `#${idx + 1}`;
    };

    // Dimensiones según el tamaño seleccionado
    const configTamano = {
        compacto: { minWidth: '120px', imgHeight: '150px' },
        mediano: { minWidth: '160px', imgHeight: '200px' },
        grande: { minWidth: '220px', imgHeight: '260px' }
    }[tamano] || { minWidth: '160px', imgHeight: '200px' };

    // Cerrar modal con ESC y navegar con teclas de dirección
    useEffect(() => {
        if (!modalData) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setModalData(null);
            } else if (e.key === 'ArrowRight') {
                irASiguiente(1);
            } else if (e.key === 'ArrowLeft') {
                irASiguiente(-1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [modalData, count, talla, genero, categoria, pedido]);

    const getModelData = (idx) => {
        const inputName = `${categoria}-${idx + 1}${gen}${talla}`;
        const itemVal = pedido.find((item) => item.nombreInput === inputName)?.cantidad || "0";
        const imgSrc = useImage(obtenerImagen(categoria, genero), idx + 1);
        return { index: idx, imgSrc, inputName, itemVal };
    };

    const irASiguiente = (delta) => {
        if (!modalData) return;
        const nuevoIndex = (modalData.index + delta + count) % count;
        setModalData(getModelData(nuevoIndex));
    };

    const actualizarCantidadModal = (nuevaCantidad) => {
        if (!modalData) return;
        const cantVal = Math.max(0, parseInt(nuevaCantidad, 10) || 0).toString();
        onInputChangeCont({
            target: {
                name: modalData.inputName,
                value: cantVal
            }
        });
        setModalData(prev => prev ? { ...prev, itemVal: cantVal } : null);
    };

    return (
        <div>
            {/* BARRA DE HERRAMIENTAS: TAMAÑO Y AYUDA */}
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small fw-medium">
                        <i className="fa-regular fa-image me-1 text-primary"></i>
                        {count} modelos disponibles
                    </span>
                    <span className="badge bg-light text-muted border border-light-subtle rounded-pill small">
                        <i className="fa-solid fa-magnifying-glass-plus me-1 text-primary"></i>
                        Haz clic en una imagen para ampliar
                    </span>
                </div>

                {/* SELECTOR DE TAMAÑO DE VISTA */}
                <div className="d-flex align-items-center gap-1 bg-light p-1 rounded-pill border border-light-subtle">
                    <span className="small text-muted px-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
                        Vista:
                    </span>
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-2 py-0 border-0 ${
                            tamano === 'compacto'
                                ? 'btn-primary text-white shadow-xs fw-bold'
                                : 'btn-light text-secondary'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setTamano('compacto')}
                        title="Vista compacta"
                    >
                        Normal
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-2 py-0 border-0 ${
                            tamano === 'mediano'
                                ? 'btn-primary text-white shadow-xs fw-bold'
                                : 'btn-light text-secondary'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setTamano('mediano')}
                        title="Vista enfocada y más grande"
                    >
                        Grande
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm rounded-pill px-2 py-0 border-0 ${
                            tamano === 'grande'
                                ? 'btn-primary text-white shadow-xs fw-bold'
                                : 'btn-light text-secondary'
                        }`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setTamano('grande')}
                        title="Vista extra grande de alta visibilidad"
                    >
                        Extra
                    </button>
                </div>
            </div>

            {/* GRILLA DE MODELOS */}
            <div
                className="d-grid gap-2 gap-sm-3"
                style={{
                    gridTemplateColumns: `repeat(auto-fill, minmax(clamp(130px, calc(50% - 8px), ${configTamano.minWidth}), 1fr))`,
                }}
            >
                {[...Array(count)].map((_, index) => {
                    const inputName = `${categoria}-${index + 1}${gen}${talla}`;
                    const itemVal = pedido.find((item) => item.nombreInput === inputName)?.cantidad || "0";
                    const isSelected = parseInt(itemVal, 10) > 0;
                    const imgSrc = useImage(obtenerImagen(categoria, genero), index + 1);

                    return (
                        <div
                            key={index}
                            className={`card text-center p-2 rounded-4 transition-all position-relative image-zoom-card ${
                                isSelected
                                    ? 'border-primary shadow-sm bg-primary-subtle bg-opacity-25'
                                    : 'border-light-subtle bg-white shadow-xs'
                            }`}
                            style={{
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                            }}
                        >
                            {/* CONTENEDOR DE IMAGEN CON EFECTO ZOOM Y FOCUS */}
                            <div
                                className="position-relative mb-2 rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center image-zoom-container"
                                style={{
                                    height: configTamano.imgHeight,
                                    cursor: 'zoom-in',
                                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                }}
                                onClick={() => setModalData({ index, imgSrc, inputName, itemVal })}
                                title="Haz clic para ampliar este modelo"
                            >
                                {/* BADGE DE IDENTIFICACIÓN DE MODELO */}
                                <span
                                    className={`position-absolute top-0 start-0 m-2 badge shadow-sm fw-bolder ${
                                        isSelected 
                                            ? 'bg-primary text-white border border-primary' 
                                            : 'bg-white text-dark border border-secondary-subtle'
                                    }`}
                                    style={{ 
                                        fontSize: usaLetras ? '1rem' : '0.82rem', 
                                        fontWeight: 800,
                                        minWidth: '30px',
                                        height: '30px',
                                        borderRadius: '8px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 2,
                                        lineHeight: 1
                                    }}
                                >
                                    {obtenerEtiquetaModelo(index)}
                                </span>

                                {/* BOTÓN ICONO DE ZOOM */}
                                <span
                                    className="position-absolute top-0 end-0 m-2 badge bg-white bg-opacity-90 text-primary border shadow-xs rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: 26, height: 26, zIndex: 2 }}
                                    title="Ampliar imagen"
                                >
                                    <i className="fa-solid fa-magnifying-glass-plus" style={{ fontSize: '11px' }}></i>
                                </span>

                                {/* IMAGEN DEL PRODUCTO */}
                                <img
                                    className="rounded-2 img-fluid"
                                    src={imgSrc}
                                    alt={`Modelo ${obtenerEtiquetaModelo(index)}`}
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "100%",
                                        objectFit: "contain",
                                        padding: '8px',
                                        transition: 'transform 0.25s ease-in-out',
                                        filter: 'contrast(1.03)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.09)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                    loading="lazy"
                                />

                                {/* FOOTER SUTIL DE CLICK */}
                                <div
                                    className="position-absolute bottom-0 start-0 end-0 py-1 text-center bg-dark bg-opacity-75 text-white small image-zoom-banner"
                                    style={{ fontSize: '0.7rem', backdropFilter: 'blur(2px)' }}
                                >
                                    <i className="fa-solid fa-up-right-and-down-left-from-center me-1"></i>
                                    Ampliar
                                </div>
                            </div>

                            {/* CONTROL DE CANTIDAD */}
                            <div className="input-group input-group-sm">
                                <span className={`input-group-text small px-2 fw-semibold ${isSelected ? 'bg-primary text-white border-primary' : 'bg-light text-muted'}`}>
                                    Cant.
                                </span>
                                <input
                                    type="number"
                                    className={`form-control form-control-sm text-center fw-bold shadow-none ${
                                        isSelected ? 'border-primary text-primary bg-white' : 'border-light-subtle'
                                    }`}
                                    name={inputName}
                                    value={itemVal}
                                    onFocus={(e) => e.target.select()}
                                    min="0"
                                    max="1000"
                                    onChange={onInputChangeCont}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL LIGHTBOX DE ZOOM Y ENFOQUE MEJORADO */}
            {modalData && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.78)',
                        backdropFilter: 'blur(6px)',
                        zIndex: 1060,
                    }}
                    onClick={() => setModalData(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        role="document"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '640px' }}
                    >
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden bg-white">
                            {/* CABECERA MODAL */}
                            <div className="modal-header border-bottom py-2 px-3 bg-light d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-primary text-white rounded-pill px-3 py-1 fw-bold fs-6">
                                        Modelo {obtenerEtiquetaModelo(modalData.index)}
                                    </span>
                                    <span className="fw-semibold text-dark small">
                                        {aTitulo ? aTitulo(categoria) : categoria.toUpperCase()} • {genero === '0' ? 'Niño' : 'Niña'}
                                        {talla && talla !== 't-1' ? ` (${talla.toUpperCase()})` : ''}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close shadow-none"
                                    onClick={() => setModalData(null)}
                                    aria-label="Close"
                                ></button>
                            </div>

                            {/* CUERPO DEL MODAL CON IMAGEN AMPLIA */}
                            <div className="modal-body p-4 text-center position-relative bg-white">
                                {/* BOTÓN NAVEGAR ANTERIOR */}
                                <button
                                    type="button"
                                    className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                    style={{ width: 42, height: 42, zIndex: 3 }}
                                    onClick={() => irASiguiente(-1)}
                                    title="Modelo anterior (Flecha Izquierda)"
                                >
                                    <i className="fa-solid fa-chevron-left text-dark"></i>
                                </button>

                                {/* IMAGEN PRINCIPAL EN GRANDE */}
                                <div
                                    className="p-3 rounded-3 mx-auto d-flex align-items-center justify-content-center"
                                    style={{
                                        maxHeight: '62vh',
                                        background: 'radial-gradient(circle, #ffffff 40%, #f8fafc 100%)',
                                        border: '1px solid rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <img
                                        src={modalData.imgSrc}
                                        alt={`Modelo ${obtenerEtiquetaModelo(modalData.index)}`}
                                        className="img-fluid rounded-3"
                                        style={{
                                            maxHeight: '52vh',
                                            maxWidth: '100%',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.08))',
                                        }}
                                    />
                                </div>

                                {/* BOTÓN NAVEGAR SIGUIENTE */}
                                <button
                                    type="button"
                                    className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                    style={{ width: 42, height: 42, zIndex: 3 }}
                                    onClick={() => irASiguiente(1)}
                                    title="Modelo siguiente (Flecha Derecha)"
                                >
                                    <i className="fa-solid fa-chevron-right text-dark"></i>
                                </button>
                            </div>

                            {/* PIE DEL MODAL CON CONTROL DIRECTO DE CANTIDAD */}
                            <div className="modal-footer border-top py-2 px-3 bg-light d-flex align-items-center justify-content-between flex-wrap gap-2">
                                <div className="text-muted small">
                                    Usa <kbd className="bg-white text-dark border px-1">←</kbd> y <kbd className="bg-white text-dark border px-1">→</kbd> para navegar
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-semibold small text-dark">Cantidad:</span>
                                    <div className="input-group input-group-sm" style={{ width: 140 }}>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => actualizarCantidadModal(Math.max(0, parseInt(modalData.itemVal || '0', 10) - 1))}
                                        >
                                            <i className="fa-solid fa-minus small"></i>
                                        </button>
                                        <input
                                            type="number"
                                            className="form-control text-center fw-bold shadow-none"
                                            value={modalData.itemVal}
                                            onChange={(e) => actualizarCantidadModal(e.target.value)}
                                            min="0"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => actualizarCantidadModal((parseInt(modalData.itemVal || '0', 10) || 0) + 1)}
                                        >
                                            <i className="fa-solid fa-plus small"></i>
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-dark rounded-pill px-3"
                                        onClick={() => setModalData(null)}
                                    >
                                        Listo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
