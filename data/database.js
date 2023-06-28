import mongoose from "mongoose";
export const connection = () => {
    mongoose.connect(process.env.MONGO_URI,{
        dbName: "socialmedia",
    }).then((c) => {console.log(`Database connected with ${c.connection.host}`)}).catch((e) => console.log(e));
}