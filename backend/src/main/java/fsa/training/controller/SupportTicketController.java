package fsa.training.controller;

import fsa.training.dao.SupportTicketDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.SupportTicket;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/support-tickets")
public class SupportTicketController {

    @Autowired
    private SupportTicketDao supportTicketDao;

    @Autowired
    private UserDao userDao;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            Object principal = auth.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                return userDao.findById(user.getId()).orElse(user);
            } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
                return userDao.findByEmail(email);
            } else if (principal instanceof org.springframework.security.oauth2.core.user.OAuth2User) {
                String email = ((org.springframework.security.oauth2.core.user.OAuth2User) principal)
                        .getAttribute("email");
                return userDao.findByEmail(email);
            }
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String category = payload.getOrDefault("category", "OTHER");
        String content = payload.get("content");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Content is required");
        }

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setCategory(category);
        ticket.setContent(content);

        supportTicketDao.save(ticket);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    public ResponseEntity<?> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<SupportTicket> result;
        
        if (user.getRole() != null && "ADMIN".equals(user.getRole().getName())) {
            result = supportTicketDao.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            result = supportTicketDao.findByUserId(user.getId(), pageable);
        }
        
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveTicket(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null || user.getRole() == null || !"ADMIN".equals(user.getRole().getName())) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        SupportTicket ticket = supportTicketDao.findById(id).orElse(null);
        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        ticket.setStatus("RESOLVED");
        supportTicketDao.save(ticket);

        return ResponseEntity.ok(ticket);
    }
}
