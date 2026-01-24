console.log("learn gen ai with node ");
import groq from 'groq-sdk';
import dotenv from 'dotenv'
dotenv.config()
import NodeCache from 'node-cache';
import { tavily } from '@tavily/core';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PineconeStore } from '@langchain/pinecone'
import { Embeddings } from "@langchain/core/embeddings";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Document } from "@langchain/core/documents";

const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = new groq({ apiKey: groqApiKey });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

const cache = new NodeCache({ stdTTL: 2 * 60 * 60 });

class GoogleGenerativeAIEmbeddings extends Embeddings {
    constructor(apiKey) {
        super();
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
    }

    async embedDocuments(documents) {
        const embeddings = await Promise.all(
            documents.map(async (doc) => {
                // ✅ CRITICAL FIX: Extract text from document
                const text = typeof doc === 'string' ? doc : doc.pageContent || doc;
                const result = await this.model.embedContent(text);
                return result.embedding.values;
            })
        );
        return embeddings;
    }

    async embedQuery(query) {
        const result = await this.model.embedContent(query);
        return result.embedding.values;
    }
}

const embeddings = new GoogleGenerativeAIEmbeddings(process.env.GEMINI_KEY)
const pinecone = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY })
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX)

const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5
})

// const userChat = async (propmt = "",nodeId) => {    
//     const intent=await classifyIntent(propmt)
//     console.log("intent",intent);

//     if (intent == "general_chat" || intent == "websearch"){
//         console.log("am inside the websearch function or simple chat");
//          const basemessage = [
//         {
//             role: "system",
//             content: `You are a Smart personal assistant.
//             if you know the answer to a question ,answer it directly in plain English.
//             if the answer is requires real-time or current information,local ,or up-to-date information or if you do not knoe the answer  use the available tools to find it .
//             you have access to the following tools:
//             searchweb - webSearch(query:string) : use this tool to search the internet for current information and real-time data or unknown information.
//             Decide when  to use your knowledge and when to use the tools. 

//             Examples : 
//             question : what is the current weather in hisar haryana web search?
//             answer : (use webSearch to find the current weather in hisar haryana)

//             question : who is the president of the united states?
//             answer : (use webSearch to find the current president of the united states)

//             question : who is the cm of delhi?
//             answer : The current Chief Minister of Delhi is rekha gupta.

//             question : Tell me the latest iTnews web search 
//             answer : (use webSearch to find the latest news)

//             current date or time ${new Date().toUTCString()}`,
//         },

//     ]

//     const messages= cache.get(nodeId) ??  basemessage 
//     if (propmt.toLowerCase() === "exit" || propmt.toLowerCase() === "bye") {
//         return "chat ended";
//     }

//     messages.push({ role: "user", content: propmt });

//     const max_try=10;
//     let count=0
//     while (true) {
//         if (count >= max_try ){
//             return "unable to get response try again later";
//         }
//         count++;
//         const complition = await groqClient.chat.completions.create({
//             model: "llama-3.3-70b-versatile",
//             // model: "openai/gpt-oss-120b",
//             messages: messages,
//             tools: [
//                 {
//                     type: 'function',
//                     function: {
//                         name: 'webSearch',
//                         description: 'search the latest information and real time data on the internate',
//                         parameters: {
//                             type: 'object',
//                             properties: {
//                                 query: {
//                                     type: 'string',
//                                     description: 'the search query to perform on the web'
//                                 }
//                             },
//                             required: ['query']
//                         }
//                     }
//                 }
//             ],
//             tool_choice: 'auto'

//         });

//         messages.push(complition?.choices[0]?.message);
//         const toolCalls = complition.choices[0].message.tool_calls;
//         if (!toolCalls || toolCalls.length === 0) {
//             cache.set(nodeId, messages);
//             // console.log("chack cache data",cache.data);


//             return complition.choices[0].message.content;
//         }

//         for (const tool of toolCalls) {
//             console.log("tool call ", tool);
//             const functionName = tool.function.name;
//             const functionParms = tool.function.arguments;

//             if (functionName === "webSearch") {
//                 const toolResult = await webSearch(JSON.parse(functionParms));

//                 // console.log("web search result ->>",result);
//                 messages.push({
//                     tool_call_id: tool.id,
//                     role: 'tool',
//                     name: functionName,
//                     content: toolResult
//                 })

//             }

//         }
//     }

//     }


//     // else if (intent === "pdf_query"){
//     //     console.log("query is pdf related" , intent);
//     //     const vectorDbResult=await testSearch(propmt)
//     //     const correctExtract=vectorDbResult.map((text)=>text.pageContent)
//     //     console.log("correctExtract",correctExtract[0]); 
//     // }

//       else if (intent === "pdf_query") {
//     console.log("Starting PDF query flow");

//     // Step 1: Get relevant context from Vector DB
//     const vectorDbResults = await testSearch(propmt);

//     if (!vectorDbResults || vectorDbResults.length === 0) {
//       return "I couldn't find any relevant information in your uploaded documents. Please make sure you've uploaded a PDF first.";
//     }

//     // Step 2: Extract text from vector DB results
//     const relevantContext = vectorDbResults.map((result) => result.pageContent).join('\n\n---\n\n');

