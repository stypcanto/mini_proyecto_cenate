package styp.com.cenate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // escanea subpaquetes automáticamente
public class CenateApplication {
    public static void main(String[] args) {
        SpringApplication.run(CenateApplication.class, args);
    }
}
