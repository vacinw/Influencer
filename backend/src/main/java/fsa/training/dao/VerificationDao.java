package fsa.training.dao;

import fsa.training.entity.User;
import fsa.training.entity.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationDao extends JpaRepository<VerificationRequest, Long> {
    List<VerificationRequest> findByStatus(String status);
    Optional<VerificationRequest> findByUserAndStatus(User user, String status);
    List<VerificationRequest> findByUser(User user);
}
