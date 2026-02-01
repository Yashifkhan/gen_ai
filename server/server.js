import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

import router from './routes/emo_route.js';
import { uploadPdfInVectorDB } from './controller/function.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({
     methods: ["POST"],
}));
app.use(express.json());

app.get('/api/v1/emo', (req, res) => {
    console.log("emo is run");
    res.send('Emo is ready');
});

app.use('/api/v1',router)

module.exports = app;

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });