import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerarHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String password = "@Styp654321";
        String hash = encoder.encode(password);
        System.out.println("Hash BCrypt para @Styp654321:");
        System.out.println(hash);
    }
}
