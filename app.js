if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require("express")
const app = express()

const mongoose = require("mongoose");

const methodOverride = require("method-override")
app.use(methodOverride("_method"))

const dbUrl = process.env.ATLASDB_URL

async function main() {
  await mongoose.connect(dbUrl);
}

main().then(()=>{
    console.log("connected to DB")
}).catch(err =>{
    console.log(err)
})

app.use(express.static(__dirname + '/public'));

const path = require("path")
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({extended: true}))

const session = require("express-session")
const MongoStore = require("connect-mongo")

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret: process.env.SECRET
    },
    touchAfter: 24 * 3600                 // in seconds, so it is 1 day
  })
  
  store.on("error", ()=>{
    console.log("ERROR in Mongo session store", err)
  })
  
  const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUnintialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 600 * 60 * 1000,
      maxAge: 7 * 24 * 600 * 60 * 1000,
      httpOnly: true,
    },
  };   

app.use(session(sessionOptions))

app.listen(8080, ()=>{
    console.log("Server is listening on port 8080")
})

app.get("/", (req, res)=>{
    res.send("Main Page")
})

const taskRouter = require("./routes/task.js")
app.use("/tasks", taskRouter)

const userRouter = require("./routes/user.js")
app.use("/", userRouter)

const groupRouter = require("./routes/group.js")
app.use("/groups", groupRouter)

const calendarRoute = require("./routes/calendar");
app.use("/calendar", calendarRoute);
