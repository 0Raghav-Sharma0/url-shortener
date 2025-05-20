const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const {connectToMongoDB} = require("./connect");
const {checkForAuthentication , restricTo} = require("./middlewares/auth");
const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url")
  .then(() => console.log("Mongodb connected"))
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
  });
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url", restricTo(["Normal","Admin"]) , urlRoute);
app.use("/user", userRoute);
app.use("/", staticRoute);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  
  try {
    // Find the entry by shortId
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );

    // If no entry is found, return a 404
    if (!entry) {
      console.error(`No entry found for short URL: ${shortId}`);
      return res.status(404).send("URL not found");
    }

    console.log(`Redirecting to: ${entry.redirectURL}`); // Log the redirect URL
    res.redirect(entry.redirectURL); // Perform the redirect
  } catch (err) {
    // If any error occurs, log the error
    console.error("Error occurred while handling the URL redirect:", err);
    res.status(500).send("An error occurred while processing the request.");
  }
});



app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
