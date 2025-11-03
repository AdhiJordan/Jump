import OpenAI from "openai";

const openai = new OpenAI({
  apiKey:
    "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",
});

export async function classifyEmail(categories, emailText) {
  const prompt = buildCategorizationPrompt(categories, emailText);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return parseCategoryFromResponse(response);
}

export async function summarizeEmail(emailText) {
  const prompt = `Summarize this email:\n${emailText}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content;
}
