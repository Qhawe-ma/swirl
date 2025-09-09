import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, off, type Database } from "firebase/database";

// Firebase instances - will be initialized asynchronously
let app: FirebaseApp | null = null;
let database: Database | null = null;
let initializationPromise: Promise<void> | null = null;

// Firebase configuration fetched from backend
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Fetch Firebase config from backend and initialize
async function initializeFirebase(): Promise<void> {
  if (app && database) {
    return; // Already initialized
  }

  try {
    console.log('🔍 Fetching Firebase configuration from backend...');
    
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.status} ${response.statusText}`);
    }

    const firebaseConfig: FirebaseConfig = await response.json();
    
    console.log('🚀 Initializing Firebase with config:', {
      projectId: firebaseConfig.projectId,
      databaseURL: firebaseConfig.databaseURL,
      hasApiKey: !!firebaseConfig.apiKey
    });

    app = initializeApp(firebaseConfig);
    database = getDatabase(app);

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    throw error;
  }
}

// Ensure Firebase is initialized before using it
async function ensureFirebaseInitialized(): Promise<Database> {
  if (!initializationPromise) {
    initializationPromise = initializeFirebase();
  }
  
  await initializationPromise;
  
  if (!database) {
    throw new Error('Firebase database not initialized');
  }
  
  return database;
}

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
    const db = await ensureFirebaseInitialized();
    const mintsRef = ref(db, `mints/${mintData.walletAddress}`);
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
export async function getUserMints(walletAddress: string, callback: (mints: MintRecord[]) => void): Promise<() => void> {
  try {
    const db = await ensureFirebaseInitialized();
    const mintsRef = ref(db, `mints/${walletAddress}`);
    
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
  } catch (error) {
    console.error('❌ Failed to initialize Firebase for getUserMints:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
}

// Get all mints from all users for the gallery
export async function getAllMints(callback: (mints: MintRecord[]) => void): Promise<() => void> {
  try {
    console.log('🔍 Setting up getAllMints Firebase listener...');
    const db = await ensureFirebaseInitialized();
    const mintsRef = ref(db, 'mints');
    
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
  } catch (error) {
    console.error('❌ Failed to initialize Firebase for getAllMints:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
}

export { database };