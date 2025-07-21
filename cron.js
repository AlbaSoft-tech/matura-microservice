import { CronJob } from "cron";
import https from "https";

const job = new CronJob('*/14 * * * *', function () {
  const data = JSON.stringify({
    data: "kush eshte naim frasheri"
  });

  const url = new URL("https://rag-microservice-w2su.onrender.com"); 

  const options = {
    hostname: url.hostname,
    path: url.pathname,
    port: 443,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  const req = https.request(options, (res) => {
    let response = '';
    res.on("data", (chunk) => response += chunk);
    res.on("end", () => {
      console.log(`POST sent. Status: ${res.statusCode}, Response: ${response}`);
    });
  });

  req.on("error", (e) => {
    console.error("Error during POST request:", e);
  });

  req.write(data);
  req.end();
});

export default job;
