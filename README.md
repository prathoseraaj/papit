# Vind

[![Next.js](https://img.shields.io/badge/next.js-15.0.0-black)](https://nextjs.org/)

Vind is a web-based file editor application for content writters and content creators featuring file management and a commit history panel. The project is **still under development**.

## Features

- **File Management**:  
  - Create, select, and delete text files.
  - Edit file contents in an intuitive editor panel.
[![Next.js](https://img.shields.io/badge/next.js-15.0.0-black)](https://nextjs.org/)
- **Git-like Commit System**:  
  - Commit your changes with custom messages.
  - View commit history for the current file.
  - Restore content from previous commits.

- **Chatbot Integration**:  
  - AI-powered assistant to help with code and workflow questions.

**Note:**  
Vind does **not** use Node.js, Express, or Python for the backend. All deployment and server requirements are managed via Next.js, making it simple and efficient to deploy.


## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React-based, using App Router and Server Components).
- **No Backend/Server**:  
  - No Node.js, Express, or Python backend required.
  - All logic runs client-side or using Next.js API routes (if needed).
- **Easy Deployment**:  
  - Leverages Next.js's inbuilt server and deployment tools.
  - Can be deployed on Vercel or any platform supporting Next.js out of the box.

## Getting Started

> **Note:** This project is under active development and may not be fully stable yet.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prathoseraaj/vind.git
   cd vind
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Roadmap

- File creation, deletion, and selection
- Simple editor for file content
- Commit panel to manage file history
- AI Chatbot integration (Coming soon)
- Enhanced file types and syntax highlighting
- Export/import project files

