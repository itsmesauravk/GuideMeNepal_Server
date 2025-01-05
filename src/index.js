import { connect } from "mongoose";
import app from "./app.js";
import ConnectDB from "./db/ConnectDB.js";

const PORT = process.env.PORT || 4000;

if(ConnectDB()){

    app.listen(PORT, () => {
        console.log(`
   Server is running on port ==> ${PORT}   
            `);
    })
}else{
    console.log("Connection Problem");
}


