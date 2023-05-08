// Import necessary packages
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require('express-session');
const uuid = require('uuid');
var cookieParser = require('cookie-parser');
// Create express app
const app = express();
app.use(cookieParser())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});
app.use(express.urlencoded({ extended: false }));
// coookie parasr
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        User.findById(req.session.userId)
            .then(user => {
                if (user) {
                    req.user = user;
                    next();
                } else {
                    res.status(401).send('Unauthorized');
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Internal server error');
            });
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/myapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
    console.log("MongoDB connected!");
});


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: false },
    password: { type: String, required: true },
    sessions: [{ type: String, required: false }],
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Image', required: false }],
});

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);
const Image = mongoose.model('Image', imageSchema);
// Middleware to parse JSON body
app.use(express.json());

// Route to create a new user
app.post("/api/register", async (req, res) => {
    const { email, password, name } = req.body;
    console.log(email, password, name);
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user in database
    console.log(hashedPassword);
    try {
        const user = new User({ email, password: hashedPassword, name });
        await user.save();
        res.cookie("token", hashedPassword, { httpOnly: true });
        res.json({ message: "User created successfully", token: hashedPassword });
    } catch (err) {
        res.status(400).json({ message: "Error creating user" });
    }
});

app.get('/authStatus', (req, res) => {
    if (req.body?.token) {
        res.status(200).json({ message: "User is logged in" })
    } else {
        res.status(401).json({ message: "User is not logged in" })
    }
});

// Route to log in a user
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);
    // Find user in database
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: "Invalid email " });
    }

    // Check if password is correct

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log({
        password,
        userPassword: user.password,
        passwordMatch
    })
    if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password" });
    }
    User.findOne({ email: req.body.email })
        .then(user => {
            console.log(user + "user");
            if (user) {
                const sessionId = uuid.v4();
                req.session.userId = user._id;
                user.sessions.push(sessionId);
                user.save()
                    .then(() => {
                        console.log('Session ID generated successfully', sessionId);
                        res.cookie('sessionId', sessionId, {
                            maxAge: 24 * 60 * 60 * 1000, // 1 day
                            sameSite: 'none',
                            secure: true,
                        });
                        res.setHeader('Set-Cookie', 'sessionId=' + sessionId + '; HttpOnly');

                        // res.redirect('/');
                    })
                    .catch(err => {
                        console.error(err);
                        console.error(err);
                        res.status(500).send('Internal server error');
                    });
            } else {
                res.status(401).send('Invalid username or password');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal server error');
        });
});

// Route to get user information (protected route)
app.get("/api/user", authenticateToken, (req, res) => {
    res.json({ email: req.user.email });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authentication failed" });
    }

    jwt.verify(token, "secret", (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        req.user = user;
        next();
    });
}

// Start server
app.listen(3000, () => console.log("Server started on port 3000"));
