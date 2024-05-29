const mongoose= require('mongoose')

mongoose.connect('mongodb://localhost:27017/loginPage')
.then(()=>{console.log('Connected to MongoDB')})
.catch(err => {console.error('Could not connect to MongoDB',err)})

const express= require ('express')
const app= express()

const config = require('./config/config')

const session = require('express-session')
const nocache = require('nocache')

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true }))

const flash = require('express-flash')

app.use(session({

  secret:config.sessionSecret,
  resave:false,
  saveUninitialized:false

}));

app.use(nocache())

app.use(flash())

app.set('view engine','ejs')

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

const port=7000

app.listen(port,()=>{
  console.log(`Server running at http://localhost:${port}`)
})

  