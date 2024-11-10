import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';

export interface AreaTanques {
	id: number;
	geom: string | null; // Geometría del tanque, puede ser null
	nomTanque: string | null; // Nombre del tanque
	orden: string | null; // Orden del tanque
	sector: string | null; // Sector al que pertenece el tanque
	capacidad: string | null; // Capacidad del tanque
	numero: string | null; // Número del tanque
}

@Injectable({
	providedIn: 'root',
})
export class AreaTanquesService {
	private apiUrl = `${environment.apiUrl}/area-tanques`; // URL de tu API para Area Tanques

	constructor(private http: HttpClient) {}

	findAll(page: number = 1, limit: number = 10, filter?: string, search?: string, fields?: string): Observable<{data: AreaTanques[]; total: number}> {
		let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

		if (filter) {
			params = params.set('filter', filter);
		}
		if (search) {
			params = params.set('search', search);
		}
		if (fields) {
			params = params.set('fields', fields);
		}

		return this.http.get<{data: AreaTanques[]; total: number}>(this.apiUrl, {params});
	}
}
