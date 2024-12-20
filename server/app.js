const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser")
const { initializeDatabase, getDatabase } = require("./database");
const handleRoutes = require("./routes");
const bodyParser = require("body-parser")

const app = express();
app.use(express.static("public"));
app.use(cors({
    origin: 'https://familydocs.onrender.com',
    credentials: true
}));
app.use(express.json())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Middleware for creating session for users
const sessionMiddleware = session({
    secret: '342dd*#*#hgo##huho(*)&^@$%#()(u8ehdg',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        maxAge: 3600000
    }
});

app.use(sessionMiddleware);
app.use(cookieParser());

const port = process.env.PORT || 5000;

async function main() {
    try {
        // Initialize the database
        await initializeDatabase("FamilyDocs");
        const { db, gfs } = getDatabase();

        // Set up routes
        handleRoutes(app, db, gfs);

        // Start the server
        app.listen(port, () => {
            console.log(`Server is listening at port ${port}`);
        });
    } catch (error) {
        console.error("Error initializing database:", error);
        throw new Error("Error initializing database");
    }
}

main();
