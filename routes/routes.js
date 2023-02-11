require('dotenv').config();

const { initializeApp } = require("firebase/app");
const {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut } = require("firebase/auth");

const firebaseConfig = {
      //YOUR FIREBASE CONFIG
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const admin = require("firebase-admin");

const serviceAccount = require("../private_key/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

////

const express = require('express');
const router = express.Router()
const jwt = require('jsonwebtoken')
const Model = require('../model/model');
const Todo = require('../model/task');
const Auth = require('../model/auth');
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
//
router.use(bodyParser.json())
//

//Post Method Model
router.post('/signUp', async (req, res) => {
    // check if the user already exists
    const exists = await Model.findOne({email:req.body.email});
    if(exists != null){
      res.status(401).json({ message: "Email is already in use." });
      return;

    }
    // hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // creat the model
    const data = new Model({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email,
        password: hashedPassword,
    })
    //
    const password = hashedPassword;//
    const email = req.body.email;//

    // save the model
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})
//login Method Model
router.get('/login', async (req, res) => {
    try{
        const userExists = await Model.findOne({ email :req.body.email})
        if(userExists){
          if(await bcrypt.compare(req.body.password, userExists.password)){
            // res.json(userExists)
            //creating the web token
            const uid =userExists.id;
            const token = await admin.auth().createCustomToken(uid)
            await signInWithCustomToken(auth,token)
            return res.json({
              status : 'Signed In',
              userId : uid,
            })
          }
          else{
            res.status(500).json({message: "Invalid Password"})
          }
        }
        else{
          res.status(500).json({message: "Invalid User"})
        }
    }
    catch(error){
        res.status(500).json({message: error.message})
    }

})
// logout method
router.delete('/logout',async (req,res) =>{
  try {
    signOut(auth)

    res.send('logged out')

  }
  catch (error) {
      res.status(400).json({ message: error.message })
  }

})
//Get User Method Model
router.get('/getUser',checkAuth, async (req, res) => {
    try{
        const userDB = await Model.findById(req.uid)
        res.json(userDB)
      }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
//Update User
router.patch('/updateUser',checkAuth, async (req, res) => {
    try {
        const userDB = await Model.findById(req.uid)
        const id = userDB.id;
        const updatedData = {
          name: req.body.name,
          age: req.body.age,
          email: userDB.email,
          password: userDB.password ,
        }
        const options = { new: true };
        //
        const result = await Model.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//Update Password Model
router.patch('/changePassword',checkAuth, async (req, res) => {
    try {
        const userDB = await Model.findById(req.uid)
        const id = userDB.id;

        //hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const updatedData = {
          name: userDB.name,
          age: userDB.age,
          email: userDB.email,
          password: hashedPassword ,
        };
        const options = { new: true };

        const result = await Model.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//Update User Email
router.patch('/changeEmail',checkAuth, async (req, res) => {
    try {
        const userDB = await Model.findById(req.uid)
        const id = userDB.id;
        // const id = req.body.userId;
        // if(userId != id){
        //   return res.sendStatus(500)
        // }
        const updatedData = {
          name: userDB.name,
          age: userDB.age,
          email: req.body.email,
          password: userDB.password ,
        };
        const options = { new: true };

        const result = await Model.findByIdAndUpdate(
            id, updatedData, options
        )
        console.log('please log in again')
        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//Delete User
router.delete('/delete',checkAuth, async (req, res) => {
    try {
        const id = req.uid;
        const data = await Model.findByIdAndDelete(id)
        //routes('/todo/todo_routes')//
        res.send(`Document with ${data.name} has been deleted..`)

    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
    try {
        const todoData = await Todo.deleteMany({user: id})
        res.send(`Document with ${todoData.task} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

///////////////////////////////////////////////////////////////////////////////////////////////

//Post Method Todo
router.post('/todoPost',checkAuth, async (req, res) => {
    // check if the user  exists
    const exists = await Model.findById(req.uid)
    const id = req.uid;
    if(exists == null){
      res.status(401).json({ message: "User is not valid." });
      return;

    }

    const todoData = new Todo({
        task: req.body.task,
        user: id,
        comp: req.body.comp,
    })

    try {
        const todoSave = await todoData.save();
        res.status(200).json(todoSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})
//Get all Method Todo
router.get('/todoGetAll', checkAuth ,async (req, res) => {
    try{
        const user = req.uid;
        const todoData = await Todo.find({user: user });
        res.json(todoData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
//Get by ID todo
router.get('/todoGetOne/:id',checkAuth, async (req, res) => {
    try{
        const id = req.params.id;
        const todoData = await Todo.findById(id);
        const user = todoData.user;
        const uid = req.uid;
        if(user!= uid){
          res.status(401).json({ message: "You can't access Todos of other users!" });
          return;
        }
        res.json(todoData)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
//Update by ID todo
router.patch('/todoUpdate/:id',checkAuth, async (req, res) => {
    try {

        const id = req.params.id;
        const todoData = await Todo.findById(id);
        const user = todoData.user;
        const uid = req.uid;
        if(user!= uid){
          res.status(401).json({ message: "You can't access Todos of other users!" });
          return;
        }
        const updatedData = {
          task: req.body.task,
          user: todoData.user,
          comp: req.body.comp,
        };
        const options = { new: true };

        const result = await Todo.findByIdAndUpdate(
            id, updatedData, options
        )
        res.send(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//Delete by ID Method todo
router.delete('/todoDelete/:id',checkAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const todoData = await Todo.findById(id);
        const user = todoData.user;
        const uid = req.uid;
        if(user!= uid){
          res.status(401).json({ message: "You can't access Todos of other users!" });
          return;
        }

        const newTodoData = await Todo.findByIdAndDelete(id)
        res.send(`Document with ${todoData.task} has been deleted..`)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////
function checkAuth(req, res, next) {
    onAuthStateChanged(auth,async (user) => {
        if (user) {
            const token = await user.getIdToken()
            const userInfo = await admin.auth().verifyIdToken(token)
            const identity = userInfo.uid
            req.uid= identity
            next()
        } else {
            res.send('User is signed out')
        }
    })
}

module.exports = router;
