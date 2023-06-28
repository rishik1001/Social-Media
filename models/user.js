import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Please Enter a Name"]
    },
    avatar: {
        public_id: String,
        url: String
    },
    email: {
        type: String,
        required: [true,"Please Enter a mail Id"],
        unique: true
    },
    password: {
        type: String,
        required: [true,"Please Enter a Password"],
        minlength: [6,"Password must be atleast 6 characters"],
        select: false
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]

});
const users = mongoose.model("User",userSchema);
export default users;