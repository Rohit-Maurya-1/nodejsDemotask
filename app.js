const express= require("express")
const userRouter= require("./routes/userRoute")
require("./connection/conn")
const  PORT=  process.env.Port||8080
//== middleware===================
const app = express()
//==========router===========
app.use(express.json());
app.use(userRouter)
app.get('/',(req,res)=>{
     res.send("hi rohit")
})


app.listen(PORT,()=>{
  console.log(`port connected ${PORT}`);
  
})