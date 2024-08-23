const express = require("express");
const mainRouter = require("./routes/index");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(cors({origin: "http://localhost:5173"}));

app.use("/api/v1",  (req, res, next)=>{console.log("in serverxx");next();
} , mainRouter);

console.log("Server is running");

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
