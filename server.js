const express = require("express");
const connectDB = require("./config/db");
const methodOverride = require("method-override");
const cors = require('cors');

const app = express();

// Connect Database
connectDB();

// Init Middlewares
app.use(express.json({ extended: true }));

var BodyParser = require('body-parser');
app.use(BodyParser.urlencoded({ extended: true }));
app.use(BodyParser.json());

// App Config
app.use(methodOverride("_method"));

// App Cors
app.use(cors());

app.get("/", (req, res) => {
  res.send("index");
});

// Define Routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/appointment", require("./routes/api/Appointment/appointmentHandler"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
