import express from "express";
import "dotenv/config";
import rag from "./retrieval_augmented_generation.js";
import job from "./cron.js"

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

job.start()

app.post("/", async (req, res) => {
  try {
    const { data, language } = req.body;
    if (!data) {
      return res.status(400).json({ message: "no data found" });
    }

    const raggedInfo = await rag(data, language);

    return res.status(200).json({ result: raggedInfo });
  } catch (error) {
    console.error("Error in microservice:", error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Microservice listening on port ${PORT}`);
});


