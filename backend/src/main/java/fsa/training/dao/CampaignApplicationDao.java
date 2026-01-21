package fsa.training.dao;

import fsa.training.entity.CampaignApplication;
import fsa.training.entity.Campaign;
import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignApplicationDao extends JpaRepository<CampaignApplication, Long> {
    List<CampaignApplication> findByCampaign(Campaign campaign);
    List<CampaignApplication> findByReceiver(User receiver);
    boolean existsByCampaignAndReceiver(Campaign campaign, User receiver);
}
