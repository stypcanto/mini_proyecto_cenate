import React, { useEffect, useState } from "react";
import { API_BASE } from "../../config/api";
import TabsMenu from "./ui/TabsMenu";
import SearchBar from "./ui/SearchBar";
import UsuariosTable from "./tables/UsuariosTable";
import PersonalTable from "./tables/PersonalTable";
import TiposDocumentoTable from "./tables/TiposDocumentoTable";
import AreasTable from "./tables/AreasTable";
import RegimenesLaboralesTable from "./tables/RegimenesLaboralesTable";
import { RefreshCw } from "lucide-react";

export default function AdminUsersManagement() {
    const [usuarios, setUsuarios] = useState([]);
    const [personal, setPersonal] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [areas, setAreas] = useState([]);
    const [regimenesLaborales, setRegimenesLaborales] = useState([]);
    const [activeTab, setActiveTab] = useState("usuarios");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 📥 Carga de datos inicial
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [usuariosRes, personalRes, tiposRes, areasRes, regimenesRes] = await Promise.all([
                    fetch(`${API_BASE}/usuarios`).then(r => r.json()),
                    fetch(`${API_BASE}/personal`).then(r => r.json()),
                    fetch(`${API_BASE}/tipos-documento`).then(r => r.json()),
                    fetch(`${API_BASE}/areas`).then(r => r.json()),
                    fetch(`${API_BASE}/regimenes-laborales`).then(r => r.json())
                ]);
                setUsuarios(usuariosRes);
                setPersonal(personalRes);
                setTiposDocumento(tiposRes);
                setAreas(areasRes);
                setRegimenesLaborales(regimenesRes);
            } catch (err) {
                console.error("❌ Error al cargar datos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="p-12 text-center">
                    <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600">Cargando datos...</p>
                </div>
            );
        }

        switch (activeTab) {
            case "usuarios":
                return <UsuariosTable usuarios={usuarios} personal={personal} searchTerm={searchTerm} />;
            case "personal":
                return <PersonalTable data={personal} searchTerm={searchTerm} />;
            case "tiposDocumento":
                return <TiposDocumentoTable data={tiposDocumento} searchTerm={searchTerm} />;
            case "areas":
                return <AreasTable data={areas} searchTerm={searchTerm} />;
            case "regimenesLaborales":
                return <RegimenesLaboralesTable data={regimenesLaborales} searchTerm={searchTerm} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Usuarios y Personal</h1>

            <TabsMenu activeTab={activeTab} onChange={setActiveTab} />

            <div className="mb-6">
                <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </div>

            {renderContent()}
        </div>
    );
}