//      if (relevantContext[0]?.Document?.pageContent.length === 0 ) {
//       return "I couldn't find any relevant information in your uploaded documents. Please make sure you've uploaded a PDF first.";
//     }

//     const cachedMessages = cache.get(nodeId) || [];

//     console.log("cachedMessages",cachedMessages);


//     const pdfSystemMessage = {
//       role: "system",
//       content: `You are a helpful assistant answering questions about the user's uploaded PDF document.

// CONTEXT FROM USER'S DOCUMENT:
// ${relevantContext}

// INSTRUCTIONS:
// - Answer the user's question based ONLY on the context provided above
// - If the context doesn't contain enough information to answer, say so clearly
// - Be specific and cite relevant parts of the document
// - Keep your answer concise and directly related to the question
// - Do not make up information that's not in the context

// Current date/time: ${new Date().toUTCString()}`
//     };

//     // Step 5: Prepare messages array
//     const messages = [
//       pdfSystemMessage,
//       ...cachedMessages.slice(-4), // Keep last 2 exchanges for context (4 messages)
//       { role: "user", content: propmt }
//     ];


//     // Step 6: Get response from LLM
//     const completion = await groqClient.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: messages,
//       temperature: 0.3, // Lower temperature for more factual responses
//       max_tokens: 1000
//     });

//     const assistantResponse = completion.choices[0].message.content;

//     console.log("llm responsea after get the data in db",assistantResponse);

//     // Step 7: Update cache with this conversation
//     const updatedMessages = cache.get(nodeId) || [];
//     updatedMessages.push(
//       { role: "user", content: propmt },
//       { role: "assistant", content: assistantResponse }
//     );

//     // // Keep only last 10 messages to avoid token limit
//     if (updatedMessages.length > 10) {
//       updatedMessages.splice(0, updatedMessages.length - 10);
//     }

//     cache.set(nodeId, updatedMessages);
//     console.log("Cache updated with PDF conversation");

//     return assistantResponse;
//   }

//   // Fallback
//   return "I couldn't determine how to handle your request. Please try again.";
// };

const userChatStreaming = async (prompt = "", nodeId, res) => {
    const intent = await classifyIntent(prompt);
    console.log("intent", intent);

    // Helper function to send streaming chunks
    const sendChunk = (text) => {
        // console.log("stream response : ",text);

        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    };

    const sendComplete = () => {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    };

    if (intent === "general_chat" || intent === "websearch") {
        await handleGeneralChatStreaming(prompt, nodeId, sendChunk, sendComplete);
    }
    else if (intent === "pdf_query") {
        await handlePdfQueryStreaming(prompt, nodeId, sendChunk, sendComplete);
    }
    else {
        sendChunk("I couldn't determine how to handle your request. Please try again.");
        sendComplete();
    }
};

