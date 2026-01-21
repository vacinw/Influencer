package fsa.training.dao;

import fsa.training.entity.User;
import fsa.training.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WalletDao extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser(User user);
}
