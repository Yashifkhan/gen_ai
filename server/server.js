import  express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import userChat, { uploadPdfInVectorDB } from './index.js';

// import userChat from '.';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// multer setup 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});

app.post('/api/v1/emo-chat-upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
        const { nodeId } = req.body;
        if (!req.file) {
            return res.status(400).json({ 
                message: "No PDF file uploaded", 
                success: false 
            });
        }

        if (!nodeId) {
            return res.status(400).json({ 
                message: "nodeId is required", 
                success: false 
            });
        }

        const filepath = req.file.path;
        
        // Upload to vector DB with nodeId in metadata
        const result = await uploadPdfInVectorDB(filepath, nodeId);
        
        res.status(201).json({
            message: "PDF uploaded successfully",
            success: true,
            data: {
                filename: req.file.originalname,
                nodeId: nodeId,
                chunks: result.length
            }
        });
        
    } catch (error) {
        console.error("Error uploading PDF:", error);
        res.status(500).json({ 
            message: "Failed to upload PDF", 
            success: false,
            error: error.message 
        });
    }
});

app.post('/api/v1/emo-chat', async (req, res) => {
    const { message,nodeId } = req.body;
    if (!message || !nodeId) {
        return res.status(400).json({ message: "Invalid request, message and nodeId are required.", success: false });
    }

    // const context = await testSearch(message, nodeId, 3);
    const result = await userChat(message,nodeId);
    res.status(201).json({message: "Ans is get successfully",success: true,data: result });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});