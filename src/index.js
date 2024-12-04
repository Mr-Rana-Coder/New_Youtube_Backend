import dotenv from "dotenv";
import connectDB from "../src/db/index.js";

dotenv.config({
    path:"./env"
})

connectDB().
then(()=>{
    app.listen(process.env.PORT || 9000,()=>{
        console.log("Server is Running",process.env.PORT);
    })
}).
catch((err)=>{
    console.log("Mongo Connection Error : ",err);
})