import {Injectable} from '@angular/core';
import {openDB, IDBPDatabase} from 'idb';

@Injectable({
	providedIn: 'root',
})
export class IndexedDbService {
	private dbPromise: Promise<IDBPDatabase>;

	constructor() {
		this.dbPromise = openDB('GeoPredioDB', 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('geoPredios')) {
					db.createObjectStore('geoPredios', {keyPath: 'page'});
				}
			},
		});
	}

	async addData(page: number, data: any[], totalRecords: number): Promise<void> {
		const db = await this.dbPromise;
		const tx = db.transaction('geoPredios', 'readwrite');
		const store = tx.objectStore('geoPredios');
		await store.put({page, data, totalRecords});
		await tx.done;
	}

	async getData(page: number): Promise<any | undefined> {
		const db = await this.dbPromise;
		const store = db.transaction('geoPredios', 'readonly').objectStore('geoPredios');
		return store.get(page);
	}

	async clear(): Promise<void> {
		const db = await this.dbPromise;
		await db.clear('geoPredios');
	}
}
