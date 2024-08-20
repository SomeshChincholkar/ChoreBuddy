const express = require("express");
const router = express.Router();
const Group = require("../models/group");
const User = require("../models/user");
const Task = require("../models/task.js")
const mongoose = require('mongoose');

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

// Apply the middleware to all group routes
router.use(isLoggedIn);


// Get all groups for the logged-in user
router.get("/", async (req, res) => {
    const userId = req.session.userId;
    const userGroups = await Group.find({ members: userId });
    res.render("groups/index.ejs", { userGroups });
});

// Create a new group
router.get("/new", (req, res) => {
    res.render("groups/new.ejs");
});

// Create a new group
router.post("/", async (req, res) => {
    const { name } = req.body;
    const userId = req.session.userId;
    const group = new Group({
        name,
        admin: userId,
        members: [userId]
    });
    await group.save();
    res.redirect("/groups");
});

// View all groups (for the logged-in user)
router.get("/", async (req, res) => {
    const groups = await Group.find({ members: req.session.userId });
    res.render("groups/index.ejs", { groups });
});


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const userId = req.session.userId; // Get the logged-in user's ID
    const group = await Group.findById(id).populate('members');
    const tasks = await Task.find({ assignedTo: { $in: group.members.map(member => member._id) } }).populate('assignedTo');
    res.render("groups/show.ejs", { group, tasks, userId });
});


// Edit group details (only for admin)
router.get("/:id/edit", async (req, res) => {
    const { id } = req.params;
    const group = await Group.findById(id);
    if (group.admin.toString() !== req.session.userId.toString()) {
        return res.redirect("/groups");
    }
    res.render("groups/edit.ejs", { group });
});


router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, newMembers } = req.body;
    const group = await Group.findById(id);

    if (group.admin.toString() !== req.session.userId.toString()) {
        return res.redirect("/groups");
    }

    // Update group name
    if (name) {
        group.name = name;
    }

    // Add new members if provided
    if (newMembers) {
        const usernames = newMembers.split(',').map(username => username.trim());

        // Fetch user IDs from usernames
        const users = await User.find({ username: { $in: usernames } });
        const userIds = users.map(user => user._id.toString());

        // Validate and filter ObjectIds
        const validUserIds = userIds.filter(userId => mongoose.isValidObjectId(userId));

        // Avoid duplicates and add valid user IDs
        const uniqueMembers = Array.from(new Set([...group.members, ...validUserIds]));
        group.members = uniqueMembers;
    }

    await group.save();
    res.redirect(`/groups/${id}`);
});


// Assign a task to group member
router.get("/:id/addTask", async (req, res) => {
    const { id } = req.params;
    const group = await Group.findById(id).populate('members');
    
    if (!group) {
        return res.redirect("/groups");
    }

    res.render("groups/addTask.ejs", { group });
});


router.post("/:id/addTask", async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, priority, taskStatus, createdAt, assignedTo } = req.body.task;

    const group = await Group.findById(id);

    if (!group || !group.members.includes(assignedTo)) {
        return res.redirect(`/groups/${id}/addTask`);
    }

    const task = new Task({
        title,
        description,
        dueDate,
        priority,
        taskStatus,
        createdAt,
        assignedTo,
        groupId: id
    });

    await task.save();
    res.redirect(`/groups/${id}`);
});


router.get("/:id/calendar", async (req, res) => {
    const { id } = req.params;
    const group = await Group.findById(id).populate('members');
    const tasks = await Task.find({ groupId: id }).populate('assignedTo');

    // Format tasks for FullCalendar
    const formattedTasks = tasks.map(task => ({
        title: `${task.title} - ${task.assignedTo.username}`,
        start: task.dueDate.toISOString(),
        description: task.description
    }));

    res.render("groups/calendar.ejs", { group, tasks: formattedTasks });
});



module.exports = router;
