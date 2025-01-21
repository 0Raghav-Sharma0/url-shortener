const shortid = require("shortid");
const { Client, GatewayIntentBits } = require("discord.js"); // Correctly import GatewayIntentBits
const mongoose = require("mongoose");
const URL = require("./models/url"); // Reuse your existing URL model
const { connectToMongoDB } = require("./connect");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const BOT_TOKEN = "MTMzMDk1Mjk5Njg4Nzk4NjI5OA.Ghoq1N.967VeacOnBDCsRox_Aphmdr5MDu5N8DNe-2WaY";
const MONGO_URI = "mongodb://127.0.0.1:27017/short-url";

connectToMongoDB(MONGO_URI)
  .then(() => console.log("Mongoose connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const [command, ...args] = message.content.split(" ");
  
  // Handle URL shortening
  if (command === "!shorten") {
    const longURL = args[0];
    if (!longURL) {
      message.reply("Please provide a valid URL to shorten.");
      return;
    }

    try {
      const shortId = shortid.generate(); // Explicitly generate shortId
      const newURL = await URL.create({
        shortId,
        redirectURL: longURL,
      });
      const shortURL = `http://localhost:8001/url/${newURL.shortId}`;
      message.reply(`Shortened URL: ${shortURL}`);
    } catch (err) {
      console.error("Error creating short URL:", err);
      message.reply("An error occurred while shortening the URL.");
    }
  }

  // Handle other commands (optional)
  else if (command === "!help") {
    message.reply("Commands:\n- `!shorten <URL>`: Shorten a given URL");
  }
});

client.login("MTMzMDk1Mjk5Njg4Nzk4NjI5OA.Ghoq1N.967VeacOnBDCsRox_Aphmdr5MDu5N8DNe-2WaY");
