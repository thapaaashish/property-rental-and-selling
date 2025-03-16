var express = require("express");
const { handleEsewaSuccess } = require("../controllers/esewa.controller");
const { updateOrderAfterPayment } = require("../controllers/order.controller");
var router = express.Router();

router.get("/success", handleEsewaSuccess, updateOrderAfterPayment);

module.exports = router;