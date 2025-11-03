import puppeteer from "puppeteer";

async function unsubscribeFromEmail(emailHtml) {
  const unsubscribeLink = extractUnsubscribeLink(emailHtml);
  if (!unsubscribeLink) throw new Error("No unsubscribe link found");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(unsubscribeLink, { waitUntil: "networkidle2" });

  // Fill any forms or click unsubscribe buttons if needed, based on page structure

  // Example:
  try {
    await page.click("input[type=checkbox]");
  } catch {
    // Ignore if no checkbox
  }
  try {
    await page.click("button[type=submit], button:contains('Unsubscribe')");
  } catch {
    // Ignore if no button
  }

  await page.waitForTimeout(2000); // wait for action to complete
  await browser.close();
  return true;
}
