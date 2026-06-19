import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name}.`,
};

const sections = [
  {
    title: "Introduction",
    icon: "👋",
    paragraphs: [
      `This Privacy Policy explains how ${siteConfig.name} ("we," "us," or "our") collects, uses, stores, and protects information when you use the ${siteConfig.name} application and related services (collectively, the "App").`,
      "By using the App, you agree to the collection and use of information in accordance with this Privacy Policy.",
      `This policy applies to ${siteConfig.name} and is reviewed periodically to keep it current and accurate.`,
    ],
  },
  {
    title: "Information We Collect",
    icon: "📋",
    paragraphs: [
      "Depending on how you use the App, we may collect the following types of information:",
    ],
    list: [
      "Account Information: such as your name, email address, username, and login credentials if you create an account.",
      "User Content: such as playlists, favorites, song preferences, uploaded audio files, and other content you choose to save or submit through the App.",
      "Usage Information: such as songs played, search history, features used, session duration, and interaction with the App.",
      "Device Information: such as device model, operating system, app version, device identifiers, IP address, and crash logs.",
      "Payment Information: if you offer subscriptions or purchases, payment processing may be handled by third-party providers. We do not store full payment card details unless explicitly stated.",
      "Support Information: information you provide when contacting us for help, feedback, or support.",
    ],
  },
  {
    title: "How We Collect Information",
    icon: "🔍",
    list: [
      "Directly from you when you register, contact us, create playlists, favorite songs, upload content, or use the App.",
      "Automatically through analytics tools, cookies, SDKs, server logs, and device permissions.",
      "From third-party providers such as authentication, hosting, payment, analytics, or cloud storage services.",
    ],
  },
  {
    title: "How We Use Your Information",
    icon: "⚙️",
    paragraphs: ["We may use your information to:"],
    list: [
      "Provide, operate, and maintain the App.",
      "Create and manage your account.",
      "Save your playlists, favorites, listening history, and preferences.",
      "Upload, store, stream, or manage songs and related content.",
      "Improve user experience, app functionality, and performance.",
      "Send updates, service notices, security alerts, and support responses.",
      "Monitor usage trends, troubleshoot issues, and prevent abuse or fraud.",
      "Comply with legal obligations and enforce our terms.",
    ],
  },
  {
    title: "Legal Basis for Processing (If Applicable)",
    icon: "⚖️",
    paragraphs: [
      "If you are located in a region that requires a legal basis for processing personal information, we process your information based on one or more of the following:",
    ],
    list: [
      "Your consent.",
      "The performance of a contract with you.",
      "Compliance with legal obligations.",
      "Our legitimate interests, such as improving and securing the App.",
    ],
  },
  {
    title: "Analytics, Cookies, and Similar Technologies",
    icon: "📊",
    paragraphs: [
      "We may use analytics providers and similar technologies to understand how users interact with the App, improve functionality, and monitor performance.",
      "Examples may include Google Analytics, Firebase Analytics, or equivalent telemetry tools.",
      "These tools may collect information such as device type, operating system, feature usage, session duration, crash reports, and approximate location derived from IP address.",
    ],
  },
  {
    title: "Permissions",
    icon: "🔐",
    paragraphs: ["The App may request access to certain device features, such as:"],
    list: [
      "Storage or Files: to upload, save, or access songs and audio content.",
      "Microphone: if recording or voice-based features are offered.",
      "Notifications: to send updates, reminders, or alerts.",
      "Internet Access: to stream songs, sync content, and support online features.",
    ],
    footer:
      "You can control many permissions through your device settings. Disabling certain permissions may limit app functionality.",
  },
  {
    title: "Sharing of Information",
    icon: "🤝",
    paragraphs: [
      "We do not sell your personal information. We may share information in the following circumstances:",
    ],
    list: [
      "Service Providers: with trusted vendors who help us host, operate, analyze, support, or secure the App.",
      "Legal Compliance: when required by law, regulation, legal process, or governmental request.",
      "Business Transfers: in connection with a merger, acquisition, financing, or sale of assets.",
      "Protection of Rights: to protect our rights, users, systems, or property.",
    ],
  },
  {
    title: "Data Retention",
    icon: "🗂️",
    paragraphs: [
      "We retain personal information only for as long as necessary to provide the App, fulfill the purposes described in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements.",
      "If you request deletion of your account, we will delete or anonymize your information within a reasonable time, unless we are required to retain certain data for legal, security, or operational reasons.",
    ],
  },
  {
    title: "Data Security",
    icon: "🛡️",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational measures to protect your information against unauthorized access, loss, misuse, alteration, or disclosure. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "International Data Transfers",
    icon: "🌐",
    paragraphs: [
      "Your information may be processed and stored in countries other than your own. By using the App, you understand that your information may be transferred to servers and service providers located in different jurisdictions.",
    ],
  },
  {
    title: "Your Privacy Rights",
    icon: "✅",
    paragraphs: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, or object to the processing of your personal information, withdraw consent where applicable, or request a copy of your data.",
      `To exercise any of these rights, contact us at ${siteConfig.author.email}.`,
    ],
  },
  {
    title: "Children's Privacy",
    icon: "👶",
    paragraphs: [
      "The App is not directed to children under the age of 13, or the minimum age required by applicable law in your jurisdiction, unless specifically stated otherwise. We do not knowingly collect personal information from children without appropriate consent. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.",
    ],
  },
  {
    title: "Third-Party Services and Links",
    icon: "🔗",
    paragraphs: [
      "The App may contain links to third-party websites, services, music platforms, storage providers, or content sources. We are not responsible for the privacy practices, policies, or content of third parties. We encourage you to review their privacy policies separately.",
    ],
  },
  {
    title: "User-Uploaded Content and Rights",
    icon: "🎵",
    paragraphs: [
      "If the App allows you to upload songs, audio files, lyrics, playlists, or other content, you are responsible for ensuring that you have the necessary rights, permissions, or licenses to upload and use that content. We may remove content that violates intellectual property rights, applicable law, or our terms.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    icon: "📝",
    paragraphs: [
      'We may update this Privacy Policy from time to time. If we make material changes, we will update the "Last Updated" date above and may provide additional notice through the App or other appropriate means.',
    ],
  },
  {
    title: "Contact Us",
    icon: "📬",
    paragraphs: [
      "If you have any questions, requests, or concerns about this Privacy Policy, you can contact us at:",
    ],
    contact: {
      name: siteConfig.name,
      email: siteConfig.author.email,
      location: "Hyderabad, Telangana, India",
    },
  },
];

export default function PrivacyPage() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">

        {/* ── Header ── */}
        <header className="mb-10 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                🔒
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/60">
                  Legal Document
                </p>
                <h1 className="font-heading text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
                  Privacy Policy
                </h1>
                <p className="text-sm text-muted-foreground">{siteConfig.name}</p>
              </div>
            </div>

            {/* Meta info pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Effective: April 15, 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Last updated: April 15, 2026
              </span>
            </div>
          </div>
        </header>

        {/* ── Table of Contents ── */}
        <nav className="mb-8 overflow-hidden rounded-2xl border border-border/50 bg-card/50 px-6 py-5 sm:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/60">
            Contents
          </p>
          <ol className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.title}>
                <a
                  href={`#section-${index}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:text-sm"
                >
                  <span className="w-4 shrink-0 text-center text-[10px] font-bold text-primary/40">
                    {index + 1}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Sections ── */}
        <div className="space-y-4">
          {sections.map((section, index) => (
            <section
              key={section.title}
              id={`section-${index}`}
              className="scroll-mt-6 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm"
            >
              {/* Section header */}
              <div className="flex items-center gap-3 border-b border-border/40 px-6 py-4 sm:px-8">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base">
                  {section.icon}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-primary/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-heading text-sm font-bold leading-snug sm:text-base">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Section body */}
              <div className="space-y-3 px-6 py-5 sm:px-8 sm:py-6">
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem] sm:leading-[1.7]"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item) => (
                      <li
                        key={item.slice(0, 48)}
                        className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.footer && (
                  <p className="rounded-lg border border-border/50 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground italic">
                    {section.footer}
                  </p>
                )}

                {/* Contact card */}
                {"contact" in section && section.contact && (
                  <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      {section.contact.name}
                    </p>
                    <div className="mt-2 space-y-1">
                      <a
                        href={`mailto:${section.contact.email}`}
                        className="flex items-center gap-2 text-sm text-primary transition-colors hover:underline"
                      >
                        <span>✉</span>
                        {section.contact.email}
                      </a>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>📍</span>
                        {section.contact.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* ── Footer note ── */}
        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} {siteConfig.name} · All rights reserved
        </p>
      </div>
    </div>
  );
}
