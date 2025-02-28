import { addHours, differenceInSeconds } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import Modal from 'react-modal'
import 'react-datepicker/dist/react-datepicker.css';

import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale/es';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css'
import { useCalendarStore, useUiStore } from '../../hooks';


registerLocale('es', es);
const customStyles = {
    content: {
        //width: 'calc(100vw - 600px)',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};
Modal.setAppElement('#root');

export const CalendarModal = () => {
    
    const { isDateModalOpen, closeDateModal } = useUiStore();
    const { activeEvent, startSavingEvent } = useCalendarStore();
    const [formSumitted, setFormSumitted] = useState(false);
    const [formValues, setFormValues] = useState({
        title: '',
        note: '',
        start: new Date(),
        end: addHours(new Date(), 2),
    });

    const titleClass = useMemo(() => {

        return (formValues.title.length > 0)
            ? 'is-valid'
            : 'is-invalid'
    }, [formValues.title, formSumitted]);

    useEffect(() => {
        if (activeEvent !== null) {
            setFormValues({ ...activeEvent });
        }

    }, [activeEvent])


    const onDateChanged = (event, changing) => {
        setFormValues({
            ...formValues,
            [changing]: event
        });
    }

    const onInputChange = ({ target }) => {
        setFormValues({
            ...formValues,
            [target.name]: target.value
        })
    }
    const onCloseModal = () => {
        closeDateModal();
    }

    const onSubmit = async(event) => {
        event.preventDefault();
        setFormSumitted(true);

        const difference = differenceInSeconds(formValues.end, formValues.start);
        if (isNaN(difference) || difference <= 0) {
            Swal.fire('Fechas incorrectas', 'Revisar las fechas ingresadas', 'error')
            return;
        }
        if (formValues.title.length <= 0) return;
        //TODO: 
        await startSavingEvent(formValues);
        closeDateModal();

    }
    return (
        <>
            <Modal
                isOpen={isDateModalOpen}
                onRequestClose={onCloseModal}
                style={customStyles}
                className="modal"
                overlayClassName="modal-fondo"
                closeTimeoutMS={200}
            >
                <h1> Nuevo evento </h1>
                <hr />
                <form className="container" onSubmit={onSubmit}>

                    <div className="form-group mb-2">
                        <label>Fecha y hora inicio</label>
                        <br />
                        <DatePicker
                            className="form-control"
                            selected={formValues.start}
                            onChange={(event) => onDateChanged(event, 'start')}
                            dateFormat="Pp"
                            showTimeSelect
                            locale="es"
                            timeCaption='hora'
                        />
                    </div>

                    <div className="form-group mb-2">
                        <label>Fecha y hora fin</label>
                        <br />
                        <DatePicker
                            className="form-control"
                            minDate={formValues.start}
                            selected={formValues.end}
                            onChange={(event) => onDateChanged(event, 'end')}
                            dateFormat="Pp"
                            showTimeSelect
                            locale="es"
                            timeCaption='hora'
                        />
                    </div>

                    <hr />
                    <div className="form-group mb-2">
                        <label>Titulo y notas</label>
                        <input
                            type="text"
                            className={`form-control ${titleClass}`}
                            placeholder="Título del evento"
                            name="title"
                            autoComplete="off"
                            value={formValues.title}
                            onChange={onInputChange}
                        />
                        <small id="emailHelp" className="form-text text-muted">Una descripción corta</small>
                    </div>

                    <div className="form-group mb-2">
                        <textarea
                            type="text"
                            className="form-control"
                            placeholder="Notas"
                            rows="5"
                            name="notes"
                            value={formValues.notes}
                            onChange={onInputChange}
                        ></textarea>
                        <small id="emailHelp" className="form-text text-muted">Información adicional</small>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-outline-primary btn-block"
                    >
                        <i className="far fa-save"></i>
                        <span> Guardar</span>
                    </button>

                </form>
            </Modal>

        </>
    )
}
