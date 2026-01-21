# InfluConnect Upgrade Roadmap

This document outlines the phased plan to upgrade InfluConnect into a fully functional Campaign Management & Financial Platform.

---

## ✅ Phase 0: Infrastructure & Security (Completed)
**Goal:** Secure the application and modernize authentication for easier user access.
- [x] **JWT Authentication**: Migrated from Session-based to Stateless JWT.
- [x] **Social Login**: Implemented Google Login (OAuth2) with automatic account creation.
- [x] **Role-Based Access**: Secured endpoints for `CREATOR`, `RECEIVER`, and `ADMIN`.

## ✅ Phase 1: Core Booking & Job Flow (Completed)
**Goal:** Enable the "Work" to happen. Move beyond simple application to actual collaboration.
- [x] **Campaign Management**: Creators can create detailed campaigns with images/videos.
- [x] **Application Flow**: Influencers discover and apply to campaigns.
- [x] **Job Generation**: Auto-create a "Job" workspace when an application is accepted.
- [x] **Milestone Tracking**:
    -   Multiple milestones per job.
    -   Evidence submission (Text + Links).
    -   Review process (Approve/Reject with feedback).
- [x] **Job Completion Logic**:
    -   Completing a job closes the campaign.
    -   Updates application status.
    -   Triggers financial transfer (backend only).

## 🚀 Phase 2: Financial System (Next Steps)
**Goal:** Make the platform transactional. "Show me the money."
- [ ] **Wallet Entity**: Finalize database structure for User Wallets (Balance).
- [ ] **Transaction History**: Interface to view "Money In" (Deposits/Earnings) and "Money Out" (Payments).
- [ ] **Wallet UI**:
    -   **Receiver**: View Earnings, current balance.
    -   **Creator**: View Spending, current balance.
- [ ] **Top-up Logic**: Mock interface to "Add Funds" (Simulating a payment gateway like VNPay/SePay).

## 🔮 Phase 3: Reputation & Profile
**Goal:** Build trust and professional profiles.
- [ ] **Enhanced Profile**: Bio, Portfolio gallery, Social links.
- [ ] **Review System**:
    -   Creator rates Influencer after job completion.
    -   Influencer rates Creator.
- [ ] **Public Profile Page**: View another user's history and rating.

## 🔮 Phase 4: Real-Time & Polish
**Goal:** Modern responsiveness.
- [ ] **Notifications**: Real-time alerts (WebSocket) for "Status Changed", "Money Received".
- [ ] **Chat**: Direct messaging between Creator and Influencer for negotiation.
- [ ] **Dashboard Charts**: Visual analytics of earnings/spending over time.
