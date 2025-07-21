import fs from "fs/promises";
import path from "path";

const splitText = async () => {
const text1 = await fs.readFile("./data/GRAMATIKA.txt", "utf8");
const text2 = await fs.readFile("./data/LETERSIA.txt", "utf8");

const inputText = text1 + "\n" + text2; 


  const chunks = inputText.split(
    "_______________________________________________________________________________"
  );

  const outputDir = "./chunks";
  await fs.mkdir(outputDir, { recursive: true });

  for (let i = 0; i < chunks.length; i++) {
    const filePath = path.join(outputDir, `chunk_${i + 1}.txt`);
    await fs.writeFile(filePath, chunks[i].trim(), "utf8");
  }

  console.log(`Saved ${chunks.length} chunks to '${outputDir}/'`);
};

splitText();
