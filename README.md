# 🏢 Hostel Complaint Management System (HCMS)

An enterprise-grade, full-stack digital solution designed to streamline, track, and resolve student grievances in hostel environments. Built with a robust **React 19** frontend, an **Express** REST API backend, and **Sequelize ORM with SQLite**, HCMS features a real-time **SLA Escalation Engine**, a **Rule-Based Troubleshooter Chatbot**, and rich **Staff Performance Dashboards**.

---

## 🚀 Key Features

### 👤 Role-Based Access Control (RBAC)
*   **Students**:
    *   Submit complaints with category, description, and priority.
    *   Upload images/videos for visual proof (using `multer` file uploading).
    *   Monitor real-time progress and view live SLA countdowns.
    *   Mark complaints as **Resolved**, rate resolution quality (1 to 5 stars), or reopen tickets if unresolved.
    *   Access the troubleshooting chatbot before creating a ticket.
*   **Staff Members**:
    *   Access a personalized dashboard containing tickets assigned to their domain (e.g., Electrical, Plumbing).
    *   Update ticket status to *In Progress*.
    *   Reject/re-queue tickets back to the Admin pool (prevents assignment lock; adds staff ID to `rejectedBy` to ensure they are not reassigned).
*   **Administrators**:
    *   Monitor system-wide metrics (active, pending, resolved, and breached tickets).
    *   Assign/re-assign tickets to staff members and specify custom SLA resolution hours.
    *   Manage users (add, edit, delete users and adjust roles).
    *   View **Staff Performance Reports** containing resolution rates and performance scores.

---

### ⏱️ Real-Time SLA Escalation Engine
A dedicated background daemon (`slaChecker.js`) automatically polls active tickets to ensure strict adherence to Service Level Agreements (SLAs).
*   **Custom SLA Assignment**: Admins set resolution timelines based on priority requirements:
    *   🔴 **High Priority**: 0 to 24 hours.
    *   🟡 **Medium Priority**: 24 to 48 hours.
    *   🟢 **Low Priority**: 48 to 72 hours.
*   **Proactive Warning Alerts**: Triggers warnings when deadlines approach (e.g., 4 hours remaining in production, 1 minute in testing).
*   **Auto-Escalation**: Instantly generates alert notifications for Admins upon an SLA breach.
*   **Two Operational Modes**:
    *   **Production**: Normal hour-based schedules.
    *   **Testing**: Accelerated minute-based schedules (High: 2 min, Medium: 4 min, Low: 6 min) running checking intervals every 10 seconds.

---

###  Intelligent Hostel Chatbot for students 
*   A client-side integrated assistant designed to resolve queries instantly.
*   Uses intelligent keyword matching across categories like **Electricity, Water, Wi-Fi, Mess/Food, Cleanliness, and Roommate Conflicts**.
*   Guides students through troubleshooting protocols, helping reduce ticket volume for trivial issues.

---

### 📊 Staff Performance Reporting
*   Provides Admins with ranking tables based on productivity metrics.
*   Calculates a composite performance score: `Score = (Resolved Tickets * 2) + (Accepted Tickets * 1)`.
*   Displays real-time resolution rates (%) to incentivize faster issue completion.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite | Fast, interactive, and modular user interface |
| **Styling** | Tailwind CSS v4, Framer Motion | Modern design, sleek layouts, and smooth animations |
| **Charts** | Recharts | Interactive dashboards showing performance rankings |
| **Backend** | Node.js, Express.js | Robust REST API server with JWT-based Auth |
| **Database** | SQLite3, Sequelize ORM | Relational schema management with promise-based queries |
| **File Storage**| Multer | Secure local file-upload engine for image/video attachments |

---

## 🔒 Security & System Reliability
*   **JWT Authorization**: Authentication headers secure access to all REST endpoints.
*   **Password Hashing**: Passwords stored using `bcryptjs` with 10 rounds of salting.
*   **File Isolation**: Visual attachments are filtered, sanitized, and stored securely locally.
*   **Sequelize Migrations & Models**: Structured relations prevent data integrity loss.

live link of website : - https://hostel-complaint-tracker.onrender.com
