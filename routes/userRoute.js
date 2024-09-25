const express = require("express")
const userController= require("../controllers/userController")
const authToken = require("../middleware/authMiddleware")
const router = express.Router();
router.post("/createUser",userController.createUser)
router.put("/updateStatus", authToken,userController.updateStatus)
router.get("/createDistance", authToken,userController.createDistance)
router.get("/users/weekday/:weekday", authToken,userController.users)
module.exports=router