# HARVVEST Stock Market Institution

Four-page English website: Home, Programs, About, Contact. Original navy/gold design and an educational SVG chart. No external image/font dependency. Book a Session opens a native accessible dialog; WhatsApp uses the number from the original project (+91 99982 88268).

## Local preview / Google AI Studio
Use Node.js 22 or newer. Run `npm install`, then `npm run dev`. Open http://localhost:3000. AI Studio can run the same dev command. HTML files also open directly for design inspection; API submissions need a running server.

## Vercel
Import this folder into the existing GitHub repository. Use Framework Preset Other, Build Command `npm run build`, and Output Directory `.`. Vercel serves the HTML/CSS/JS and the `api/enquiry.js` function. The clean routes /programs, /about and /contact also resolve. Do not deploy to GitHub Pages: the enquiry API requires a server. The obsolete Netlify forms configuration and GitHub Pages workflow were removed.

## Google Sheet setup (required for enquiries)
1. Create a private Google Sheet called HARVVEST Enquiries. Do not publish the sheet or make customer details publicly accessible.
2. In that sheet choose Extensions > Apps Script. Paste the contents of `setup/google-apps-script.gs`.
3. In Apps Script Project Settings > Script properties, set `SHEET_ID` to the ID between /d/ and /edit in the spreadsheet URL. Set `ENQUIRY_DISPATCH_TOKEN` to a long random secret (for example generate locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Keep the secret private.
4. Deploy > New deployment > Web app. Execute as yourself. Choose Anyone for access, authorize your own script, and copy the deployed URL ending in /exec. Some managed Google accounts restrict public web apps; use an account where this deployment is permitted.
5. Set `ENQUIRY_DISPATCH_WEBHOOK_URL` to that /exec URL and `ENQUIRY_DISPATCH_TOKEN` to the same secret in Vercel environment variables (and the AI Studio server environment for preview). Redeploy after changing the environment. For local use create .env from .env.example. Never put these values into HTML or browser JavaScript.
6. Submit a test enquiry. Check a new row appears in the Enquiries tab. The script creates column headers on an empty tab; it includes a seventh Request ID column for deduplicating retries.

The backend only returns success after the webhook confirms `stored:true`. There is no fake success, memory fallback, public enquiries.json, or logging of customer data. Without the URL and token, forms show a retry/WhatsApp message and preserve the inputs. A timeout may happen after a row is saved; retry uses the same ID to avoid duplicates. Google authorization, the real Sheet write, and production delivery must be tested in your account after configuration. For larger public campaigns add persistent server-side rate limiting/CAPTCHA; the private token authenticates backend-to-Sheet requests, not website visitors.

## Content and scope
The 3-month HARVVEST Trading Program and 6-month Advanced Mastery Program retain Lifetime Program Access. Offers use First 3 Classes Are Free and Free Career Counselling. No fees, fake metrics, invented testimonials, Sunday sessions or guaranteed profits. Original contact/address are preserved. Mentor profiles and real classroom photos await supplied material. No live market data is claimed by the chart.
