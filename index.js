const express = require("express");
const dontenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const dbConnection = require("./dbConfig/dbConnection");
const routes = require("./routes/index");
const errorMiddleware = require("./middleware/errorMiddleware");

dontenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

dbConnection();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(routes);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
