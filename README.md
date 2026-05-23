# Team Task Manager

A full-stack Team Task Manager application built using the MERN stack.  
This project allows teams to manage projects, assign tasks, track progress, and monitor task statistics through a clean dashboard interface.

---

## Features

### Authentication & Authorization
- User Registration & Login
- JWT Authentication
- Role-based Access (Admin / Member)

### Project Management
- Create Projects
- View All Projects
- Manage Team Workspaces

### Task Management
- Create Tasks
- Assign Tasks to Team Members
- Update Task Status
- Set Priority Levels
- Track Pending & Completed Tasks

### Dashboard
- Total Projects
- Total Tasks
- Completed Tasks
- Pending Tasks
- Overdue Tasks
- Recent Task Activity
- Task Status Statistics

---

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- Context API
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

### Deployment
- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas

---

## Project Structure

```bash
team-task-manager/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── vercel.json
│   └── package.json
│
└── README.md
