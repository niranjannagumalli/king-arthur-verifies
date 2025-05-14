import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

export const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || env.BOT_TOKEN;
export const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY") ||
  env.DISCORD_PUBLIC_KEY;
export const DISCORD_ROLE_ID = Deno.env.get("DISCORD_ROLE_ID") ||
  env.DISCORD_ROLE_ID;
export const INTRODUCTION_CHANNEL_ID =
  Deno.env.get("INTRODUCTION_CHANNEL_ID") || env.INTRODUCTION_CHANNEL_ID;
export const DISCORD_API_ENDPOINT = "https://discord.com/api/v10/";

// Google Sheets API Keys
export const CLIENT_EMAIL = Deno.env.get("CLIENT_EMAIL") || env.CLIENT_EMAIL;
export const PRIVATE_KEY = Deno.env.get("PRIVATE_KEY") || env.PRIVATE_KEY;
export const SHEET_ID = Deno.env.get("SHEET_ID") || env.SHEET_ID;
