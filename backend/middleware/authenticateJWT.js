import { OAuth2Client } from "google-auth-library";

const CLIENT_ID =
  "72374069200-sbn1vic1mkm9iapsdi8ilvre057t4k6r.apps.googleusercontent.com"; // same as frontend/client config
const client = new OAuth2Client(CLIENT_ID);

export default async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401); // Unauthorized
  }

  const token = authHeader.substring(7);
  console.log("token", token);
  try {
    // Verify Google ID Token using google-auth-library
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    console.log("ticket ======", ticket);

    const payload = ticket.getPayload();
    console.log("payload", payload);
    req.user = payload; // contains user info like sub (user id), email, name, etc.
    next();
  } catch (error) {
    console.error("Token verification failed", error);
    res.sendStatus(403); // Forbidden
  }
}
