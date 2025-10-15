SELECT *
FROM vw_auditoria_detallada
ORDER BY fecha_hora DESC
LIMIT 5;



[
  {
    "fecha_hora": "2025-10-15T06:59:35.244744",
    "usuario_sesion": "scantor",
    "usuario": {
      "id_user": 1,
      "username": "scantor",
      "dni": "44914706",
      "nombre_completo": "STYP CANTO RONDON",
      "roles": ["SUPERADMIN"],
      "correo_corporativo": "nuevo.correo@essalud.gob.pe",
      "correo_personal": "styp611@outlook.com"
    },
    "evento": {
      "modulo": "dim_usuarios",
      "accion": "DELETE",
      "estado": "SUCCESS",
      "tipo_evento": "🔴 Eliminación de registro",
      "id_afectado": null,
      "detalle": [
        "reset_token_expires_at → NULL",
        "failed_attempts → 0",
        "locked_until → NULL",
        "name_user → nuevo_user",
        "stat_user → A",
        "created_at → 2025-10-15T06:54:26.709733+00:00"
      ]
    },
    "origen": {
      "ip": null,
      "dispositivo": ""
    }
  },
  {
    "fecha_hora": "2025-10-15T02:12:00.751423",
    "usuario_sesion": "scantor",
    "usuario": {
      "id_user": 1,
      "username": "scantor",
      "dni": "44914706",
      "nombre_completo": "STYP CANTO RONDON",
      "roles": ["SUPERADMIN"],
      "correo_corporativo": "nuevo.correo@essalud.gob.pe",
      "correo_personal": "styp611@outlook.com"
    },
    "evento": {
      "modulo": "dim_personal_externo",
      "accion": "UPDATE",
      "estado": "SUCCESS",
      "tipo_evento": "🟡 Modificación de registro",
      "id_afectado": 2,
      "detalle": [
        "movil_ext: 999888777 → 999777666",
        "updated_at: 2025-10-15T02:10:57 → 2025-10-15T02:12:00"
      ]
    },
    "origen": {
      "ip": "192.168.1.77",
      "dispositivo": "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5)"
    }
  }
]


Ejemplo 1 — Obtener todos los registros de auditoría

curl -X GET http://localhost:8080/api/auditoria \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token_jwt>"


  Ejemplo 2 — Filtrar por usuario

  curl -X GET "http://localhost:8080/api/auditoria?usuario=scantor" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <tu_token_jwt>"


 Ejemplo 3 — Filtrar por módulo o tipo de acción

 curl -X GET "http://localhost:8080/api/auditoria?modulo=dim_usuarios&accion=DELETE" \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer <tu_token_jwt>"


Ejemplo 4 — Registrar manualmente (si deseas probar inserciones)

curl -X POST http://localhost:8080/api/auditoria \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -d '{
    "usuario": "scantor",
    "modulo": "dim_personal_externo",
    "accion": "UPDATE",
    "estado": "SUCCESS",
    "detalle": "Cambio en correo y teléfono",
    "ip": "192.168.1.77",
    "dispositivo": "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_5)"
  }'



Tip extra: integrar en backend

Cuando tu backend esté listo, solo asegúrate de que:
	1.	Tu AuditController tenga endpoints tipo:

	@GetMapping("/auditoria")
    public List<AuditoriaDTO> listar(@RequestParam Optional<String> usuario, @RequestParam Optional<String> modulo, ...) { ... }

    2.	Y si usas JWT, que la cabecera Authorization esté bien seteada:

    -H "Authorization: Bearer $(cat token.txt)"


