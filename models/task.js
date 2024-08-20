const mongoose = require("mongoose")
const Schema = mongoose.Schema

const taskSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    description: String,
    assignedTo:{
        type: Schema.Types.ObjectId,
        ref: "User"        
    },
    dueDate: {
        type: Date,
        required: true
    },
    priority:{
        type: Number,
        required: true
    },
    taskStatus:{
        type: String,
        enum: ["Not Started", "In Progress", "Completed"],
        default: "Not Started"
    },
    groupId: {
        type: Schema.Types.ObjectId,
        ref: "Group"
    },
    createdAt: {
        type: Date,
        required: true
    }

})

const task = mongoose.model("Task", taskSchema)       // Since, Task so, collection name is tasks
module.exports = task
