const express = require("express");
const multer = require("multer");
const { Client, LocalAuth } = require("whatsapp-web.js");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, "creds.json"),
});
const upload = multer({ storage });

let client;

app.post("/upload-creds", upload.single("creds"), (req, res) => {
  res.json({ message: "Fișier creds.json încărcat cu succes!" });
});

app.get("/init-whatsapp", async (req, res) => {
  if (client) return res.json({ message: "Client deja inițializat!" });

  client = new Client({ authStrategy: new LocalAuth() });

  client.on("qr", (qr) => console.log("Scan QR Code pentru conectare."));

  client.on("ready", () => console.log("WhatsApp Web conectat!"));

  client.initialize();
  res.json({ message: "WhatsApp Web inițializat. Scanează QR Code!" });
});

app.post("/send-message", async (req, res) => {
  if (!client) return res.status(400).json({ error: "WhatsApp nu este conectat!" });

  const { numbers, message, delay } = req.body;

  for (const number of numbers) {
    try {
      await client.sendMessage(`${number}@c.us`, message);
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));
    } catch (err) {
      console.error(`Eroare la trimiterea mesajului către ${number}`, err);
    }
  }

  res.json({ message: "Mesaje trimise cu succes!" });
});

app.listen(port, () => console.log(`Server pornit pe http://localhost:${port}`));
