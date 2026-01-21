package fsa.training.dao;

import fsa.training.entity.Transaction;
import fsa.training.entity.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionDao extends JpaRepository<Transaction, Long> {
    List<Transaction> findByWalletOrderByCreatedAtDesc(Wallet wallet);
    Page<Transaction> findByWalletOrderByCreatedAtDesc(Wallet wallet, Pageable pageable);
}
