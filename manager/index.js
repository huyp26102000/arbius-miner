const express = require("express");
const app = express();
require("dotenv").config();

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
