const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const USER_STATUS = [
    "Attending",
    "Undecided",
    "NotAttending"
];

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
    },
    host: {
        type: ObjectId,
        required: true,
    },
    capacity: {
        type: Number,
        required: false,
    },
    invite_only: {
        type: Boolean,
        required: true,
    },
    invited: {
        type: [
            ObjectId
        ],
        required: false
    },
    attending: {
        type: [
            {
                type: Object,
                properties: {
                    user: {
                        type: ObjectId,
                        required: true,
                    },
                    status: {
                        type: String,
                        required: true
                    },
                }
            }
        ],
        required: true,
    },
    coordinates: {
        type: Object,
        properties: {
            latitude: {
                type: Number,
                required: true,
            },
            longitude: {
                type: Number,
                required: true,
            }
        }
    }
})

module.exports = mongoose.model('Event', eventSchema)