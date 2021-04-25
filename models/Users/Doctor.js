var mongoose = require("mongoose");

var doctorSchema = new mongoose.Schema({
    name: {
        type: String
    },
    fatherName: {
        type: String
    },
    address: {
        type: String
    },
    dob: {
        type: Date,
        required: true
    },
    mobNumber: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    }
});

module.exports = mongoose.model("doctor", doctorSchema);