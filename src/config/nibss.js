const axios = require("axios");

const nibssClient = axios.create({
  baseURL: "https://nibssbyphoenix.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.NIBSS_TOKEN}`,
  },
});

module.exports = nibssClient;
