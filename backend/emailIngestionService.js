import { classifyEmail, summarizeEmail } from "./aiService.js";

export async function ingestEmailsForUser(userId, tokens) {
  // Gmail fetch logic unchanged...

  const categories = await Category.find({ userId });

  for (const msg of res.data.messages) {
    const message = await gmail.users.messages.get({
      userId: "me",
      id: msg.id,
      format: "full",
    });

    const emailText = extractTextFromGmailMessage(message.data);

    // Reuse helper functions
    const categoryId = await classifyEmail(categories, emailText);
    const summary = await summarizeEmail(emailText);

    // Save mapping + archive email as needed
  }
}
