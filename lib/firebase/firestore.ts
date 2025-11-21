import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  onSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Camera, User, Subscription, Alert, ChatMessage, FavoriteCamera } from '@/types';

// Helper to convert Firestore timestamps
function convertTimestamps<T>(data: Record<string, unknown>): T {
  const converted = { ...data };
  for (const key in converted) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = (converted[key] as Timestamp).toDate().toISOString();
    }
  }
  return converted as T;
}

// Users
export async function getUser(userId: string): Promise<User | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...convertTimestamps<Omit<User, 'id'>>(docSnap.data()) };
  }
  return null;
}

export async function updateUser(userId: string, data: Partial<User>) {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
}

// Cameras
export async function getCameras(options?: {
  status?: string;
  featured?: boolean;
  creatorId?: string;
  region?: string;
  animalType?: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  startAfterDoc?: DocumentSnapshot;
}): Promise<Camera[]> {
  const constraints: QueryConstraint[] = [];

  if (options?.status) {
    constraints.push(where('status', '==', options.status));
  }
  if (options?.featured !== undefined) {
    constraints.push(where('featured', '==', options.featured));
  }
  if (options?.creatorId) {
    constraints.push(where('creator_id', '==', options.creatorId));
  }
  if (options?.region) {
    constraints.push(where('region', '==', options.region));
  }
  if (options?.animalType) {
    constraints.push(where('animal_type', '==', options.animalType));
  }
  if (options?.orderByField) {
    constraints.push(orderBy(options.orderByField, options.orderDirection || 'desc'));
  }
  if (options?.limitCount) {
    constraints.push(limit(options.limitCount));
  }
  if (options?.startAfterDoc) {
    constraints.push(startAfter(options.startAfterDoc));
  }

  const q = query(collection(db, 'cameras'), ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps<Omit<Camera, 'id'>>(doc.data()),
  }));
}

export async function getCamera(cameraId: string): Promise<Camera | null> {
  const docRef = doc(db, 'cameras', cameraId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = convertTimestamps<Omit<Camera, 'id'>>(docSnap.data());
    // Get creator data
    if (data.creator_id) {
      const creator = await getUser(data.creator_id);
      if (creator) {
        return { id: docSnap.id, ...data, creator };
      }
    }
    return { id: docSnap.id, ...data };
  }
  return null;
}

export async function addCamera(data: Omit<Camera, 'id' | 'created_at' | 'updated_at'>) {
  const docRef = await addDoc(collection(db, 'cameras'), {
    ...data,
    viewer_count: 0,
    total_views: 0,
    featured: false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCamera(cameraId: string, data: Partial<Camera>) {
  const docRef = doc(db, 'cameras', cameraId);
  await updateDoc(docRef, { ...data, updated_at: serverTimestamp() });
}

// Alerts
export async function getActiveAlerts(cameraId: string): Promise<Alert[]> {
  const now = new Date().toISOString();
  const q = query(
    collection(db, 'alerts'),
    where('camera_id', '==', cameraId),
    where('is_active', '==', true),
    orderBy('created_at', 'desc'),
    limit(3)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...convertTimestamps<Omit<Alert, 'id'>>(doc.data()),
    }))
    .filter((alert) => !alert.expires_at || alert.expires_at > now);
}

// Subscriptions
export async function getSubscriptions(userId: string): Promise<Subscription[]> {
  const q = query(
    collection(db, 'subscriptions'),
    where('user_id', '==', userId),
    where('status', '==', 'active'),
    orderBy('created_at', 'desc')
  );
  const querySnapshot = await getDocs(q);

  const subscriptions = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const data = convertTimestamps<Omit<Subscription, 'id'>>(docSnap.data());
      if (data.camera_id) {
        const camera = await getCamera(data.camera_id);
        return { id: docSnap.id, ...data, camera: camera || undefined };
      }
      return { id: docSnap.id, ...data };
    })
  );

  return subscriptions;
}

// Favorites
export async function getFavorites(userId: string): Promise<FavoriteCamera[]> {
  const q = query(
    collection(db, 'favorite_cameras'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );
  const querySnapshot = await getDocs(q);

  const favorites = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const data = convertTimestamps<Omit<FavoriteCamera, 'id'>>(docSnap.data());
      const camera = await getCamera(data.camera_id);
      return { id: docSnap.id, ...data, camera: camera || undefined };
    })
  );

  return favorites;
}

export async function addFavorite(userId: string, cameraId: string) {
  await addDoc(collection(db, 'favorite_cameras'), {
    user_id: userId,
    camera_id: cameraId,
    created_at: serverTimestamp(),
  });
}

export async function removeFavorite(favoriteId: string) {
  await deleteDoc(doc(db, 'favorite_cameras', favoriteId));
}

// Chat Messages
export async function getChatMessages(cameraId: string, limitCount = 50): Promise<ChatMessage[]> {
  const q = query(
    collection(db, 'chat_messages'),
    where('camera_id', '==', cameraId),
    orderBy('created_at', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);

  const messages = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const data = convertTimestamps<Omit<ChatMessage, 'id'>>(docSnap.data());
      const user = await getUser(data.user_id);
      return {
        id: docSnap.id,
        ...data,
        user: user ? { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url } : undefined,
      };
    })
  );

  return messages.reverse();
}

export async function addChatMessage(cameraId: string, userId: string, message: string) {
  const docRef = await addDoc(collection(db, 'chat_messages'), {
    camera_id: cameraId,
    user_id: userId,
    message,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToChatMessages(
  cameraId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const q = query(
    collection(db, 'chat_messages'),
    where('camera_id', '==', cameraId),
    orderBy('created_at', 'desc'),
    limit(50)
  );

  return onSnapshot(q, async (snapshot) => {
    const messages = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = convertTimestamps<Omit<ChatMessage, 'id'>>(docSnap.data());
        const user = await getUser(data.user_id);
        return {
          id: docSnap.id,
          ...data,
          user: user ? { id: user.id, full_name: user.full_name, avatar_url: user.avatar_url } : undefined,
        };
      })
    );
    callback(messages.reverse());
  });
}

// Stats
export async function getPlatformStats() {
  const [usersSnapshot, camerasSnapshot] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'cameras')),
  ]);

  const cameras = camerasSnapshot.docs.map((doc) => doc.data());
  const activeCameras = cameras.filter((c) => c.status === 'active').length;
  const pendingCameras = cameras.filter((c) => c.status === 'pending').length;

  return {
    totalUsers: usersSnapshot.size,
    totalCameras: camerasSnapshot.size,
    activeCameras,
    pendingCameras,
  };
}

export async function getPendingCameras(): Promise<Camera[]> {
  const q = query(
    collection(db, 'cameras'),
    where('status', '==', 'pending'),
    orderBy('created_at', 'desc')
  );
  const querySnapshot = await getDocs(q);

  const cameras = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const data = convertTimestamps<Omit<Camera, 'id'>>(docSnap.data());
      const creator = data.creator_id ? await getUser(data.creator_id) : null;
      return { id: docSnap.id, ...data, creator: creator || undefined };
    })
  );

  return cameras;
}
