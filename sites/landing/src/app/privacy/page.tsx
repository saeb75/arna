import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How GlotMate collects, uses and protects your data, and the choices you have.",
};

const mail = <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate={siteConfig.effectiveDate}
      intro={`This Privacy Policy explains what data ${siteConfig.name} collects, why we collect it, and the choices you have. We collect as little as possible, and we never sell your personal data.`}
    >
      <h2>1. Who we are</h2>
      <p>
        {siteConfig.copyrightHolder} (&quot;we&quot;, &quot;us&quot;) is the
        controller of the personal data described in this policy. You can
        contact us any time at {mail}.
      </p>

      <h2>2. What we collect</h2>

      <h3>Account data</h3>
      <p>
        You can use GlotMate without creating an account: the app then works
        with an anonymous account identifier. If you choose to save your
        progress, we receive the email address you enter, or a basic identity
        token from Apple when you use Sign in with Apple.
      </p>

      <h3>Profile data</h3>
      <p>
        The answers you give when you set up the app: the name you want to be
        called, your English level, daily goal, the context you want to practise
        (for example work or travel), your interests, your occupation if you
        choose to add it, your native language, the tutor you picked and your
        time zone.
      </p>

      <h3>Your voice</h3>
      <p>
        GlotMate is a speaking app. When you hold the microphone button, the app
        records what you say and sends the recording to our server, which
        forwards it to a speech-recognition provider to turn it into text. We
        do not keep the audio recording after it has been transcribed. The
        microphone is used only while you hold the button.
      </p>

      <h3>Conversations and learning data</h3>
      <p>
        We store the text of your lessons and role plays (what you said or typed
        and what the tutor answered), your answers to exercises and unit tests,
        your progress and streak, the feedback generated for your sentences, and
        the words you save. After a lesson we may also store a short summary and
        a few facts you mentioned (for example your hobbies), so that later
        conversations can build on earlier ones.
      </p>

      <h3>Device &amp; technical data</h3>
      <p>
        Like most apps, we receive basic technical information automatically:
        device type, operating system, app version, language and IP address. We
        use this to keep the app stable and secure.
      </p>

      <h3>Identifiers</h3>
      <p>
        To run the Service and to measure how well our marketing works, we
        receive or generate pseudonymous identifiers: a randomly generated
        install ID, a purchase identifier issued by the App Store or Google
        Play, and, only where you have allowed it (through Apple&apos;s App
        Tracking Transparency prompt on iOS), your device&apos;s advertising
        identifier. These identifiers are not tied to your real name.
      </p>

      <h3>Purchase data</h3>
      <p>
        GlotMate is currently free. If you ever buy a subscription or other paid
        feature, the App Store or Google Play handles the payment itself. We
        receive a receipt that tells us which plan you bought and whether it is
        active. We do not receive or store your payment card details.
      </p>

      <h3>Communications</h3>
      <p>
        If you email us, we keep your message and contact details so we can
        reply. We do not use your email for marketing without your consent.
      </p>

      <h2>3. What we do not do</h2>
      <ul>
        <li>We do not access your contacts, photos or precise location.</li>
        <li>We do not listen in the background: the microphone records only while you hold the button.</li>
        <li>We do not show third-party advertisements inside GlotMate.</li>
        <li>We do not sell your personal data.</li>
      </ul>

      <h2>4. Why we use your data</h2>
      <ul>
        <li>To provide the lessons, role plays and tutor replies, in text and voice;</li>
        <li>To personalize the tutor to your level, goals and earlier conversations;</li>
        <li>To show your progress, mistakes and saved words;</li>
        <li>To send the daily reminder, if you turn it on (it is scheduled on your device);</li>
        <li>To keep the Service secure, prevent abuse and fix problems;</li>
        <li>To understand which marketing brings people to the app;</li>
        <li>To answer you when you contact us and to meet our legal obligations.</li>
      </ul>

      <h2>5. Artificial intelligence</h2>
      <p>
        Your tutor is an AI. To produce its replies, the text of your
        conversation, your profile answers and your voice recordings are
        processed by the AI and speech providers listed below, acting on our
        behalf. We send them only what is needed for the request, and we do not
        allow them to use your data to advertise to you. AI-generated replies
        and corrections can be wrong.
      </p>

      <h2>6. Legal bases (EEA / UK)</h2>
      <ul>
        <li><strong>Performance of a contract:</strong> providing the Service you asked for;</li>
        <li><strong>Legitimate interests:</strong> security, fraud prevention, improving the Service and basic measurement;</li>
        <li><strong>Consent:</strong> the advertising identifier (App Tracking Transparency) and notifications. You can withdraw consent at any time in your device settings;</li>
        <li><strong>Legal obligation:</strong> where the law requires us to keep or disclose data.</li>
      </ul>

      <h2>7. Service providers we work with</h2>
      <p>
        We share data only with providers that help us run GlotMate, and only as
        far as they need it:
      </p>
      <ul>
        <li><strong>Supabase</strong>: database and sign-in;</li>
        <li><strong>OpenAI</strong>: tutor replies, feedback and speech recognition;</li>
        <li><strong>Google</strong> (Gemini, Cloud Translation), <strong>Microsoft Azure</strong>, <strong>ElevenLabs</strong> and <strong>Inworld</strong>: the tutor&apos;s voice and translations;</li>
        <li><strong>Apple</strong>: Sign in with Apple and App Store purchases;</li>
        <li><strong>RevenueCat</strong>: purchase status;</li>
        <li><strong>AppsFlyer</strong>: install attribution and marketing measurement;</li>
        <li><strong>Expo</strong>: app updates;</li>
        <li><strong>Cloudflare</strong> and our hosting providers: delivering and protecting the Service.</li>
      </ul>
      <p>
        We may also disclose data if the law requires it, or as part of a
        merger or acquisition, in which case this policy continues to apply.
      </p>

      <h2>8. Tracking, advertising identifiers and your choices</h2>
      <p>
        On iOS, GlotMate asks for your permission through Apple&apos;s App
        Tracking Transparency prompt before it accesses your device&apos;s
        advertising identifier. If you choose &quot;Ask App Not to Track&quot;,
        we do not access it, and the app works exactly the same. You can change
        your choice at any time in <em>Settings &rarr; Privacy &amp; Security
        &rarr; Tracking</em>. On Android you can reset or delete your
        advertising ID in your device settings.
      </p>

      <h2>9. How long we keep your data</h2>
      <p>
        We keep your data for as long as you use GlotMate. When you delete your
        account, your profile, conversations, progress, saved words and what the
        tutor remembers about you are deleted from our systems; backups are
        purged on a rolling cycle. Voice recordings are not kept after
        transcription. We may keep limited records where the law requires it.
      </p>

      <h2>10. Deleting your account</h2>
      <p>
        You can delete your account and data yourself in the app, under{" "}
        <em>Profile &rarr; Delete account</em>, or by following the steps on our{" "}
        <Link href="/delete-account">account deletion page</Link>.
      </p>

      <h2>11. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct,
        delete or export your personal data, to object to or restrict certain
        processing, and to withdraw consent. To use these rights, email {mail}.
        You also have the right to complain to your local data protection
        authority.
      </p>

      <h2>12. California residents</h2>
      <p>
        We do not sell personal information, and we do not share it for
        cross-context behavioral advertising without your permission. You have
        the right to know, delete and correct your personal information, and we
        will not discriminate against you for using these rights.
      </p>

      <h2>13. Children</h2>
      <p>
        GlotMate is not directed to children under 13, and we do not knowingly
        collect personal data from them. If you believe a child has given us
        personal data, contact us and we will delete it.
      </p>

      <h2>14. International transfers</h2>
      <p>
        Our providers may process data in countries other than your own,
        including the United States. Where required, we rely on appropriate
        safeguards such as standard contractual clauses.
      </p>

      <h2>15. Security</h2>
      <p>
        We protect your data with encryption in transit, access controls and
        authenticated APIs. No system is perfectly secure, but we work to
        protect your data and will notify you as required by law if something
        goes wrong.
      </p>

      <h2>16. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. If the changes are
        significant, we will let you know in the app or by email. The effective
        date at the top shows when it was last updated.
      </p>

      <h2>17. Contact</h2>
      <p>Questions about this policy or your data? Email {mail}.</p>
    </LegalPage>
  );
}
