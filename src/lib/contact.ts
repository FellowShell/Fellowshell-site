const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/hello@fellowshell.com";

/**
 * Posts the contact form straight to FormSubmit, a zero-signup service that
 * forwards submissions (including any attached files) to hello@fellowshell.com
 * by email. No backend or hosting is required for this to work.
 *
 * First submission: FormSubmit sends a one-time confirmation email to
 * hello@fellowshell.com the first time this address is used. Someone needs
 * to click that link before real submissions start arriving.
 */
export async function submitContactForm(formData: FormData): Promise<void> {
  const response = await fetch(FORMSUBMIT_ENDPOINT, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`FormSubmit responded with status ${response.status}`);
  }
}
