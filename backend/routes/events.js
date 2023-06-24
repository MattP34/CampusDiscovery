const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Event = require('../models/event');
const { ObjectId } = require('mongodb');

const USER_STATUS = [
    "Attending",
    "Undecided",
    "NotAttending",
    "NoRSVP"
];

async function getEventFromJson(json) {
    const name = json.name.trim();
    const description = json.description.trim();
    const location = json.location.trim();
    const time = json.time.trim();
    const capacity = json.capacity;
    const invite_only = json.invite_only;
    console.log(json.coordinates);
    const latitude = json.coordinates.latitude;
    const longitude = json.coordinates.longitude;
    if(typeof(invite_only) != "boolean") {
        throw new Error("invite only value is not a boolean");
    }
    if(capacity != null && typeof(capacity) != "number") {
        throw new Error("capacity is not a number");
    }
    if(capacity != null && capacity < 1) {
        throw new Error("capacity cannot be non positive");
    }
    var host = new ObjectId(json.host);
    if(host == null) {
        throw new Error("invalid host value");
    }
    if(
        name.length == 0 ||
        location.length == 0 ||
        time.length == 0
    ) {
        throw new Error("name, location, or time is blank");
    }

    var event = null;
    var currUser = await User.findById(host);
    event = new Event({
        name: name,
        description: description,
        location: location,
        time: time,
        host: currUser._id,
        capacity: capacity,
        invite_only: invite_only,
        invited: (invite_only)?[
            currUser._id
        ]:null,
        attending: [{
            user: currUser._id,
            status: "Attending"
        }],
        coordinates: {
            latitude: latitude,
            longitude: longitude,
        }
    });
    console.log(latitude);
    console.log(longitude);
    console.log(event);
    return event;
}

function doesUserHavePermission(event, user) {
    var permissions = false;
    if(user.type == "Admin") {
        permissions = true;
    }
    if(user._id.equals(event.host)) {
        permissions = true;
    }
    return permissions;
}

async function getAttending(event_attending) {
    var attending = {
        attending: [],
        undecided: [],
        notAttending: []
    }
    for(let i = 0; i < event_attending.length; i++) {
        const status = event_attending[i].status;
        const user_id = event_attending[i].user;
        const user = (await User.findById(user_id));
        if(user == null) {
            console.log(user_id + " does not exist");
            continue;
        }
        const name = user.name;
        if(status == "Attending") {
            attending.attending.push({
                id: user_id.toString(),
                name: name
            });
        } else if(status == "Undecided") {
            attending.undecided.push({
                id: user_id.toString(),
                name: name
            })
        } else {
            attending.notAttending.push({
                id: user_id.toString(),
                name: name
            })
        }
    }
    return attending;
}

async function getInvited(invited) {
    if(invited == undefined) {
        return [];
    }
    var return_invitited = [];
    for(let i = 0; i < invited.length; i++) {
        const user_id = invited[i];
        const user = (await User.findById(user_id));
        if(user == null) {
            console.log(user_id + " does not exist");
            continue;
        }
        const name = user.name;
        return_invitited.push(
            {
                id: user_id,
                name: name
            }
        )
    }
    return return_invitited;
}

function userAttendingStatus(event, user) {
    for(let i = 0; i < event.attending.length; i++) {
        const status = event.attending[i].status;
        const user_id = event.attending[i].user;
        if(user_id.equals(user._id)) {
            return status;
        }
    }
    return "No RSVP";
}

function isEventOpen(event, user) {
    if(event.invite_only) {
        var hasInvite = false;
        for(let i = 0; i < event.invited.length; i++) {
            if(event.invited[i].equals(user._id)) {
                hasInvite = true;
            }
        }
        if(!hasInvite) {
            return false;
        }
    }
    if(event.capacity == undefined || event.capacity == null) {
        return true;
    }
    var currSize = 0;
    for(let i = 0; i < event.attending.length; i++) {
        if(event.attending[i].status == "Attending") {
            if(event.attending[i].user.equals(user._id)) {
                continue;
                // if the user is already attending then they shouldn't count
            }
            currSize++;
        }
    }
    return currSize < event.capacity;
}

async function eventToJson(event, user, hostName, hasPermissions) {
    const attending = await getAttending(event.attending);
    const userAttending = userAttendingStatus(event, user);
    const invited = await getInvited(event.invited);
    return {
        "id": event._id,
        "name": event.name,
        "description": event.description,
        "location": event.location,
        "time": event.time,
        "hostName": hostName,
        "hasPermissions": hasPermissions,
        "capacity": (event.capacity!=undefined)?event.capacity:null,
        "invite_only": event.invite_only,
        "attending": attending,
        "open": isEventOpen(event, user),
        "user_attending": userAttending,
        "invited": invited,
        "coordinates": {
            latitude: event.coordinates.latitude,
            longitude: event.coordinates.longitude
        }
    };
}

