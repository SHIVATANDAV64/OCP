/**
 * Lazy Appwrite initialization to reduce bundle size
 * This file ensures appwrite is only loaded when needed
 */
import type { Account, Databases, Storage, Functions } from 'appwrite';

let cachedAccount: Account | null = null;
let cachedDatabases: Databases | null = null;
let cachedStorage: Storage | null = null;
let cachedFunctions: Functions | null = null;

export async function getAccount() {
  if (!cachedAccount) {
    const { account } = await import('./appwrite');
    cachedAccount = account;
  }
  return cachedAccount;
}

export async function getDatabases() {
  if (!cachedDatabases) {
    const { databases } = await import('./appwrite');
    cachedDatabases = databases;
  }
  return cachedDatabases;
}

export async function getStorage() {
  if (!cachedStorage) {
    const { storage } = await import('./appwrite');
    cachedStorage = storage;
  }
  return cachedStorage;
}

export async function getFunctions() {
  if (!cachedFunctions) {
    const { functions } = await import('./appwrite');
    cachedFunctions = functions;
  }
  return cachedFunctions;
}

export async function getAppwriteServices() {
  const [account, databases, storage, functions] = await Promise.all([
    getAccount(),
    getDatabases(),
    getStorage(),
    getFunctions(),
  ]);
  return { account, databases, storage, functions };
}

export { ID, Query, DATABASE_ID, COLLECTIONS, BUCKETS, authService, dbService } from './appwrite';
