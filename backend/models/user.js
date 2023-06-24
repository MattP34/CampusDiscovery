const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    detail: {
        type: String,
        required: true,
    },
    events: {
        type: [ObjectId],
        required: true,
        default: []
    },
});

module.exports = mongoose.model('User', userSchema)