import { pdfToText, testSearch } from "./pdf_to_text.js"

const filepath="./yashif-resume.pdf"
// const result=await pdfToText(filepath)

const vectoreResult= await testSearch("explain about projects")
// console.log("cd result is -->>>",vectoreResult);
