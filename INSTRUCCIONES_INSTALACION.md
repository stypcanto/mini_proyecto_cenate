# 🚀 Instrucciones de Instalación y Ejecución

## 📦 Archivos Creados

### Frontend (React)
```
frontend/
├── src/
│   ├── pages/
│   │   └── TransferenciaExamenesPage.jsx  ✅ Página principal
│   ├── components/
│   │   ├── ExamenModal.jsx                ✅ Modal para crear/editar
│   │   └── ConfirmDialog.jsx              ✅ Diálogo de confirmación
│   ├── hooks/
│   │   └── useExamenes.js                 ✅ Hook personalizado
│   ├── api/
│   │   └── examenes.js                    ✅ Servicios API
│   └── App.js                             ✅ Actualizado con routing
├── package.json                           ✅ Actualizado con dependencias
└── TRANSFERENCIA_EXAMENES_README.md       ✅ Documentación
```

## 🔧 Paso 1: Instalar Dependencias

Abre una terminal y ejecuta:

```bash
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend
npm install
```

Esto instalará las nuevas dependencias:
- `react-router-dom@^6.28.0` - Para el routing
- `lucide-react@^0.263.1` - Para los iconos

## 🖥️ Paso 2: Ejecutar en Desarrollo

### Opción A: Sin Docker (Desarrollo local)

```bash
# Asegúrate de estar en el directorio frontend
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend

# Iniciar el servidor de desarrollo
npm start
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

### Opción B: Con Docker (Producción)

```bash
# Volver al directorio raíz del proyecto
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate

# Reconstruir solo el frontend
docker-compose build --no-cache frontend

# Levantar todos los servicios
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker ps
```

La aplicación estará disponible en:
- Frontend: `http://localhost`
- Backend: `http://localhost:8080`

## 🌐 Paso 3: Navegar a las Páginas

Una vez que la aplicación esté corriendo, verás un menú de navegación en la parte superior con dos opciones:

1. **Pacientes** - `/` (página existente)
2. **Transferencia de Exámenes** - `/transferencia-examenes` (nueva página)

## ✅ Verificar que Todo Funciona

### En la página de Transferencia de Exámenes deberías poder:

1. ✅ Ver los logos de EsSalud y CENATE en el header
2. ✅ Ver el campo IPRESS deshabilitado con el valor por defecto
3. ✅ Seleccionar Modalidad de Atención, Nivel de Atención y Tipo de Examen
4. ✅ Ver una tabla con 7 exámenes de ejemplo
5. ✅ Buscar exámenes por nombre o código
6. ✅ Hacer clic en el botón "NUEVO" para abrir el modal
7. ✅ Hacer clic en el icono de editar (lápiz) para editar un examen
8. ✅ Hacer clic en el icono de eliminar (basura) para eliminar un examen
9. ✅ Ver badges de color verde para "Activo" y rojo para "Inactivo"

## 📝 Funcionalidades Actuales (Mock Data)

### ✅ Implementado:
- Interfaz completa según el diseño UI/UX
- Modal para crear/editar exámenes
- Diálogo de confirmación para eliminar
- Búsqueda por nombre y código (filtrado local)
- Estados visuales (Activo/Inactivo)
- Responsive design
- Navegación entre páginas

### ⏳ Pendiente (Requiere Backend):
- Conexión real con la API
- Paginación desde el servidor
- Persistencia de datos
- Validaciones del servidor
- Manejo de errores del servidor

## 🔌 Paso 4: Conectar con el Backend (Próximo)

Para conectar con el backend real, necesitarás:

### 1. Crear las entidades Java:

```java
// backend/src/main/java/styp/com/cenate/model/Examen.java
@Entity
@Table(name = "examenes")
public class Examen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String codigo;
    private String nombre;
    private String estado;
    private String ipressTransferencia;
    private String modalidadAtencion;
    private String nivelAtencion;
    private String tipoExamen;
    
    // Getters y Setters
}
```

### 2. Crear el repositorio:

```java
// backend/src/main/java/styp/com/cenate/repository/ExamenRepository.java
public interface ExamenRepository extends JpaRepository<Examen, Long> {
    Page<Examen> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
    Page<Examen> findByCodigo(String codigo, Pageable pageable);
}
```

### 3. Crear el controlador:

```java
// backend/src/main/java/styp/com/cenate/api/ExamenController.java
@RestController
@RequestMapping("/api/examenes")
@CrossOrigin(origins = "*")
public class ExamenController {
    
    @Autowired
    private ExamenRepository examenRepository;
    
    @GetMapping
    public Page<Examen> getExamenes(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return examenRepository.findAll(PageRequest.of(page, size));
    }
    
    @GetMapping("/buscar")
    public Page<Examen> buscarExamenes(
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String codigo,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        // Implementar lógica de búsqueda
    }
    
    @PostMapping
    public Examen createExamen(@RequestBody Examen examen) {
        return examenRepository.save(examen);
    }
    
    @PutMapping("/{id}")
    public Examen updateExamen(@PathVariable Long id, @RequestBody Examen examen) {
        examen.setId(id);
        return examenRepository.save(examen);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExamen(@PathVariable Long id) {
        examenRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
```

### 4. Actualizar el frontend:

En `TransferenciaExamenesPage.jsx`, descomentar las líneas:

```javascript
// Descomentar estas líneas:
import useExamenes from '../hooks/useExamenes';

const {
  examenes,
  loading,
  error,
  searchExamenes,
  createExamen,
  updateExamen,
  deleteExamen
} = useExamenes();

// Y comentar el mock data
```

### 5. Crear la tabla en PostgreSQL:

```sql
CREATE TABLE examenes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(500) NOT NULL,
    estado VARCHAR(20) DEFAULT 'Activo',
    ipress_transferencia VARCHAR(200),
    modalidad_atencion VARCHAR(50),
    nivel_atencion VARCHAR(50),
    tipo_examen VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de ejemplo
INSERT INTO examenes (codigo, nombre, estado, ipress_transferencia, modalidad_atencion, nivel_atencion, tipo_examen)
VALUES 
('87220', 'KOH - EXAMEN DE TEJIDOS PARA HONGOS', 'Activo', 'H.N. ALBERTO SABOGAL SOLOGUREN', 'Ambulatorio', 'Nivel III', 'Especializado'),
('87220', 'ESTUDIOS DE SENSIBILIDAD A ANTIBIOTICOS; METODO DE DISCO, POR PLACA', 'Activo', 'NINGUNA', 'Ambulatorio', 'Nivel II', 'Rutina');
```

## 🐛 Solución de Problemas

### Error: "Module not found: react-router-dom"
```bash
npm install react-router-dom@^6.28.0
```

### Error: "Module not found: lucide-react"
```bash
npm install lucide-react@^0.263.1
```

### Los logos no se muestran
Verifica que los archivos estén en:
- `/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend/public/images/Logo ESSALUD Azul.png`
- `/Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/frontend/public/images/Logo CENATE Azul.png`

### Docker no reconstruye
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Documentación Adicional

- React Router: https://reactrouter.com/
- Lucide React Icons: https://lucide.dev/
- Tailwind CSS: https://tailwindcss.com/

## 🎉 ¡Listo!

Tu página de Transferencia de Exámenes está ahora completamente funcional con datos de ejemplo (mock data). Una vez que conectes el backend, tendrás un sistema completo de gestión de exámenes de laboratorio.

---

**Última actualización:** 08/10/2025  
**Estado:** ✅ Frontend completo - ⏳ Backend pendiente
