const Customer = require('../models/customer.model');
const nibssService = require('./nibss.service');
const bcrypt = require('bcrypt');

async function onboardCustomer({ firstName, lastName, email, password, phoneNumber, bvn, dateOfBirth, gender }) {
    
    // Call NIBSS API to insert BVN
    const nibssResponse = await nibssService.insertBvn({
        bvn,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phoneNumber,
    });

    const customer = new Customer({
        firstName,
        lastName,
        email,
        phoneNumber,
        bvn,
        dateOfBirth,
        gender,
        password,
        onboardingStatus: nibssResponse.success ? 'onboarded' : 'failed', nibssResponse,
        
    });
    return await customer.save();
}
module.exports = { onboardCustomer };