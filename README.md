ILES — Internship Logging and Evaluation System

A digital platform for managing student internships, weekly activity logs, supervisor reviews, evaluations, and internship performance tracking.


📌 Overview

ILES (Internship Logging and Evaluation System) is a web-based platform designed to simplify and digitize the management of student internships.

The system provides a centralized environment where students can record their internship activities, supervisors can review and evaluate submitted work, and academic administrators can monitor internship progress and performance.

Instead of relying on paper-based logbooks and fragmented communication, ILES provides a structured digital workflow for the entire internship logging and evaluation process.

---

🎯 Problem Statement

Traditional internship management often involves:

- Paper-based logbooks
- Delayed supervisor reviews
- Difficulty tracking student progress
- Limited visibility for academic supervisors
- Manual evaluation and score computation
- Difficulty maintaining reliable records
- Poor communication between students and supervisors

ILES addresses these challenges by providing a centralized system for logging, reviewing, evaluating, and monitoring internship activities.

---

✨ Key Features

👨‍🎓 Student

Students can:

- Register and authenticate securely
- Maintain their internship profile
- View internship placement information
- Submit weekly internship activity logs
- Track the status of submitted logs
- Receive feedback from supervisors
- View evaluation results
- Monitor internship progress

🧑‍💼 Workplace Supervisor

Workplace supervisors can:

- View assigned students
- Review submitted weekly logs
- Approve or reject internship logs
- Provide feedback
- Evaluate student performance
- Track student progress

👨‍🏫 Academic Supervisor

Academic supervisors can:

- Monitor assigned students
- Review internship activity logs
- Evaluate student performance
- Provide academic feedback
- Approve or reject submitted logs
- Monitor internship progress

🔐 Authentication & Role-Based Access

ILES uses role-based access control to ensure that users only access functionality appropriate to their role.

Supported roles include:

- Student
- Workplace Supervisor
- Academic Supervisor

---

🔄 Internship Workflow

The core internship workflow follows a structured process:

Student
   │
   ▼
Creates Weekly Log
   │
   ▼
Submits Log
   │
   ▼
Workplace Supervisor Review
   │
   ├── Reject ──► Student Revises
   │
   ▼
Academic Supervisor Review
   │
   ├── Reject ──► Student Revises
   │
   ▼
Approval
   │
   ▼
Evaluation
   │
   ▼
Performance Score

This workflow helps maintain accountability and provides a clear audit trail throughout the internship period.

---

🏗️ System Architecture

ILES follows a client-server architecture.

┌─────────────────────────┐
│       React Frontend    │
│                         │
│   Student Dashboard     │
│   Supervisor Dashboard  │
└────────────┬────────────┘
             │
             │ REST API
             ▼
┌─────────────────────────┐
│     Django Backend      │
│                         │
│ Django REST Framework   │
│ Authentication          │
│ Business Logic          │
│ Evaluation              │
│ Workflow Management     │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
│        Database         │
└─────────────────────────┘

---

🛠️ Technology Stack

Frontend

- React
- Vite
- Chakra UI
- JavaScript
- REST API integration

Backend

- Python
- Django
- Django REST Framework
- JWT Authentication

Database

- PostgreSQL

Development & Deployment

- Git
- GitHub
- Vercel
- Render

---

📂 Project Structure

ILES-PROJECT/
│
├── backend/
│   ├── iles_backend/
│   ├── users/
│   ├── students/
│   ├── placements/
│   ├── weekly_logs/
│   ├── evaluations/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   └── package.json
│
└── README.md

«The exact folder structure may evolve as the system continues to be developed.»

---

🚀 Getting Started

Prerequisites

Make sure the following are installed:

- Python 3.x
- Node.js
- npm
- PostgreSQL
- Git

1. Clone the Repository

git clone <repository-url>
cd ILES-PROJECT

2. Backend Setup

cd backend

python -m venv venv

Activate the virtual environment.

Windows:

venv\Scripts\activate

Linux/macOS:

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Configure the required environment variables and database connection.

Run migrations:

python manage.py migrate

Start the development server:

python manage.py runserver

---

3. Frontend Setup

Open another terminal:

cd frontend

npm install

Start the development server:

npm run dev

The frontend can then be accessed through the local development URL provided by Vite.

---

🧪 Testing

The system is designed to support different levels of testing, including:

- Unit testing
- API testing
- Integration testing
- Authentication testing
- Role-based access testing
- Workflow validation

Testing focuses particularly on critical workflows such as:

Authentication
      ↓
Weekly Log Submission
      ↓
Supervisor Review
      ↓
Evaluation
      ↓
Score Computation

---

📊 Evaluation & Scoring

ILES supports structured internship evaluation involving both workplace and academic supervision.

The evaluation model allows supervisors to provide:

- Performance scores
- Evaluation criteria
- Feedback
- Internship performance assessment

The system is designed to support weighted evaluation, including the configured contribution of workplace and academic supervisors.

---

🔒 Security

The system implements security mechanisms including:

- JWT-based authentication
- Role-based authorization
- Protected API endpoints
- Server-side validation
- Controlled access to internship records
- Environment-based configuration of sensitive settings

Sensitive credentials and configuration values should never be committed to the repository.

---

🌍 Deployment

The application is designed as a full-stack web application with:

Frontend → Vercel
Backend  → Render
Database → PostgreSQL

Production deployment requires appropriate environment variables and database configuration.

---

🗺️ Future Improvements

Planned improvements may include:

- Real-time notifications
- Email notifications
- More detailed analytics dashboards
- Improved evaluation reporting
- Advanced internship progress tracking
- Mobile application support
- Enhanced audit and reporting capabilities
- Automated performance analytics

---

👥 Contributors

ILES was developed as a collaborative software development project.

Contributors:
Ssenyondo Henry -SsenyoHens
NGS1414
IVAN Kyanzi - ivanthe-eng
katocalvin10
francismusana92

---

📄 Project Status

Status: Active Development

ILES is being continuously improved as features are tested, refined, and prepared for real-world use.

---

🤝 Contributing

Contributions, suggestions, and feedback are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Open a Pull Request

---

📜 License

All rights are reserved. In case you want to use the system, reach out to us via our official email.

---

💡 Why ILES?

ILES is more than a digital replacement for a paper internship logbook.

It aims to create a transparent, structured, and accountable internship management process connecting students, workplace supervisors, and academic supervisors in one platform.

«Log. Review. Evaluate. Improve.»
