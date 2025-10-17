Scholarship Finder & Manager WebApp 🎓💡

Project Name: Scholarship Finder & Manager
Author: Preetam Dutta
Status: MVP (Minimum Viable Product)
Live Demo: Scholarship Finder & Manager WebApp

Table of Contents

Overview

Features

Technology Stack

Installation

Usage

AI-Based Scholarship Suggestion

Student Verification & Security

Screenshots

Future Enhancements

License

Overview

The Scholarship Finder & Manager WebApp is a platform designed to simplify the process of discovering and applying for scholarships. It ensures students find scholarships matching their eligibility automatically and allows seamless one-click applications without repeatedly uploading documents.

The platform prioritizes security, accessibility, and automation, making it ideal for students from various backgrounds, especially those needing financial support.

Check the live demo here
.

Features

Automated Scholarship Suggestions: AI-powered recommendation system matching students with scholarships based on their eligibility.

One-Click Scholarship Registration: Apply for scholarships without repeatedly uploading the same documents.

Student Verification:

Captures student photograph for identification.

Supports Indian students with optional Aadhaar, ABC ID, and income certificate verification.

Document Management: Keeps track of uploaded documents and application status.

PDF Download: Generates PDF summary of each scholarship applied with status.

Secure System:

Device fingerprinting ensures application authenticity.

Prevents proxy applications using unique device identifiers.

Responsive Design: Works on desktop, tablet, and mobile devices.

Technology Stack

Frontend:

React.js

TypeScript

TailwindCSS / Vanilla CSS

Backend:

Node.js

Express.js

Supabase / PostgreSQL for database and authentication

AI Recommendation:

OpenAI API or custom logic for eligibility matching

Other Tools:

Vite for project bundling

GitHub for version control

Vercel for deployment

Installation

Clone the repository

git clone https://github.com/yourusername/scholarship-app.git
cd scholarship-app


Install dependencies

npm install


Setup Environment Variables
Create a .env.local file and add:

VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
DATABASE_URL=your-database-connection-string
OPENAI_API_KEY=your-openai-api-key


Run the development server

npm run dev


Access the app
Open http://localhost:8080
 in your browser.

Usage

Student Registration:

Enter personal details.

Upload photograph.

Optional: Provide Aadhaar, ABC ID, and income certificate (for Indian students).

Scholarship Search & Suggestions:

AI automatically matches scholarships based on student details.

View suggested scholarships and apply with one click.

Download Application Summary:

After applying, download a PDF with all scholarship details and status.

Admin Dashboard (if implemented):

Monitor student registrations, applications, and document verification.

AI-Based Scholarship Suggestion

The app uses an AI-powered recommendation engine to match students with relevant scholarships:

Analyzes student eligibility criteria (age, income, academic record, location).

Suggests scholarships the student is most likely to qualify for.

Reduces manual search effort, making the application process faster and more efficient.

Student Verification & Security

Captures photograph of the student during registration for identity verification.

Supports Indian student verification with Aadhaar, ABC ID, and income certificate (optional).

Device fingerprinting ensures application authenticity.

Prevents proxy applications by tying submissions to unique device IDs.

Screenshots

(Include screenshots of the app here if possible)

Future Enhancements

Add multi-language support for regional students.

Enable admin-controlled scholarship verification.

Improve AI suggestion algorithm with more criteria and historical data.

Add notification system for application deadlines and status updates.

License

This project is licensed under the MIT License.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS



Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
