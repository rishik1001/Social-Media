import app from "./app.js";
import {connection} from "./data/database.js"
import dotenv from "dotenv"
dotenv.config({
    path: './data/config.env'
});
connection();
app.listen(process.env.PORT,() => {
    console.log(`Server is running at ${process.env.PORT}`);
})