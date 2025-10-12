package styp.com.cenate.repository;

import styp.com.cenate.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio para la entidad Rol.
 *
 * 📘 Esta interfaz extiende JpaRepository, lo que te brinda:
 *  - Métodos CRUD automáticos (save, findById, findAll, delete, etc.)
 *  - Soporte para consultas personalizadas usando convenciones de nombre (Derived Queries)
 *
 * 📦 JpaRepository<Rol, Integer>:
 *  - Rol → la entidad que se gestiona.
 *  - Integer → el tipo de dato del ID principal (según tu entidad Rol).
 */
@Repository
public interface RolRepository extends JpaRepository<Rol, Integer> {

    /**
     * Busca un rol por su descripción.
     * Ejemplo: findByDescRol("ADMIN") → devuelve un Optional<Rol> si existe.
     *
     * @param descRol descripción del rol (columna desc_rol en la tabla).
     * @return Optional con el Rol encontrado o vacío si no existe.
     */
    Optional<Rol> findByDescRol(String descRol);

    /**
     * Verifica si ya existe un rol con una descripción determinada.
     * Muy útil para evitar duplicados antes de crear un nuevo rol.
     *
     * @param descRol descripción del rol.
     * @return true si ya existe, false si no.
     */
    boolean existsByDescRol(String descRol);
}
