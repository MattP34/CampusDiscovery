const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Event = require('../models/event');
const { ObjectId } = require('mongodb');

const VALID_USER_TYPE =
[
    "Student",
    "Teacher",
    "Organizer",
    "Admin"
];

//Getting all
router.get('/', async (req, res) => {
    try{
        const users = await User.find()
        res.json(users)
    }catch (err){
        res.status(500).json({message: err.message})
    }
})


async function getUserFromJson(json) {
    const name = json.name.trim();
    const username = json.username.trim();
    const type = json.type.trim();
    const detail = json.detail.trim();

    var validType = false;
    for(let i = 0; i < VALID_USER_TYPE.length && !validType; i++) {
        if(VALID_USER_TYPE[i] == type) {
            validType = true;
        }
    }

    if(!(validType)) {
        throw new Error('invalid user type:' + type);
    }

    if(
        name.length == 0 ||
        username.length == 0
    ) {
        throw new Error("name or username is empty");    
    }

    const query = { "username" :
        {
            $eq: username
        }
    };
    var userSearch = await User.findOne(query);
    if(userSearch != null) {
        // Note this update is deprecated
        await userSearch.update({
            name: name,
            type: type,
            detail: detail
        });
        userSearch = await User.findOne(query);
        return userSearch
    };

    const user = new User({
        name: name,
        username: username,
        type: type,
        detail: detail
    });
    return user;
}

//Creating one
router.post('/', async (req, res) => {
    try {
        const user = await getUserFromJson(req.body);
        console.log("user");
        console.log(user);
        const newUser = await user.save();
        res.status(201).json(
            {
                "id": newUser._id,
                "name": newUser.name,
                "username": newUser.username,
                "type": newUser.type,
                "detail": newUser.detail
            }
        );
    } catch (err) {
        // catch for invalid json input for user
        res.status(400).json({message: "error on backend:" + err.message});
    }
})
//Updating one
router.patch('/', (req, res) => {
    
})

//Deleting one
router.delete('/:id', async (req, res) => {
    try {
        const id = new ObjectId(req.query.id);
        const result = await Event.deleteOne( {_id: id} );
        if(result.deletedCount === 1) {
            res.status(204);
        } else {
            res.status(404);
        }
    } catch(err) {
        res.status(400).json({message: err.message});
    } 
})


module.exports = router