console.log("learn gen ai with node ");
import groq from 'groq-sdk';
import dotenv from 'dotenv'
import { tavily } from '@tavily/core';
dotenv.config()

const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = new groq({ apiKey: groqApiKey });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });


const userChat = async (propmt = "") => {

    const messages = [
        {
            role: "system",
            content: `You are a helpful assistant.
Use tools ONLY when the user asks for real-time or current information.
If tools are not required, answer normally `,
        },
        {
            role: 'user',
            content: propmt,
        }
    ]

    const complition = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
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
       tool_choice: {
  type: "function",
  function: { name: "webSearch" }
}

    });


    messages.push(complition.choices[0].message);
    const toolCalls = complition.choices[0].message.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
        console.log("Final Answer: ", complition.choices[0].message.content);
        return;
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

    // console.log("complete mess go to llm", messages)
    // result from websearch tool 
    const complition2 = await groqClient.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        // tools: [
        //     {
        //         type: 'function',
        //         function: {
        //             name: 'webSearch',
        //             description: 'search the latest information and real time data on the internate',
        //             parameters: {
        //                 type: 'object',
        //                 properties: {
        //                     query: {
        //                         type: 'string',
        //                         description: 'the search query to perform on the web'
        //                     }
        //                 },
        //                 required: ['query']
        //             }
        //         }
        //     }
        // ],
        // tool_choice: 'auto'

    });

    console.log("final result : ", JSON.stringify(complition2.choices[0].message, null, 2));


}



async function webSearch({ query }) {
    const response = await tavilyClient.search(query, { limit: 3 });
    const finalresult = response?.results?.map((result) => result.content).join("\n\n");
    return finalresult;
}

userChat(`when was launched gpt 5 model?  `);


