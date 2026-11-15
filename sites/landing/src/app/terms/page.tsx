import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions that govern your use of the GlotMate app and website.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      effectiveDate={siteConfig.effectiveDate}
      intro={`Please read these Terms & Conditions (the "Terms") carefully. They govern your use of the ${siteConfig.name} mobile application, website, and any related services (together, the "Service").`}
    >
      <h2>1. Acceptance of these Terms</h2>
      <p>
        By creating an account, downloading the app, or using any part of the
        Service, you agree to be bound by these Terms. If you do not agree, do
        not use the Service.
      </p>

      <h2>2. Who can use GlotMate</h2>
      <p>
        You must be at least 13 years old to use the Service. If you are
        between 13 and the age of majority in your country, you may use the
        Service only with the involvement of a parent or legal guardian. By
        using the Service, you represent that you meet these requirements.
      </p>

      <h2>3. Your account</h2>
      <p>
        You can use GlotMate as a guest, and you may save your progress with
        an email address and password or with Sign in with Apple. You are
        responsible for keeping your sign-in credentials secure and for any
        activity that takes place through your account. Notify us immediately
        at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>{" "}
        if you suspect unauthorized access.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Reverse-engineer, scrape, or attempt to extract our content in bulk;</li>
        <li>Resell, sublicense, or redistribute GlotMate lessons, role plays, audio, or other content;</li>
        <li>Use the Service to harass, defraud, or harm anyone;</li>
        <li>Interfere with the Service&apos;s normal operation, security, or networks;</li>
        <li>Use bots, scrapers, or other automated tools to access the Service except where we explicitly allow it;</li>
        <li>Attempt to bypass any access or rate limits.</li>
      </ul>

      <h2>5. Content and intellectual property</h2>
      <p>
        All lessons, role plays, audio, illustrations, branding and software that make
        up the Service are owned by {siteConfig.copyrightHolder} or our
        licensors. We grant you a personal, non-exclusive, non-transferable,
        revocable license to use the Service for your own language learning,
        subject to these Terms. We reserve all rights not expressly granted.
      </p>

      <h2>6. User feedback</h2>
      <p>
        If you send us feedback, suggestions, or ideas, you grant us a
        worldwide, royalty-free license to use them to improve the Service. We
        appreciate it.
      </p>

      <h2>7. Subscriptions and payments</h2>
      <p>
        Parts of the Service are or may become available only through a paid
        subscription or one-time purchase. When that applies:
      </p>
      <ul>
        <li>
          Pricing, billing cycle, and any free-trial details are shown inside
          the app before you confirm the purchase.
        </li>
        <li>
          Payments and refunds are handled by the App Store or Google Play
          under their own terms. We do not receive or store your full payment
          card details.
        </li>
        <li>
          Subscriptions <strong>renew automatically</strong> at the end of
          each billing period unless you cancel at least 24 hours before the
          period ends. You can manage or cancel renewals at any time in your
          App Store or Google Play account settings; cancellation takes
          effect at the end of the current paid period.
        </li>
        <li>
          If you cancel a paid trial before it ends, you will not be charged.
          If a trial converts to a paid subscription, the standard renewal
          and cancellation rules above apply.
        </li>
        <li>
          We may change subscription prices for future billing periods. If
          we do, we will give you advance notice and an opportunity to cancel
          before the new price takes effect.
        </li>
      </ul>

      <h2>8. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We
        may suspend or terminate your access if you violate these Terms or use
        the Service in a way that creates legal or operational risk for us or
        other users.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        The Service is provided <strong>&quot;as is&quot;</strong> and{" "}
        <strong>&quot;as available&quot;</strong>. While we work hard to keep
        GlotMate useful and accurate, we do not warrant that it will be
        uninterrupted, error-free, or that it will help you achieve any
        particular language proficiency.
      </p>
      <p>
        Your tutor is an <strong>artificial intelligence</strong>, not a human
        teacher. Its replies, corrections, translations and feedback are
        generated automatically and can be incomplete or wrong. Do not rely on
        them as professional, legal, medical or other expert advice.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {siteConfig.copyrightHolder}{" "}
        will not be liable for any indirect, incidental, special, consequential
        or punitive damages, or any loss of data, profits or goodwill arising
        out of your use of, or inability to use, the Service. Our total
        aggregate liability to you for all claims relating to the Service is
        limited to the greater of (a) the amount you paid us for the Service
        in the twelve months immediately preceding the event giving rise to
        the claim, or (b) USD 50.
      </p>
      <p>
        Nothing in these Terms excludes or limits any liability that cannot
        be excluded or limited under applicable law (for example, liability
        for gross negligence, wilful misconduct, or your statutory consumer
        rights).
      </p>

      <h2>11. Changes to the Service or these Terms</h2>
      <p>
        We may update the Service and these Terms from time to time. If a
        change is material, we will give you reasonable notice — for example,
        in-app or by email. Continuing to use the Service after a change means
        you accept the updated Terms.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These Terms are governed by the laws of the country in which{" "}
        {siteConfig.copyrightHolder} is established, without regard to its
        conflict-of-laws rules. You may have additional rights under the
        mandatory consumer protection laws of your country of residence, and
        nothing in this section limits those rights.
      </p>

      <h2>13. App Store and Google Play</h2>
      <p>
        If you downloaded GlotMate from the Apple App Store, you acknowledge
        that these Terms are between you and {siteConfig.copyrightHolder}{" "}
        only, and not with Apple. Apple is not responsible for the Service or
        its content. Apple and its subsidiaries are, however, third-party
        beneficiaries of these Terms and may enforce them against you.
        Maintenance and support obligations (if any) rest solely with{" "}
        {siteConfig.copyrightHolder}.
      </p>
      <p>
        If you downloaded GlotMate from Google Play, equivalent terms apply:
        the agreement is between you and {siteConfig.copyrightHolder}, and
        Google is not a party to it.
      </p>

      <h2>14. Miscellaneous</h2>
      <p>
        If any provision of these Terms is held to be unenforceable, the
        remaining provisions will remain in full force and effect. We may
        assign these Terms in connection with a merger, acquisition, or sale
        of assets; you may not assign them without our prior written consent.
        These Terms, together with our Privacy Policy, are the entire
        agreement between you and {siteConfig.copyrightHolder} regarding the
        Service and supersede any prior agreements on the same subject.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Reach us at{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
