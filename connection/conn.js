const mongoose= require("mongoose");
const dotenv=require("dotenv")

dotenv.config()
 const DB=process.env.DATABASE
 const connection= mongoose.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then((res)=>{
     console.log("connection successfully")
}).catch((err)=>{
 console.log("connection error")
})
module.exports=connection;