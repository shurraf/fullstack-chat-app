const mongoose = require('mongoose')

exports.connectDb = async()=> {
  try{
    const cnctn = await mongoose.connect(process.env.MONGODB_URL)
    console.log(`database connected successfully to ${cnctn.connection.host}`);
  }catch(error){
    console.log('error while connecting to mongodb ',error)
  }
}