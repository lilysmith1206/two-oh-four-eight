// import packages
const express = require('express');
const path = require('path');

// express
const app = express();

// serve build files dist

app.use(express.static("./dist/two-oh-four-eight"));

// route requests

app.use("/*", (req, res) => {
  res.sendFile("index.html", {root: "dist/two-oh-four-eight"});
});

// start app

app.listen(process.env.PORT || 8080);
