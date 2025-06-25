import { useState } from "react";
import { Table, Header, HeaderRow, Body, Row, Cell } from "@table-library/react-table-library/table";
import * as XLSX from "xlsx";
import { useTheme } from "@table-library/react-table-library/theme";
import { useClientesStore, useFuntions } from "../hooks";
import { useSelector } from "react-redux";


const ExcelReader = () => {

    const [tableData, setTableData] = useState({ nodes: [] });
    const { formatearPrecio, convertirFechaIngles } = useFuntions();
    const [search, setSearch] = useState("");
    const { datosClientes } = useSelector(state => state.clientes);


    const handleSearch = (event) => {
        setSearch(event.target.value);
    };
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const workbook = XLSX.read(bstr, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const data = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                raw: false,
                cellDates: true,
            });

            const cleanedData = data
                .filter(
                    (row) =>
                        Array.isArray(row) &&
                        row.length > 3 &&
                        typeof row[0] !== "undefined" &&
                        !String(row[0]).includes("NIT")
                )
                .map((row) => {
                    const fecha = row[7];
                    let fechaFormateada = "";

                    if (fecha instanceof Date) {
                        fechaFormateada = fecha.toLocaleDateString("es-CO");
                    } else if (typeof fecha === "string") {
                        fechaFormateada = fecha;
                    }
                    //console.log(row)
                    return {
                        CODIGO: row[0]?.toString().trim() || "",
                        PRODUCTO: row[1]?.toString().trim() || "",
                        CANTIDAD: row[2] ? parseFloat(row[2].toString().trim().replace(/,/g, "")) : 0,
                        PRECIO: row[3] ? parseFloat(row[3].toString().trim().replace(/,/g, "")) : 0,
                        TOTAL: row[4] ? parseFloat(row[4].toString().trim().replace(/,/g, "")) : 0,
                        REMISION: row[5]?.toString().trim() || "",
                        HORA: row[6] ? parseFloat(row[6].toString().trim().replace(/,/g, "")) : 0,
                        FECHA: fechaFormateada?.toString().trim() || "",
                        PRECIOFABRICA: row[8] ? parseFloat(row[8].toString().trim().replace(/,/g, "")) : 0,
                        NIT: row[9]?.toString().trim() || "",
                    };
                });

            setTableData({ nodes: cleanedData });
        };
        reader.readAsBinaryString(file);
    };
    const filteredData = {
        nodes: tableData.nodes
            .filter((item) =>
            (
                //item.CLIENTE.toLowerCase().includes(search.toLowerCase()) ||
                item.FECHA.toLowerCase().includes(search.toLowerCase())
                //item.REMISION.toLowerCase().includes(search.toLowerCase())
            )
            )
            .filter((item) => item.FECHA) // Validar que la fecha sea utilizable
            .sort((a, b) => {
                const fechaA = convertirFechaIngles(a.FECHA);
                const fechaB = convertirFechaIngles(b.FECHA);
                return fechaB - fechaA; // Ordenar de más reciente a más antigua
            }),
    };
    const obtenerNombreCliente = (nit) => {
        const cliente = datosClientes.find((c) => c.NIT === nit?.toString());
        return cliente ? cliente.NOMBRE : "Desconocido";
    };
    const sizeColumnTheme = {
        Table: `
              --data-table-library_grid-template-columns: 
                  auto auto auto auto auto auto auto auto auto auto !important;
          `,
    };
    const theme = useTheme([sizeColumnTheme]);
    console.log(filteredData.nodes);

    return (
        <>
            {/* Columna para el input */}
            <div className="col-6">
                <label htmlFor="estadoSelect" className="form-label fw-semibold">Buscar:</label>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filtro (Fecha, cliente, remisión, NIT)"
                        value={search}
                        onChange={handleSearch}
                    />
                    <div className="input-group-append">
                        <button className="btn border" type="button">
                            <i className="fas fa-search fa-sm" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="card mt-4">
                <div className="container mt-4">
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="mb-3"
                    />

                    <Table
                        className="table table-hover text-start w-100 compact-table"
                        style={{ maxWidth: "100%" }}
                        data={filteredData}
                        theme={theme}

                    >
                        {(tableList) => (
                            <>
                                <Header>
                                    <HeaderRow className="text-center" style={{ background: "red" }}>
                                        <Cell className="fw-semibold">CODIGO</Cell>
                                        <Cell className="fw-semibold">PRODUCTO</Cell>
                                        <Cell className="fw-semibold">CANTIDAD</Cell>
                                        <Cell className="fw-semibold">PRECIO</Cell>
                                        <Cell className="fw-semibold">TOTAL</Cell>
                                        <Cell className="fw-semibold">REMISION</Cell>
                                        <Cell className="fw-semibold">HORA</Cell>
                                        <Cell className="fw-semibold">FECHA</Cell>
                                        <Cell className="fw-semibold">PRECIOFABRICA</Cell>
                                        <Cell className="fw-semibold">NIT</Cell>
                                    </HeaderRow>
                                </Header>

                                <Body>
                                    <Row>
                                        <Cell></Cell>
                                        <Cell></Cell>
                                        <Cell></Cell>
                                        <Cell></Cell>
                                        <Cell></Cell>
                                        <Cell></Cell>
                                        <Cell></Cell>
                                        <Cell></Cell>
                                        <Cell colSpan={3} className="text-end fw-semibold">Total ventas:</Cell>
                                        <Cell className="text-end fw-bold">
                                            {formatearPrecio(filteredData.nodes.reduce((acc, item) => acc + item.TOTAL, 0))}
                                        </Cell>
                                    </Row>
                                    {tableList.map((item, index) => (
                                        <Row key={index} item={item}>
                                            <Cell>{item.CODIGO}</Cell>
                                            <Cell>{item.PRODUCTO}</Cell>
                                            <Cell>{item.CANTIDAD}</Cell>
                                            <Cell>{item.PRECIO}</Cell>
                                            <Cell>{item.TOTAL}</Cell>
                                            <Cell>{item.REMISION}</Cell>
                                            <Cell>{item.HORA}</Cell>
                                            <Cell>{item.FECHA}</Cell>
                                            <Cell>{item.PRECIOFABRICA}</Cell>
                                            <Cell>{item.NIT}</Cell>
                                        </Row>
                                    ))}

                                </Body>
                            </>
                        )}
                    </Table>
                </div>
            </div>
        </>
    );
};

export default ExcelReader;
