import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <Link href="/landing" style={backLinkStyle}>← Back to Home</Link>
          <h1 style={titleStyle}>Privacy Policy</h1>
          <p style={subtitleStyle}>Last updated: June 15, 2026</p>
        </div>

        <div style={contentStyle}>
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>1. Introduction</h2>
            <p style={paragraphStyle}>
              Welcome to <strong>Halo</strong> ("we," "our," or "us"). Halo is a design-led, offline-first task manager. 
              We respect your privacy and are committed to protecting any information related to your use of our app.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>2. Zero Personal Data Collection</h2>
            <p style={paragraphStyle}>
              Halo is designed to run entirely locally on your device:
            </p>
            <ul style={listStyle}>
              <li>No user account, login, or registration is required to use the app.</li>
              <li>All tasks, subtasks, lists, streaks, and preferences are stored strictly on your local device (using web storage or native app preferences).</li>
              <li>We do not operate any database servers to collect or host your tasks. We have zero access to your data.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>3. Google AdMob (Advertising)</h2>
            <p style={paragraphStyle}>
              Halo displays advertisements served by Google AdMob to keep the app free. 
              To serve ads, the Google Mobile Ads SDK may collect certain device-specific information, including:
            </p>
            <ul style={listStyle}>
              <li>Device identifiers (such as the Android Advertising ID).</li>
              <li>IP addresses (used for general geolocation and ad delivery).</li>
              <li>Ad interaction events and crash reporting metrics.</li>
            </ul>
            <p style={paragraphStyle}>
              Google uses this data in accordance with their privacy practices. You can review Google's policies and learn how to manage your ad preferences by visiting:
              <br />
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>
                Google Partner Privacy Policy & Terms
              </a>
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>4. Local Backups</h2>
            <p style={paragraphStyle}>
              Halo offers an optional manual export feature that lets you download your data as a JSON file. 
              This file is saved locally to your device storage. We do not store, upload, or transmit your backup files.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>5. Children's Privacy</h2>
            <p style={paragraphStyle}>
              Since we do not collect any personal data, we do not knowingly collect or store any information from children of any age.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>6. Changes to this Policy</h2>
            <p style={paragraphStyle}>
              We may update this Privacy Policy from time to time. Any changes will be posted directly on this page and the updated date will be noted at the top.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>7. Contact Us</h2>
            <p style={paragraphStyle}>
              If you have any questions or concerns about your privacy while using Halo, please contact us at:
              <br />
              <a href="mailto:amf369785@gmail.com" style={linkStyle}>amf369785@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  background: "#09090F",
  color: "#E5E7EB",
  minHeight: "100vh",
  padding: "40px 20px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};

const cardStyle: React.CSSProperties = {
  background: "#12121E",
  maxWidth: "760px",
  width: "100%",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
  border: "1px solid #1F1F35",
};

const headerStyle: React.CSSProperties = {
  borderBottom: "1px solid #1F1F35",
  paddingBottom: "20px",
  marginBottom: "30px",
};

const backLinkStyle: React.CSSProperties = {
  color: "#7C5CFC",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
  display: "inline-block",
  marginBottom: "16px",
};

const titleStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: "800",
  color: "#FFFFFF",
  margin: "0 0 8px 0",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#9CA3AF",
  margin: 0,
};

const contentStyle: React.CSSProperties = {
  lineHeight: "1.6",
};

const sectionStyle: React.CSSProperties = {
  marginBottom: "28px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#FFFFFF",
  marginBottom: "12px",
};

const paragraphStyle: React.CSSProperties = {
  color: "#D1D5DB",
  fontSize: "15px",
  margin: "0 0 12px 0",
};

const listStyle: React.CSSProperties = {
  color: "#D1D5DB",
  fontSize: "15px",
  paddingLeft: "20px",
  margin: "0 0 16px 0",
};

const linkStyle: React.CSSProperties = {
  color: "#7C5CFC",
  textDecoration: "none",
  fontWeight: "600",
};
