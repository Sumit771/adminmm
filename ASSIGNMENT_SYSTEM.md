## 📦 Updated Data Model (Firestore)

```javascript
orders: {
  name: string,              // Client name
  whatsapp: string,          // WhatsApp number with country code
  country: string,           // Auto-detected country from WhatsApp
  telecaller: string,        // Telecaller name
  assignedToEmail: string,   // Editor's email address (tarun@mm.com, etc.)
  assignedToName: string,    // Editor's display name (Tarun, Harinder, etc.)
  sampleImageUrl: string,    // URL of sample image (uploaded or hosted)
  imageType: "upload" | "url", // Type of image source
  status: "pending" | "in-progress" | "completed",
  createdAt: serverTimestamp,  // Order creation timestamp
  completedAt: timestamp | null // Completion timestamp (when status = completed)
}
```

## 👥 Editor Details

| Name | Email | Role |
|------|-------|------|
| Tarun | tarun@mm.com | Editor |
| Harinder | harinder@mm.com | Editor |
| Roop | roop@mm.com | Editor |
| Gurwinder | gurwinder@mm.com | Editor |
| Vivek | vivek@mm.com | Team Leader |

## 🔧 Changes Made

1. **Updated Assignment System**: Changed from Firebase UIDs to email addresses for order assignment
2. **Modified useOrders Hook**: Now filters orders using `assignedToEmail == user.email` for editors
3. **Updated OrderForm**: 
   - Changed editors array to use email addresses
   - Updated form state to use `assignedToEmail`
   - Modified Select component to assign by email
4. **Updated Firestore Rules**: 
   - Changed validation to use `assignedToEmail`
   - Updated ownership check to use email instead of UID

## ✅ How It Works Now

1. **Team Leader** creates orders and assigns them to editors by selecting from dropdown (shows names)
2. **Order Data** stores both `assignedToEmail` (for filtering) and `assignedToName` (for display)
3. **Editors** see only orders where `assignedToEmail` matches their login email
4. **Real-time Updates** ensure editors immediately see newly assigned orders
5. **Security** maintained through Firestore rules that validate email-based ownership

The system now correctly shows assigned orders to editors based on their email addresses!