export function detectEsp(headers: Record<string, string[]>): string {
  const h = (k: string) => headers[k.toLowerCase()] || [];

  const raw = Object.entries(headers)
    .flatMap(([k, v]) => v.map(x => `${k}: ${x}`))
    .join('\n');

  const contains = (needle: RegExp) => needle.test(raw);

  if (contains(/x-ses-outgoing/i) || contains(/amazonses\.com/i)) return 'Amazon SES';
  if (contains(/sendgrid\.net/i) || contains(/x-sg-eid/i)) return 'SendGrid';
  if (contains(/mailgun\.net/i) || contains(/x-mailgun-/i)) return 'Mailgun';
  if (contains(/spf=pass.*google\.com/i) || contains(/gmail\.com/i) || contains(/google\.com/i)) return 'Gmail';
  if (contains(/outlook\.com/i) || contains(/protection\.outlook\.com/i) || contains(/spf=pass.*outlook/i)) return 'Outlook/Office 365';
  if (contains(/zoho\.com/i) || contains(/x-zoho-/i)) return 'Zoho Mail';
  if (contains(/sparkpost/i) || contains(/x-msys-engagement/i)) return 'SparkPost';
  if (contains(/postmarkapp\.com/i) || contains(/x-pm-metadata/i)) return 'Postmark';
  if (contains(/smtp\.yandex/i) || contains(/yandex\.ru/i)) return 'Yandex';
  if (contains(/smtp\.sendinblue\.com/i) || contains(/brevo/i)) return 'Brevo/Sendinblue';

  if (h('x-mailer').some(v => /thunderbird|apple mail|outlook/i.test(v))) return 'Direct SMTP (Mail Client)';
  return 'Unknown';
}
