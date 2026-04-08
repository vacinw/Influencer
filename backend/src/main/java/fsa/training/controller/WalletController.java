package fsa.training.controller;

import fsa.training.dao.NotificationDao;
import fsa.training.dao.TransactionDao;
import fsa.training.dao.UserDao;
import fsa.training.dao.WalletDao;
import fsa.training.entity.Notification;
import fsa.training.entity.Transaction;
import fsa.training.entity.User;
import fsa.training.entity.Wallet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/wallet")
@Transactional
public class WalletController {

    @Autowired
    private WalletDao walletDao;

    @Autowired
    private TransactionDao transactionDao;

    @Autowired
    private UserDao userDao;

    @Autowired
    private NotificationDao notificationDao;

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

    private Wallet getOrCreateWallet(User user) {
        Optional<Wallet> walletOpt = walletDao.findByUser(user);
        if (walletOpt.isPresent()) {
            return walletOpt.get();
        }
        Wallet newWallet = new Wallet();
        newWallet.setUser(user);
        newWallet.setBalance(0.0);
        return walletDao.save(newWallet);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getWalletSummary() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Wallet wallet = getOrCreateWallet(user);
        List<Transaction> recentTransactions = transactionDao.findByWalletOrderByCreatedAtDesc(wallet);

        Map<String, Object> response = new HashMap<>();
        response.put("balance", wallet.getBalance());
        response.put("transactions", recentTransactions);
        response.put("userId", user.getId()); // For payment syntax
        response.put("bankName", wallet.getBankName());
        response.put("bankAccountName", wallet.getBankAccountName());
        response.put("bankAccountNumber", wallet.getBankAccountNumber());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            Double amount = Double.valueOf(payload.get("amount").toString());
            if (amount <= 0) {
                return ResponseEntity.badRequest().body("Amount must be positive");
            }
            // Add other mock payment fields if necessary

            Wallet wallet = getOrCreateWallet(user);

            // Update Balance
            wallet.setBalance(wallet.getBalance() + amount);
            walletDao.save(wallet);

            // Create Transaction Record
            Transaction tx = new Transaction();
            tx.setWallet(wallet);
            tx.setAmount(amount);
            tx.setType("DEPOSIT");
            tx.setStatus("COMPLETED");
            tx.setDescription("Deposit via Simulated Gateway");
            transactionDao.save(tx);

            return ResponseEntity.ok(wallet);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid amount format");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Deposit failed: " + e.getMessage());
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            Double amount = Double.valueOf(payload.get("amount").toString());
            if (amount <= 0) {
                return ResponseEntity.badRequest().body("Amount must be positive");
            }

            Wallet wallet = getOrCreateWallet(user);

            if (wallet.getBankName() == null || wallet.getBankAccountName() == null || wallet.getBankAccountNumber() == null) {
                return ResponseEntity.badRequest().body("Bạn cần cập nhật thông tin ngân hàng trước khi rút tiền!");
            }

            if (wallet.getBalance() < amount) {
                return ResponseEntity.badRequest().body("Số dư không đủ!");
            }

            // Update Balance
            wallet.setBalance(wallet.getBalance() - amount);
            walletDao.save(wallet);

            // Create Transaction Record
            Transaction tx = new Transaction();
            tx.setWallet(wallet);
            tx.setAmount(amount);
            tx.setType("WITHDRAWAL");
            tx.setStatus("PENDING"); // Simulate manual processing or instant
            tx.setDescription("Withdrawal Request");
            transactionDao.save(tx);

            // Notify Admin
            List<User> admins = userDao.findByRoleName("ADMIN");
            for (User admin : admins) {
                Notification notif = new Notification();
                notif.setUser(admin);
                notif.setTitle("Yêu cầu rút tiền mới");
                notif.setContent("Người dùng " + user.getName() + " (" + user.getEmail() + ") vừa yêu cầu rút " + String.format("%,.0f", amount) + " VND. Vui lòng kiểm tra và duyệt trong mục Quản lý Rút tiền.");
                notif.setLink("/admin/withdrawals");
                notificationDao.save(notif);
            }

            return ResponseEntity.ok(wallet);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid amount format");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Withdrawal failed: " + e.getMessage());
        }
    }

    @PutMapping("/bank-info")
    public ResponseEntity<?> updateBankInfo(@RequestBody Map<String, String> payload) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        
        try {
            Wallet wallet = getOrCreateWallet(user);
            if (payload.containsKey("bankName")) wallet.setBankName(payload.get("bankName"));
            if (payload.containsKey("bankAccountName")) wallet.setBankAccountName(payload.get("bankAccountName"));
            if (payload.containsKey("bankAccountNumber")) wallet.setBankAccountNumber(payload.get("bankAccountNumber"));
            
            walletDao.save(wallet);
            return ResponseEntity.ok(wallet);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update bank info: " + e.getMessage());
        }
    }
}
