import { startBot, Intents, createBot } from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import {getVerificationStatus } from "./sheet.ts";

// Create the bot
const bot = createBot({
  token: Deno.env.get("BOT_TOKEN")!,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,

  events: {
    ready() {
      console.log("🤖 Bot is online!");
    },

    async messageCreate(bot, message) {
      

      if (message.content.startsWith("$verify"))
        {
        const email = message.content.split(" ")[1];
        const start = performance.now();
        const status = await getVerificationStatus(email)
        const end = performance.now();
        console.log(`Request took ${(end - start).toFixed(2)} ms`);
        await bot.helpers.sendMessage(message.channelId, {
          content: "Hello!"+status,
        });
      }
    },
  },
});

// Start the bot
await startBot(bot);
