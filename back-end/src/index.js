const express = require('express')
const dotenv = require("dotenv");
const router = require('./routes/authRoute');
const { connectDb } = require('./lib/db');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const messageRouter = require('./routes/messageRoute');
const { app, server } = require('./lib/socket');
const path = require('path')

dotenv.config()

const port = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


app.use('/api/auth',router)
app.use('/api/messages',messageRouter)

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname,'../front-end/dist')))

  app.get('*',(req,res) => {
    res.sendFile(path.join(__dirname,'../front-end','dist','index.html'))
  })
}

server.listen(port, () => {
  console.log(`server is running on port ${port}`)
  connectDb()
})