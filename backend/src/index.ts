import express, { Express, Request, Response } from 'express';
import morgan from "morgan"
import { configDotenv } from 'dotenv';
import cors from "cors"
import connectDB from './config/mongodb';
  
const app: Express = express();
configDotenv()

// req logger middleware - Use 'dev' format for concise, colored console logs
app.use(morgan('dev'));
app.use(cors())

connectDB();
const port = process.env.PORT || 3000;

// Built-in body parsing middleware
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

app.listen(port, () => {
  console.log(`Server is running`);
});
