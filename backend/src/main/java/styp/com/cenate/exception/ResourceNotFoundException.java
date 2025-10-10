package styp.com.cenate.exception;

/**
 * Excepción lanzada cuando no se encuentra un recurso solicitado
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
