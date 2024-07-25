const express = require('express')

const router = express.Router() 

const authController = require('../controllers/authController')

router.post('/register',authController.userSignup)
router.post('/google-signup', authController.googleSignup)
router.post('/login',authController.login)


module.exports = router