import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(key);
}

const fromEmail = process.env.RESEND_FROM_EMAIL || "info@breedwise.co.uk";
const noreplyEmail = process.env.RESEND_NOREPLY_EMAIL || "noreply@breedwise.co.uk";
const adminEmail = process.env.RESEND_ADMIN_EMAIL || "admin@breedwise.co.uk";

function plainTextFooter() {
  return `\n\n---\nBreedWise | breedwise.co.uk\nThis is an automated message. Please do not reply directly to this email. For support, contact info@breedwise.co.uk.`;
}

function htmlFooter() {
  return `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
    <p style="margin:0;font-weight:600;color:#0f172a;">BreedWise</p>
    <p style="margin:4px 0 0;"><a href="https://breedwise.co.uk" style="color:#00BFA5;text-decoration:none;">breedwise.co.uk</a></p>
    <p style="margin:8px 0 0;font-size:11px;">This is an automated message. Please do not reply directly to this email. For support, contact <a href="mailto:info@breedwise.co.uk" style="color:#64748b;">info@breedwise.co.uk</a>.</p>
  </div>`;
}

export async function sendVerificationEmail(to, verificationUrl) {
  const subject = "Verify your BreedWise account";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Verify your email address</h2>
    <p>Thank you for signing up to BreedWise. Please click the link below to verify your email address.</p>
    <p style="margin:24px 0;"><a href="${verificationUrl}" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Verify email address</a></p>
    <p style="font-size:13px;color:#64748b;">This link expires after 24 hours. If you did not create an account, you can safely ignore this email.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Verify your email address\n\nThank you for signing up to BreedWise. Please visit the link below to verify your email address:\n\n${verificationUrl}\n\nThis link expires after 24 hours. If you did not create an account, you can safely ignore this email.${plainTextFooter()}`;

  return getResend().emails.send({ from: noreplyEmail, to, subject, html, text });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const subject = "Reset your BreedWise password";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Reset your password</h2>
    <p>You requested a password reset for your BreedWise account. Click the link below to choose a new password.</p>
    <p style="margin:24px 0;"><a href="${resetUrl}" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Reset password</a></p>
    <p style="font-size:13px;color:#64748b;">This link expires after 1 hour. If you did not request a reset, you can safely ignore this email.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Reset your password\n\nYou requested a password reset for your BreedWise account. Visit the link below to choose a new password:\n\n${resetUrl}\n\nThis link expires after 1 hour. If you did not request a reset, you can safely ignore this email.${plainTextFooter()}`;

  return getResend().emails.send({ from: noreplyEmail, to, subject, html, text });
}

