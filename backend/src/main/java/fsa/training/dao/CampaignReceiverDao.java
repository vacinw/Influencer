package fsa.training.dao;

import fsa.training.entity.CampaignReceiver;
import fsa.training.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignReceiverDao extends JpaRepository<CampaignReceiver, Long> {
    List<CampaignReceiver> findByReceiver(User receiver);
}
