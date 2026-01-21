package fsa.training.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHasher {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (args.length > 0) {
            for (String password : args) {
                System.out.println(password + ": " + encoder.encode(password));
            }
        } else {
            System.out.println("admin123: " + encoder.encode("admin123"));
            System.out.println("creator123: " + encoder.encode("creator123"));
            System.out.println("receiver123: " + encoder.encode("receiver123"));
            System.out.println("123456: " + encoder.encode("123456"));
        }
    }
}
