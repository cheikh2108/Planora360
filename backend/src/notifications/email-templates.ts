/**
 * Templates d'emails modernes et cohérents pour PLANORA 360
 * Design inspiré de Stripe, Linear, Notion
 */

export class EmailTemplates {
  private readonly frontendUrl: string;

  constructor(frontendUrl: string) {
    this.frontendUrl = frontendUrl;
  }

  /**
   * Template de base moderne avec header gradient
   */
  base(params: {
    title: string;
    preheader?: string;
    content: string;
    headerGradient?: string;
    showLogo?: boolean;
    footerNote?: string;
  }): string {
    const {
      title,
      preheader,
      content,
      headerGradient = 'linear-gradient(135deg, #0b1629 0%, #1e3a5f 100%)',
      showLogo = true,
      footerNote,
    } = params;

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <title>${title}</title>
  <!--[if mso]>
  <style>
    table { border-collapse: collapse; border-spacing: 0; }
    td { padding: 0; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">

  <!-- Preheader invisible -->
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${preheader || title}</div>

  <!-- Container principal -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f1f5f9;min-height:100vh">
    <tr>
      <td align="center" style="padding:40px 16px">

        <!-- Card email -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:white;border-radius:16px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);overflow:hidden">

          <!-- Header avec gradient -->
          <tr>
            <td style="background:${headerGradient};padding:${showLogo ? '48px 40px' : '40px'};text-align:center">
              ${
                showLogo
                  ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:20px">
                    <img src="https://f005.backblazeb2.com/file/ataaba-pilot/email-assets/logo-light.svg" alt="PLANORA 360" width="160" height="40" style="display:block;max-width:160px;height:auto;margin:0 auto" />
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
              <h1 style="margin:0;color:white;font-size:28px;font-weight:700;line-height:1.2;letter-spacing:-0.02em">${title}</h1>
            </td>
          </tr>

          <!-- Contenu -->
          <tr>
            <td style="padding:48px 40px">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:32px 40px;border-top:1px solid #e2e8f0">
              ${
                footerNote
                  ? `
              <div style="background:#eff6ff;border-left:3px solid #3b82f6;border-radius:8px;padding:16px;margin-bottom:24px">
                <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.6">${footerNote}</p>
              </div>
              `
                  : ''
              }
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom:12px">
                    <p style="margin:0;color:#64748b;font-size:14px;font-weight:600">PLANORA 360</p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-bottom:12px">
                    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5">Gestion de projets et pilotage stratégique</p>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <p style="margin:0;color:#cbd5e1;font-size:11px">© 2026 PLANORA 360 — Tous droits réservés</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
  }

  /**
   * Bouton d'action moderne
   */
  button(params: { text: string; url: string; color?: string }): string {
    const { text, url, color = '#2563eb' } = params;
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-radius:8px;background:${color}">
            <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:white;text-decoration:none;font-weight:600;font-size:15px;border-radius:8px;line-height:1.4">${text}</a>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Card d'informations
   */
  infoCard(params: { title?: string; rows: Array<{ label: string; value: string }> }): string {
    const { title, rows } = params;
    return `
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:24px 0">
        ${title ? `<h3 style="margin:0 0 16px;color:#0f172a;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">${title}</h3>` : ''}
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          ${rows
            .map(
              (row) => `
          <tr>
            <td style="padding:8px 0;color:#64748b;font-size:13px;font-weight:600;width:40%">${row.label}</td>
            <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600">${row.value}</td>
          </tr>
          `,
            )
            .join('')}
        </table>
      </div>
    `;
  }

  /**
   * Alerte / Callout
   */
  alert(params: { type: 'info' | 'warning' | 'success' | 'error'; message: string }): string {
    const { type, message } = params;

    const styles = {
      info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
      warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
      error: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    };

    const style = styles[type];

    return `
      <div style="background:${style.bg};border-left:4px solid ${style.border};border-radius:12px;padding:20px;margin:24px 0">
        <p style="margin:0;color:${style.text};font-size:14px;line-height:1.6;font-weight:500">
          ${message}
        </p>
      </div>
    `;
  }

  /**
   * Séparateur visuel
   */
  divider(): string {
    return `<div style="height:1px;background:linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);margin:32px 0"></div>`;
  }
}
