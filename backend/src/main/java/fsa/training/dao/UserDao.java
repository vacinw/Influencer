package fsa.training.dao;

import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.cache.annotation.Cacheable;

@Repository
public interface UserDao extends JpaRepository<User, Long> {
    User findByEmail(String email);
    boolean existsByEmail(String email);
    @Cacheable("usersByRole")
    java.util.List<User> findByRoleName(String roleName);
    
    org.springframework.data.domain.Page<User> findByRoleName(String roleName, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u JOIN Application a ON a.receiver.id = u.id " +
       "JOIN Campaign c ON a.campaign.id = c.id " +
       "LEFT JOIN c.tags t " +
       "WHERE u.role.name = 'RECEIVER' AND " +
       "(c.title LIKE CONCAT('%', :categoryName, '%') OR " +
       "c.description LIKE CONCAT('%', :categoryName, '%') OR " +
       "t LIKE CONCAT('%', :categoryName, '%'))")
    org.springframework.data.domain.Page<User> findInfluencersByCategoryName(
        @org.springframework.data.repository.query.Param("categoryName") String categoryName, 
        org.springframework.data.domain.Pageable pageable);
}
