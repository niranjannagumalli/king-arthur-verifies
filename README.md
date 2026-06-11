# Arthur the verifier
Just like how Arthur accepts the proof and verifies whatever the magician Merlin gives it to him, our bot takes in an email address (as proof) and assigns you the user a role, which could potentially give them access to the whole discord server. Here the bot is invoked by a slash command "/email". Also, it sends out a message in another channel which is meant for introductions. In that message it pings that user and attaches a bio and linkedin address of the user which the user has previosly provided. Btw, the email is deleted within sometime to ensure that the privacy of the user is not compromised

## Setting and Assumptions
The bot is useful for your server if
1. you use some sort of form which people *have* to fill to enter the server and the data from the form is stored in google sheet.
2. Members who join the sever have very limited access to the server. Assigning a role to them gives them access. Now you want to assign them role given they provide the email address which they have used to fill in the form.
3. The probability that someone joins the server without filling the form i.e. the server invite link leaks AND inputs an email address of someone who is yet to verify is negligible. 
## Details to replicate it for your server

Just like how Arthur accepts the proof and verifies whatever the magician Merlin gives to him, our bot takes in an email address (as proof) and assigns the user a role, granting them access to the Discord server. 

The bot is invoked by a slash command `/email`. Once successfully verified, it automatically assigns a role to the user and posts an introductory message in a designated channel, including the user's bio and LinkedIn profile.

## 🌟 Setting and Assumptions

This bot is a perfect fit for your server if:
1. You use a form (like Google Forms) that members *must* fill out to join the community, and the responses are stored in a Google Sheet.
2. New members join the server with limited access. A specific role must be assigned to grant them full access.
3. You want to automate this role assignment based on the email address they provided in the form.
4. The probability of someone joining without filling out the form (e.g., via a leaked invite link) AND guessing an unverified email is negligible.

---

## 🔀 Information Flow

Here is how data flows through the application when a user tries to verify:

```mermaid
sequenceDiagram
    participant User as Discord User
    participant Discord as Discord API
    participant Bot as King Arthur App (Deno)
    participant Sheets as Google Sheets

    User->>Discord: Types /email <their-email>
    Discord->>Bot: POST request to Interactions Endpoint
    Bot->>Bot: Verifies request signature
    Bot->>Sheets: Fetches sheet rows
    Sheets-->>Bot: Returns row data
    
    alt Email NOT Found
        Bot-->>Discord: "Could you please retry with correct email?"
    else Already Verified
        Bot-->>Discord: "Looks like you're already verified."
    else Email Found & Not Verified
        Bot->>Sheets: Updates "Verified?" column to "TRUE"
        Bot->>Discord: Assigns verified role to user
        Bot->>Discord: Sends Intro message to #introductions channel
        Bot-->>Discord: "Successfully verified!"
    end
```

---

## 🚀 Setup Guide

Follow these steps to set up "King Arthur Verifies" for your Discord server.

### 1. Google Sheets Setup
1. Create a Google Sheet to store your form responses.
2. Ensure your sheet has the following exact column headers in the first row (Sheet index 0):
   - `Email Address`
   - `Verified?`
   - `LinkedIn Profile (Will be visible to other members)`
   - `Short Bio (Will be visible to other members)`
3. Go to the [Google Cloud Console](https://console.cloud.google.com/).
4. Create a new project and enable the **Google Sheets API**.
5. Create a **Service Account** and generate a JSON key.
6. Open the JSON file. Note the `client_email` and `private_key`.
7. Share your Google Sheet with the `client_email` (giving it Editor access).
8. Copy the **Sheet ID** from the URL of your Google Sheet (the long string between `/d/` and `/edit`).

### 2. Discord Bot Setup
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a New Application.
3. In the **General Information** tab, copy the **Public Key**.
4. Go to the **Bot** tab, create a bot, and copy the **Bot Token**.
5. Invite the bot to your server ensuring it has permissions to **Manage Roles** and **Send Messages**. Make sure the Bot's role is placed *above* the role it needs to assign in your server's role hierarchy.
6. Create a Slash Command for your bot. You will need to register a `/email` command with an option named `email` of type `String`. (This can be done using the Discord API directly or simple scripts).

### 3. Deployment
Since this project uses Deno and standard web requests, it is perfectly suited to be hosted on serverless platforms like [Deno Deploy](https://deno.com/deploy).

1. Deploy this code repository to your hosting provider.
2. Set up the following Environment Variables in your deployment environment:
   
   **Discord Variables:**
   - `BOT_TOKEN`: Your Discord Bot Token.
   - `DISCORD_PUBLIC_KEY`: Your Discord App's Public Key.
   - `DISCORD_ROLE_ID`: The ID of the role to give verified members.
   - `INTRODUCTION_CHANNEL_ID`: The ID of the channel where the bot should send welcome messages.
   
   **Google Variables:**
   - `CLIENT_EMAIL`: The `client_email` from your Service Account JSON.
   - `PRIVATE_KEY`: Your service account `private_key`, **Base64 encoded**. *(Note: The application uses `atob(PRIVATE_KEY)` to decode it, meaning you must base64 encode the raw string from the JSON before saving it as an environment variable. You can do this easily in a JS console using `btoa("-----BEGIN PRIVATE KEY-----\n...")`)*.
   - `SHEET_ID`: The ID of your Google Sheet.

### 4. Link Endpoint to Discord
1. Once deployed, copy your application's public URL.
2. Go back to your App in the Discord Developer Portal.
3. In the **General Information** tab, paste your URL into the **Interactions Endpoint URL** field.
4. Save changes. Discord will send a ping to verify it works.

You are all set! Users can now use `/email` in your server to get verified.
