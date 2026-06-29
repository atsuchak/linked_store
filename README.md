# Linked Store

A user-friendly web and mobile application designed to help you quickly save and manage your important links. Ever scrolled past an interesting post on Facebook or an article on Twitter, only to forget it later? Linked Store is here to solve that by providing a seamless, fast way to store your URLs so you can revisit them whenever you need.

## Why Linked Store? 💡
The internet is fast-paced, and it's easy to lose track of valuable content. **Linked Store prioritizes a smooth and effortless user experience**, allowing you to save links on the go, organize them efficiently, and access them across devices without missing a beat.

## Tech Stack 🛠️

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) for smooth animations
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database:** MongoDB with [Mongoose](https://mongoosejs.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Mobile Support:** [Capacitor](https://capacitorjs.com/) (Android APK generation)

## Features ✨
- 📌 Quick & easy link saving for social media posts, articles, and videos
- 🤝 Highly user-friendly and intuitive interface
- 🌓 Beautiful Dark / Light mode support
- 📱 Fully responsive & Mobile-ready (Android build available)
- 🚀 Fast performance with Next.js 16
- 🔒 Secure authentication and data privacy

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- npm, yarn, or pnpm
- MongoDB URI (for database connection)

### Cloning Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/atsuchak/linked_store.git
   ```
2. Navigate to the project directory:
   ```bash
   cd linked_store
   ```

### Installation & Setup

1. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Set up your environment variables. Create a `.env.local` file in the root directory and add the necessary variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   # Add any other required variables (e.g., SMTP settings for Nodemailer)
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Mobile Build (Android)
This project uses Capacitor to generate an Android APK, making it easy to save links directly from your phone.
To sync and open the Android project in Android Studio:
```bash
npm run build
npm run cap:sync
npm run cap:open
```

## Contributing 🤝
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## License 📝
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
