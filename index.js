const express = require("express");
const path = require("path");
const cors = require("cors");
const paymentRouter = require("./routes/index");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/split-payments/compute", paymentRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
