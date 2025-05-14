import { json, validateRequest } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { verifySignature } from "./signature.ts";
import { getVerificationStatus } from "./sheet.ts";
import { assignRole, sendIntroMessage } from "./discord_api.ts";
import { DISCORD_ROLE_ID, INTRODUCTION_CHANNEL_ID } from "./env.ts";

export async function home(request: Request) {
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

    const { type = 0, data = { options: [] }, guild_id, member = { user: {} } } = JSON.parse(body);
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

        if (status === "TRUE") {
            // If the verification status is true, attempt to assign the role.
            const roleId = DISCORD_ROLE_ID; // Get the Role ID from environment variables
            const guildId = guild_id;
            const userId = member.user.id; // member object contains user id.
            console.log(body, userId, guildId, roleId);

            if (!roleId) {
                console.error("DISCORD_ROLE_ID is not defined in the environment.");
                responseContent += ", but I couldn't assign the role due to a configuration error.";
                return json({
                    type: 4,
                    data: {
                        content: responseContent,
                        flags: 64,
                    },
                });
            }

            try {
                await assignRole(guildId, userId, roleId);
                responseContent = `Hello ${value}, The status of your registration is ${status}. You have been assigned the verified role!`;
                const introChannelId = INTRODUCTION_CHANNEL_ID;
                await sendIntroMessage(introChannelId, payload.bio, payload.linkedin);

            } catch (error) {
                console.error("Error assigning role:", error);
                responseContent += `, but I encountered an error assigning the role: ${error.message}`;
            }
        }
        try {
            // await deleteOriginalInteractionMessage(applicationId, interactionToken);
        }
        catch (error) {
            console.error("Error deleting message:", error);
            responseContent += ". Couldn't delete your message. Please delete your message so that your email address can not be seen by others.";
        }


        return json({
            type: 4,
            data: {
                content: responseContent,
                flags: 64,
            },
        });
    }

    return json({ error: "bad request" }, { status: 400 });
}