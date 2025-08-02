# No G - Gluten & Allergen Checker PWA

A beautiful, intuitive Progressive Web Application (PWA) that helps users with gluten intolerance quickly check ingredient lists for gluten and other allergens using AI-powered image scanning and text analysis.

## Features

### Core Functionality
- **Image Scanning**: Take photos of ingredient labels for instant AI analysis
- **Manual Text Input**: Paste or type ingredient lists for analysis
- **Multi-Allergen Support**: Check for gluten, caffeine, chocolate (with more coming soon)
- **Check History**: Automatic saving of all ingredient checks with timestamps
- **Favorites System**: Save frequently checked safe products for quick access
- **User Authentication**: Secure login with email or Google account
- **Offline Support**: Works offline with service worker caching

### PWA Features
- Installable on mobile and desktop devices
- Offline functionality with intelligent caching
- App shortcuts for quick scanning
- Push notification support (future feature)
- Responsive design optimized for all devices

## Technology Stack

- **Frontend**: React with Tailwind CSS
- **AI Backend**: OpenAI GPT-4 Vision API
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: GitHub Pages
- **PWA**: Service Worker with cache-first strategy

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/no-g-pwa.git
cd no-g-pwa
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Update the homepage in `package.json`:
```json
"homepage": "https://yourusername.github.io/no-g-pwa"
```

### Development

Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Building for Production

Build the production version:
```bash
npm run build
```

### Deployment to GitHub Pages

1. Build and deploy:
```bash
npm run deploy
```

2. Go to your repository settings on GitHub
3. Under "Pages", ensure the source is set to the `gh-pages` branch

## Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication and Firestore
3. Add your web app and copy the configuration
4. Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /checks/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## OpenAI API Setup

1. Get an API key from https://platform.openai.com
2. Ensure you have access to GPT-4 Vision API
3. Add the key to your `.env` file

## Usage

### Scanning Ingredients
1. Open the app and tap the camera button
2. Take a photo of the ingredient label
3. Wait for AI analysis
4. View results with safety status and flagged ingredients

### Manual Input
1. Switch to manual input mode
2. Paste or type the ingredient list
3. Click "Analyze Ingredients"
4. View detailed results

### Managing History
- All checks are automatically saved
- Access history from the bottom navigation
- Mark items as favorites for quick access
- Delete unwanted checks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built for the gluten-free community
- Powered by OpenAI's GPT-4 Vision
- UI inspired by modern design principles
