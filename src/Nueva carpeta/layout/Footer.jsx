const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-light border-top py-3 mt-auto">
            <div className="container text-center">
                <div className="mb-2">
                    <span className="text-muted">© {currentYear} Grupo Gogo. Todos los derechos reservados.</span>
                </div>                
            </div>
        </footer>
    );
};

export default Footer;