// Getting one
// should have the id as a query parameter
router.get('/by_user/', async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        const user = await User.findById(id);
        if(user == null) {
            throw new Error("User with id:" + id + "was not found");
        }
        const events = await Event.find();
        var sendEvents = [];
        for(let i = 0; i < events.length; i++) {
            var event = events[i];
            // will need to make this operation happen in parell
            var host = null;
            if(event.host != null) {
                host = await User.findById(event.host);
            }
            hasPermissions = doesUserHavePermission(event, user);
            sendEvents.push(await eventToJson(event, user, host.name, hasPermissions));
        }
        res.status(201).json(
            {
                events: sendEvents
            }
        );
    } catch(err) {
        res.status(400).json({message: err.message});
    }
})


router.post('/', async (req, res) => {
    console.log("post");
    try {
        var event = await getEventFromJson(req.body);
        var newEvent = await event.save();
        var host = await User.findById(event.host);
        if(host == null) {
            throw new Error(" User with id:"+event.host+" does not exist");
        }
        hostName = host.name;
        var eventTemp = await eventToJson(event, host, hostName, true);
        res.status(201).json(
            eventTemp
        );
    } catch(err) {
        console.log(err);
        res.status(400).json({message: "Server error: " + err.message});
    }
});

router.post('/edit/', async (req, res) => {
    console.log("edit");
    try {
        var event_id = new ObjectId(req.body.id);
        var event = await Event.findById(event_id);
        var user = await User.findById(req.body.editor);
        if(event == null) {
            res.status(404).json({message:"event to edit not found"});
            return;
        }
        if(user == null) {
            res.status(404).json({message:"user was not found"});
            return;
        }
        var permissions = doesUserHavePermission(event, user);
        if(!permissions) {
            res.status(400).json({message:"user does not have permission to edit"});
            return;
        }
        await event.update({
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            time: req.body.time,
            coordinates: req.body.coordinates
        })
        res.status(201).json(
            {
                status: "good"
            }
        );
        console.log("edit success");
    } catch(err) {
        console.log(err.message);
        res.status(400).json({message: "Server error: " + err.message});
    }
    console.log("done");
});

router.delete('/', async (req, res) => {
    console.log("delete");
    try {
        const user_id = new ObjectId(req.query.user_id);
        const event_id = new ObjectId(req.query.event_id);
        const user = await User.findById(user_id);
        if(user == null) {
            res.status(404).json({message: "user not found"});
            return;
        }
        const event = await Event.findById(event_id);
        if(event == null) {
            res.status(404).json({message: "event not found"});
            return;
        }
        var hasPermissions = doesUserHavePermission(event, user); 
        if(!hasPermissions) {
            console.log("permissions");
            res.status(400).json({message: "user does not have permissions"});
            return;
        }
        const result = await Event.deleteOne({_id: event._id});
        if(result.deletedCount == 1) {
            res.status(200).json({
                status: "good"
            });
        } else {
            res.status(404).json({message: "did not find element to delete"});
        }
    } catch (err) {
        console.log("error:" + err.message);
        res.status(400).json({message: "Server error: " + err.message});
    }
    console.log("done");
});

async function updateRSVP(event, user, status) {
    var attending = event.attending;
    var updated = false;
    for(let i = 0; i < attending.length; i++) {
        if(user._id.equals(attending[i].user)) {
            if(status == "NoRSVP") {
                attending.splice(i, 1);
                updated = true;
                break;
            }
            attending[i].status = status;
            updated = true;
            break;
        }
    }
    if(!updated) {
        attending.push(
            {
                user: user._id,
                status: status
            }
        );
    }
    await event.update({
        attending: attending
    });
}

router.post('/add_rsvp/', async (req, res) => {
    console.log("rsvp");
    try {
        var event_id = new ObjectId(req.body.id);
        var event = await Event.findById(event_id);
        var user = await User.findById(req.body.user);
        var status = req.body.status;
        var correct_status = false;
        for(let i = 0; i < USER_STATUS.length; i++) {
            if(status == USER_STATUS[i]) {
                correct_status = true;
            }
        }
        if(!correct_status) {
            console.log("invalid status");
            res.status(404).json({message:"invalid status"});
            return;
        }
        if(event == null) {
            console.log("Event not found");
            res.status(404).json({message:"event to edit not found"});
            return;
        }
        if(user == null) {
            console.log("user not found");
            res.status(404).json({message:"user was not found"});
            return;
        }
        var open = isEventOpen(event, user);
        if(!open) {
            console.log("event not open")
            res.status(400).json({message:"event is not open"});
            return;
        }
        await updateRSVP(event, user, status);
        res.status(201).json(
            {
                status: "good"
            }
        );
        console.log("edit success");
    } catch(err) {
        console.log(err.message);
        res.status(400).json({message: "Server error: " + err.message});
    }
    console.log("done");
});

async function deleteRSVP(event, user_set) {
    var deleted = 0;
    var attending = [];
    for(let i = 0; i < event.attending.length; i++) {
        if(!user_set.has(event.attending[i].user.toString())) {
            attending.push(event.attending[i]);
        } else {
            deleted++;
        }
    }
    if(deleted < user_set.size) {
        console.log("deleted user was not RSVP'd");
    }
    await event.update({
        attending: attending
    });
    return true;
}

