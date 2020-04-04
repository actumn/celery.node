"use strict";
const express = require("express");
const app = require("./app");

// start the UI
app(express()).listen(5000);
console.log("Video conversion server started on port 5000");
