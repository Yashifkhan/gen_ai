console.log("learn gen ai with node ");
import groq from 'groq-sdk';
import dotenv from 'dotenv'
import { tavily } from '@tavily/core';
import readline from 'readline/promises';
dotenv.config()

const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = new groq({ apiKey: groqApiKey });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });


const userChat = async (propmt = "") => {

    const rl=readline.createInterface({
        input:process.stdin,
        output:process.stdout
    });

    const messages = [
        {
            role: "system",
            content: `You are a helpful assistant.
Use tools ONLY when the user asks for real-time or current information.
If tools are not required, answer normally , current date or time ${new Date().toUTCString()}, you have access to the following tools:
1. webSearch({query} :{query:string}) : searches the latest information and real time data on the internet
`,
        },
        
    ]

   while(true){
    const question= await rl.question("You: ");

    if (question.toLowerCase() === "exit" || question.toLowerCase() === "bye") {
        break;
    }

    messages.push({ role: "user", content: question || propmt });



     while (true) {
        const complition = await groqClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            // model: "openai/gpt-oss-120b",

            messages: messages,
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'webSearch',
                        description: 'search the latest information and real time data on the internate',
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
            //        tool_choice: {
            //   type: "function",
            //   function: { name: "webSearch" }
            // }
            tool_choice: 'auto'

        });
        messages.push(complition.choices[0].message);
        const toolCalls = complition.choices[0].message.tool_calls;
        if (!toolCalls || toolCalls.length === 0) {
            console.log("Final Answer: ", complition.choices[0].message.content);
            break;
        }
    
        for (const tool of toolCalls) {
            console.log("tool call ", tool);
            const functionName = tool.function.name;
            const functionParms = tool.function.arguments;
    
    
    
            if (functionName === "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParms));
    
                // console.log("web search result ->>",result);
    
    
    
                messages.push({
                    tool_call_id: tool.id,
                    role: 'tool',
                    name: functionName,
                    content: toolResult
                })
    
            }
    
        }
    }

   }
   rl.close();


}



async function webSearch({ query }) {
    console.log("web search tool call...");

    const response = await tavilyClient.search(query);
    const finalresult = response?.results?.map((result) => result.content).join("\n\n");
    return finalresult;
}

userChat(`what is the current weather in hisar haryana web search?`);


