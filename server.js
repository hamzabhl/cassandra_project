const express = require('express');
const cors = require('cors');

const { connectDB } = require('./connexion/connexion');

const kpiRoutes = require('./routes/totals');
const customersByCountryRoute = require('./routes/customersByCountry');

const app = express();

app.use(express.json());
app.use(cors());

// DB
connectDB();

// Routes
app.use('/totals', kpiRoutes);
app.use('/customers-by-country', customersByCountryRoute);

app.listen(3000, () => {
    console.log('🚀 Server running on port 3000');
});