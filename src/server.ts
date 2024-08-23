import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { corsConfig } from './config/cors'
import { connectDB } from './config/db'
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRouters'

dotenv.config()
connectDB() //Llama a la conexion

const app = express() //Generamos la aplicacion
app.use(cors(corsConfig))//Habilita los cors
app.use(morgan('dev'))
app.use(express.json())//Habilita el request

// Routes 
app.use(`/api/auth`, authRoutes)
app.use(`/api/projects`, projectRoutes)

export default app