import useImage from "../../../hooks/useImage";
import { useFuntions } from "../../../hooks"


export const CargaImagesTipo = ({ onInputChangeCont, pedido, imagen, talla = 't-1', genero, categoria }) => {

    const gen = (genero === '0') ? '-O' : '-A';

    const itemsImagn = (categoria, genero) => {
        if (categoria === 'kb' || categoria === 'cb') return 6;
        if (categoria === 'kce') return 6;
        if (categoria === 'cc' || categoria === 'kcg' || categoria === 'kcp') return (genero === '0') ? 5 : 7;
    }

    const { obtenerImagen } = useFuntions();


    return (
        <div
            className="d-grid gap-2"
            style={{
                gridTemplateColumns: `repeat(${itemsImagn(categoria, genero)}, 1fr)`, // divide el espacio según list
            }}
        >
            {[...Array(itemsImagn(categoria, genero))].map((_, index) => (
                <div key={index} className="text-center rounded p-1">
                    <img
                        className="border rounded img-fluid shadow-lg"
                        src={useImage(obtenerImagen(categoria, genero), index + 1)}
                        alt={`Cantidad ${index + 1}`}
                        style={{ width: "100%", maxHeight: "210px", objectFit: "contain" }}
                        loading="lazy"
                    />
                    <div className="input-group mt-1">
                        <input
                            type="number"
                            className="form-control form-control-sm text-center"
                            name={`${categoria}-${index + 1}${gen}${talla}`}
                            value={
                                pedido.find(
                                    (item) =>
                                        item.nombreInput === `${categoria}-${index + 1}${gen}${talla}`
                                )?.cantidad || "0"
                            }
                            onFocus={(e) => e.target.select()}
                            min="0"
                            max="1000"
                            onChange={onInputChangeCont}
                        />
                    </div>
                </div>
            ))}
        </div>
    );

}
