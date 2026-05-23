const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Simple but explicit CORS configuration
app.use(cors({
  origin: [
    'https://team-task-manager-taupe-ten.vercel.app',
    'https://team-task-manager-git-main-anas9169s-projects.vercel.app',
    'https://team-task-manager-2vli0r5b3-anas9169s-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;