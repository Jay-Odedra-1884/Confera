import mongoose, { Mongoose } from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    tocken: {
        type:String
    }
});

const User = mongoose.model("User", userSchema);

export { User };