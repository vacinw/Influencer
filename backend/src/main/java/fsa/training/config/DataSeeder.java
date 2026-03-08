package fsa.training.config;

import fsa.training.dao.RoleDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Role;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Ensure Admin Role Exists
        Role adminRole = roleDao.findByName("ADMIN");
        if (adminRole == null) {
            adminRole = new Role();
            adminRole.setName("ADMIN");
            adminRole = roleDao.save(adminRole);
        }

        // Ensure Admin User Exists
        if (!userDao.existsByEmail("admin@gmail.com")) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Default password
            admin.setRole(adminRole);
            admin.setVerified(true);
            admin.setEnabled(true);
            userDao.save(admin);
            System.out.println("✅ DEFAULT ADMIN CREATED: admin@gmail.com / admin123");
        } else {
            System.out.println("✅ DEFAULT ADMIN ALREADY EXISTS: admin@gmail.com");
        }
    }
}
