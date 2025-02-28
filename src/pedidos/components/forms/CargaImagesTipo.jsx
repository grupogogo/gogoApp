import useImage from "../../../hooks/useImage";
import { useFuntions } from "../../../hooks"


export const CargaImagesTipo = ({ onInputChangeCont, pedido, imagen, talla = 't-1', genero, categoria }) => {

    const gen = (genero === '0') ? '-O' : '-A';
    const list = (categoria === 'kcg' || categoria === 'kcp' || categoria === 'cc') ? (gen === '-A') ? 6 : 5 : 4
    const { obtenerImagen } = useFuntions();



    return (
        <>            
            {[...Array(list)].map((_, index) => (
                <div key={index} className="col-md-2 col-sm-2 p-1">
                    <div className="border border-success text-center rounded p-1">
                        <img
                            className="rounded img-fluid"
                            src={useImage(obtenerImagen(categoria, genero), index + 1)}
                            alt={`Cantidad ${index + 1}`}
                            style={{ width: "auto", height: "210px" }}
                            loading="lazy"
                        />
                        <div className="input-group mt-1">
                            <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                name={`${categoria}-${index + 1}${gen}${talla}`} // Asegúrate de que gen y talla sean accesibles
                                value={pedido.find(item => item.nombreInput === `${categoria}-${index + 1}${gen}${talla}`)?.cantidad || '0'}
                                min="0"
                                max="1000"
                                onChange={onInputChangeCont} // Llama a la función recibida
                            />
                        </div>
                    </div>
                </div>
            ))}
        </>

    )
}
