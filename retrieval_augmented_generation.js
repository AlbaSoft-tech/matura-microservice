import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from "fs/promises";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { VectorStore } from "@langchain/core/vectorstores";

const sbApiKey = process.env.SUPABASE_KEY;
const sbUrl = process.env.SUPABASE_URL;
const geminiApiKey = process.env.GEMINI_API_KEY;
const client = createClient(sbUrl, sbApiKey);
const embedder = new GoogleGenerativeAIEmbeddings({
  model: "text-embedding-004",
  taskType: TaskType.QUESTION_ANSWERING,
  apiKey: geminiApiKey,
});

async function rag(question, language) {
  try {
    let finalResults = null;

    // Embedding the query
    const query = await embedder.embedQuery(question);

    // Define similarity thresholds
    const thresholds = [0.7, 0.6, 0.5, 0.4, 0.3];
    let results = [];

    // Choose the correct RPC function based on the language
    let searchFunction =
      language === "macedonian"
        ? "sematic_search_macedonian"
        : "sematic_search_albanian";

    // Loop through thresholds and fetch results
    for (const threshold of thresholds) {
      const { data, error } = await client.rpc(searchFunction, {
        query_embedding: query,
        similarity_threshold: threshold,
        match_count: 2,
      });

      if (error) {
        console.error("RPC Error:", error);
        break;
      }

      if (data && data.length > 0) {
        finalResults = data;
        break;
      }
    }

    console.log(finalResults);
    return finalResults;

    /*
    CODE TO CONVERT ALL DATA TO VECTOR AND PUSH TO SUPABASE
      const gramatika = await fs.readFile("data/GRAMATIKA.txt", "utf8");
      const letersia = await fs.readFile("data/LETERSIA.txt", "utf8");
      const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1400,  
      chunkOverlap: 100,
      separators: '.'
    });

    const chunks = await splitter.createDocuments([gramatika, letersia]);
      

      await SupabaseVectorStore.fromDocuments(chunks, 
        embedder, 
          {
            client, 
            tableName: "documents",
          }
        )
          */
  } catch (error) {
    console.error("Error:", error);
  }
}

const ingestDocumentsForLanguage = async () => {
  try {
    const gramatika = await fs.readFile("data/GRAMATIKA.txt", "utf8");
    const letersia = await fs.readFile("data/LETERSIA.txt", "utf8");
    const maqedonisht = await fs.readFile("data/MAQEDONISHT.txt", "utf8");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1400,
      chunkOverlap: 100,
      separators: ".",
    });

    const albanianChunks = await splitter.createDocuments([
      gramatika,
      letersia,
    ]);
    const macedonianChunks = await splitter.createDocuments([maqedonisht]);

    await SupabaseVectorStore.fromDocuments(albanianChunks, embedder, {
      client,
      tableName: "documents_albanian",
    });

    await SupabaseVectorStore.fromDocuments(macedonianChunks, embedder, {
      client,
      tableName: "documents_macedonian",
    });
  } catch (error) {
    console.error(error);
  }
};

await ingestDocumentsForLanguage()
//await ingestDocumentsForLanguage();
export default rag;
