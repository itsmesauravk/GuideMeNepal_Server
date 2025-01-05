import mongoose from "mongoose";


const ConnectDB = async () => {
    try {
       
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(` 🌐 MongoDB Connected ==> ${conn.connection.name}`);
    } catch (error) {
        console.error(` ⛔ Error: ${error.message}`);
        process.exit(1);
    }
}

export default ConnectDB