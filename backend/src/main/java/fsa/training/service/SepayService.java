package fsa.training.service;

import fsa.training.dao.TransactionDao;
import fsa.training.dao.UserDao;
import fsa.training.dao.WalletDao;
import fsa.training.dto.SepayDto;
import fsa.training.entity.Transaction;
import fsa.training.entity.User;
import fsa.training.entity.Wallet;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SepayService {

    @Autowired
    private WalletDao walletDao;

    @Autowired
    private TransactionDao transactionDao;

    @Autowired
    private UserDao userDao;

    @Transactional
    public void processWebhook(SepayDto data) {
        if (data.getTransferAmount() <= 0) {
            return; // Ignore invalid amount
        }

        // Parse User ID from "content" or "code"
        // Expected format: "PAY 123" or "PAY123"
        Long userId = extractUserId(data.getContent());
        if (userId == null) {
            throw new IllegalArgumentException("Cannot find User ID in transfer content: " + data.getContent());
        }

        User user = userDao.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Get or Create Wallet
        Wallet wallet = walletDao.findByUser(user).orElseGet(() -> {
            Wallet w = new Wallet();
            w.setUser(user);
            w.setBalance(0.0);
            return walletDao.save(w);
        });

        // Check if transaction already processed (optional idempotent check)
        // For simplicity, we assume Sepay won't send duplicates or we rely on
        // transaction ID check if we stored it
        // Ideally we should store Sepay Reference Code to prevent double counting.

        // Update Balance
        wallet.setBalance(wallet.getBalance() + data.getTransferAmount());
        walletDao.save(wallet);

        // Create Transaction Record
        Transaction tx = new Transaction();
        tx.setWallet(wallet);
        tx.setAmount(data.getTransferAmount());
        tx.setType("DEPOSIT");
        tx.setStatus("COMPLETED");
        tx.setDescription("Top up via Sepay (Ref: " + data.getReferenceCode() + ")");
        transactionDao.save(tx);
    }

    private Long extractUserId(String content) {
        if (content == null)
            return null;

        // Regex to find "ICS" followed by digits, allowing for optional spaces
        // Case insensitive
        Pattern pattern = Pattern.compile("ICS\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(content);

        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}
