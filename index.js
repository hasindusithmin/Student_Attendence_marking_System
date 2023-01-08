// install express with `npm install express` 
const express = require('express')
const studentModel = require('./models/students')
const mongoose = require('mongoose')
const uuidBase62 = require('uuid-base62');
const cors = require('cors')

const app = express()

app.use(cors())

app.use(express.json())

app.get('/', async (req, res) => {
    try {
        const students = await studentModel.find()
        res.status(200).json(students)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/:uuid4', async (req, res) => {
    try {
        const { uuid4 } = req.params;
        const student = await studentModel.findOne({ uuid4 })
        res.status(200).json(student)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/', async (req, res) => {
    try {
        const uuid4 = uuidBase62.v1()
        const { ssn, name, address, email, phone_number, class_fee } = req.body;
        const students = await studentModel.create({ uuid4, ssn, name, address, email, phone_number, class_fee, attendence: [], earlyleave: [] })
        res.status(200).json(students)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})



app.put('/:uuid4/:action', async (req, res) => {
    try {
        const { uuid4, action } = req.params;
        const valid_actions = ['enter', 'leave']
        if (!valid_actions.includes(action)) throw Error(`action is not valid`)
        const date = new Date()
        const { ssn, name, address, email, phone_number, class_fee, attendence, earlyleave } = await studentModel.findOne({ uuid4 })
        if (action === 'enter') attendence.push(new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"}))
        else if (action === 'leave') earlyleave.push(new Date().toLocaleString("en-US", {timeZone: "Asia/Colombo"}))
        const student = await studentModel.updateOne({ uuid4 }, { uuid4, ssn, name, address, email, phone_number, class_fee, attendence, earlyleave })
        res.status(200).json(student)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/:uuid', async (req, res) => {
    try {
        const { uuid } = req.params;
        const student = await studentModel.deleteOne({ uuid })
        res.status(200).json(student)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})


mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL)
    .then(() => {
        app.listen(3000, () => {
            console.log('db conneted\nserver running:3000');
        })
    })
    .catch(err => {
        console.error({ error: err.message });
    })

// export 'app'
module.exports = app