
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import Footer from "./Footer"
import '@fortawesome/fontawesome-free/css/all.min.css';
import "react-datepicker/dist/react-datepicker.css";


export const LayoutApp = ({ children }) => {
    return (
        <>            
                <div id="wrapper">
                    <Sidebar />
                    <div id="content-wrapper" className="d-flex flex-column">
                        <div id="content">
                            <Navbar />
                            {children}
                        </div>
                        <Footer />
                    </div>
                </div>            
        </>
    )
};