import  express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import userChat from './index.js';
// import userChat from '.';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/api/v1/emo-chat', async (req, res) => {
    console.log("emo chat start");
    const { message } = req.body;
    console.log("Received message:", message);
    const result = await userChat(message);
    res.status(201).json({message: "Ans is get successfully",success: true,data: result });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});