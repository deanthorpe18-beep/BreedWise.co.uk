import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  return new Resend(key);
}

const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@breedwise.co.uk";
const adminEmail = process.env.RESEND_ADMIN_EMAIL || "admin@breedwise.co.uk";

function plainTextFooter() {
  return `\n\n---\nBreedWise | breedwise.co.uk\nThis is an automated message. Please do not reply directly to this email. For support, contact support@breedwise.co.uk.`;
}

function htmlFooter() {
  return `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
    <p style="margin:0;font-weight:600;color:#0f172a;">BreedWise</p>
    <p style="margin:4px 0 0;"><a href="https://breedwise.co.uk" style="color:#00BFA5;text-decoration:none;">breedwise.co.uk</a></p>
    <p style="margin:8px 0 0;font-size:11px;">This is an automated message. Please do not reply directly to this email. For support, contact <a href="mailto:support@breedwise.co.uk" style="color:#64748b;">support@breedwise.co.uk</a>.</p>
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

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
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

  return getResend().emails.send({ from: fromEmail, to, subject, html, text });
}

export async function sendClaimConfirmation(to, breederName) {
  const subject = "Your BreedWise claim has been received";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Claim received</h2>
    <p>Thank you for claiming <strong>${breederName}</strong> on BreedWise. We have received your request and it is now under review.</p>
    <p style="margin:16px 0;">Our team typically reviews claims within 1–2 working days. You will receive an email once a decision has been made.</p>
    <p style="font-size:13px;color:#64748b;">If you have any questions, contact us at <a href="mailto:support@breedwise.co.uk">support@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Claim received\n\nThank you for claiming ${breederName} on BreedWise. We have received your request and it is now under review.\n\nOur team typically reviews claims within 1-2 working days. You will receive an email once a decision has been made.\n\nIf you have any questions, contact us at support@breedwise.co.uk.${plainTextFooter()}`;

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

  return resend.emails.send({ from: fromEmail, to: adminEmail, subject, html, text });
}

export async function sendRemovalConfirmation(to, breederName) {
  const subject = "Your BreedWise removal request has been received";
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">Removal request received</h2>
    <p>Thank you for contacting us about <strong>${breederName}</strong>. We have received your removal request and it is now under review.</p>
    <p style="margin:16px 0;">Our team typically reviews removal requests within 1–2 working days. You will receive an email once a decision has been made.</p>
    <p style="font-size:13px;color:#64748b;">Please note that we may retain anonymised or aggregated data as outlined in our Privacy Policy. If you have any questions, contact us at <a href="mailto:support@breedwise.co.uk">support@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `Removal request received\n\nThank you for contacting us about ${breederName}. We have received your removal request and it is now under review.\n\nOur team typically reviews removal requests within 1-2 working days. You will receive an email once a decision has been made.\n\nPlease note that we may retain anonymised or aggregated data as outlined in our Privacy Policy. If you have any questions, contact us at support@breedwise.co.uk.${plainTextFooter()}`;

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

  return resend.emails.send({ from: fromEmail, to: adminEmail, subject, html, text });
}

export async function sendStatusUpdateEmail(to, subject, message) {
  const html = `<div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#2D3436;">
    <h2 style="color:#00BFA5;margin-bottom:16px;">${subject}</h2>
    <p>${message}</p>
    <p style="margin:16px 0;font-size:13px;color:#64748b;">If you have any questions, contact us at <a href="mailto:support@breedwise.co.uk">support@breedwise.co.uk</a>.</p>
    ${htmlFooter()}
  </div>`;
  const text = `${subject}\n\n${message}\n\nIf you have any questions, contact us at support@breedwise.co.uk.${plainTextFooter()}`;

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
    message += " If you believe this was a mistake, please contact support@breedwise.co.uk.";
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
    message += " If you believe this was a mistake, please contact support@breedwise.co.uk.";
  } else if (status === "under_review") {
    message += " We are reviewing your request and will update you shortly.";
  }
  return sendStatusUpdateEmail(to, subject, message);
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
