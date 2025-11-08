
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Settings, Movement } from '../types';
import { DB_NAME, DB_VERSION, STORES } from '../constants';

interface AppDB extends DBSchema {
    [STORES.SETTINGS]: {
        key: 'default';
        value: Settings;
    };
    [STORES.MOVEMENTS]: {
        key: number;
        value: Movement;
        indexes: { 'mesAño': string };
    };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

const initDB = (): Promise<IDBPDatabase<AppDB>> => {
    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
                transaction.objectStore(STORES.SETTINGS).put({ id: 'default', inicialMensual: 300, ocrConfidenceThreshold: 70 });
            }
            if (!db.objectStoreNames.contains(STORES.MOVEMENTS)) {
                const store = db.createObjectStore(STORES.MOVEMENTS, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                store.createIndex('mesAño', 'mesAño');
            }
        },
    });

    return dbPromise;
};


export const getSettings = async (): Promise<Settings> => {
    const db = await initDB();
    const settings = await db.get(STORES.SETTINGS, 'default');
    return settings || { id: 'default', inicialMensual: 300, ocrConfidenceThreshold: 70 };
};

export const updateSettings = async (settings: Omit<Settings, 'id'>): Promise<void> => {
    const db = await initDB();
    await db.put(STORES.SETTINGS, { ...settings, id: 'default' });
};

export const addMovement = async (movement: Omit<Movement, 'id'>): Promise<number> => {
    const db = await initDB();
    return await db.add(STORES.MOVEMENTS, movement as Movement);
};

export const getMovementsByMonth = async (mesAño: string): Promise<Movement[]> => {
    const db = await initDB();
    return await db.getAllFromIndex(STORES.MOVEMENTS, 'mesAño', mesAño);
};

export const getAllMovements = async (): Promise<Movement[]> => {
    const db = await initDB();
    return await db.getAll(STORES.MOVEMENTS);
};

export const updateMovement = async (movement: Movement): Promise<void> => {
    const db = await initDB();
    await db.put(STORES.MOVEMENTS, movement);
};

export const deleteMovement = async (id: number): Promise<void> => {
    const db = await initDB();
    await db.delete(STORES.MOVEMENTS, id);
};

export const getLatestMovement = async (): Promise<Movement | undefined> => {
    const db = await initDB();
    const cursor = await db.transaction(STORES.MOVEMENTS).store.openCursor(null, 'prev');
    return cursor?.value;
};

export const exportData = async (months: string[]): Promise<Movement[]> => {
    const db = await initDB();
    const movements: Movement[] = [];
    for (const month of months) {
        const monthMovements = await db.getAllFromIndex(STORES.MOVEMENTS, 'mesAño', month);
        movements.push(...monthMovements);
    }
    return movements.sort((a, b) => new Date(a.fechaISO).getTime() - new Date(b.fechaISO).getTime());
}