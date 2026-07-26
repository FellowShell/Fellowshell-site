import { useEffect, useId, useRef, useState, type SubmitEvent } from "react";
import { submitContactForm } from "../lib/contact";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
  privacyAck?: string;
  attachments?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const COPY = {
  hire: {
    messageLabel: "What are you looking for help with?",
    messagePlaceholder: "The work you need done, rough timeline, and anything else useful to know.",
    attachmentLabel: "Attach a file",
    attachmentHint: "optional, up to 10MB total",
  },
  join: {
    messageLabel: "Tell us about yourself",
    messagePlaceholder: "Your background, any relevant skills or interests, and your availability.",
    attachmentLabel: "CV, portfolio, or work samples",
    attachmentHint: "optional, up to 10MB total",
  },
  general: {
    messageLabel: "Tell us more",
    messagePlaceholder: "",
    attachmentLabel: "Attach a file",
    attachmentHint: "optional, up to 10MB total",
  },
} as const;

type Purpose = keyof typeof COPY;

function formatMB(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export default function ContactForm() {
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [purpose, setPurpose] = useState<Purpose>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [privacyAck, setPrivacyAck] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("purpose");
    if (requested === "hire" || requested === "join" || requested === "general") {
      setPurpose(requested);
    }
  }, []);

  const attachmentBytes = attachments.reduce((total, file) => total + file.size, 0);

  function handleFileChange(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    setAttachments(files);
    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    setErrors((prev) => ({
      ...prev,
      attachments:
        totalBytes > MAX_ATTACHMENT_BYTES
          ? `Attachments total ${formatMB(totalBytes)}MB. Keep it under 10MB, or leave them off and mention them in your message.`
          : undefined,
    }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!EMAIL_PATTERN.test(email)) next.email = "Enter a valid email address.";
    if (!message.trim() || message.trim().length < 10) {
      next.message = "Tell us a little more (at least 10 characters).";
    }
    if (!privacyAck) next.privacyAck = "You need to accept the Privacy Policy to continue.";
    if (attachmentBytes > MAX_ATTACHMENT_BYTES) {
      next.attachments = `Attachments total ${formatMB(attachmentBytes)}MB. Keep it under 10MB, or leave them off and mention them in your message.`;
    }
    return next;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !formRef.current) {
      setStatus("idle");
      return;
    }

    setStatus("submitting");
    try {
      await submitContactForm(new FormData(formRef.current));
      setStatus("success");
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setPrivacyAck(false);
      setMarketingOptIn(false);
      setAttachments([]);
      formRef.current.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form noValidate ref={formRef} onSubmit={handleSubmit}>
      <input type="text" name="_honeypot" tabIndex={-1} autoComplete="off" className="visually-hidden" aria-hidden="true" />
      <input type="hidden" name="_subject" value="New message from fellowshell.com" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />

      <div className="field">
        <label htmlFor={`${idPrefix}-purpose`}>I'm getting in touch to</label>
        <select
          id={`${idPrefix}-purpose`}
          name="purpose"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value as Purpose)}
        >
          <option value="hire">Work with your volunteers for my company</option>
          <option value="join">Apply as a volunteer</option>
          <option value="general">Ask a general question</option>
        </select>
      </div>

      <div className="field" data-invalid={Boolean(errors.name)}>
        <label htmlFor={`${idPrefix}-name`}>Full name</label>
        <input
          id={`${idPrefix}-name`}
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
          required
        />
        {errors.name && (
          <p className="field-error" id={`${idPrefix}-name-error`}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="field" data-invalid={Boolean(errors.email)}>
        <label htmlFor={`${idPrefix}-email`}>Email address</label>
        <input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
          required
        />
        {errors.email && (
          <p className="field-error" id={`${idPrefix}-email-error`}>
            {errors.email}
          </p>
        )}
      </div>

      {purpose !== "join" && (
        <div className="field">
          <label htmlFor={`${idPrefix}-company`}>Company <span className="text-muted">(optional)</span></label>
          <input
            id={`${idPrefix}-company`}
            name="company"
            type="text"
            autoComplete="organization"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>
      )}

      <div className="field" data-invalid={Boolean(errors.message)}>
        <label htmlFor={`${idPrefix}-message`}>{COPY[purpose].messageLabel}</label>
        <textarea
          id={`${idPrefix}-message`}
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={COPY[purpose].messagePlaceholder || undefined}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${idPrefix}-message-error` : undefined}
          required
        />
        {errors.message && (
          <p className="field-error" id={`${idPrefix}-message-error`}>
            {errors.message}
          </p>
        )}
      </div>

      <div className="field" data-invalid={Boolean(errors.attachments)}>
        <label htmlFor={`${idPrefix}-attachments`}>
          {COPY[purpose].attachmentLabel} <span className="text-muted">({COPY[purpose].attachmentHint})</span>
        </label>
        <input
          id={`${idPrefix}-attachments`}
          name="attachment"
          type="file"
          multiple
          onChange={(event) => handleFileChange(event.target.files)}
          aria-invalid={Boolean(errors.attachments)}
          aria-describedby={errors.attachments ? `${idPrefix}-attachments-error` : `${idPrefix}-attachments-hint`}
        />
        {!errors.attachments && attachments.length > 0 && (
          <p className="hint" id={`${idPrefix}-attachments-hint`}>
            {attachments.length} file{attachments.length === 1 ? "" : "s"} selected, {formatMB(attachmentBytes)}MB total.
          </p>
        )}
        {errors.attachments && (
          <p className="field-error" id={`${idPrefix}-attachments-error`}>
            {errors.attachments}
          </p>
        )}
      </div>

      <div className="field" data-invalid={Boolean(errors.privacyAck)}>
        <div className="checkbox-row">
          <input
            id={`${idPrefix}-privacy`}
            type="checkbox"
            checked={privacyAck}
            onChange={(event) => setPrivacyAck(event.target.checked)}
            aria-describedby={errors.privacyAck ? `${idPrefix}-privacy-error` : undefined}
            required
          />
          <label htmlFor={`${idPrefix}-privacy`}>
            I've read the{" "}
            <a className="link" href="/privacy-policy">
              Privacy Policy
            </a>{" "}
            and agree to Fellowshell processing my details to respond to this enquiry.
          </label>
        </div>
        {errors.privacyAck && (
          <p className="field-error" id={`${idPrefix}-privacy-error`}>
            {errors.privacyAck}
          </p>
        )}
      </div>

      <div className="field">
        <div className="checkbox-row">
          <input
            id={`${idPrefix}-marketing`}
            name="marketing_opt_in"
            type="checkbox"
            checked={marketingOptIn}
            onChange={(event) => setMarketingOptIn(event.target.checked)}
          />
          <label htmlFor={`${idPrefix}-marketing`}>
            Send me occasional updates about Fellowshell. You can unsubscribe anytime.
          </label>
        </div>
      </div>

      <button type="submit" className="btn btn--primary btn--block" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>

      <div role="status" aria-live="polite">
        {status === "success" && (
          <p className="form-status" data-tone="success">
            Thanks, we've received your message and will get back to you soon.
          </p>
        )}
        {status === "error" && (
          <p className="form-status" data-tone="error">
            Something went wrong sending that. Please try again or email hello@fellowshell.com directly.
          </p>
        )}
      </div>
    </form>
  );
}
