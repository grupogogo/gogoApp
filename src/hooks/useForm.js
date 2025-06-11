import { useEffect, useMemo, useState } from 'react';
import { useClientesStore } from './useClientesStore';

export const useForm = (initialForm = {}, formValidations = {}) => {

    const [formState, setFormState] = useState(initialForm);
    const [formValidation, setFormValidation] = useState({})
    const [showModal, setShowModal] = useState(false);


    const handleClose = () => setShowModal(false);
    const handleShow = () => {
        setShowModal(true);
    }

    useEffect(() => { //Se ejecuta cada vez que hay algun cambio en el formState es decir en algun campo del formulario
        createValidators();
    }, [formState])


    const isFormValid = useMemo(() => {
        for (const formValue of Object.keys(formValidation)) {
            if (formValidation[formValue] !== null) return (false);
        }
        return (true);
    }, [formValidation])

    const onInputChange = ({ target }) => {
        const { name, value } = target;
        // Validamos si el input pertenece a 'precioKits', 'precioCirios' o 'precioGuantes'
        if (name === 'kcg' || name === 'kcp' || name === 'kb') {
            setFormState((prev) => ({
                ...prev,
                precios: {
                    ...prev.precios,
                    precioKits: {
                        ...prev.precios.precioKits,  // Correctamente accedemos a 'precioKits'
                        [name]: value        // Actualizamos el valor del campo en 'precioKits'
                    }
                }
            }));
        } else if (name === 'cc' || name === 'cb') {
            setFormState((prev) => ({
                ...prev,
                precios: {
                    ...prev.precios,
                    precioCirios: {
                        ...prev.precios.precioCirios,  // Correctamente accedemos a 'precioCirios'
                        [name]: value          // Actualizamos el valor del campo en 'precioCirios'
                    }
                }
            }));
        } else if (name === 'gb' || name === 'gn' || name === 'gm') {
            setFormState((prev) => ({
                ...prev,
                precios: {
                    ...prev.precios,
                    precioGuantes: {
                        ...prev.precios.precioGuantes,  // Correctamente accedemos a 'precioGuantes'
                        [name]: value           // Actualizamos el valor del campo en 'precioGuantes'
                    }
                }
            }));
        } else {
            // Si es otro campo, lo actualizamos normalmente
            setFormState((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const onInputNumbersChange = ({ target }) => {
        const { name, value } = target;

        // Permitir que el campo quede vacío cuando se borra todo
        if (value === '') {
            setFormState((prev) => ({
                ...prev,
                [name]: ''
            }));
            return;
        }

        let formattedValue = value;

        if (name === 'precio') {
            // Permitir números con punto o coma como separador decimal
            if (!/^\d*[\.,]?\d*$/.test(value)) return;

            // Reemplazar coma por punto para estandarizar el formato decimal
            formattedValue = value.replace(',', '.');
        } else {
            // Para otros campos, solo números enteros
            if (!/^\d*$/.test(value)) return;
        }

        setFormState((prev) => ({
            ...prev,
            [name]: formattedValue
        }));
    };



    const onResetForm = () => {
        setFormState(initialForm);
    }

    const createValidators = () => {
        const formCheckedValues = {};

        for (const formFiel of Object.keys(formValidations)) {
            const [fn, errorMessage] = formValidations[formFiel];
            formCheckedValues[`${formFiel}Valid`] = fn(formState[formFiel]) ? null : errorMessage;
        }
        setFormValidation(formCheckedValues);

    }

    return {
        ...formState,
        formState,
        onInputChange,
        onInputNumbersChange,
        onResetForm,
        handleClose,
        handleShow,

        ...formValidation,
        isFormValid,
        showModal,
        setFormState
    }
}