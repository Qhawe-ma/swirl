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

// Initialize Firebase
console.log('🔥 Initializing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL
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
  console.log('🔍 Getting mints for wallet:', walletAddress);
  const mintsRef = ref(database, `mints/${walletAddress}`);
  
  const unsubscribe = onValue(mintsRef, (snapshot) => {
    console.log('📊 Firebase snapshot received for wallet:', walletAddress);
    const data = snapshot.val();
    console.log('📦 Raw Firebase data:', data);
    
    if (data) {
      const mints = Object.values(data) as MintRecord[];
      // Sort by timestamp, newest first
      mints.sort((a, b) => b.timestamp - a.timestamp);
      console.log('✅ Found', mints.length, 'mints for wallet:', walletAddress);
      callback(mints);
    } else {
      console.log('📭 No mints found for wallet:', walletAddress);
      callback([]);
    }
  }, (error) => {
    console.error('❌ Firebase error for getUserMints:', error);
    console.error('Firebase config being used:', firebaseConfig);
    callback([]);
  });
  
  // Return unsubscribe function
  return unsubscribe;
}

// Get all mints from all users for the gallery
export function getAllMints(callback: (mints: MintRecord[]) => void): () => void {
  console.log('🌍 Getting all mints from Firebase');
  const mintsRef = ref(database, 'mints');
  
  const unsubscribe = onValue(mintsRef, (snapshot) => {
    console.log('📊 Firebase snapshot received for all mints');
    const data = snapshot.val();
    console.log('📦 Raw Firebase data (all mints):', data);
    
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
      console.log('✅ Found', allMints.length, 'total mints across all wallets');
      callback(allMints);
    } else {
      console.log('📭 No mints found in database');
      callback([]);
    }
  }, (error) => {
    console.error('❌ Firebase error for getAllMints:', error);
    console.error('Firebase config being used:', firebaseConfig);
    callback([]);
  });
  
  // Return unsubscribe function
  return unsubscribe;
}

export { database };