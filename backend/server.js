require('dotenv').config()

const express = require ('express')
const app = express()
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

// mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
const db = mongoose.connection
// db.on('error', (error) => console.error(error))
// db.once('open', () => console.log('Connected to Database'))

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const userRouter = require('./routes/users');
app.use('/users', userRouter);
const eventRouter = require('./routes/events');
app.use('/events', eventRouter);

app.listen(4000, () => console.log('Server Started'))
// mongodb+srv://azeezishaqui:<password>@cluster0.xzi0vky.mongodb.net/?retryWrites=true&w=majority
mongoose.connect(
    `mongodb+srv://azeezishaqui:Mehdi123@cluster0.xzi0vky.mongodb.net/?retryWrites=true&w=majority`
);
