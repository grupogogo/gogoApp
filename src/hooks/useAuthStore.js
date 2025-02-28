import { useDispatch, useSelector } from 'react-redux'
import { gogoApi } from '../api';
import { onChecking, onLogin, onLogout, clearErrorMessage } from '../store';

export const useAuthStore = () => {

    const { status, user, errorMessage } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const startLogin = async ({ email, password }) => {
        dispatch(onChecking())
        try {
            const { data } = await gogoApi.post('/auth', { email, password })
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch(onLogin({ name: data.name, uid: data.uid, rol: data.rol }));

        } catch (error) {
            dispatch(onLogout('Credenciales Incorrectas'));
            setTimeout(() => {
                dispatch(clearErrorMessage());
            }, 10);
        }
    }

    const startRegister = async ({ email, password, name, telefono, numIdentificacion }) => {
        dispatch(onChecking());
        try {
            const { data } = await gogoApi.post('/auth/new', { email, password, name, telefono, numIdentificacion })
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());

            dispatch(onLogin({ name: data.name, uid: data.uid }));

        } catch (error) {
            dispatch(onLogout(error.response.data?.msg || '--'));
            setTimeout(() => {
                dispatch(clearErrorMessage());
            }, 10);
        }
    }

    const checkAuthToken = async () => {
        const token = localStorage.getItem('token');
        if (!token) { return dispatch(onLogout()); }
        try {
            const { data } = await gogoApi.get('auth/renew');
            localStorage.setItem('token', data.token);
            localStorage.setItem('token', data.token);
            localStorage.setItem('token-init-date', new Date().getTime());
            dispatch(onLogin({ name: data.name, uid: data.uid, rol: data.rol }));
        } catch (error) {
            localStorage.clear();
            dispatch(onLogout(error.response.data?.msg || '--'));
        }
    }

    const startLogout = () => {
        localStorage.clear();
        dispatch(onLogout());
    }
    return {
        //* Propiedades
        errorMessage,
        status,
        user,

        //* Metodos
        startLogin,
        startRegister,
        checkAuthToken,
        startLogout
    }
}
