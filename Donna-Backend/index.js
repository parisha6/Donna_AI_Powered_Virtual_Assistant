import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
dotenv.config();
import multer from "multer";
import axios from "axios";
import { Pinecone } from '@pinecone-database/pinecone';


const upload = multer({ storage: multer.memoryStorage() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "cgSgspJ2msm6clMCkdW9";
const DEEPGRAM_API_KEY = "7fab080694bf6636586a873a3d31800e6e751ff2";

// Microsoft Graph API credentials
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const tenantId = process.env.TENANT_ID;
const userEmail = process.env.USER_EMAIL;

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

const pinecone = new Pinecone();
const ffmpegPath = './bin/ffmpeg';  // Path to the ffmpeg binary
const rhubarbPath = './bin/rhubarb';  // Path to the rhubarb binary


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

// Function to get Microsoft Graph API token
const getToken = async () => {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const tokenData = {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
  };
  const response = await axios.post(tokenUrl, new URLSearchParams(tokenData));
  return response.data.access_token;
};

// New route for creating an event
app.post("/createEvent", async (req, res) => {
  const { subject, start, end, timeZone } = req.body;

  try {
    const token = await getToken();
    const eventUrl = `https://graph.microsoft.com/v1.0/users/${userEmail}/events`;

    const event = {
      subject,
      body: {
        contentType: "Text",
        content: "Scheduled by Donna Virtual Assistant",
      },
      start: {
        dateTime: start,
        timeZone,
      },
      end: {
        dateTime: end,
        timeZone,
      },
    };
    const response = await axios.post(eventUrl, event, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    res.json({ message: "Event created successfully!", eventId: response.data.id });
  } catch (error) {
    console.error("Error creating event:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create event" });
  }
});

//Route to send an email
app.post("/sendEmail", async (req, res) => {
  const { subject, body, recipient } = req.body;

  try {
    const token = await getToken();
    const sendMailUrl = `https://graph.microsoft.com/v1.0/users/${userEmail}/sendMail`;

    const emailData = {
      message: {
        subject: "Email sent by Donna",
        body: {
          contentType: "Text",
          content: body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipient,
            },
          },
        ],
      },
    };
    const response = await axios.post(sendMailUrl, emailData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 202) {
      res.status(200).json({ message: "Email sent successfully!" });
    } else {
      res.status(response.status).json({ error: response.data });
    }
  } catch (error) {
    console.error("Error sending email:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `bin\\rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `
        Your name is donna.
        You are a personal assistant for Purdue fort wayne University students.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

app.post("/transcript", upload.single("file"), async (req, res) => {

  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    // Send the uploaded file to Deepgram for transcription
    const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": "audio/mp3", // Adjust this based on file type
      },
      body: req.file.buffer, // Use file buffer from multer
    });

    if (!deepgramResponse.ok) {
      const error = await deepgramResponse.json();
      return res.status(deepgramResponse.status).send({ error });
    }

    const deepgramData = await deepgramResponse.json();
    const texttranscript = deepgramData.results.channels[0].alternatives[0].transcript;

    // // Write transcription to a file
    // const filePath = path.join(__dirname, "transcription.txt");
    // fs.writeFileSync(filePath, texttranscript);

    //  // Send the file as a response
    // res.download(filePath, "transcription.txt", (err) => {
    //   if (err) {
    //     console.error("Error sending file:", err);
    //     res.status(500).send({ error: "Failed to send file." });
    //   }

    // fs.unlinkSync(filePath);
    // })

    // Create a message object with transcription text
    const messages = [
      {
        text: texttranscript,
        facialExpression: "smile",
        animation: "Talking_0",
      },
    ];

    // Generate audio and lipsync data
    for (let i = 0; i < messages.length; i++) {
      const message1 = messages[i];
      const fileName = `audios/message_${i}.mp3`; // The name of your audio file
      const fileInput1 = message1.text
      // Convert text to speech
      await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, fileInput1);

      // Generate lipsync data
      await lipSyncMessage(i);

      // Add audio and lipsync data to the message object
      message1.audio = await audioFileToBase64(fileName);
      message1.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
    }

    res.send({ messages });
  } catch (error) {
    console.error("Error in /transcript:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});


async function queryPinecone(query, topK = 3) {
  const index = pinecone.index("donna-cloud-kb");
  console.log(query);
  try {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    const queryResult = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return queryResult.matches;
  } catch (error) {
    console.error('Error querying Pinecone:', error);
    return [];
  }
}

async function summarizeResults(results, userQuery) {
  const contentToSummarize = results.map(r => r.metadata.text).join('\n\n');
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes information." },
        { role: "user", content: `Summarize the following information in response to the query: "${userQuery}"\n\n${contentToSummarize}` }
      ],
      max_tokens: 100
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error summarizing results:', error);
    return 'Error generating summary';
  }
}


app.post("/rag", async (req, res) => {
  const userMessage = req.body.message;
  console.log("message from user", userMessage);
  if (!userMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const results = await queryPinecone(userMessage, 3);
    console.log("Results**********", results);
    if (results.length > 0) {
      const summary = await summarizeResults(results, userMessage);
      console.log("Generated summary::::", summary);
      res.send(summary);
      // const messages1 = [{
      //   text: summary,
      //   facialExpression: "smile",
      //   animation: "Talking_0"
      // }];

      // // Generate audio and lipsync data
      // for (let i = 0; i < messages1.length; i++) {
      //   const message12 = messages1[i];
      //   const fileName = `audios/message_${i}.mp3`; // The name of your audio file
      //   const fileInput12 = message12.text;
      //   // Convert text to speech
      //   await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, fileInput12);

      //   // Generate lipsync data
      //   await lipSyncMessage(i);

      //   // Add audio and lipsync data to the message object
      //   message12.audio = await audioFileToBase64(fileName);
      //   message12.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
      // }


    }
  } catch (error) {
    console.error("Error in /rag:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});


const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};


app.listen(port, () => {
  console.log(`Donna listening on port ${port}`);
});