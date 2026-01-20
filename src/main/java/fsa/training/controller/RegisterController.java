package fsa.training.controller;

import fsa.training.dao.RoleDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Role;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class RegisterController {

    @Autowired
    private UserDao userDao;

    @Autowired
    private RoleDao roleDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/register")
    public String registerForm(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    @PostMapping("/register")
    public String register(@ModelAttribute User user, 
                          @RequestParam String roleName, 
                          Model model) {
        try {
            if (userDao.existsByEmail(user.getEmail())) {
                model.addAttribute("message", "Email đã tồn tại!");
                return "register";
            }

            Role role = roleDao.findByName(roleName);
            if (role == null) {
                role = new Role();
                role.setName(roleName);
                roleDao.save(role);
            }

            user.setRole(role);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userDao.save(user);

            model.addAttribute("message", "Đăng ký thành công! Vui lòng đăng nhập.");
            return "login";
        } catch (Exception e) {
            model.addAttribute("message", "Đăng ký thất bại: " + e.getMessage());
            return "register";
        }
    }
}
