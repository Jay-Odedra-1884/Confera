import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt"
import crypto from "crypto";


//*user registeration controller
export const register = async (req, res) => {
    const { name, username, password } = req.body;

    try{
        let existingUser = await User.findOne({ username });

        if(existingUser) {
            return res.status(httpStatus.FOUND).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({message: "User Registered"});
    } catch (e) {
        res.json({message: `Something went wrong => ${e}`});
    }
}


//*user login controller
export const login = async (req, res) => {

    const { username, password } = req.body;

    if(!username || !password) {
        return res.status(400).json({message:"Please Provide Username and Password"});
    }

    try {
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(isPasswordValid) {
            let tocken = crypto.randomBytes(20).toString("hex");

            user.tocken = tocken;

            await user.save();
            return res.status(httpStatus.OK).json({tocken: tocken});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({message:"Invalid Username or Password"});
        }
    } catch (e) {
        res.json({message: `Something went wrong => ${e}`});
    }
}

