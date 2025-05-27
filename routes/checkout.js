const express = require('express');
const router = express.Router();
const {auth} = require("../middleware/auth");
const {createStripeSession} = require('../controllers/checkOut');

router.post('/', auth, createStripeSession);

module.exports = router;