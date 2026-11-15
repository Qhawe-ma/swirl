import { initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, push, onValue, type Database } from "firebase/database";

let app: FirebaseApp | null = null;
let database: Database | null = null;
let initializationPromise: Promise<void> | null = null;

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

async function initializeFirebase(): Promise<void> {
  if (app && database) {
    return;
  }

  try {
    const response = await fetch('/api/firebase-config');
    if (!response.ok) {
      throw new Error(`Failed to fetch Firebase config: ${response.status} ${response.statusText}`);
    }

    const firebaseConfig: FirebaseConfig = await response.json();
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);

  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    throw error;
  }
}

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
  imageUrl?: string;
  imageData?: string;
  metadataUri: string;
  timestamp: number;
  transactionSignature: string;
}

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
    
    const userMintsRef = ref(db, `mints/${mintData.walletAddress}/${id}`);
    
    const globalMintsRef = ref(db, `gallery_mints/${timestamp}_${id}`);
    
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
    
    return id;
  } catch (error) {
    console.error('❌ Failed to save mint record:', error);
    throw error;
  }
}

export async function getUserMints(walletAddress: string, callback: (mints: MintRecord[]) => void): Promise<() => void> {
  try {
    const db = await ensureFirebaseInitialized();
    const mintsRef = ref(db, `mints/${walletAddress}`);
    
    const unsubscribe = onValue(mintsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const mints = Object.values(data) as MintRecord[];
        mints.sort((a, b) => b.timestamp - a.timestamp);
        callback(mints);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('❌ Firebase error for getUserMints:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase for getUserMints:', error);
    callback([]);
    return () => {};
  }
}

export async function getAllMints(callback: (mints: MintRecord[]) => void, limit: number = 50): Promise<() => void> {
  try {
    const db = await ensureFirebaseInitialized();
    
    const { query, orderByKey, limitToLast } = await import('firebase/database');
    const galleryMintsRef = ref(db, 'gallery_mints');
    const limitedQuery = query(galleryMintsRef, orderByKey(), limitToLast(limit));
    
    const unsubscribe = onValue(limitedQuery, (snapshot) => {
      const data = snapshot.val();
      
      if (data && Object.keys(data).length > 0) {
        const mints = Object.values(data) as any[];
        mints.reverse();
        
        callback(mints);
      } else {
        // Records written before gallery_mints only exist under mints/{wallet}.
        const oldMintsRef = ref(db, 'mints');
        onValue(oldMintsRef, (oldSnapshot) => {
          const oldData = oldSnapshot.val();
          if (oldData) {
            const allMints: MintRecord[] = [];
            
            Object.values(oldData).forEach((walletMints: any) => {
              if (walletMints && typeof walletMints === 'object') {
                Object.values(walletMints).forEach((mint: any) => {
                  allMints.push(mint as MintRecord);
                });
              }
            });
            
            allMints.sort((a, b) => b.timestamp - a.timestamp);
            const limitedMints = allMints.slice(0, limit);
            callback(limitedMints);
          } else {
            callback([]);
          }
        });
      }
    }, (error) => {
      console.error('❌ Firebase error for getAllMints:', error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase for getAllMints:', error);
    callback([]);
    return () => {};
  }
}

export { database };
