const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    admin: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});


module.exports = mongoose.model("Group", groupSchema);
