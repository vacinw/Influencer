package fsa.training.config;

import fsa.training.dao.RoleDao;
import fsa.training.entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleDao roleDao;

    @Override
    public void run(String... args) throws Exception {
        // Tạo các role mặc định nếu chưa có
        createRoleIfNotExists("ADMIN");
        createRoleIfNotExists("CREATOR");
        createRoleIfNotExists("RECEIVER");
    }

    private void createRoleIfNotExists(String roleName) {
        if (roleDao.findByName(roleName) == null) {
            Role role = new Role();
            role.setName(roleName);
            roleDao.save(role);
            System.out.println("Created role: " + roleName);
        }
    }
}
