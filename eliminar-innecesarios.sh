#!/bin/bash

# ========================================================================
# 🗑️ ELIMINAR ARCHIVOS NO USADOS - VERSIÓN MÍNIMA
# ========================================================================

cd "$(dirname "$0")/frontend/src/pages" || exit 1

echo "🗑️ Eliminando páginas NO USADAS..."

# Eliminar páginas admin que NO se usan
cd admin || exit 1
rm -f AdminAccountRequests.jsx
rm -f AdminPersonalPanel.jsx
rm -f AdminRecoveries.jsx
rm -f AdminUsersManagement.jsx
rm -f PermisosManagement.jsx
rm -f RolesManagement.jsx
rm -f SystemLogs.jsx
rm -f UserManagement.jsx
rm -f UsuarioDetalle.jsx

# Eliminar carpetas completas
rm -rf components
rm -rf tables
rm -rf ui

echo "✅ Páginas admin innecesarias eliminadas"

cd ..

# Eliminar páginas que no se usan
rm -f AccountRequest.jsx
rm -f AdminAccountRequests.jsx
rm -f PacientesPage.jsx
rm -f TransferenciaExamenesPage.jsx

# Eliminar auth innecesarios
cd auth
rm -f Register.jsx
rm -f ForgotPassword.jsx
cd ..

# Eliminar roles completos (por ahora)
rm -rf roles

# Eliminar user
rm -rf user

echo "✅ Archivos innecesarios eliminados"
echo ""
echo "📋 Archivos que QUEDAN:"
echo "  - pages/Home.jsx"
echo "  - pages/Dashboard.jsx"
echo "  - pages/Unauthorized.jsx"
echo "  - pages/NotFound.jsx"
echo "  - pages/auth/Login.jsx"
echo "  - pages/admin/AdminDashboard.jsx"
