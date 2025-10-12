package styp.com.cenate.exception;

/**
 * Excepción personalizada para contraseñas débiles.
 */
public class WeakPasswordException extends RuntimeException {
    public WeakPasswordException(String message) {
        super(message);
    }
}