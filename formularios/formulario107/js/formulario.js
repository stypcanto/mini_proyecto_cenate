
    // ⬇️ CONFIGURACIÓN - Cambia según tu entorno
    const API_BASE = "http://localhost:8080/api/import-excel";
    
    let selectedFile = null;
    let importResult = null;
    let tableItems = null;
    let tableErrores = null;

    // Configurar zona de arrastre
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');

    // ✅ CORRECCIÓN: Evitar doble click
    uploadZone.addEventListener('click', (e) => {
        // Solo abrir si NO se hizo click en el botón
        if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
            fileInput.click();
        }
    });
    
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    function handleFileSelect(file) {
        const allowed = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];
        const nameOk = /\.(xlsx|xls)$/i.test(file.name);
        const typeOk = !file.type || allowed.includes(file.type);

        if (!nameOk || !typeOk) {
            alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
            return;
        }

        selectedFile = file;
        
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        document.getElementById('fileInfo').style.display = 'block';
        document.getElementById('uploadBtn').disabled = false;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function resetUpload() {
        selectedFile = null;
        fileInput.value = '';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadBtn').disabled = true;
        document.getElementById('resultSection').style.display = 'none';
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('uploadBtn').style.display = 'block';
        document.getElementById('dataTablesCard').style.display = 'none';
        
        if (tableItems) {
            tableItems.destroy();
            tableItems = null;
        }
        if (tableErrores) {
            tableErrores.destroy();
            tableErrores = null;
        }
    }

    async function uploadFile() {
        if (!selectedFile) {
            alert('Por favor selecciona un archivo primero');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('uploadBtn').style.display = 'none';

        try {
            const response = await fetch(`${API_BASE}/pacientes`, {
                method: 'POST',
                body: formData
            });

            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');
            
            let result;
            if (isJson) {
                result = await response.json();
            } else {
                const text = await response.text();
                result = { raw_response: text };
            }

            if (!response.ok) {
                throw new Error(`Error HTTP ${response.status}: ${JSON.stringify(result)}`);
            }

            importResult = result;
            mostrarResultados(result);

        } catch (error) {
            console.error('Error completo:', error);
            alert('Error al importar el archivo:\n' + error.message);
            
            document.getElementById('loadingSpinner').style.display = 'none';
            document.getElementById('uploadBtn').style.display = 'block';
        }
    }

    function mostrarResultados(result) {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';

        // Estadísticas
        const total = result.total_filas || 0;
        const ok = result.filas_ok || 0;
        const error = result.filas_error || 0;
        const successRate = total > 0 ? Math.round((ok / total) * 100) : 0;

        document.getElementById('statTotal').textContent = total;
        document.getElementById('statOk').textContent = ok;
        document.getElementById('statError').textContent = error;
        document.getElementById('statSuccess').textContent = successRate + '%';

        // Detalles
        const estado = result.estado_carga || 'DESCONOCIDO';
        document.getElementById('detailId').textContent = result.id_carga || '-';
        document.getElementById('detailNombre').textContent = result.nombre_archivo || '-';
        document.getElementById('detailHash').textContent = result.hash_archivo || '-';
        
        const badge = document.getElementById('detailEstadoBadge');
        badge.textContent = estado;
        badge.className = 'badge badge-custom ' + getEstadoClass(estado);

        // Scroll suave
        setTimeout(() => {
            document.getElementById('resultSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);
    }

    function getEstadoClass(estado) {
        const estados = {
            'PROCESADO': 'bg-success',
            'STAGING_CARGADO': 'bg-info',
            'RECIBIDO': 'bg-primary',
            'ERROR': 'bg-danger',
            'PARCIAL': 'bg-warning'
        };
        return estados[estado] || 'bg-secondary';
    }

    async function cargarDatosTablas() {
        if (!importResult || !importResult.id_carga) {
            alert('No hay datos de carga disponibles');
            return;
        }

        const idCarga = importResult.id_carga;
        
        // DEBUG: Mostrar en consola
        console.log('🔍 ID Carga:', idCarga);
        console.log('🔍 URL completa:', `${API_BASE}/pacientes/${idCarga}/datos`);

        try {
            const response = await fetch(`${API_BASE}/pacientes/${idCarga}/datos`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('✅ Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error HTTP ${response.status}: ${errorText}`);
            }

            const datos = await response.json();
            console.log('✅ Datos recibidos:', datos);
            
            // Mostrar card de tablas
            document.getElementById('dataTablesCard').style.display = 'block';
            
            // Actualizar badges
            document.getElementById('badgeItems').textContent = datos.total_items || 0;
            document.getElementById('badgeErrores').textContent = datos.total_errores || 0;

            // Cargar tabla de items
            cargarTablaItems(datos.items || []);
            
            // Cargar tabla de errores
            cargarTablaErrores(datos.errores || []);

            // Scroll a las tablas
            setTimeout(() => {
                document.getElementById('dataTablesCard').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);

        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            alert('Error al cargar los datos de las tablas:\n' + error.message);
        }
    }

    function cargarTablaItems(items) {
        console.log('📊 Cargando items:', items.length);
        
        // Destruir tabla existente si existe
        if (tableItems) {
            tableItems.destroy();
        }

        // Limpiar tbody
        $('#tableItems tbody').empty();

        // Llenar datos
        items.forEach(item => {
            const row = `
                <tr>
                    <td>${item.id_item || ''}</td>
                    <td>${item.registro || ''}</td>
                    <td>${item.tipo_documento || ''}</td>
                    <td>${item.numero_documento || ''}</td>
                    <td>${item.paciente || ''}</td>
                    <td>${item.sexo || ''}</td>
                    <td>${item.fecha_nacimiento || ''}</td>
                    <td>${item.telefono || ''}</td>
                    <td>${item.derivacion_interna || ''}</td>
                    <td><span class="badge badge-estado bg-info">${item.id_estado || ''}</span></td>
                </tr>
            `;
            $('#tableItems tbody').append(row);
        });

        // Inicializar DataTable
        tableItems = $('#tableItems').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
            },
            pageLength: 10,
            order: [[0, 'asc']],
            responsive: true,
            destroy: true
        });
    }

    function cargarTablaErrores(errores) {
        console.log('⚠️ Cargando errores:', errores.length);
        
        // Destruir tabla existente si existe
        if (tableErrores) {
            tableErrores.destroy();
        }

        // Limpiar tbody
        $('#tableErrores tbody').empty();

        // Llenar datos
        errores.forEach(error => {
            let rawJson = '-';
            if (error.raw_json) {
                const jsonStr = typeof error.raw_json === 'string' ? 
                    error.raw_json : JSON.stringify(error.raw_json);
                const preview = jsonStr.length > 100 ? 
                    jsonStr.substring(0, 100) + '...' : jsonStr;
                rawJson = `<div class="json-preview" title="Click para ver completo">${preview}</div>`;
            }

            const row = `
                <tr>
                    <td>${error.id_error || ''}</td>
                    <td>${error.registro || ''}</td>
                    <td><span class="badge bg-danger">${error.codigo_error || ''}</span></td>
                    <td>${error.detalle_error || ''}</td>
                    <td>${error.columnas_error || ''}</td>
                    <td>${rawJson}</td>
                    <td>${error.created_at ? new Date(error.created_at).toLocaleString('es-PE') : ''}</td>
                </tr>
            `;
            $('#tableErrores tbody').append(row);
        });

        // Inicializar DataTable
        tableErrores = $('#tableErrores').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
            },
            pageLength: 10,
            order: [[0, 'asc']],
            responsive: true,
            destroy: true
        });
    }
