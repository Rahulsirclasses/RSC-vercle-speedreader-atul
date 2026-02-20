require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;

        const drills = await db.collection('drillresults').find().toArray();
        const sessions = await db.collection('readingsessions').find().toArray();

        console.log('--- DATABASE CHECK ---');
        console.log('Total Drills:', drills.length);
        if (drills.length > 0) console.log('Sample Drill:', JSON.stringify(drills[drills.length - 1], null, 2));

        console.log('Total Sessions:', sessions.length);
        if (sessions.length > 0) console.log('Sample Session:', JSON.stringify(sessions[sessions.length - 1], null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

check();
