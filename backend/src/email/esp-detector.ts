// Guess sender ESP using common header fingerprints
// You can extend this map over time.

export function detectESP(headers: Record<string, any>): string {
  const h = Object.fromEntries(Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));

  const receivedAll = (Array.isArray(headers['received']) ? headers['received'] : [headers['received']])
    .filter(Boolean)
    .map((x: any) => String(x).toLowerCase())
    .join('\n');

  const xMailer = (h['x-mailer'] || h['user-agent'] || '').toLowerCase();
  const msgId = (h['message-id'] || '').toLowerCase();

  // Fingerprints
  if (receivedAll.includes('.amazonses.com') || msgId.includes('.amazonses.com')) return 'Amazon SES';
  if (receivedAll.includes('.sendgrid.net') || h['x-sg-eid']) return 'SendGrid';
  if (receivedAll.includes('.mailgun.org') || h['x-mailgun-variables']) return 'Mailgun';
  if (receivedAll.includes('.sparkpostmail.com') || h['x-spamcheck-servers']) return 'SparkPost';
  if (receivedAll.includes('mailchimp') || h['x-mailchimp']) return 'Mailchimp';
  if (receivedAll.includes('.sendinblue.com') || h['x-mailin-messageid']) return 'Brevo/Sendinblue';
  if (receivedAll.includes('.hubspotemail.net') || h['x-hubspot-email']) return 'HubSpot';
  if (receivedAll.includes('.titan.email')) return 'Titan';
  if (receivedAll.includes('.zoho.com') || receivedAll.includes('.zohomail.com')) return 'Zoho Mail';
  if (receivedAll.includes('.outlook.com') || receivedAll.includes('.protection.outlook.com')) return 'Microsoft 365/Outlook';
  if (receivedAll.includes('.google.com') || receivedAll.includes('.gmail.com')) return 'Gmail';
  if (xMailer.includes('apple mail')) return 'Apple Mail';

  return 'Unknown';
}
