import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import admin from 'firebase-admin'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './config/swagger.js'
import boardRoutes from './routes/board.routes.js'
import listRoutes from './routes/list.routes.js'
import taskRoutes from './routes/task.routes.js'
import userRoutes from './routes/user.routes.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Swagger UI
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpecs))

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
})

// Routes
app.use('/user', userRoutes)
app.use('/board', boardRoutes)
app.use('/list', listRoutes)
app.use('/task', taskRoutes)

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({
    statusCode: 500,
    message: 'Something went wrong!',
    error: err.message,
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Swagger documentation available at http://localhost:${PORT}`)
})
