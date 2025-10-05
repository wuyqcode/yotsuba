import { get, set } from 'idb-keyval';

const STORAGE_PREFIX = 'yotsuba:post:';

export const saveToStorage = async <T>(key: string, value: T): Promise<void> => {
  try {
    await set(`${STORAGE_PREFIX}${key}`, value);
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
};

export const loadFromStorage = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await get(`${STORAGE_PREFIX}${key}`);
    return value as T;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return null;
  }
};
