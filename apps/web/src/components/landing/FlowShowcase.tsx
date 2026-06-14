export default function FlowShowcase() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="flow-showcase">
        <div className="flow-heading">
          <div className="flow-heading-badge">
            <i className="ti ti-route" aria-hidden="true" />
            How It Works
          </div>
          <div className="flow-heading-title">
            EmailBot picks <em>what matters most</em>
          </div>
        </div>

        <div className="flow-main">
          <div className="flow-col flow-col-left">
            <div className="flow-label">
              <div className="flow-label-text">Incoming emails</div>
            </div>

            <div className="email-card" data-type="spam">
              <div className="email-card-icon" style={{ background: "#2a1520", color: "#f87171" }}>
                <i className="ti ti-alert-triangle" aria-hidden="true" />
              </div>
              <div className="email-card-text">
                <div className="email-card-label">Spam</div>
                <div className="email-card-sub">Auto-filtered out</div>
              </div>
            </div>

            <div className="email-card" data-type="promo">
              <div className="email-card-icon" style={{ background: "#2a2510", color: "#fbbf24" }}>
                <i className="ti ti-tag" aria-hidden="true" />
              </div>
              <div className="email-card-text">
                <div className="email-card-label">Promotions</div>
                <div className="email-card-sub">Sales & marketing</div>
              </div>
            </div>

            <div className="email-card" data-type="internship">
              <div className="email-card-icon" style={{ background: "#102a1a", color: "#4ade80" }}>
                <i className="ti ti-briefcase" aria-hidden="true" />
              </div>
              <div className="email-card-text">
                <div className="email-card-label">Internships</div>
                <div className="email-card-sub">Opportunities & jobs</div>
              </div>
            </div>

            <div className="email-card" data-type="other">
              <div className="email-card-icon" style={{ background: "#10192a", color: "#60a5fa" }}>
                <i className="ti ti-mail" aria-hidden="true" />
              </div>
              <div className="email-card-text">
                <div className="email-card-label">Other</div>
                <div className="email-card-sub">Updates & notices</div>
              </div>
            </div>
          </div>

          <svg className="flow-connections" viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
            <path className="conn-line" d="M 210 85 C 320 85, 350 195, 430 195" />
            <path className="conn-line" d="M 210 145 C 300 145, 350 195, 430 195" />
            <path className="conn-line" d="M 210 215 C 300 215, 350 200, 430 200" />
            <path className="conn-line" d="M 210 285 C 300 285, 360 205, 430 205" />
            <path className="conn-line-out" d="M 570 190 C 640 190, 680 90, 780 90" />
            <path className="conn-line-out" d="M 570 195 C 640 195, 680 195, 780 195" />
            <path className="conn-line-out" d="M 570 205 C 640 205, 680 300, 780 300" />
          </svg>

          <div className="flow-center">
            <div className="hub-node">
              <div className="hub-icon">
                <i className="ti ti-brain" aria-hidden="true" />
              </div>
              <div className="hub-label">EmailBot</div>
              <div className="hub-sublabel">AI Worker</div>
            </div>
            <div className="hub-desc">
              <div className="hub-desc-title">AI scores & ranks</div>
              <div className="hub-desc-sub">
                Reads, understands, and prioritizes<br />every email automatically
              </div>
            </div>
          </div>

          <div className="flow-col flow-col-right">
            <div className="flow-label">
              <div className="flow-label-text">WhatsApp alerts</div>
            </div>

            <div className="wa-card">
              <div className="wa-card-header">
                <div className="wa-card-icon" style={{ background: "#2a1520", color: "#f87171" }}>
                  <i className="ti ti-urgent" aria-hidden="true" />
                </div>
                <div className="wa-card-source">CEO Direct</div>
                <div className="wa-card-tag tag-urgent">Urgent · Score 9</div>
              </div>
              <div className="wa-card-body">Board review — numbers needed</div>
              <div className="wa-card-preview">&ldquo;Q4 board review — need numbers by 5pm&rdquo;</div>
            </div>

            <div className="wa-card">
              <div className="wa-card-header">
                <div className="wa-card-icon" style={{ background: "#102a1a", color: "#4ade80" }}>
                  <i className="ti ti-briefcase" aria-hidden="true" />
                </div>
                <div className="wa-card-source">Internship Alert</div>
                <div className="wa-card-tag tag-opportunity">Opportunity · Score 8</div>
              </div>
              <div className="wa-card-body">Google SWE Internship</div>
              <div className="wa-card-preview">&ldquo;Application deadline: June 15th...&rdquo;</div>
            </div>

            <div className="wa-card">
              <div className="wa-card-header">
                <div className="wa-card-icon" style={{ background: "#10192a", color: "#60a5fa" }}>
                  <i className="ti ti-mail-forward" aria-hidden="true" />
                </div>
                <div className="wa-card-source">Auto-Reply Sent</div>
                <div className="wa-card-tag tag-reply">Replied · AI</div>
              </div>
              <div className="wa-card-body">Invoice payment confirmation</div>
              <div className="wa-card-preview">&ldquo;Polished reply sent via Gmail ✓&rdquo;</div>
            </div>
          </div>
        </div>

        <div className="reply-flow">
          <div className="reply-flow-step">
            <div className="reply-flow-icon" style={{ background: "#0d2b10", color: "#25d366" }}>
              <i className="ti ti-brand-whatsapp" aria-hidden="true" />
            </div>
            <div className="reply-flow-label">Reply on WhatsApp</div>
          </div>
          <div className="reply-flow-arrow">→</div>
          <div className="reply-flow-step">
            <div className="reply-flow-icon" style={{ background: "#1a1a2e", color: "#a78bfa" }}>
              <i className="ti ti-brain" aria-hidden="true" />
            </div>
            <div className="reply-flow-label">AI refines reply</div>
          </div>
          <div className="reply-flow-arrow">→</div>
          <div className="reply-flow-step">
            <div className="reply-flow-icon" style={{ background: "#1a1520", color: "#f87171" }}>
              <i className="ti ti-mail-forward" aria-hidden="true" />
            </div>
            <div className="reply-flow-label">Sent via Email</div>
          </div>
        </div>
      </div>
    </section>
  );
}
