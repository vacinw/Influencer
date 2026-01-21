package fsa.training.dao;

import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignDao extends JpaRepository<Campaign, Long> {
    List<Campaign> findByCreator(User creator);
    List<Campaign> findByStatus(String status);
}
