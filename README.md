# TechBridge

A multilingual, multi-domain career guidance platform connecting learners, experienced advisers and organizations.

## MVP included
- Learner and adviser registration UI.
- Interface language options: English, Telugu, Hindi and Malayalam.
- Career categories across technology, healthcare, business, finance, design, education, engineering, hospitality, skilled trades, public service and environment.
- Supabase Auth + Postgres schema.
- Adviser applications default to pending.
- Owner email notification with signed, 48-hour approve/reject review links using Resend.

## Setup
1. Use Node.js 20+.
2. Copy .env.example to .env.local and fill in the values.
3. Create a Supabase project and run supabase/schema.sql in its SQL Editor.
4. Configure Supabase Auth email confirmation and your site's redirect URL.
5. Verify a sender domain in Resend and set EMAIL_FROM.
6. Run npm install and npm run dev.

## Environment
See .env.example. Never expose SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, or ADVISER_REVIEW_SECRET to browser code or commit real secrets.

## Adviser approval
Adviser registration creates a pending application. The server emails OWNER_EMAIL two signed review links. Links expire after 48 hours and require a confirmation POST. Only approved advisers should ever appear in a public directory.

This is an MVP foundation, not a production-ready recruitment or counselling system. Before launch, add rate limiting/CAPTCHA, a protected owner dashboard, privacy policy, terms, consent and retention controls, credential verification, reviewed translations and tests.
