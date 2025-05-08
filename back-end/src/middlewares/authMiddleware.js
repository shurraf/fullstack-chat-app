const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

exports.protectRoute = async(req,res,next) => {
  try{
    const token = req.cookies.jwt
    if(!token){
      return res.status(401).json({message: 'please login or register first'})
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)

    if(!decoded){
      return res.status(401).json({ message: "unauthorized user" });
    }

    const user = await User.findById(decoded.userId).select('-password')

    if(!user){
      return res.status(404).json({ message: "user not found" });
    }

    req.user = user
    next()

  }catch(error){
    console.log('error in protectRoute middleware ',error.message)
    return res.status(500).json({ message: "internal server error" });
  }
}