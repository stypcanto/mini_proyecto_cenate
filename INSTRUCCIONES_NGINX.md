# 🔧 Configuración Nginx para TeleEKGs - v1.50.3

## Problema
El servidor nginx reverso (10.0.89.239) limita uploads a un tamaño menor que el configurado en Spring Boot, causando errores HTTP 413.

## Solución

### En el servidor 10.0.89.239, ejecutar como root:

```bash
# 1. Ubicar archivo nginx.conf
sudo find /etc -name "nginx.conf" 2>/dev/null

# 2. Hacer backup
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak.$(date +%Y%m%d)

# 3. Editar archivo
sudo nano /etc/nginx/nginx.conf
```

### Agregar/Modificar en la sección `http { }`

```nginx
http {
    # ... configuración existente ...

    # ✅ v1.50.3: Aumentar límite para uploads de ECG
    client_max_body_size 15M;  # Permite archivos hasta 15MB

    # Para uploads más grandes (ej. 50MB):
    # client_max_body_size 50M;

    # ... resto de configuración ...
}
```

### Validar y recargar

```bash
# Validar sintaxis
sudo nginx -t

# Si todo está OK, recargar
sudo systemctl reload nginx
# o
sudo service nginx reload
# o
sudo nginx -s reload
```

### Verificar

```bash
# Verificar que nginx está corriendo
sudo systemctl status nginx

# Ver logs en caso de error
sudo tail -f /var/log/nginx/error.log
```

## Valores Recomendados

| Caso | Tamaño | Razón |
|------|--------|-------|
| **ECG pequeños** | 15M | Cubre la mayoría de casos |
| **ECG medianos** | 50M | Soporta uploads múltiples |
| **ECG máximo** | 100M | Máximo configurado en Spring Boot |

## Cambios Realizados en CENATE v1.50.3

✅ Spring Boot: max-file-size=50MB, max-request-size=100MB
✅ MBAC: Permisos para INSTITUCION_EX en /teleekgs/*
✅ Migración: V3_4_1 ejecutada en BD

⚠️ Nginx: **NECESITA CONFIGURACIÓN MANUAL** (este archivo)

## Commit de Referencia

```
Commit: 2343d0a
fix(v1.50.3): Aumentar límites multipart + Configurar MBAC teleekgs para usuarios externos
```

---

**Nota:** Después de actualizar nginx, reintentar upload de ECGs en http://10.0.89.239/teleekgs/upload
