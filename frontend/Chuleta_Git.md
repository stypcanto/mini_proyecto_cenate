### 💾 Guardar cambios actuales
git stash

### 💬 Guardar con mensaje
git stash push -m "mensaje descriptivo"

### 📋 Ver stashes guardados
git stash list

### 🔄 Recuperar el último stash (y eliminarlo)
git stash pop

### 🔁 Aplicar un stash específico sin eliminarlo
git stash apply stash@{0}

### 🧹 Borrar un stash específico
git stash drop stash@{0}

### 💣 Borrar todos los stashes
git stash clear
