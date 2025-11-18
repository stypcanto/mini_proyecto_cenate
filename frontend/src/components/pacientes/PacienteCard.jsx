import React from "react";

const PacienteCard = ({ paciente }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {paciente.nombre}
            </h2>
            <div className="text-gray-600 text-sm space-y-1">
                <p>
                    <span className="font-medium text-gray-700">Documento:</span>{" "}
                    {paciente.docPaciente}
                </p>
                <p>
                    <span className="font-medium text-gray-700">Sexo:</span>{" "}
                    {paciente.sexo}
                </p>
                <p>
                    <span className="font-medium text-gray-700">Fecha de nacimiento:</span>{" "}
                    {paciente.fechaNacimiento}
                </p>
            </div>
        </div>
    );
};

export default PacienteCard;
