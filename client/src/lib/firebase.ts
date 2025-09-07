import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug environment variables
console.log('🔍 Environment variables debug:', {
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? '[EXISTS]' : '[MISSING]',
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

// Initialize Firebase
console.log('🚀 Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  databaseURL: firebaseConfig.databaseURL,
  hasApiKey: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log('✅ Firebase initialized successfully');

export interface MintRecord {
  id: string;
  walletAddress: string;
  mintAddress: string;
  name: string;
  imageData: string;
  metadataUri: string;
  timestamp: number;
  transactionSignature: string;
}

// Save a new mint record
export async function saveMintRecord(mintData: Omit<MintRecord, 'id' | 'timestamp'>): Promise<string> {
  try {
    const mintsRef = ref(database, `mints/${mintData.walletAddress}`);
    const newMintRef = push(mintsRef);
    
    const mintRecord: MintRecord = {
      ...mintData,
      id: newMintRef.key!,
      timestamp: Date.now()
    };
    
    await set(newMintRef, mintRecord);
    console.log('✅ Mint record saved to Firebase:', mintRecord.id);
    return mintRecord.id;
  } catch (error) {
    console.error('❌ Failed to save mint record:', error);
    throw error;
  }
}

// Get all mints for a wallet address
export function getUserMints(walletAddress: string, callback: (mints: MintRecord[]) => void): () => void {
  const mintsRef = ref(database, `mints/${walletAddress}`);
  
  const unsubscribe = onValue(mintsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const mints = Object.values(data) as MintRecord[];
      // Sort by timestamp, newest first
      mints.sort((a, b) => b.timestamp - a.timestamp);
      callback(mints);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('❌ Firebase error for getUserMints:', error);
    callback([]);
  });
  
  // Return unsubscribe function
  return unsubscribe;
}

// Get all mints from all users for the gallery
export function getAllMints(callback: (mints: MintRecord[]) => void): () => void {
  console.log('🔍 Setting up getAllMints Firebase listener...');
  const mintsRef = ref(database, 'mints');
  
  const unsubscribe = onValue(mintsRef, (snapshot) => {
    console.log('🔄 Firebase getAllMints callback triggered');
    const data = snapshot.val();
    console.log('📊 Firebase data received:', data);
    
    if (data) {
      const allMints: MintRecord[] = [];
      
      // Iterate through all wallet addresses
      Object.values(data).forEach((walletMints: any) => {
        if (walletMints && typeof walletMints === 'object') {
          // Add all mints from this wallet
          Object.values(walletMints).forEach((mint: any) => {
            allMints.push(mint as MintRecord);
          });
        }
      });
      
      // Sort by timestamp, newest first
      allMints.sort((a, b) => b.timestamp - a.timestamp);
      console.log(`✅ Found ${allMints.length} total mints in Firebase`);
      callback(allMints);
    } else {
      console.log('📭 No data found in Firebase - calling callback with empty array');
      callback([]);
    }
  }, (error) => {
    console.error('❌ Firebase error for getAllMints:', error);
    callback([]);
  });
  
  // Return unsubscribe function
  return unsubscribe;
}

export { database };