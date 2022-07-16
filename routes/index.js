const express = require("express");
const splitPaymentController = require("../controllers/index");
const router = express.Router();

router.post("/", splitPaymentController.splitPaymentCompute);

module.exports = router;
