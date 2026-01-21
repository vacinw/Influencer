package fsa.training.controller;

import fsa.training.dao.RoleDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Role;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@org.springframework.web.bind.annotation.RequestMapping("/api")
public class RegisterController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            if (userDao.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body("Email đã tồn tại!");
            }

            // Default role if not provided or handle role selection
            // In API, role should probably be passed in the User object or DTO
            // For now assuming role is inside User or we need a way to set it.
            // Let's assume the frontend sends the role ID or name.
            // If the user entity has a role object, we check it.

            // Existing logic expected "roleName" param. Let's make it smarter.
            // But to keep it simple and compatible with the entity:
            if (user.getRole() != null && user.getRole().getName() != null) {
                Role role = roleDao.findByName(user.getRole().getName());
                if (role == null) {
                    role = new Role();
                    role.setName(user.getRole().getName());
                    roleDao.save(role);
                }
                user.setRole(role);
            } else {
                // Return error or set default
                return ResponseEntity.badRequest().body("Role is required");
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userDao.save(user);

            return ResponseEntity.ok("Đăng ký thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Đăng ký thất bại: " + e.getMessage());
        }
    }
}
