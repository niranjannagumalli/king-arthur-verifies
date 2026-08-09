import { verifySignature } from "./signature.ts";
import { getVerificationStatus } from "./sheet.ts";
import { assignRole, sendIntroMessage } from "./discordApi.ts";
import { DISCORD_ROLE_ID, INTRODUCTION_CHANNEL_ID } from "./env.ts";

// The home function handles incoming requests to the server. It verifies the request signature, checks the request type, and processes the verification status of a user based on their email.
// If the user is verified, it assigns them a role in Discord and sends an introduction message to a specified channel.
export async function home(request: Request) {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method Not Allowed" },
      { status: 405 },
    );
  }
  // these are the headers which are included in a request sent by discord.
  if (
    !request.headers.has("X-Signature-Ed25519") ||
    !request.headers.has("X-Signature-Timestamp")
  ) {
    return Response.json(
      { error: "Missing required headers" },
      { status: 400 },
    );
  }
  const { valid, body } = await verifySignature(request);
  if (!valid) {
    return Response.json(
      { error: "Invalid request" },
      {
        status: 401,
      },
    );
  }

  const { type = 0, data = { options: [] }, guild_id, member = { user: {} } } =
    Response.json.parse(body);
  // Discord performs Ping interactions to test our application.
  if (type === 1) {
    return Response.json({
      type: 1,
    });
  }

  if (type === 2) {
    const { value } = data.options.find((option) => option.name === "email");

    const payload = await getVerificationStatus(value);
    let responseContent = "";
    if (payload === "Already Verified") {
      responseContent += "Looks like you're already verified.";
    } else if (payload.verified === "TRUE") {
      // If the verification status is true, attempt to assign the role.
      const roleId = DISCORD_ROLE_ID; // Get the Role ID from environment variables
      const guildId = guild_id;
      const userId = member.user.id; // member object contains user id.

      if (!roleId) {
        console.error("DISCORD_ROLE_ID is not defined in the environment.");
        responseContent +=
          ", but I couldn't assign the role due to a configuration error.";
        return Response.json({
          type: 4,
          data: {
            content: responseContent,
            flags: 64,
          },
        });
      }

      try {
        await assignRole(guildId, userId, roleId);
        responseContent =
          `Hello, You've been successfully verified and assigned the verified role!`;
        const introChannelId = INTRODUCTION_CHANNEL_ID;
        await sendIntroMessage(
          introChannelId,
          payload.bio,
          payload.linkedin,
          userId,
        );
      } catch (error) {
        console.error("Error assigning role:", error);
        responseContent +=
          `, but I encountered an error assigning the role: ${error.message}`;
      }
    } else {
      responseContent =
        "Hello, We did not find your email in the database. Could you please retry with your correct email id which you have filled in the form?";
    }

    return Response.json({
      type: 4,
      data: {
        content: responseContent,
        flags: 64,
      },
    });
  }

  return Response.json({ error: "bad request" }, { status: 400 });
}
