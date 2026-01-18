console.log("learn gen ai with node ");
import groq from 'groq-sdk';
import dotenv from 'dotenv'
dotenv.config()
import NodeCache from 'node-cache';
import { tavily } from '@tavily/core';

const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = new groq({ apiKey: groqApiKey });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

const cache = new NodeCache({ stdTTL: 2*60*60});

const userChat = async (propmt = "",nodeId) => {
    
    const basemessage = [
        {
            role: "system",
            content: `You are a Smart personal assistant.
            if you know the answer to a question ,answer it directly in plain English.
            if the answer is requires real-time or current information,local ,or up-to-date information or if you do not knoe the answer  use the available tools to find it .
            you have access to the following tools:
            searchweb - webSearch(query:string) : use this tool to search the internet for current information and real-time data or unknown information.
            Decide when  to use your knowledge and when to use the tools. 

            Examples : 
            question : what is the current weather in hisar haryana web search?
            answer : (use webSearch to find the current weather in hisar haryana)

            question : who is the president of the united states?
            answer : (use webSearch to find the current president of the united states)

            question : who is the cm of delhi?
            answer : The current Chief Minister of Delhi is rekha gupta.

            question : Tell me the latest iTnews web search 
            answer : (use webSearch to find the latest news)

            current date or time ${new Date().toUTCString()}`,
        },

    ]

    const messages= cache.get(nodeId) ??  basemessage 
    console.log("messages to get cache",messages);
    

    if (propmt.toLowerCase() === "exit" || propmt.toLowerCase() === "bye") {
        return "chat ended";
    }

    messages.push({ role: "user", content: propmt });

    const max_try=10;
    let count=0
    while (true) {

        if (count >= max_try ){
            return "unable to get response try again later";
        }
        count++;
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
            tool_choice: 'auto'

        });
        messages.push(complition.choices[0].message);
        const toolCalls = complition.choices[0].message.tool_calls;
        if (!toolCalls || toolCalls.length === 0) {
            cache.set(nodeId, messages);
            console.log("chack cache data",cache.data);
            
            return complition.choices[0].message.content;
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

async function webSearch({ query }) {
    console.log("web search tool call...");
    const response = await tavilyClient.search(query);
    const finalresult = response?.results?.map((result) => result.content).join("\n\n");
    return finalresult;
}
// userChat(`what is the current weather in hisar haryana web search?`);
export default userChat;


