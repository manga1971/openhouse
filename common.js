// common.js - Funcționalități JavaScript comune și setup IndexedDB

// Import idb-keyval library (usually via CDN or module bundler)
// For competition, we'll embed the UMD build directly or assume it's loaded via script tag.
// If we were bundling, this would be `import { get, set, del } from 'idb-keyval';`
// For simplicity and "pure JS", we'll just ensure idbKeyval is available globally.
// (In the HTML files, we will include the idb-keyval UMD script tag).

// Utilități pentru IndexedDB cu idb-keyval
// idb-keyval este deja o biblioteca foarte compacta si simpla.
// Nu o vom refactoriza, ci o vom folosi direct.
// (Presupunem ca acest script e incarcat DUPA idb-keyval.umd.js in HTML)

const db = {
    get: async (key) => {
        try {
            return await idbKeyval.get(key);
        } catch (error) {
            console.error(`Error getting key "${key}" from IndexedDB:`, error);
            return null;
        }
    },
    set: async (key, val) => {
        try {
            await idbKeyval.set(key, val);
            return true;
        } catch (error) {
            console.error(`Error setting key "${key}" to IndexedDB:`, error);
            return false;
        }
    },
    del: async (key) => {
        try {
            await idbKeyval.del(key);
            return true;
        } catch (error) {
            console.error(`Error deleting key "${key}" from IndexedDB:`, error);
            return false;
        }
    },
    clear: async () => {
        try {
            await idbKeyval.clear();
            return true;
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
            return false;
        }
    },
    keys: async () => {
        try {
            return await idbKeyval.keys();
        } catch (error) {
            console.error('Error getting IndexedDB keys:', error);
            return [];
        }
    }
};

// Funcție utilitară pentru debounce (pentru auto-save la input)
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// Funcție utilitară pentru formatarea timpului (pentru durata dictărilor)
function formatDuration(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Generare UUID v4
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}