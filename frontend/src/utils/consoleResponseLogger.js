export const logRespuestaConsola = ({
  titulo = "Consulta API",
  endpoint,
  method = "GET",
  enviado,
  status,
  devuelto,
  fuente,
  identificador,
  etiquetaIdentificador = "Ref",
  separador = "*****",
}) => {
  const referencia =
    identificador ??
    enviado?.dni ??
    enviado?.id ??
    enviado?.codigo ??
    enviado?.pk ??
    "-";
  const etiquetaFuente = fuente || "sin-fuente";

  console.log(`${separador} INICIO ${titulo.toUpperCase()} ${separador}`);
  console.groupCollapsed(
    `${separador} 🧾 ${titulo} | ${etiquetaFuente} | ${etiquetaIdentificador}: ${referencia} | HTTP ${status ?? "-"} ${separador}`
  );
  console.log("Endpoint:", endpoint);
  console.log("Método:", method);
  console.log("Enviado:", enviado);
  console.log("Devuelto:", devuelto);
  console.groupEnd();
  console.log(`${separador} FIN ${titulo.toUpperCase()} ${separador}`);
};
