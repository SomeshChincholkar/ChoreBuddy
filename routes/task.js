const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const Group = require("../models/group");

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

// Apply the middleware to all task routes
router.use(isLoggedIn);

// Get all tasks assigned to the logged-in user or their group
router.get("/", async (req, res) => {
    const userId = req.session.userId;
    const tasks = await Task.find({assignedTo: userId }).sort({ dueDate: 1 });
    res.render("tasks/index.ejs", { tasks, userId });
});

router.get("/new", async (req, res) => {
    const userId = req.session.userId;
    const userGroups = await Group.find({ members: userId });
    res.render("tasks/new.ejs", { userGroups });
});

// Create a new task and assign it to a group
router.post("/", async (req, res) => {
    const { title, description, dueDate, priority, groupId } = req.body.task;
    const userId = req.session.userId;
    const task = new Task({
        title,
        description,
        assignedTo: userId,
        dueDate,
        priority,
        groupId,
        createdAt: new Date()
    });
    await task.save();
    res.redirect("/tasks");
});

// Render form to edit a task
router.get("/:id/edit", async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId;

    // Fetch the task details
    const task = await Task.findOne({ _id: id, assignedTo: userId });

    // If the task doesn't exist or doesn't belong to the user, redirect
    if (!task) {
        return res.redirect("/tasks");
    }

    res.render("tasks/edit.ejs", { task });
});


// Update a task
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, priority, taskStatus } = req.body.task;
    await Task.findOneAndUpdate({ _id: id, assignedTo: req.session.userId }, { title, description, dueDate, priority, taskStatus });
    res.redirect("/tasks");
});

// Delete a task
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    await Task.findOneAndDelete({ _id: id, assignedTo: req.session.userId });
    res.redirect("/tasks");
});

module.exports = router;
