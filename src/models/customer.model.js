const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    bvn: {
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    onboardingStatus: {
        type: String,
        enum: ['pending', 'onboarded', 'failed'],
        default: 'pending'
    },

    nibssResponse: {
        type: Object
    },
    password: {
        type: String,
        required: true,
        select: false
    }

   }, { timestamps: true,
    toJSON: {transform: (doc, ret) => {
        delete ret.password;
        return ret;
    }},
   });

module.exports = mongoose.model('Customer', customerSchema);