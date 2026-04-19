require('dotenv').config();
const cassandra = require('cassandra-driver');

// Read values from .env
const client = new cassandra.Client({
    contactPoints: process.env.CASSANDRA_CONTACT_POINTS.split(','),
    localDataCenter: process.env.CASSANDRA_DATACENTER,
    keyspace: process.env.CASSANDRA_KEYSPACE
});

// Connect function
async function connectDB() {
    try {
        await client.connect();
        console.log('Connected to Cassandra!');
    } catch (err) {
        console.error('Cassandra connection error:', err);
    }
}

module.exports = {
    client,
    connectDB
};