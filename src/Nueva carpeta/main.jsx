import ReactDOM from 'react-dom/client'
import { GogoApp } from './GogoApp.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './custom.scss'; // tus sobrescrituras personalizadas deben ir al final
import './styles.css';  // este también al final
import '@fortawesome/fontawesome-free/css/all.min.css';




ReactDOM.createRoot(document.getElementById('root')).render(
    <GogoApp />
);