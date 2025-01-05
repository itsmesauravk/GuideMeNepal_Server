
import app from "./app.js";
import ConnectDB from "./db/ConnectDB.js";

const PORT = process.env.PORT || 4000;


    

ConnectDB()
.then(() => {
    app.listen(PORT ||4000, () => {
        console.log(` 🚀 Server is running on port ==> ${PORT} `);
    })
})
.catch((err) => {
    console.log(" ⛔ Connection Problem");
})


