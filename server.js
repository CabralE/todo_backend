/////////////////////////////////////////////
// Import Our Dependencies
/////////////////////////////////////////////
require("dotenv").config() 
const express = require("express") 
const morgan = require("morgan") 
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const cors = require("cors");

/////////////////////////////////////////////
// Database Connection
/////////////////////////////////////////////
const DATABASE_URL = process.env.DATABASE_URL
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(DATABASE_URL, CONFIG)

mongoose.connection
    .on("open", () => console.log("Connected to Mongoose"))
    .on("close", () => console.log("Disconnected from Mongoose"))
    .on("error", (error) => console.log(error))

////////////////////////////////////////////////
// Our Models
////////////////////////////////////////////////
const { Schema, model } = mongoose

// todo schema
const todosSchema = new Schema({
    name: String,
    task: String,
    date: String,
    completed: Boolean
})

// todo model
const Todo = model("Todo", todosSchema)

const app = express()

/////////////////////////////////////////////////////
// Middleware
/////////////////////////////////////////////////////
app.use(morgan("tiny"))
app.use(methodOverride("_method")) 
app.use(express.urlencoded({ extended: true })) 
app.use(express.static("public")) 
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

////////////////////////////////////////////
// Routes
////////////////////////////////////////////
app.get("/", (req, res) => {
    res.send("your server is running a todo list... better catch it.")
})

app.get("/todo/seed", (req, res) => {
    const startTodo = [
        { name: "Orange", task: "orange", date: "November 1st", completed: false },
        { name: "Grape", task: "purple", date: "November 2nd", completed: true },
        { name: "Banana", task: "orange", date: "November 3rd", completed: false },
        { name: "Strawberry", task: "red", date: "November 4th", completed: true },
        { name: "Coconut", task: "brown", date: "November 5th", completed: false },
    ]
    Todo.remove({}, (err, data) => {
        Todo.create(startTodo, (err, data) => {
            res.json(data);
        }
        );
    });
});

app.get("/todo", async (req, res) => {
    try {
        res.json(await Todo.find({}));
    } catch (error) {
        res.status(400).json(error);
    }
});

app.post("/todo", async (req, res) => {
    try {
        res.json(await Todo.create(req.body));
    } catch (error) {
        res.status(400).json(error);
    }
});

app.put("/todo/:id", async (req, res) => {
    try {
        res.json(
            await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true })
        );
    } catch (error) {
        res.status(400).json(error);
    }
});

app.delete("/todo/:id", async (req, res) => {
    try {
        res.json(await Todo.findByIdAndRemove(req.params.id));
    } catch (error) {
        res.status(400).json(error);
    }
});

//////////////////////////////////////////////
// Server Listener
//////////////////////////////////////////////
const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Now Listening on port ${PORT}`))