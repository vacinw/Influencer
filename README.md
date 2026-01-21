# InfluConnect - Influencer Marketing Platform

InfluConnect is a platform that bridges the gap between Brands (Creators) and Influencers (Receivers/KOLs). It simplifies the process of finding talent, managing campaigns, and tracking results.

## 🚀 Features

*   **Role-Based Access**:
    *   **Admin**: Manage users, monitor platform activity.
    *   **Creator (Brand)**: Create campaigns, search for influencers, hire talent.
    *   **Receiver (Influencer/KOL)**: Apply for campaigns, manage contracts, monetize influence.
*   **Authentication**: Secure login/register with Google OAuth2 support.
*   **Campaign Management**: Create, edit, and track marketing campaigns.
*   **Dashboard**: tailored dashboards for each user role.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React (v18+) with TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS
*   **Routing**: React Router DOM
*   **Icons**: Lucide React
*   **HTTP Client**: Axios

### Backend
*   **Framework**: Spring Boot (Java)
*   **Security**: Spring Security + OAuth2 Client
*   **Database**: MySQL
*   **ORM**: Hibernate / Spring Data JPA
*   **Template Engine**: Thymeleaf (legacy support/emails)

## 📋 Prerequisites

*   **Java**: JDK 17 or higher
*   **Maven**: 3.6+
*   **Node.js**: v18+
*   **MySQL**: 8.0+

## ⚙️ Installation & Setup

### 1. Database Setup
Create a MySQL database named `influ`:
```sql
CREATE DATABASE influ;
```
Check `backend/src/main/resources/application.properties` if you need to change the username/password (default: `root`/`empty`).

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Run the application:
```bash
mvn spring-boot:run
```
The backend will start on **http://localhost:8080**.

### 3. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```
The frontend will start on **http://localhost:5173**.

## 📂 Project Structure

```
├── backend/                # Spring Boot Backend
│   ├── src/main/java       # Source code
│   └── src/main/resources  # Config (application.properties, etc.)
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context (Auth, etc.)
│   │   ├── layouts/        # Page layouts (MainLayout, etc.)
│   │   ├── pages/          # Application pages (Dashboard, Login, etc.)
│   │   └── services/       # API integration (axios)
│   └── public/             # Static assets
│
└── README.md               # Project Documentation
```

## 🔐 Default Roles & Testing

*   **Public Access**: Home, Explore, Login, Register.
*   **Authenticated**: Role Selection (first login).
*   **Dashboard**: Accessible after role selection.

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
