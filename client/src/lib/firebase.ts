import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
  });
  
  // Return unsubscribe function
  return () => off(mintsRef, 'value', unsubscribe);
}

export { database };