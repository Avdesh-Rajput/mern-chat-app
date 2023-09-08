const mongoose = require('mongoose');

const connectDB = async() => {
     try {
       const conn = await mongoose.connect(process.env.MONGO_URI , 
          {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }
        )
        console.log('Succesfully connected to db');
     } catch (error) {
        console.log('Error in connecting to Db' , error)
     }
};

module.exports = connectDB;