const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { User } = require('./model/user')
const { auth } = require('./middleware/auth')

const config = require('./config/key')
const app = express()
mongoose
  .connect(config.mongoURI, { useNewUrlParser: true })
  .then(() => console.log('DB connected'))
  .catch(err => console.error(err))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

app.get('/api/user/auth', auth, (req, res) => {
  res.status(200).json({
    _id: req._id,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role
  })
})

app.post('/api/users/register', (req, res) => {
  const user = new User(req.body)
  user.save((err, doc) => {
    if (err) {
      return res.json({ success: false, err })
    }
    return res.status(200).json({ sucess: true, useData: doc })
  })
})

app.post('/api/user/login', (req, res) => {
  //find email in the database
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user)
      return res.json({
        loginSucess: false,
        message: 'Incorrect email'
      })

    //compare the password
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSucess: false,
          message: 'Wrong password'
        })
      }
    })

    //generate a token fo user
    user.generateToken((err, user) => {
      if (err) return res.status(400).send(err)

      res
        .cookie("user_auth", user.token)
        .status(200)
        .json({ loginSucess: true })
    })
  })
})

app.get('/api/user/logout', auth, (req, res) => {
  User.findByIdAndUpdate({ _id: req.user._id }, { token: '' }, (err, doc) => {
    if (err) return res.status(400).json({ sucess: false, err })
    return res.status(200).send({
      success: true,
      message: "You are logged out"
    })
  })
})

const port = process.env.PORT || 5000

app.listen(port, ()=>{
  console.log(`Server is running at ${port} `)
})
