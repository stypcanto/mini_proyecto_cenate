import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    getPersonalCntByUsuario,
    getPersonalExternoById,
} from "../../api/personal";
import { useAuth } from "../../hooks/useAuth";
import { Edit3 } from "lucide-react";
import PersonalCard from "../../components/ui/PersonalCard";

const Profile = () => {
    const { user } = useAuth();
    const [personal, setPersonal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isExterno, setIsExterno] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user) return;

                // Detectar si es personal interno o externo según su rol
                const esInterno =
                    user.roles?.some((r) =>
                        ["MEDICO", "ENFERMERIA", "OBSTETRA", "FARMACIA", "LABORATORIO"].includes(
                            r
                        )
                    ) ?? false;

                let data;
                if (esInterno) {
                    data = await getPersonalCntByUsuario(user.id);
                } else {
                    setIsExterno(true);
                    data = await getPersonalExternoById(user.id);
                }

                setPersonal(data);
            } catch (err) {
                console.error("❌ Error al cargar perfil:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading)
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-600">
                Cargando perfil...
            </div>
        );

    if (!personal)
        return (
            <div className="flex flex-col items-center justify-center h-screen text-gray-600">
                <p>No se encontró información personal asociada.</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                <div className="flex flex-col md:flex-row items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Mi Perfil</h1>
                        <p className="text-gray-500 mt-1">
                            {isExterno ? "Profesional Externo" : "Personal CENATE"}
                        </p>
                    </div>

                    <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition">
                        <Edit3 className="w-5 h-5" />
                        Editar Perfil
                    </button>
                </div>

                <PersonalCard personal={personal} />
            </motion.div>
        </div>
    );
};

export default Profile;