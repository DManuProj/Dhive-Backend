const mongoose = require('mongoose')

const dbConnection = async () => {
    try {
       await mongoose.connect(process.env.MONGODB_URL,{
      
        })
        console.log("DB connected")
    } catch (error) {
        console.log("DB connection failed" + error)
    }
}


module.exports = dbConnection