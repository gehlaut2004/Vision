AI-Based Online Exam Proctoring Platform
📌 Overview

This project is an AI-powered online exam proctoring system designed to ensure secure and fair online assessments.
It provides a complete workflow from organization → student → exam → proctoring → result, with automated monitoring to minimize cheating.

✨ Features

Organization Panel – Register students, generate login credentials automatically.

Secure Authentication – Students receive system-generated username/password.

Exam Dashboard – Dynamic question rendering with timer.

AI Proctoring Modules – Face, eye, head movement, and background voice detection.

Fullscreen Enforcement – Prevents tab switching or minimizing.

Violation System – Warnings for suspicious activity, auto-submit on major violations.

Exam Logs – Stores cheating events for review.

🛠️ Tech Stack

Frontend: React, TailwindCSS, face-api.js
Backend: Node.js, Express.js
Database: MongoDB (or your DB choice)
Other Tools: WebRTC, JWT, Razorpay (if payments integrated)

⚙️ Workflow
🔑 Organization Workflow

Organization registers a student in the system.

System auto-generates credentials (username & password).

Credentials are securely shared with the student.

Organization creates an exam schedule and assigns it to students.

🎓 Student Workflow

Student logs in with system-generated credentials.

Student selects the assigned exam from their dashboard.

System requests camera & microphone access.

Exam starts in fullscreen mode.

👀 Proctoring in Action

During the exam, the following checks continuously run:

Face Detection → Verifies one face is visible.

Eye/Head Tracking → Detects if student looks away.

Voice Monitoring → Detects background noise or multiple voices.

Fullscreen Enforcement → Detects tab switches or exit.

⚠️ Violation Handling

Minor Violations → Warning displayed.

Repeated Violations → Strike count increases.

Major Violations → Auto submission of exam.

📝 Exam Completion

Student submits manually OR system auto-submits.

Responses + violation logs sent to backend.

Results stored in database for organization review.

📊 Workflow Diagram
flowchart TD

A[Organization Registers Student] --> B[System Generates Username & Password]
B --> C[Credentials Shared with Student]
C --> D[Organization Creates & Assigns Exam]
D --> E[Student Logs in with Credentials]
E --> F[Student Joins Exam]
F --> G[Camera & Mic Access Granted]
G --> H[Exam Starts in Fullscreen Mode]

H --> I{Proctoring Checks}
I --> I1[Face Detection]
I --> I2[Eye/Head Movement]
I --> I3[Voice Monitoring]
I --> I4[Fullscreen Enforcement]

I1 --> J[Violations Logged]
I2 --> J
I3 --> J
I4 --> J

J --> K{Violation Severity}
K -->|Minor| L[Warning Displayed]
K -->|Repeated| M[Strike Count Increased]
K -->|Major| N[Auto Submission]

L --> O[Exam Completion]
M --> O
N --> O

O --> P[Answers + Logs Sent to Backend]
P --> Q[Results Stored for Review]
