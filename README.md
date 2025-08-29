# Meet.AI 🤖

A full-stack SaaS platform that brings intelligent, custom AI agents into your real-time video calls. Built with Next.js 15, React 19, and a modern, type-safe technology stack.

**[Live Application URL](https://meetai-gules.vercel.app/)** | **[GitHub Repository](https://github.com/jashPandyaa/meetai)**

[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Stack](https://img.shields.io/badge/Stack-Next.js_Full_Stack-blue?style=for-the-badge)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) 

---

## About The Project

Meet.AI is not just another video calling app. It's an intelligent meeting platform designed to enhance productivity by integrating custom AI agents directly into live conversations. As a full-stack application built on a **Next.js and PostgreSQL** foundation, it covers everything from real-time communication to subscription management.

After each call, the platform provides a complete post-meeting experience with automated summaries, full transcripts, video playback, and a contextual AI chat to ask questions about the meeting content.



---

## Key Features

-   **🤖 Real-Time AI Agent (Gemini API):** Engage with a custom AI agent that can answer questions and provide information *during* the live video call.
-   **📝 Post-Call AI Analysis (OpenAI API):** Automatically generate concise summaries and full, accurate transcripts after each meeting concludes.
-   **📞 Real-Time Video & Chat:** High-quality video and chat powered by the **Stream Video & Chat SDK**.
-   **📂 Complete Meeting Lifecycle:** Track meetings through various states: Upcoming, Active, Processing, and Completed.
-   **📺 Meeting Playback & History:** Access a full history of your past meetings, including video recordings and transcripts.
-   **🔍 Transcript Search:** Quickly find key moments by searching through the meeting transcript.
-   **💬 Contextual AI Q&A:** Chat with an AI that has the full context of a completed meeting to ask specific questions about the discussion.
-   **🔐 Secure Authentication:** Robust and simple user login provided by **Better Auth**, including social providers like Google and GitHub.
-   **💳 Subscription Management:** Seamlessly handle payments and premium features using the **Polar SDK**.
-   **📱 Fully Mobile Responsive:** A clean and accessible user experience on both desktop and mobile devices.

---

### ⚠️ Important Note on Mobile Functionality

Please be aware that the **real-time AI agent, powered by the Gemini API, is currently functional only on desktop browsers.**

This is due to inherent restrictions and configurations within the Gemini API's web integration for mobile devices. The rest of the application, including initiating video calls, using the chat, and accessing your post-meeting dashboard, is fully functional and responsive on mobile.

---

## Tech Stack

This project uses a modern, robust, and type-safe tech stack.

-   **Core Framework:** Next.js 15 (with App Router) & React 19
-   **Styling:** Tailwind CSS v4 & Shadcn/UI
-   **Backend & API Layer:** tRPC for end-to-end typesafe APIs & Tanstack Query for data fetching
-   **Database:** Neon (Serverless PostgreSQL)
-   **ORM:** Drizzle ORM
-   **Authentication:** Better Auth
-   **Payments:** Polar
-   **Real-Time Services:**
    -   Stream Video SDK
    -   Stream Chat SDK
-   **AI & Background Jobs:**
    -   **Gemini API** (for the real-time in-meeting agent)
    -   **OpenAI API** (for post-meeting summaries, transcripts, and Q&A)
    -   Inngest (for reliable background job processing)
-   **Deployment:** Vercel

---
## Project Workflow Summary

The development of this project followed a structured, chapter-by-chapter process:

1.  **Foundation:** Initial Next.js setup, GitHub repository, and configuration of the Neon database with Drizzle ORM.
2.  **Authentication:** Integrated Better Auth for user registration, login, and social providers, along with creating the necessary UI and protected routes.
3.  **Core UI & tRPC:** Built the main dashboard layout (sidebar, navbar) and set up tRPC for typesafe client-server communication.
4.  **Feature Modules (Agents & Meetings):** Developed the core SaaS features, allowing users to create and manage custom AI Agents and schedule Meetings. This included forms, data tables with filters, and individual resource pages.
5.  **Real-Time Integration:** Integrated the Stream SDK to power the live video call experience and connected the real-time Gemini agent via webhooks.
6.  **Post-Call Experience:** Set up Inngest to handle background jobs for processing recordings, generating summaries/transcripts with OpenAI, and enabling the post-call AI chat.
7.  **Monetization:** Added the Polar SDK and Better Auth adapter to manage user subscriptions and protect premium features.

## Code Standards

TypeScript for type safety
ESLint for code quality
Prettier for formatting
Mobile-first responsive design
Accessibility considerations


## 🐛 Known Issues & Limitations

Mobile AI Voice: Gemini API restrictions prevent voice responses on mobile devices
Speech Recognition: May have varying accuracy across different browsers/devices
Network Dependencies: Requires stable internet for real-time features


## 📞 Support & Issues

Issues: GitHub Issues
Discussions: GitHub Discussions


## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Stream - Video and chat infrastructure
OpenAI - AI summaries and transcript processing
Google Gemini - Real-time AI responses
Vercel - Deployment platform
Neon - PostgreSQL hosting
Polar - Payment processing


## 📊 Project Stats

Framework: Next.js 15 with App Router
Language: TypeScript
Database: PostgreSQL with Drizzle ORM
Real-time: Stream SDK for video/chat
AI: OpenAI + Gemini API integration
Auth: Better Auth with social providers
Payments: Polar subscription management


# Built with ❤️ by jashPandyaa
