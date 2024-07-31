// const express = require('express')
// const app = express();
// app.listen(8000,() =>{
//     console.log(`Server running on http://localhost:8000`)
// })

import express from "express"
import "./config/db.js"
import cors from 'cors'
import bodyParser from "body-parser";
import router from './router/route.js'
import { PORT } from "./config/globalKey.js";
const app = express();

app.use(cors())

app.use(bodyParser.json({extended:true}))
app.use(bodyParser.urlencoded({extended:true, parameterLimit:500,limit: '500mb'}))
app.use("/api", router)

app.listen(PORT,()=>{
    console.log(`Server runing on http://localhost:${PORT}`)
})