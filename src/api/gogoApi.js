import axios from "axios";
import { getEnvVaribles } from "../helpers/getEnvVariables";

const { VITE_API_URL } = getEnvVaribles();

const gogoApi = axios.create({
    baseURL: VITE_API_URL
});

//Todo: Configurar interceptores
gogoApi.interceptors.request.use(config => {
    config.headers = {
        ...config.headers,
        'x-token': localStorage.getItem('token')
    }
    return config;
})
export default gogoApi;