const handleGeneralChatStreaming = async (prompt, nodeId, sendChunk, sendComplete) => {
    const baseMessage = [
        {
            role: "system",
            content: `You are a Smart personal assistant.
            if you know the answer to a question, answer it directly in plain English.
            if the answer requires real-time or current information, local, or up-to-date information or if you do not know the answer use the available tools to find it.
            you have access to the following tools:
            searchweb - webSearch(query:string) : use this tool to search the internet for current information and real-time data or unknown information.
            Decide when to use your knowledge and when to use the tools.
            current date or time ${new Date().toUTCString()}`,
        },
    ];
    const messages = cache.get(nodeId) ?? baseMessage;
    if (prompt.toLowerCase() === "exit" || prompt.toLowerCase() === "bye") {
        sendChunk("Chat ended");
        sendComplete();
        return;
    }

    messages.push({ role: "user", content: prompt });

    const maxTry = 10;
    let count = 0;

    while (true) {
        if (count >= maxTry) {
            sendChunk("Unable to get response, try again later");
            sendComplete();
            return;
        }
        count++;

        const completion = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'webSearch',
                        description: 'search the latest information and real time data on the internet',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'the search query to perform on the web'
                                }
                            },
                            required: ['query']
                        }
                    }
                }
            ],
            tool_choice: 'auto',
            stream: true // Enable streaming
        });

        // messages.push(completion?.choices[0]?.message);

        let fullContent = "";
        let toolCalls = [];

        // Stream the response
        for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta;

            if (delta?.content) {
                fullContent += delta.content;
                sendChunk(delta.content); // Send each chunk to client
            }

            if (delta?.tool_calls) {
                toolCalls = delta.tool_calls;
            }
        }
        const assistantMessage = {
            role: "assistant",
            content: fullContent || null,
        };

        // Add tool calls if they exist
        if (toolCalls.length > 0) {
            assistantMessage.tool_calls = toolCalls;
        }

        messages.push(assistantMessage)
        // If no tool calls, we're done
        if (!toolCalls || toolCalls.length === 0) {
            cache.set(nodeId, messages);
            sendComplete();
            return;
        }

        // Handle tool calls
        for (const tool of toolCalls) {
            console.log("tool call ", tool);
            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;

            if (functionName === "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParams));

                messages.push({
                    tool_call_id: tool.id,
                    role: 'tool',
                    name: functionName,
                    content: toolResult
                });
            }
        }
    }
};
const handlePdfQueryStreaming = async (prompt, nodeId, sendChunk, sendComplete) => {
    // console.log("Starting PDF query flow");

    const vectorDbResults = await testSearch(prompt);

    if (!vectorDbResults || vectorDbResults.length === 0) {
        sendChunk("I couldn't find any relevant information in your uploaded documents. Please make sure you've uploaded a PDF first.");
        sendComplete();
        return;
    }

    const relevantContext = vectorDbResults.map((result) => result.pageContent).join('\n\n---\n\n');

    if (relevantContext[0]?.Document?.pageContent.length === 0) {
        sendChunk("I couldn't find any relevant information in your uploaded documents. Please make sure you've uploaded a PDF first.");
        sendComplete();
        return;
    }

    const cachedMessages = cache.get(nodeId) || [];

    const pdfSystemMessage = {
        role: "system",
        content: `You are a helpful assistant answering questions about the user's uploaded PDF document.

CONTEXT FROM USER'S DOCUMENT:
${relevantContext}

INSTRUCTIONS:
- Answer the user's question based ONLY on the context provided above
- If the context doesn't contain enough information to answer, say so clearly
- Be specific and cite relevant parts of the document
- Keep your answer concise and directly related to the question
- Do not make up information that's not in the context

Current date/time: ${new Date().toUTCString()}`
    };

    const messages = [
        pdfSystemMessage,
        ...cachedMessages.slice(-4),
        { role: "user", content: prompt }
    ];

    const completion = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.3,
        max_tokens: 1000,
        stream: true // Enable streaming
    });

    // console.log("completion",completion.choices[0].message)
    let assistantResponse = "";

    // Stream the response
    for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
            assistantResponse += delta.content;
            sendChunk(delta.content); // Send each chunk to client
        }
    }

    // console.log("llm response after get the data in db", assistantResponse);

    // Update cache
    const updatedMessages = cache.get(nodeId) || [];
    updatedMessages.push(
        { role: "user", content: prompt },
        { role: "assistant", content: assistantResponse }
    );

    if (updatedMessages.length > 10) {
        updatedMessages.splice(0, updatedMessages.length - 10);
    }

    cache.set(nodeId, updatedMessages);

    sendComplete();
};

// user query filter where to start the process 
async function classifyIntent(userMessage, userId) {
    const classificationPrompt = `Analyze this user message and determine if it's asking about:
1. Their uploaded PDF/document (answer: "pdf_query")
2. General chat/information (answer: "general_chat")
3. Web search needed (answer: "webSearch")

User message: "${userMessage}"

Context clues for PDF queries:
- "my document", "my PDF", "my file", "uploaded file"
- "my project", "my report", "my notes"
- "what did I upload", "from the document"
- "explain my...", "summarize my..."

Answer with ONLY one word: pdf_query, general_chat, or webSearch`;

    const response = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: classificationPrompt }],
        temperature: 0.2,
        max_tokens: 10
    });
    return response.choices[0].message.content.trim().toLowerCase();
}

// web search tool 
async function webSearch({ query }) {
    console.log("web search tool call...");
    const response = await tavilyClient.search(query);
    const finalresult = response?.results?.map((result) => result.content).join("\n\n");
    return finalresult;
}


// upload pdf to vector db 
// export async function uploadPdfInVectorDB(filepath) {
//     const loader = new PDFLoader(filepath, { splitPages: false });
//     const doc = await loader.load();
//     const textSplitter = new RecursiveCharacterTextSplitter({
//         chunkSize: 500,
//         chunkOverlap: 100,
//     });
//     const text = await textSplitter.splitText(doc[0].pageContent);
//     const documents = text.map((chunk) => {
//         return {
//             pageContent: chunk,
//             metadata: doc[0].metadata
//         }
//     })
//     const vcdbresult=await vectorStore.addDocuments(documents)
//     console.log("pdf save in db ", vcdbresult);
// }
export async function uploadPdfInVectorDB(filepath, nodeId) {
    try {
        // Load PDF
        const loader = new PDFLoader(filepath, { splitPages: false });
        const doc = await loader.load();

        // Split into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100,
        });

        const text = await textSplitter.splitText(doc[0].pageContent);

        // ✅ Create proper Document objects with nodeId in metadata
        const documents = text.map((chunk, index) => {
            return new Document({
                pageContent: chunk,
                metadata: {
                    ...doc[0].metadata,
                    nodeId: nodeId,  // Add nodeId for filtering
                    chunkIndex: index,
                    uploadedAt: new Date().toISOString()
                }
            });
        });

        // Upload to Pinecone
        await vectorStore.addDocuments(documents);

        console.log(`✅ Uploaded ${documents.length} chunks for nodeId: ${nodeId}`);

        return documents;

    } catch (error) {
        console.error("Error uploading PDF:", error);
        throw error;
    }
}

// get the data in vector db 
export async function testSearch(query) {
    const results = await vectorStore.similaritySearch(query, 3);
    return results;
}

export default userChatStreaming;


