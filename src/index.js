
import app from "./app.js";
import { sequelize } from "./db/ConnectDB.js";

const PORT = process.env.PORT || 4000;


// Connect to the database
sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');
    app.listen(PORT ||4000, () => {
        console.log(` 🚀 Server is running on port ==> ${PORT} `);
    })
  })
  .catch((error) => {
    console.log(" ⛔ Connection Problem", error);
  });





