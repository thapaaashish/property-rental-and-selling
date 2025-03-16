var express = require("express");
const {
  createOrder,
  getAllOrders,
} = require("../controllers/order.controller");
var router = express.Router();

router.get("/", getAllOrders);
router.post("/create", createOrder);

module.exports = router;