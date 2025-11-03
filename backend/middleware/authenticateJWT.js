import { OAuth2Client } from "google-auth-library";

const CLIENT_ID =
  "72374069200-sbn1vic1mkm9iapsdi8ilvre057t4k6r.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

export default async function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.sendStatus(401);
  }

  const token = authHeader.substring(7);
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.user = payload;
    next();
  } catch (error) {
    console.error("Token verification failed", error);
    res.sendStatus(403);
  }
}
