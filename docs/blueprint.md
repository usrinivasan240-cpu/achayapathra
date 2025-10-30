# **App Name**: SharePlate

## Core Features:

- User Authentication and Verification: Secure user registration/login with Firebase Auth, including email/password, Google, and phone authentication. Requires identity verification via ID and selfie upload, ensuring each user has only one verified account.
- Food Donation Module: Donors can upload food details (name, type, time, quantity, description, location, image). The system calls an AI API to verify food safety before allowing the donation to be listed. In addition, donors will upload food expiration dates.
- AI-Powered Food Safety Verification: Utilize an AI tool to automatically check uploaded food images for safety and quality, ensuring that only safe food donations are listed, based on the food data. The AI model analyzes food state based on provided information such as image, ingredients and estimated conservation time and flags food for further revision by a moderator if necessary.
- Nearby Matching: Enable receivers/NGOs and volunteers to discover nearby donation opportunities.
- Reward Points System: Implement a point-based reward system to encourage more donations. Reward donors and volunteers based on feedback (ratings), and allow Cloud Functions to update points automatically.
- Leaderboard: Display top donors and volunteers to further incentivize donations and volunteer work. Run a daily Cloud Function to aggregate and update the leaderboard.
- Admin Panel: Provide an admin interface to approve identities, manage reports, edit site statistics, and monitor for abuse.

## Style Guidelines:

- Primary color: Earthy Green (#8FBC8F) to reflect nature and food.
- Background color: Light beige (#F5F5DC), a desaturated hue of the primary, for a clean, soft backdrop.
- Accent color: Warm Orange (#E9967A) for calls to action and highlights.
- Headline font: 'Playfair', serif, elegant and fashionable feel. Body font: 'PT Sans', sans-serif, a modern look and feel.
- Use simple, intuitive icons to represent food types, donation status, and user actions.
- Clean and organized layout to highlight donations and calls to action.
- Subtle animations for loading and transitioning between different states.