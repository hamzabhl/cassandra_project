const express = require('express');
const cors = require('cors');

const { connectDB } = require('./connexion/connexion');

const app = express();

app.use(express.json());
app.use(cors());

// DB
connectDB();

// Routes
app.use('/totals', require('./routes/totals_route'));
app.use('/stats', require('./routes/stats_route'));

app.listen(3000, () => {
    console.log('Server running on port 3000');
});