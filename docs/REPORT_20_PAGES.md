# StudySync – 20 Page Project Report

## Page 1 – Title
StudySync: Real-Time Remote Learning Platform.

## Page 2 – Abstract
StudySync recreates collaborative library study sessions for remote students.

## Page 3 – Problem Statement
Remote learning reduces peer interaction and shared study motivation.

## Page 4 – Objectives
Build groups, resources, live chat, whiteboard, quizzes, leaderboard and tutoring.

## Page 5 – Scope
The system supports student collaboration and tutor discovery.

## Page 6 – User Roles
Student, group owner, tutor and administrator.

## Page 7 – Functional Requirements
Authentication, groups, invites, uploads, chat, drawing, quizzes and bookings.

## Page 8 – Non-Functional Requirements
Security, low latency, availability, scalability and responsive UX.

## Page 9 – Architecture
React frontend, Django REST API, Socket.IO gateway and MongoDB.

## Page 10 – Database Design
Users, groups, memberships, resources, messages, quizzes, questions, attempts, tutors and bookings.

## Page 11 – Authentication
JWT/session strategy, protected endpoints and membership checks.

## Page 12 – Resource Hub
Files are uploaded to S3; only authorized group members can retrieve them.

## Page 13 – Real-Time Chat
Socket.IO rooms broadcast messages to members.

## Page 14 – Whiteboard
Canvas events are represented as line segments and broadcast to room peers.

## Page 15 – Video
PeerJS/WebRTC can be added for peer video in the room.

## Page 16 – Quiz Engine
Quiz creation, attempts, scoring and leaderboard aggregation.

## Page 17 – Tutor Marketplace
Tutor profiles expose subject, rate, availability and verification state.

## Page 18 – Booking
Server-side overlap validation prevents double booking.

## Page 19 – Testing and Deployment
Test APIs, room events, drawing synchronization, authorization and deployment.

## Page 20 – Conclusion
StudySync combines modern web development, real-time communication and learning tools into one scalable product.
