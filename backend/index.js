require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/snippets', require('./routes/snippets'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/collaboration', require('./routes/collaboration'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Robust error handler
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const isDev = process.env.NODE_ENV === 'development';

    console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - Error: ${err.message}`);
    if (isDev) console.error(err.stack);

    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(isDev && {
            stack: err.stack,
            details: err.details || null
        })
    });
});

app.listen(PORT, () => {
    console.log(`Sunder Backend listening on port ${PORT}`);
});
