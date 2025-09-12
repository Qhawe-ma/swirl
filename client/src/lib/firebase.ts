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
  imageUrl: string; // IPFS URL instead of full base64 data
  metadataUri: string;
  timestamp: number;
  transactionSignature: string;
}

// Save a new mint record with dual indexing for scalability
export async function saveMintRecord(mintData: Omit<MintRecord, 'id' | 'timestamp'>): Promise<string> {
  try {
    const db = await ensureFirebaseInitialized();
    const timestamp = Date.now();
    const id = push(ref(db, 'temp')).key!;
    
    const mintRecord: MintRecord = {
      ...mintData,
      id,
      timestamp
    };
    
    // Save to user's personal mints
    const userMintsRef = ref(db, `mints/${mintData.walletAddress}/${id}`);
    
    // Save to global mints index for gallery (sorted by timestamp)
    const globalMintsRef = ref(db, `gallery_mints/${timestamp}_${id}`);
    
    // Atomic write to both locations
    await Promise.all([
      set(userMintsRef, mintRecord),
      set(globalMintsRef, {
        id,
        walletAddress: mintData.walletAddress,
        mintAddress: mintData.mintAddress,
        name: mintData.name,
        imageUrl: mintData.imageUrl,
        timestamp
      })
    ]);
    
    console.log('✅ Mint record saved to Firebase with dual indexing:', id);
    return id;
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

// Get paginated mints from global index for the gallery (SCALABLE for high volume)
export async function getAllMints(callback: (mints: MintRecord[]) => void, limit: number = 50): Promise<() => void> {
  try {
    console.log('🔍 Setting up OPTIMIZED getAllMints Firebase listener...');
    const db = await ensureFirebaseInitialized();
    
    // MIGRATION: Try the new optimized structure first, fallback to old structure if empty
    const { query, orderByKey, limitToLast } = await import('firebase/database');
    const galleryMintsRef = ref(db, 'gallery_mints');
    const limitedQuery = query(galleryMintsRef, orderByKey(), limitToLast(limit));
    
    const unsubscribe = onValue(limitedQuery, (snapshot) => {
      console.log('🔄 Firebase getAllMints callback triggered (OPTIMIZED)');
      const data = snapshot.val();
      
      if (data && Object.keys(data).length > 0) {
        const mints = Object.values(data) as any[];
        // Reverse to get newest first (limitToLast gives oldest first)
        mints.reverse();
        
        console.log(`✅ Found ${mints.length} recent mints in new structure (limited to ${limit} for performance)`);
        callback(mints);
      } else {
        console.log('📭 No data in new gallery structure, falling back to old structure...');
        // Fallback to old structure for backwards compatibility
        const oldMintsRef = ref(db, 'mints');
        onValue(oldMintsRef, (oldSnapshot) => {
          const oldData = oldSnapshot.val();
          if (oldData) {
            const allMints: MintRecord[] = [];
            
            // Iterate through all wallet addresses  
            Object.values(oldData).forEach((walletMints: any) => {
              if (walletMints && typeof walletMints === 'object') {
                Object.values(walletMints).forEach((mint: any) => {
                  allMints.push(mint as MintRecord);
                });
              }
            });
            
            // Sort by timestamp, newest first, and limit
            allMints.sort((a, b) => b.timestamp - a.timestamp);
            const limitedMints = allMints.slice(0, limit);
            console.log(`✅ Found ${limitedMints.length} mints in old structure (migrated)`);
            callback(limitedMints);
          } else {
            console.log('📭 No data found in either structure');
            callback([]);
          }
        });
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