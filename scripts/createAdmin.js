const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

      
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        const admin = new User({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            mobileNumber: '1234567890',
            homeAddress: 'Admin Address'
        });

        await admin.save();
        console.log('Admin created successfully');
        console.log('Email: admin@example.com');
        console.log('Password: Admin@123');

    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createAdmin();