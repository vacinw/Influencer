package fsa.training.controller;

import fsa.training.dao.NotificationDao;
import fsa.training.dao.UserDao;
import fsa.training.entity.Notification;
import fsa.training.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationDao notificationDao;

    @Autowired
    private UserDao userDao;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            Object principal = auth.getPrincipal();
            if (principal instanceof User) {
                User user = (User) principal;
                return userDao.findById(user.getId()).orElse(user);
            } else if (principal instanceof UserDetails) {
                String email = ((UserDetails) principal).getUsername();
                return userDao.findByEmail(email);
            }
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        List<Notification> notifications = notificationDao.findByUserOrderByCreatedAtDesc(user);
        long unreadCount = notificationDao.countByUserAndIsReadFalse(user);

        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notifications);
        response.put("unreadCount", unreadCount);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Optional<Notification> notifOpt = notificationDao.findById(id);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Notification notification = notifOpt.get();
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        notification.setRead(true);
        notificationDao.save(notification);

        return ResponseEntity.ok(notification);
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        List<Notification> notifications = notificationDao.findByUserOrderByCreatedAtDesc(user);
        for (Notification notif : notifications) {
            if (!notif.isRead()) {
                notif.setRead(true);
                notificationDao.save(notif);
            }
        }

        return ResponseEntity.ok("Đã đánh dấu tất cả là đã đọc");
    }
}
