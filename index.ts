import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'
import { type } from 'os'
import fs, { truncate } from 'fs'

const app = express()
app.use(bodyParser.json())
app.use(cors())

const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface JWTPayload {
  id:number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  balance: number;
  amount:number;
}
interface DbSchema{
  users:JWTPayload[]
}

type RegisterArgs = Omit<JWTPayload, 'id'>
type LoginArgs = Pick<JWTPayload, "username"|"password">
type dataArgs =Pick<JWTPayload,"firstname"|"lastname"|"balance">
type AmountArgs =Pick<JWTPayload,"amount">

app.get('/',(req,res)=>{
  res.json({ message:"Hi"})
})


app.post<any,any,RegisterArgs>('/register',
  (req, res) => {

    const ok = req.body
    const raw =fs.readFileSync('db.json','utf8')
    const db: DbSchema =JSON.parse(raw)
    const user =db.users.find(user =>user.username===ok.username)
    db.users.push({
      ...ok,
      id:Date.now()
    })
    if(user?.username){
      res.status(400).json({message: "Username is already in used"})
    }
    fs.writeFileSync('db.json',JSON.stringify(db))
    res.status(200).json({message :"Register successfully"})
  })
  
  
  app.post<any,any,LoginArgs>('/login',
  (req, res) => {

    // Use username and password to create token.
    const ok = req.body
    const raw =fs.readFileSync('db.json','utf8')
    const db: DbSchema =JSON.parse(raw)
    const user =db.users.find(user =>user.username===ok.username)
    if(!user){
      res.status(400)
      res.json({message : "Invalid username or password"})
      return
    }
    if(user.password !== ok.password){
      res.status(400)
       res.json({message : "Invalid username or password"})
      return
    }

    const token =jwt.sign({firstname:user.firstname, lastname: user.lastname, balance:user.balance},"SIMPLE_SECRET")

    return res.status(200).json({
      message: 'Login succesfully',
       token: {token}
    })
  })

app.get<any,any,dataArgs>('/balance',
  (req, res) => {
    const token = req.query.token as string
    try {
     // { username }
      const data = jwt.verify(token, SECRET) as JWTPayload
      res.status(200).json(data)
  
    }
    catch (e) {
      //response in case of invalid token
      res.status(401)
      res.json({message:"Invalid token"})
    }
  })

app.post<any,any,AmountArgs>('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {

    const amountp =req.body
    //Is amount <= 0 ?
    if (!validationResult(amountp).isEmpty())
      return res.status(400).json({ message: "Invalid data" })
      res.json()
  })

app.post('/withdraw',
  (req, res) => {
  })

app.delete('/reset', (req, res) => {

  //code your database reset here
  // .destroy({where:{},truncate:true})
  
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  
})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))