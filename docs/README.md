# Icebreaker Bingo

> A real-time multiplayer icebreaker bingo game for team building and social events

## 🚀 Overview

Icebreaker Bingo is an interactive web application that helps break the ice at social events, team meetings, or conferences. Admins create games with unique codes, and players join anonymously to find people matching various descriptions on their bingo boards. The app features real-time synchronization, so everyone sees progress as it happens. Perfect for remote teams, onboarding sessions, or any gathering where you want people to connect!

## ✨ Features

- **Admin Dashboard** - Create and manage multiple bingo games with unique codes
- **Anonymous Player Access** - Players join instantly with just a game code and name
- **Real-Time Sync** - All player progress updates live across all devices
- **Direct Game URLs** - Easy sharing with game-specific links
- **Bilingual Support** - Full English and Norwegian language support
- **Player Management** - Sort players by progress or name, track completion
- **Session Persistence** - Players can refresh without losing progress
- **Game Control** - End games to preserve data while blocking new joins

## 🛠️ Tech Stack

- **Frontend**: Vite + React 18.2.0
- **Styling**: Tailwind CSS 3.4.0
- **Backend**: Firebase 10.14.1
  - Authentication (Email/Password + Anonymous)
  - Firestore Database (Real-time sync)
- **Icons**: Lucide React 0.263.1
- **Build Tool**: Vite 5.0.8

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18.0 or higher)
- npm or yarn
- A Firebase account and project

## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/[your-username]/icebreaker-bingo.git
cd icebreaker-bingo
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory:
```bash
touch .env.local
```

4. Add your Firebase configuration to `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

For detailed information about the project organization and conventions, see [Project Structure Documentation](./docs/PROJECT_STRUCTURE.md).

## 🚀 Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |

## 🌐 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### [Other deployment options]
[Add deployment instructions for your chosen platform]

## 🧪 Testing

```bash
[Add testing commands when implemented]
npm run test
```

## 📖 Usage Examples

[Add code examples or screenshots showing how to use key features]

```javascript
// Example code snippet
```

## 🤝 Contributing

[If you want contributions, add guidelines here]

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

[Specify your license - MIT, Apache 2.0, etc.]

## 👤 Author

**[Your Name]**

- GitHub: [@yourusername](https://github.com/yourusername)
- [Other contact info]

## 🙏 Acknowledgments

- [Credit any libraries, tutorials, or resources that helped]
- [Thank contributors]

## 📞 Support

For support, email [your-email] or open an issue in the repository.

## 🗺️ Roadmap

- [ ] [Planned feature 1]
- [ ] [Planned feature 2]
- [ ] [Planned feature 3]

## 📸 Screenshots

[Add screenshots of your app once available]

---

Built with ❤️ using Vite and Firebase