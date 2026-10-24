const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}
module.exports = connectDB;