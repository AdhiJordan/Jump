import { google } from "googleapis";

function getOAuth2Client(tokens, clientId, clientSecret, redirectUri) {
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
  oAuth2Client.setCredentials(tokens);
  return oAuth2Client;
}

async function refreshAccessToken(oAuth2Client, userId, saveTokensCallback) {
  try {
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);

    // Save updated tokens (including possible new refresh token) to DB
    await saveTokensCallback(userId, credentials);

    return credentials;
  } catch (error) {
    console.error("Error refreshing access token", error);
    throw error;
  }
}

export async function listEmails(
  tokens,
  labelIds = [],
  config,
  saveTokensCallback,
  userId
) {
  const oAuth2Client = getOAuth2Client(
    tokens,
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  if (!tokens.expiry_date || tokens.expiry_date < Date.now()) {
    const newTokens = await refreshAccessToken(
      oAuth2Client,
      userId,
      saveTokensCallback
    );
    tokens = newTokens;
  }

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  // Fetch list of message IDs
  const listRes = await gmail.users.messages.list({
    userId: "me",
    labelIds,
  });

  const messages = listRes.data.messages || [];

  // Fetch full details for each message in parallel
  const detailedMessages = await Promise.all(
    messages.map(async (msg) => {
      const res = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });
      return res.data;
    })
  );

  return detailedMessages;
}

// export async function listEmails(
//   tokens,
//   labelIds = [],
//   config,
//   saveTokensCallback,
//   userId
// ) {
//   const oAuth2Client = getOAuth2Client(
//     tokens,
//     config.clientId,
//     config.clientSecret,
//     config.redirectUri
//   );

//   // Refresh token if expired or near expiry
//   if (!tokens.expiry_date || tokens.expiry_date < Date.now()) {
//     const newTokens = await refreshAccessToken(
//       oAuth2Client,
//       userId,
//       saveTokensCallback
//     );
//     tokens = newTokens;
//   }

//   const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

//   const res = await gmail.users.messages.list({
//     userId: "me",
//     labelIds,
//     maxResults: 50,
//   });

//   return res.data.messages || [];
// }

export async function getEmailDetails(
  tokens,
  messageId,
  config,
  saveTokensCallback,
  userId
) {
  const oAuth2Client = getOAuth2Client(
    tokens,
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );

  // Refresh token if expired or near expiry
  if (!tokens.expiry_date || tokens.expiry_date < Date.now()) {
    const newTokens = await refreshAccessToken(
      oAuth2Client,
      userId,
      saveTokensCallback
    );
    tokens = newTokens;
  }

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
    maxResults: 50,
  });

  return res.data;
}
