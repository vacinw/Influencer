package fsa.training.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "campaign_receivers")
public class CampaignReceiver {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;
    
    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;
}
