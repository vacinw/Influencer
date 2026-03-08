package fsa.training.dao;

import fsa.training.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewDao extends JpaRepository<Review, Long> {

    List<Review> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    boolean existsByCreatorIdAndReceiverIdAndCampaignId(Long creatorId, Long receiverId, Long campaignId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.receiver.id = :receiverId")
    Double getAverageRatingForReceiver(@Param("receiverId") Long receiverId);
}