router.post('/delete_rsvp/', async (req, res) => {
    console.log("delete rsvp");
    try {
        console.log(req.body);
        var event_id = new ObjectId(req.body.id);
        var event = await Event.findById(event_id);
        var delete_users = req.body.delete_users;
        var user = await User.findById(req.body.user);
        var user_set = new Set();
        console.log(delete_users);
        for(let i = 0; i < delete_users.length; i++) {
            user_set.add(delete_users[i]);
        }
        console.log(user_set);
        if(event == null) {
            console.log("Event not found");
            res.status(404).json({message:"event to edit not found"});
            return;
        }
        var permission = doesUserHavePermission(event, user);
        if(!permission) {
            console.log("event not open")
            res.status(400).json({message:"event is not open"});
            return;
        }
        var val = await deleteRSVP(event, user_set);
        if(!val) {
            console.log("user not in event")
            res.status(400).json({message:"user not in event"});
            return;
        }
        res.status(201).json(
            {
                status: "good"
            }
        );
        console.log("edit success");
    } catch(err) {
        console.log(err.message);
        res.status(400).json({message: "Server error: " + err.message});
    }
    console.log("done");
});

async function deleteInvited(event, user_set) {
    var deleted = 0;
    var invited = [];
    for(let i = 0; i < event.invited.length; i++) {
        if(!user_set.has(event.invited[i].toString())) {
            invited.push(event.invited[i]);
        } else {
            deleted++;
        }
    }
    if(deleted < user_set.size) {
        console.log("deleted user was not RSVP'd");
    }
    await event.update({
        invited: invited
    });
    await deleteRSVP(event, user_set);
    return true;
}

router.post('/delete_invited/', async (req, res) => {
    console.log("delete invited");
    try {
        var event_id = new ObjectId(req.body.id);
        var event = await Event.findById(event_id);
        var delete_users = req.body.delete_users;
        var user = await User.findById(req.body.user);
        var user_set = new Set();
        for(let i = 0; i < delete_users.length; i++) {
            user_set.add(delete_users[i]);
        }
        if(event == null) {
            console.log("Event not found");
            res.status(404).json({message:"event to edit not found"});
            return;
        }
        var permission = doesUserHavePermission(event, user);
        if(!permission) {
            console.log("user does not have permission")
            res.status(400).json({message:"event is not open"});
            return;
        }
        var val = await deleteInvited(event, user_set);
        if(!val) {
            console.log("user not in event")
            res.status(400).json({message:"user not in event"});
            return;
        }
        res.status(201).json(
            {
                status: "good"
            }
        );
        console.log("edit success");
    } catch(err) {
        console.log(err.message);
        res.status(400).json({message: "Server error: " + err.message});
    }
    console.log("done");
});

async function addInvited(event, new_user) {
    var deleted = 0;
    var invited = event.invited;
    for(let i = 0; i < invited.length; i++) {
        if(invited[i].equals(new_user._id)) {
            throw new Error("User is already invited");
        }
    }
    invited.push(new_user._id);
    await event.update({
        invited: invited
    });
    return true;
}

router.post('/add_invited/', async (req, res) => {
    console.log("add invited");
    try {
        var event_id = new ObjectId(req.body.id);
        var event = await Event.findById(event_id);
        var user = await User.findById(req.body.user);
        var new_user = await User.findOne( {username: req.body.username} );
        if(event == null) {
            console.log("Event not found");
            res.status(404).json({message:"event to edit not found"});
            return;
        }
        if(user == null) {
            console.log("user not found");
            res.status(404).json({message:"user was not found"});
            return;
        }
        if(new_user == null) {
            console.log("new user not found");
            res.status(404).json({message:"new user was not found"});
            return;
        }
        var permission = doesUserHavePermission(event, user);
        if(!permission) {
            console.log("user does not have permission")
            res.status(400).json({message:"event is not open"});
            return;
        }
        await addInvited(event, new_user);
        res.status(201).json(
            {
                status: "good"
            }
        );
        console.log("edit success");
    } catch(err) {
        console.log(err.message);
        res.status(400).json({message: "Server error: " + err.message});
    }
    console.log("done");
});

router.get("/user_rsvp/", async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        const user = await User.findById(id);
        if(user == null) {
            throw new Error("User with id:" + id + "was not found");
        }
        const events = await Event.find();
        var sendEvents = [];
        for(let i = 0; i < events.length; i++) {
            var event = events[i];
            // will need to make this operation happen in parell
            var host = null;
            if(event.host != null) {
                host = await User.findById(event.host);
            }
            hasPermissions = doesUserHavePermission(event, user);
            var user_rsvpd = false;
            for(let i = 0; i < event.attending.length; i++) {
                if(event.attending[i].user.equals(id)) {
                    user_rsvpd = true;
                    break;
                }
            }
            if(user_rsvpd) {
                sendEvents.push(await eventToJson(event, user, host.name, hasPermissions));
            }
        }
        res.status(201).json(
            {
                events: sendEvents
            }
        );
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

module.exports = router;