export async function sendEmailChangeConfirmation(to, confirmationUrl) {
  const subject = "Confirm your new email address";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Confirm email change</h2>
    <p>You requested to change your email address on BreedWise. Click the link below to confirm this change.</p>
    <p style="margin:24px 0;"><a href="${confirmationUrl}" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Confirm new email</a></p>
    <p style="font-size:13px;color:#64748b;">This link expires after 24 hours. If you did not request this change, you can safely ignore this email.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Confirm email change\n\nYou requested to change your email address on BreedWise. Visit the link below to confirm this change:\n\n${confirmationUrl}\n\nThis link expires after 24 hours. If you did not request this change, you can safely ignore this email.${plainTextFooter()}`;

  return getResend().emails.send({ from: noreplyEmail, to, subject, html, text });
}

export async function sendClaimConfirmation(to, breederName) {
  const subject = "Your BreedWise claim has been received";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Claim received</h2>
    <p>Thank you for claiming <strong>${breederName}</strong> on BreedWise. We have received your request and it is now under review.</p>
    <p style="margin:16px 0;">Our team typically reviews claims within 1–2 working days. You will receive an email once a decision has been made.</p>
    <p style="font-size:13px;color:#64748b;">If you have any questions, contact us at <a href="mailto:info@breedwise.co.uk">info@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Claim received\n\nThank you for claiming ${breederName} on BreedWise. We have received your request and it is now under review.\n\nOur team typically reviews claims within 1-2 working days. You will receive an email once a decision has been made.\n\nIf you have any questions, contact us at info@breedwise.co.uk.${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendClaimAdminNotification(breederName, claimantEmail) {
  const subject = `New claim submitted: ${breederName}`;
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">New claim submitted</h2>
    <p><strong>Breeder:</strong> ${breederName}</p>
    <p><strong>Claimant email:</strong> ${claimantEmail}</p>
    <p style="margin:24px 0;"><a href="https://breedwise.co.uk/admin" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Review in admin panel</a></p>
    ${htmlFooter()}
  </div>`;
  const text = `New claim submitted\n\nBreeder: ${breederName}\nClaimant email: ${claimantEmail}\n\nReview in admin panel: https://breedwise.co.uk/admin${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to: adminEmail, subject, html, text });
}

export async function sendRemovalConfirmation(to, breederName) {
  const subject = "Your BreedWise removal request has been received";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Removal request received</h2>
    <p>Thank you for contacting us about <strong>${breederName}</strong>. We have received your removal request and it is now under review.</p>
    <p style="margin:16px 0;">Our team typically reviews removal requests within 1–2 working days. You will receive an email once a decision has been made.</p>
    <p style="font-size:13px;color:#64748b;">Please note that we may retain anonymised or aggregated data as outlined in our Privacy Policy. If you have any questions, contact us at <a href="mailto:info@breedwise.co.uk">info@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Removal request received\n\nThank you for contacting us about ${breederName}. We have received your removal request and it is now under review.\n\nOur team typically reviews removal requests within 1-2 working days. You will receive an email once a decision has been made.\n\nPlease note that we may retain anonymised or aggregated data as outlined in our Privacy Policy. If you have any questions, contact us at info@breedwise.co.uk.${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendRemovalAdminNotification(breederName, requesterEmail) {
  const subject = `New removal request: ${breederName}`;
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#FF6B6B;margin-bottom:16px;">New removal request</h2>
    <p><strong>Breeder:</strong> ${breederName}</p>
    <p><strong>Requester email:</strong> ${requesterEmail}</p>
    <p style="margin:24px 0;"><a href="https://breedwise.co.uk/admin" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Review in admin panel</a></p>
    ${htmlFooter()}
  </div>`;
  const text = `New removal request\n\nBreeder: ${breederName}\nRequester email: ${requesterEmail}\n\nReview in admin panel: https://breedwise.co.uk/admin${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to: adminEmail, subject, html, text });
}

export async function sendStatusUpdateEmail(to, subject, message) {
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">${subject}</h2>
    <p>${message}</p>
    <p style="margin:16px 0;font-size:13px;color:#64748b;">If you have any questions, contact us at <a href="mailto:info@breedwise.co.uk">info@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `${subject}\n\n${message}\n\nIf you have any questions, contact us at info@breedwise.co.uk.${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendClaimStatusUpdate(to, breederName, status, adminReason) {
  const subject = `Your BreedWise claim has been ${status.replace("_", " ")}`;
  let message = `Your claim for <strong>${breederName}</strong> has been <strong>${status.replace("_", " ")}</strong>.`;
  if (adminReason) {
    message += ` Reason: ${adminReason}`;
  }
  if (status === "approved") {
    message += " You can now manage your listing through your breeder dashboard.";
  } else if (status === "rejected") {
    message += " If you believe this was a mistake, please contact info@breedwise.co.uk.";
  } else if (status === "under_review") {
    message += " We are reviewing your claim and will update you shortly.";
  }
  return sendStatusUpdateEmail(to, subject, message);
}

export async function sendRemovalStatusUpdate(to, breederName, status, adminReason) {
  const subject = `Your BreedWise removal request has been ${status.replace("_", " ")}`;
  let message = `Your removal request for <strong>${breederName}</strong> has been <strong>${status.replace("_", " ")}</strong>.`;
  if (adminReason) {
    message += ` Reason: ${adminReason}`;
  }
  if (status === "approved") {
    message += " Your listing has been hidden from public view. We may retain anonymised or aggregated data as outlined in our Privacy Policy.";
  } else if (status === "rejected") {
    message += " If you believe this was a mistake, please contact info@breedwise.co.uk.";
  } else if (status === "under_review") {
    message += " We are reviewing your request and will update you shortly.";
  }
  return sendStatusUpdateEmail(to, subject, message);
}

export async function sendWelcomeEmail(to, displayName = "there") {
  const subject = "Welcome to BreedWise";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Welcome to BreedWise, ${displayName}</h2>
    <p>Your email has been verified and your account is now active.</p>
    <p style="margin:16px 0;">BreedWise is the UK's leading pet breeder directory. Here is what you can do next:</p>
    <ul style="padding-left:20px;margin:12px 0;">
      <li style="margin-bottom:8px;">Search for verified breeders across dogs, cats, birds, fish, reptiles and small pets</li>
      <li style="margin-bottom:8px;">Claim your breeder listing to manage your profile and connect with potential buyers</li>
      <li style="margin-bottom:8px;">Browse our encyclopedia to learn about different breeds</li>
    </ul>
    <p style="margin:24px 0;"><a href="https://breedwise.co.uk/search" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Find breeders</a></p>
    <p style="font-size:13px;color:#64748b;">If you have any questions, contact us at <a href="mailto:info@breedwise.co.uk">info@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Welcome to BreedWise, ${displayName}

Your email has been verified and your account is now active.

BreedWise is the UK's leading pet breeder directory. Here is what you can do next:
- Search for verified breeders across dogs, cats, birds, fish, reptiles and small pets
- Claim your breeder listing to manage your profile and connect with potential buyers
- Browse our encyclopedia to learn about different breeds

Find breeders: https://breedwise.co.uk/search

If you have any questions, contact us at info@breedwise.co.uk.${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendClaimInvitation(to, breederName, breederSlug) {
  const claimUrl = `https://breedwise.co.uk/claim?slug=${encodeURIComponent(breederSlug)}&name=${encodeURIComponent(breederName)}`;
  const profileUrl = `https://breedwise.co.uk/breeder/${breederSlug}`;
  const subject = `Claim your breeder listing on BreedWise — ${breederName}`;
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Your listing is live on BreedWise</h2>
    <p>Hi there,</p>
    <p>We have created a public listing for <strong>${breederName}</strong> on <a href="https://breedwise.co.uk" style="color:#00BFA5;text-decoration:none;">BreedWise</a>, the UK's pet breeder directory.</p>
    <p style="margin:16px 0;"><a href="${profileUrl}" style="color:#00BFA5;text-decoration:none;font-weight:600;">View your profile →</a></p>
    <p style="margin:16px 0;background:#F1F4F6;padding:16px;border-radius:16px;">
      <strong>Why claim your profile?</strong><br/>
      • Update your contact details, breeds, and photos<br/>
      • Receive direct messages from potential buyers<br/>
      • Stand out with a verified badge<br/>
      • It's completely free to get started
    </p>
    <p style="margin:24px 0;"><a href="${claimUrl}" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">Claim your free listing</a></p>
    <p style="font-size:13px;color:#64748b;">If you have any questions, reply to this email or contact us at <a href="mailto:info@breedwise.co.uk">info@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Your listing is live on BreedWise

Hi there,

We have created a public listing for ${breederName} on BreedWise, the UK's pet breeder directory.

View your profile: ${profileUrl}

Why claim your profile?
- Update your contact details, breeds, and photos
- Receive direct messages from potential buyers
- Stand out with a verified badge
- It's completely free to get started

Claim your free listing: ${claimUrl}

If you have any questions, contact us at info@breedwise.co.uk.${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendContactConfirmation(to) {
  const subject = "We have received your message";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Message received</h2>
    <p>Thank you for contacting BreedWise. We have received your message and will respond as soon as possible.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Message received\n\nThank you for contacting BreedWise. We have received your message and will respond as soon as possible.${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendNewMessageEmail(to, senderName, conversationUrl, previewText) {
  const subject = `New message from ${senderName} on BreedWise`;
  const truncated = previewText.length > 120 ? previewText.slice(0, 120) + "..." : previewText;
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">You have a new message</h2>
    <p><strong>${senderName}</strong> sent you a message on BreedWise:</p>
    <p style="margin:16px 0;padding:16px;background:#F1F4F6;border-radius:12px;font-size:14px;color:#475569;">"${truncated}"</p>
    <p style="margin:24px 0;"><a href="${conversationUrl}" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">View conversation</a></p>
    <p style="font-size:13px;color:#64748b;">Reply directly on BreedWise to continue the conversation.</p>
    ${htmlFooter()}
  </div>`;
  const text = `You have a new message\n\n${senderName} sent you a message on BreedWise:\n\n"${truncated}"\n\nView conversation: ${conversationUrl}\n\nReply directly on BreedWise to continue the conversation.${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendNewsletterEmail(to, subject, html, text) {
  return getResend().emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    text: text || subject,
  });
}

export async function sendSearchAlertEmail(to, alertName, breeders) {
  const subject = `New breeders match your alert: ${alertName}`;
  const listHtml = breeders
    .map(
      (b) => `<li style="margin-bottom:12px;">
        <a href="https://breedwise.co.uk/breeder/${b.slug}" style="color:#00BFA5;font-weight:600;text-decoration:none;">${b.name}</a>
        <span style="color:#64748b;font-size:13px;"> — ${b.town}${b.breeds?.length ? ` · ${b.breeds.slice(0, 2).join(", ")}` : ""}</span>
      </li>`
    )
    .join("");

  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#2D3436;">
    <div style="background:linear-gradient(135deg,#00BFA5,#008f7a);padding:24px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:20px;color:#fff;">New breeders found</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Matching: ${alertName}</p>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">These breeders were recently added to BreedWise and match your saved search alert:</p>
      <ul style="margin:0;padding-left:20px;">${listHtml}</ul>
      <p style="margin:24px 0 0;"><a href="https://breedwise.co.uk/account/saved-searches" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;font-size:14px;">Manage your alerts</a></p>
    </div>
    ${htmlFooter()}
  </div>`;

  const text = `New breeders match your alert: ${alertName}\n\n${breeders.map((b) => `${b.name} — ${b.town} — https://breedwise.co.uk/breeder/${b.slug}`).join("\n")}${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendLitterAnnouncementEmail(to, { recipientName, breeder, litter, source, alertName }) {
  const subject = `New litter from ${breeder.name} — ${litter.breed}`;
  const profileUrl = `https://breedwise.co.uk/breeder/${breeder.slug}`;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const intro =
    source === "waitlist"
      ? `A new litter has been announced by ${breeder.name}, and you're on their wait list.`
      : `A new litter matching your alert${alertName ? ` (${alertName})` : ""} has been announced on BreedWise.`;

  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#2D3436;">
    <div style="background:linear-gradient(135deg,#00BFA5,#008f7a);padding:24px;border-radius:16px 16px 0 0;text-align:center;">
      <h1 style="margin:0;font-size:20px;color:#fff;">New litter announced</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">${breeder.name} · ${breeder.town || "UK"}</p>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;">
      <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">${greeting}<br><br>${intro}</p>
      <div style="background:#F8FAFC;border-radius:12px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 8px;font-weight:600;color:#0f172a;">${litter.litterName || litter.breed}</p>
        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
          Breed: ${litter.breed}<br>
          ${litter.birthDate ? `Born: ${litter.birthDate}<br>` : ""}
          ${litter.goHomeDate ? `Can leave: ${litter.goHomeDate}<br>` : ""}
          ${litter.availableCount != null ? `Available: ${litter.availableCount}<br>` : ""}
          ${litter.announcement ? `<br>${litter.announcement}` : ""}
        </p>
      </div>
      <p style="margin:0;"><a href="${profileUrl}" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;font-size:14px;">View breeder profile</a></p>
    </div>
    ${htmlFooter()}
  </div>`;

  const text = `${subject}\n\n${intro}\n\n${litter.breed}${litter.birthDate ? ` · Born ${litter.birthDate}` : ""}\n\n${profileUrl}${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendWaitlistJoinedEmail(to, { name, breederName, breederSlug, breedInterest }) {
  const subject = `You're on the wait list — ${breederName}`;
  const profileUrl = `https://breedwise.co.uk/breeder/${breederSlug}`;
  const greeting = name ? `Hi ${name},` : "Hi,";

  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Wait list confirmed</h2>
    <p>${greeting}</p>
    <p style="line-height:1.6;">You're on the wait list for <strong>${breederName}</strong>${breedInterest ? ` (${breedInterest})` : ""}. We'll email you when they announce a new litter on BreedWise.</p>
    <p style="margin:24px 0;"><a href="${profileUrl}" style="display:inline-block;background:#00BFA5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600;">View their profile</a></p>
    ${htmlFooter()}
  </div>`;

  const text = `Wait list confirmed\n\n${greeting}\n\nYou're on the wait list for ${breederName}. We'll email you when they announce a new litter.\n\n${profileUrl}${plainTextFooter()}`;

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}
