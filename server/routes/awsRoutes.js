const express = require("express");
const router = express.Router();

const awsSns = require("../controllers/awsController");

// Router for aws
router.post("/sns-subscription-confirmation", awsSns.incomingMessageHandler);

// module.exports = router
module.exports = function(){
	return router;
};