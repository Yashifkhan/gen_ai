import  express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/api/v1/emo-chat', async (req, res) => {
    console.log("emo chat start");
    
    
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});