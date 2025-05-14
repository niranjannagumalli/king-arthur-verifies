import { BOT_TOKEN, DISCORD_API_ENDPOINT } from "./env.ts";

// Function to assign a role to a user in a Discord guild.
export async function assignRole(guildId: string, userId: string, roleId: string) {
    if (!BOT_TOKEN) {
        throw new Error("BOT_TOKEN is not defined in the environment.");
    }

    const url = `${DISCORD_API_ENDPOINT}/guilds/${guildId}/members/${userId}/roles/${roleId}`;

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json(); // Attempt to get more detailed error
        throw new Error(`Failed to assign role: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    // A successful role assignment typically returns a 204 No Content, so we don't need to parse JSON.
}

export async function sendIntroMessage(channelId: string, bio: string, linkedin: string) {
    if (!BOT_TOKEN) {
        throw new Error("BOT_TOKEN is not defined in the environment.");
    }

    const url = `${DISCORD_API_ENDPOINT}/channels/${channelId}/messages`;

    const responseContent = `Hello!\n🔗 LinkedIn: ${linkedin}\n📝 Bio: ${bio}`;
    console.log(responseContent);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content: responseContent,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send intro message:", errorData);
        throw new Error(`Failed to send intro message: ${response.status} - ${JSON.stringify(errorData)}`);
    }
}