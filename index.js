const express = require('express')
const mongoose = require('mongoose')

const app = express()
mongoose
  .connect(
    'mongodb+srv://akojamsy:12345akojamsy@cluster0-ofkzy.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true }
  )
  .then(() => console.log('DB connected'))
  .catch(err => console.error(err))

app.get('/', (req, res) => {
  res.send('I am working ooo')
})

app.listen(5000)
