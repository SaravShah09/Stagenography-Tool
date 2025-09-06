const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    logs: [{
        type: { type: String },
        fileFormat: { type: String },
        message: { type: String },
        time: { type: Date }
    }
    ],
    role: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);