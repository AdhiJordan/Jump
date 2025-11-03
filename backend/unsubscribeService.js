import puppeteer from "puppeteer";

function extractUnsubscribeLink(emailHtml) {
  // Example: Regex or DOM parsing to find unsubscribe URL
  const regex = /https?:\/\/[^\s"]*unsubscribe[^\s"]*/i;
  const match = emailHtml.match(regex);
  return match ? match[0] : null;
}

async function unsubscribeFromEmail(emailHtml) {
  const unsubscribeLink = extractUnsubscribeLink(emailHtml);
  if (!unsubscribeLink) throw new Error("No unsubscribe link found");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(unsubscribeLink, { waitUntil: "networkidle2" });

  try {
    await page.click("input[type=checkbox]");
  } catch {
    // No checkbox — ignore
  }
  try {
    await page.click("button[type=submit], button:contains('Unsubscribe')");
  } catch {
    // No button — ignore
  }

  await page.waitForTimeout(2000); // Wait for unsubscribe to process
  await browser.close();
  return true;
}

export async function batchUnsubscribeEmails(emails) {
  // Limit concurrency to 1 with delay, to respect site limits & prevent bans
  for (const email of emails) {
    try {
      const html = email.body || "";
      const unsubscribed = await unsubscribeFromEmail(html);
      if (unsubscribed) {
        console.log(`Unsubscribed from email ID ${email.emailId}`);
        // Optionally mark in DB that unsubscribe succeeded
      }
    } catch (err) {
      console.error(
        `Failed to unsubscribe email ID ${email.emailId}:`,
        err.message
      );
    }
    // Delay between unsubs (e.g. 5 seconds) to be polite and avoid throttling
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}
