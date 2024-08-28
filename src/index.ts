// src/index.ts
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import crypto from "crypto"
import { creatNewUser,getAllUsers,getUserById,updateUsersById,deleteUserById, getUserByName } from "./db/user";
import { generateToken } from "./utils/jwtUtils";
import { CheckAuth } from "./middleware/checkAuth";
import cookieParser from 'cookie-parser';
const app = express();
const port = 3000;
export const SECRET_KEY = "12345678";
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser()); 

let users = [];
const MONGO_URL = "mongodb://127.0.0.1/jwt";
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  // Replace with the actual password you want to hash
  try {
    const hashedPassword = await bcrypt.hash(password, 8);
    const newUser=await creatNewUser({ username, password: hashedPassword, email })
    res.status(200).send(newUser)
  } catch (error) {
    res.status(500).send("Error hashing password");
  }
});
app.post("/login", async (req, res) => {
    const { username, password } = req.body;


    try {
        const user= await getUserByName(username)
        if (!user) {
            return res.status(404).send("User not found,Please Register first");
          }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid password");
          }
        const csrf = crypto.randomBytes(128).toString('base64')
        const token = generateToken({_id:user._id,username: user.username,csrfToken:csrf});
        console.log("token",token)
        res.setHeader('X-CSRF-Token',csrf)
        res.cookie('APP_AUTH', token, {domain:"localhost",path:"/", httpOnly: true ,expires: new Date(Date.now() + 86400000),}); 
        res.status(200).json({
            success: true,
            message: 'Authentication successful!',
            token: token,
          });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password',
          });
    }
  });
  app.get("/protected", CheckAuth,async (req, res) => {
    console.log("hello")
    return res.status(200).json({
        success: true,
        message: 'this is protected',
      });
  });
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
if (!MONGO_URL) throw Error("missing mongo connection string");
mongoose.connect(MONGO_URL);
mongoose.connection.on("error", (error: Error) => {
  console.log(error);
});
mongoose.connection.on("connected", async () => {
  console.log("Mongo Database connected");
});
