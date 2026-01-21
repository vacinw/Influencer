package fsa.training.controller;

import fsa.training.dao.RoleDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Role;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @PostMapping("/role")
    public ResponseEntity<?> updateRole(@RequestBody Map<String, String> payload, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = null;
        if (authentication.getPrincipal() instanceof OAuth2User) {
            email = ((OAuth2User) authentication.getPrincipal()).getAttribute("email");
        } else if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getName();
        }

        if (email == null) {
            return ResponseEntity.badRequest().body("Cannot identify user");
        }

        User user = userDao.findByEmail(email);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        String roleName = payload.get("role");
        if (roleName == null || (!roleName.equals("CREATOR") && !roleName.equals("RECEIVER"))) {
            return ResponseEntity.badRequest().body("Invalid role. Must be CREATOR or RECEIVER");
        }

        Role role = roleDao.findByName(roleName);
        if (role == null) {
            // Should create role if not exists? Ideally roles are seeded.
            // But for simple path, let's assume roles exist or create on fly?
            // Better to return error if not seeded, but to be safe lets create:
            role = new Role();
            role.setName(roleName);
            roleDao.save(role);
        }

        user.setRole(role);
        userDao.save(user);

        return ResponseEntity.ok(user);
    }
}
