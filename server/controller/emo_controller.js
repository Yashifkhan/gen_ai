import userChatStreaming from "./function.js";

import { uploadPdfInVectorDB } from "./function.js";

export  const emoChat=async(req,res)=>{
    const { message, nodeId,model } = req.body;
    console.log("Received message:", model);

    if (!message || !nodeId) {
        return res.status(400).json({
            message: "Invalid request, message and nodeId are required.",
            success: false
        });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    try {
        await userChatStreaming(message, nodeId, res,model);
    } catch (error) {
        console.error('Streaming error:', error);
        res.write(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`);
    } finally {
        res.end();
    }

}

export const emoChatPdf=async(req,res)=>{
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

}