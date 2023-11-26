// Backend (Node.js + Express + MongoDB example)
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());

// Connect to MongoDB
mongoose.connect(
  `mongodb+srv://myasinkngl:123123ma@realestate.mml9ms6.mongodb.net/?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Define a schema for markers
const markerSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  title: String,
});

const Marker = mongoose.model("Marker", markerSchema);

app.use(bodyParser.json());

// Save a marker to the database
app.post("/api/markers", async (req, res) => {
  const { latitude, longitude, title } = req.body;
  try {
    const marker = new Marker({ latitude, longitude, title });
    await marker.save();
    res.status(201).json(marker);
  } catch (error) {
    console.error("Error saving marker:", error);
    res.status(500).send("Error saving marker");
  }
});

// Get all markers from the database
app.get("/api/markers", async (req, res) => {
  const markers = await Marker.find();
  res.json(markers);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Define a route to handle marker deletion by ID
// Sample server-side code to handle deletion
app.delete("/api/markers/:markerId", async (req, res) => {
  const { markerId } = req.params;
  try {
    const deletedMarker = await Marker.findByIdAndDelete(markerId);
    if (!deletedMarker) {
      return res.status(404).send("Marker not found");
    }
    res.status(200).send("Marker deleted successfully");
  } catch (error) {
    console.error("Error deleting marker:", error);
    res.status(500).send("Error deleting marker");
  }
});
