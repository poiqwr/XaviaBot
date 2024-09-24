import axios from 'axios';
import tinyurl from 'tinyurl';

const config = {
  name: "shae",
  version: "1.0",
  author: "Samir OE",
  hasPermission: 0,
  credits: "Samir OE",
  description: "Interact with AI, format responses, and shorten URLs.",
  usages: "<text>",
  cooldowns: 5,
};

function formatResponse(content) {
  const header = `🧋✨ | 𝙰𝚒\n━━━━━━━━━━━━━━━━\n`;
  const footer = `━━━━━━━━━━━━━━━━`;
  return `${header}${content.trim()}\n${footer}`;
}

global.api = {
  s: "https://www.samirxpikachu.run" + ".place",
  fallbacks: [
    "http://samirxpikachuio.onrender.com",
    "http://samirxzy.onrender.com"
  ]
};

async function fetchFromAPI(url) {
  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.error("Primary API failed:", error.message);
    for (const fallback of global.api.fallbacks) {
      try {
        const response = await axios.get(url.replace(global.api.s, fallback));
        return response;
      } catch (error) {
        console.error("Fallback API failed:", error.message);
      }
    }
    throw new Error("All APIs failed.");
  }
}

async function onCall({ api, event, args, message }) {
  const { threadID, messageID } = message;
  const senderID = event.senderID;
  const query = args.join(" ") + ", short direct answer";

  try {
    let shortURL = '';
    if (event.type === "message_reply" && ["photo", "sticker"].includes(event.messageReply.attachments?.[0]?.type)) {
      shortURL = await tinyurl.shorten(event.messageReply.attachments[0].url);
    }

    const url = `${global.api.s}/gemini?text=${encodeURIComponent(query)}&system=default&uid=${senderID}${shortURL ? `&url=${encodeURIComponent(shortURL)}` : ''}`;
    const response = await fetchFromAPI(url);

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const responseText = response.data.candidates[0].content.parts[0].text;
      const formattedMessage = formatResponse(responseText);
      api.sendMessage({ body: formattedMessage }, threadID, messageID);
    }
  } catch (error) {
    console.error("Error:", error.message);
    api.sendMessage("Failed to retrieve a response.", threadID, messageID);
  }
}

export default {
  config,
  onCall
};
