const cassandra = require('cassandra-driver');

// Create client
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'], // your Cassandra node
    localDataCenter: 'datacenter1', // default for local setup
    keyspace: 'ecommerce' // your DB name
});

// Connect function (optional)
async function connectDB() {
    try {
        await client.connect();
        console.log('✅ Connected to Cassandra');
    } catch (err) {
        console.error('❌ Cassandra connection error:', err);
    }
}

module.exports = {
    client,
    connectDB
};