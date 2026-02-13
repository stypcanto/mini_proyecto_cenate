$file = "c:\Users\User\Desktop\mini_proyecto_cenate\frontend\src\pages\bolsas\Solicitudes.jsx"
$content = [System.IO.File]::ReadAllText($file)
$old = 'getEstadoDisplay(mapearEstadoAPI(solicitud.cod_estado_cita || solicitud.estado_gestion_citas_id))'
$new = 'getEstadoDisplay(solicitud.cod_estado_cita)'
$content = $content.Replace($old, $new)
[System.IO.File]::WriteAllText($file, $content)
Write-Host "Replacement done"
