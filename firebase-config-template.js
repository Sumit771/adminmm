// Firebase configuration template
// Replace with your actual Firebase project configuration
// Get these values from Firebase Console > Project Settings > General > Your apps

export const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Instructions:
// 1. Create a new Firebase project at https://console.firebase.google.com/
// 2. Enable Authentication with Email/Password provider
// 3. Enable Firestore Database
// 4. Enable Storage
// 5. Copy the config values above from Firebase Console
// 6. Deploy the security rules:
//    - firestore.rules to Firestore > Rules
//    - storage.rules to Storage > Rules
// 7. Create user accounts in Firebase Auth:
//    - vivek@mm.com (Team Leader)
//    - Other editor emails as needed