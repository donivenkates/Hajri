const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const demoUsersRoutes = require("./routes/EmpAttendance");
const reportRoutes = require("./routes/Reports");
// const googleDrive = require("./routes/GoogleDrive");

app.use("/api", demoUsersRoutes);
app.use("/api", reportRoutes);
// app.use("/api", googleDrive);

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
