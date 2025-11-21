import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from './config';

export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: { contentType?: string }
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(storageRef);
}

export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export async function listFiles(path: string) {
  const storageRef = ref(storage, path);
  const result = await listAll(storageRef);
  return Promise.all(
    result.items.map(async (item) => ({
      name: item.name,
      fullPath: item.fullPath,
      url: await getDownloadURL(item),
    }))
  );
}

export async function uploadThumbnail(cameraId: string, file: File): Promise<string> {
  const path = `thumbnails/${cameraId}/${file.name}`;
  return uploadFile(path, file, { contentType: file.type });
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const path = `avatars/${userId}/${file.name}`;
  return uploadFile(path, file, { contentType: file.type });
}
