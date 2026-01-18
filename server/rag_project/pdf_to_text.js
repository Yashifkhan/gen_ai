import { GoogleGenerativeAI } from "@google/generative-ai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from '@langchain/pinecone'
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Embeddings } from "@langchain/core/embeddings";
import 'dotenv/config';


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

const embeddings=new GoogleGenerativeAIEmbeddings(process.env.GEMINI_KEY)

const pinecone = new PineconeClient({apiKey:process.env.PINECONE_API_KEY})

const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX)


const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5
})

export async function pdfToText(filepath) {
    const loader = new PDFLoader(filepath, { splitPages: false });
    const doc = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });

    const text = await textSplitter.splitText(doc[0].pageContent);
    const documents = text.map((chunk) => {
        return {
            pageContent: chunk,
            metadata: doc[0].metadata
        }
    })
    const vcdbresult=await vectorStore.addDocuments(documents)
    console.log("text data with chanking", vcdbresult);
}


// Add to pdf_to_text.js

export async function testSearch(query) {
    console.log(`\n🔍 Searching for: "${query}"\n`);
    
    const results = await vectorStore.similaritySearch(query, 3);
    
    console.log("📊 Search Results:\n");
    results.forEach((result, i) => {
        console.log(`--- Result ${i + 1} ---`);
        console.log(result.pageContent);
        console.log(`Metadata:`, result.metadata);
        console.log("");
    });
    
    return results;
}
