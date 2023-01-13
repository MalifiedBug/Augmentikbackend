import { MongoClient } from "mongodb";
import cors from 'cors'
// const express = require("express"); // "type": "commonjs"
import express, { response } from "express"; // "type": "module"
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import bcrypt from 'bcrypt'
import  jwt  from "jsonwebtoken";



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT
const MONGO_URL = process.env.MONGO_URL;

//environment variables

//connect mongodb

async function MongoConnect(){
    const client = await new MongoClient(MONGO_URL).connect();
    console.log('Mongo Connected')
    return client;
}

const client = await MongoConnect();




app.get("/", function (request, response) {
  response.send("🙋‍♂️ Welcome to augmentik");
});


app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));

//package.json


//sign in sign up services

async function hashedPassword(password) {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

app.post("/signup", async function (request, response) {
  let { name, email, password } = request.body;
  let userdb = await client
    .db("Augmentik")
    .collection("Users")
    .findOne({ email: email });
  if (userdb) {
    response.status(200).send({ msg: "user already present", userdb });
  } else {
    const hashedPass = await hashedPassword(password);
    let result = await client
      .db("Augmentik")
      .collection("Users")
      .insertOne({ name,email: email, password: hashedPass, admin: false });
    response.send({ msg: "user added",name, email, result });
  }
});

app.post("/signin", async function (request, response) {
  let { email, password } = request.body;
  let userdb = await client
    .db("Augmentik")
    .collection("Users")
    .findOne({ email: email });

  if (userdb) {
    const isSame = await bcrypt.compare(password, userdb.password);

    if (isSame) {
      console.log(userdb)
      var name = userdb.name;
      var admin = userdb.admin;
      var token = jwt.sign({ email: email }, process.env.JWT_SECRET);
      response.status(200).send({ msg: "logged in", token, name, admin });
    } else {
      response.status(200).send({ msg: "invalid credentials" });
    }
  } else {
    response.status(200).send({ msg: "no user found" });
  }
});

//admin services

app.post("/newdata", async (req,res)=>{
  const posted = await client.db("Augmentik").collection("Data").updateOne({},{ $push:{data:req.body}})
  res.status(200).send(posted)
})

app.get("/alldata", async (req,res)=>{
  const getting = await client.db("Augmentik").collection("Data").find({}).toArray()
  res.status(200).send(getting[0].data)
})

//hashing password


// async function hashedPassword(password){
//    const NO_OF_ROUNDS = 10;
//    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
//    const hashedPassword = await bcrypt.hash(password,salt);
//    return hashedPassword;
// }

// //sign jwt

// var token = jwt.sign({ email: email }, process.env.JWT_SECRET);

// //compare with bcrypt

//         const isSame = await bcrypt.compare(password,userdb.password);


// //jwt middleware

// import jwt from 'jsonwebtoken'

// export const auth = (request,response, next)=>{
//     const token = request.header("x-auth-token");
//     console.log("token", token)
//     jwt.verify(token,process.env.JWT_SECRET)
//     next();
// }












