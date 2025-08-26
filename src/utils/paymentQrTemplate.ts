/**
 * Utility function to generate HTML content for payment QR code display
 */

interface PaymentQrTemplateData {
  scheduleId: string;
  amount: string;
  orderInfo: string;
  qrCodeDataUrl: string;
}

export const generatePaymentQrHtml = (data: PaymentQrTemplateData): string => {
  const template = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bank Transfer Payment - Schedule ${data.scheduleId}</title>
  <style>
    :root {
      --radius: 0.625rem;
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.145 0 0);
      --primary: #24AE7C;
      --primary-foreground: oklch(0.985 0 0);
      --secondary: oklch(0.97 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --border: oklch(0.922 0 0);
      --destructive: oklch(0.577 0.245 27.325);
    }

    .dark {
      --background: oklch(0.145 0 0);
      --foreground: oklch(0.985 0 0);
      --card: oklch(0.205 0 0);
      --card-foreground: oklch(0.985 0 0);
      --secondary: oklch(0.269 0 0);
      --muted-foreground: oklch(0.708 0 0);
      --border: oklch(1 0 0 / 10%);
      --destructive: oklch(0.704 0.191 22.216);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 1rem;
      background-color: var(--background);
      color: var(--foreground);
      transition: background-color 0.2s, color 0.2s;
    }

    .container {
      background-color: var(--card);
      color: var(--card-foreground);
      padding: 2rem;
      border-radius: var(--radius);
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
      text-align: center;
      max-width: 420px;
      width: 100%;
      border: 1px solid var(--border);
    }

    .header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .header p {
      color: var(--muted-foreground);
      margin: 0 0 1.5rem 0;
    }

    .qr-code {
      margin: 1.5rem 0;
      padding: 1rem;
      background-color: #ffffff;
      border-radius: var(--radius);
      display: inline-block;
    }

    .qr-code img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    .payment-info {
      margin: 1.5rem 0;
      padding: 1rem;
      background-color: var(--secondary);
      border-radius: var(--radius);
      border-left: 4px solid var(--primary);
      text-align: left;
    }

    .payment-info .amount {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
      margin: 0.5rem 0;
    }

    .payment-info .schedule-id {
      font-family: monospace, sans-serif;
      background-color: var(--border);
      padding: 0.25rem 0.5rem;
      border-radius: calc(var(--radius) - 4px);
      font-size: 0.875rem;
    }

    .instructions {
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: var(--muted-foreground);
      line-height: 1.5;
      text-align: left;
    }

    .instructions strong {
        color: var(--foreground);
    }

    .close-btn {
      margin-top: 2rem;
      padding: 0.75rem 1.5rem;
      background-color: var(--destructive);
      color: var(--primary-foreground);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
      transition: opacity 0.2s;
    }

    .close-btn:hover {
      opacity: 0.85;
    }

    @media (prefers-color-scheme: dark) {
      html {
        color-scheme: dark;
      }
      body {
        --background: oklch(0.145 0 0);
        --foreground: oklch(0.985 0 0);
        --card: oklch(0.205 0 0);
        --card-foreground: oklch(0.985 0 0);
        --secondary: oklch(0.269 0 0);
        --muted-foreground: oklch(0.708 0 0);
        --border: oklch(1 0 0 / 10%);
        --destructive: oklch(0.704 0.191 22.216);
      }
    }

  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Bank Transfer Payment</h2>
      <p>Scan the QR code to complete your payment</p>
    </div>

    <div class="payment-info">
      <div>Schedule ID: <span class="schedule-id">${data.scheduleId}</span></div>
      <div class="amount">${data.amount}</div>
      <div style="font-size: 0.875rem; color: var(--muted-foreground);">
        ${data.orderInfo}
      </div>
    </div>

    <div class="qr-code">
      <img src="${data.qrCodeDataUrl}" alt="Payment QR Code" />
    </div>

    <div class="instructions">
      <strong>Instructions:</strong><br>
      1. Scan this QR code with your phone's camera or a QR scanner app.<br>
      2. You will be redirected to the payment website.<br>
      3. Complete the payment on the website.<br>
      4. Keep the transaction receipt for your records.
    </div>

    <button class="close-btn" onclick="window.close()">Close Window</button>
  </div>
</body>
</html>
`;

  return template;
};
