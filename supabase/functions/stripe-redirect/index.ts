import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "unknown";
    const type = url.searchParams.get("type") || "subscription";

    console.log("stripe-redirect: Handling redirect", { status, type });

    // Create HTML page that auto-redirects to app using custom scheme
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Truxel - ${status === 'success' ? 'Payment Successful' : 'Payment Cancelled'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      max-width: 400px;
    }
    .icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 28px;
      margin: 0 0 16px 0;
    }
    p {
      font-size: 16px;
      opacity: 0.9;
      margin: 0 0 24px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 32px;
      background: white;
      color: #667eea;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .spinner {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 3px solid white;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    ${status === 'success' ? `
      <div class="icon">✅</div>
      <h1>Payment Successful!</h1>
      <p>Your ${type === 'subscription' ? 'subscription' : 'search pack'} is now active.</p>
      <div class="spinner"></div>
      <p style="font-size: 14px; margin-top: 20px;">Redirecting to app...</p>
    ` : `
      <div class="icon">❌</div>
      <h1>Payment Cancelled</h1>
      <p>No charges were made to your account.</p>
      <div class="spinner"></div>
      <p style="font-size: 14px; margin-top: 20px;">Redirecting to app...</p>
    `}
    <p style="font-size: 12px; opacity: 0.7; margin-top: 24px;">
      If you're not redirected automatically,
      <a href="truxel://${status === 'success' ? 'subscription-success' : 'subscription-cancelled'}" 
         style="color: white; text-decoration: underline;">
        click here
      </a>
    </p>
  </div>
  <script>
    // Try to open the app using custom scheme
    const customSchemeUrl = 'truxel://${status === 'success' ? 'subscription-success' : 'subscription-cancelled'}';
    
    // Attempt 1: Direct redirect
    setTimeout(() => {
      window.location.href = customSchemeUrl;
    }, 1000);

    // Attempt 2: Try again after 3 seconds in case first attempt failed
    setTimeout(() => {
      window.location.href = customSchemeUrl;
    }, 3000);

    // Attempt 3: If still on page after 5 seconds, show manual link
    setTimeout(() => {
      const container = document.querySelector('.container');
      if (container && document.visibilityState === 'visible') {
        container.innerHTML += '<p style="margin-top: 20px;"><a href="' + customSchemeUrl + '" class="button">Open Truxel App</a></p>';
      }
    }, 5000);
  </script>
</body>
</html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("stripe-redirect error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
