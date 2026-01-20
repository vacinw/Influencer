# InfluConnect - KOL Platform

Platform connecting campaign creators with influencers (KOLs).

## Project Structure

This project is built with:
- **Spring Boot 3.2.0**
- **Java 21**
- **Spring Data JPA** (MySQL)
- **Spring Security**
- **Thymeleaf**

## Features

- **For Creators**: Create campaigns, manage applications, approve/reject candidates.
- **For Receivers (KOLs)**: Browse campaigns, apply for jobs, track status.
- **For Admin**: Manage users, oversee system.

## Roles

1. **ADMIN**: Full system access.
2. **CREATOR**: Campaign management.
3. **RECEIVER**: Job application.

## Getting Started

1. Clone the repository.
2. Configure database in `application.properties`.
3. Run the application via `InfluConnectApplication.java`.
4. Access at `http://localhost:8080`.
