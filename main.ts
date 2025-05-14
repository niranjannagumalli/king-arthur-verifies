import {
    json,
    serve,
    validateRequest,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import nacl from "https://esm.sh/tweetnacl@v1.0.3?dts";
import { getVerificationStatus } from "./sheet.ts";

// Discord API endpoint for adding a role to a user in a guild.
const DISCORD_API_ENDPOINT = "https://discord.com/api/v10/";

// For all requests to "/" endpoint, we want to invoke home() handler.
serve({
    "/": home,
});

async function home(request: Request) {
    const { error } = await validateRequest(request, {
        POST: {
            headers: ["X-Signature-Ed25519", "X-Signature-Timestamp"],
        },
    });
    if (error) {
        return json({ error: error.message }, { status: error.status });
    }

    const { valid, body } = await verifySignature(request);
    if (!valid) {
        return json(
            { error: "Invalid request" },
            {
                status: 401,
            },
        );
    }
    
    const { type = 0, data = { options: []}, token, application_id, guild_id, member = {user:[]} } =  JSON.parse(body);
    // Discord performs Ping interactions to test our application.
    if (type === 1) {
        return json({
            type: 1,
        });
    }

    if (type === 2) {
        const { value } = data.options.find((option) => option.name === "email");

        const payload = await getVerificationStatus(value);
        const status = payload.verified;

        let responseContent = `Hello ${value}, The status of your registration is ${status}`;
        const interactionToken = token;
        const applicationId = application_id;
        
        if (status === "TRUE") {
            // If the verification status is true, attempt to assign the role.
            const roleId = Deno.env.get("DISCORD_ROLE_ID"); // Get the Role ID from environment variables
            // const guildId = Deno.env.get("DISCORD_GUILD_ID");  // guild_id is part of the incoming payload
            const guildId = guild_id;
            const userId = member.user.id; // member object contains user id.
            console.log(body,userId, guildId, roleId)
            

            if (!roleId) {
                console.error("DISCORD_ROLE_ID is not defined in the environment.");
                responseContent += ", but I couldn't assign the role due to a configuration error.";
                return json({
                    type: 4,
                    data: {
                        content: responseContent,
                        flags:64,
                    },
                });
            }

            try {
                await assignRole(guildId, userId, roleId);
                responseContent = `Hello ${value}, The status of your registration is ${status}. You have been assigned the verified role!`;
                const introChannelId = Deno.env.get("INTRODUCTION_CHANNEL_ID")
                await sendIntroMessage(introChannelId, payload.bio, payload.linkedin);
                
            } catch (error) {
                console.error("Error assigning role:", error);
                responseContent += `, but I encountered an error assigning the role: ${error.message}`;
            }
        }
        try{
            // await deleteOriginalInteractionMessage(applicationId, interactionToken);
        }
        catch(error)
        {
            console.error("Error deleting message:", error)
            responseContent+=". Couldn't delete your message. Please delete your message so that your email address can not be seen by others."
        }
        

        return json({
            type: 4,
            data: {
                content: responseContent,
                flags:64,
            },
        });
    }

    return json({ error: "bad request" }, { status: 400 });
}

async function verifySignature(
    request: Request,
): Promise<{ valid: boolean; body: string }> {
    const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY")!;
    const signature = request.headers.get("X-Signature-Ed25519")!;
    const timestamp = request.headers.get("X-Signature-Timestamp")!;
    const body = await request.text();
    const valid = nacl.sign.detached.verify(
        new TextEncoder().encode(timestamp + body),
        hexToUint8Array(signature),
        hexToUint8Array(PUBLIC_KEY),
    );

    return { valid, body };
}

function hexToUint8Array(hex: string) {
    return new Uint8Array(
        hex.match(/.{1,2}/g)!.map((val) => parseInt(val, 16)),
    );
}

// Function to assign a role to a user in a Discord guild.
async function  assignRole(guildId: string, userId: string, roleId: string) {
    const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
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

async function sendIntroMessage(channelId: string, bio: string, linkedin: string) {
    const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
    if (!BOT_TOKEN) {
        throw new Error("BOT_TOKEN is not defined in the environment.");
    }

    const url = `${DISCORD_API_ENDPOINT}/channels/${channelId}/messages`;

    const responseContent = `Hello ${value}!\n✅ Verified: ${result.verified}\n🔗 LinkedIn: ${result.linkedin}\n📝 Bio: ${result.bio}`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bot ${BOT_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            responseContent,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send intro message:", errorData);
        throw new Error(`Failed to send intro message: ${response.status} - ${JSON.stringify(errorData)}`);
    }
}
