import Link from "next/link";

export default function TermsPage() {
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <Link href="/landing" style={backLinkStyle}>← Back to Home</Link>
          <h1 style={titleStyle}>Terms of Service</h1>
          <p style={subtitleStyle}>Last updated: June 15, 2026</p>
        </div>

        <div style={contentStyle}>
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>1. Terms Acceptance</h2>
            <p style={paragraphStyle}>
              By using the <strong>Halo</strong> application (the "App"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, do not download, install, or use the App.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>2. License to Use</h2>
            <p style={paragraphStyle}>
              We grant you a personal, worldwide, non-assignable, and non-exclusive license to use the App for your personal, non-commercial productivity and task management needs.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>3. Local Data Storage & Responsibility</h2>
            <p style={paragraphStyle}>
              Halo is an offline-first app. Your tasks, lists, streaks, and settings are stored locally on your device:
            </p>
            <ul style={listStyle}>
              <li>We do not sync your data to our servers or run any cloud storage.</li>
              <li>You are solely responsible for managing your data. Clearing your browser cache, clearing app storage, resetting your device, or uninstalling the App will result in permanent loss of your data.</li>
              <li>We recommend using the "Export backup" feature in Settings regularly to secure your data.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>4. Disclaimer of Warranties</h2>
            <p style={paragraphStyle}>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
              WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>5. Limitation of Liability</h2>
            <p style={paragraphStyle}>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE CREATORS OF HALO BE LIABLE FOR ANY DIRECT, 
              INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE APP, 
              INCLUDING LOSS OF DATA, DEVICE MALFUNCTIONS, OR WORK DISRUPTIONS.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>6. Contact Information</h2>
            <p style={paragraphStyle}>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              <a href="mailto:amf369786@gmail.com" style={linkStyle}>amf369786@gmail.com</a>
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
