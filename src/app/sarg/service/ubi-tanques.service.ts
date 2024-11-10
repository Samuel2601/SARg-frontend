import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';

export interface UbiTanques {
	id: number;
	geom: string | null; // Geometría del tanque, puede ser null
	puntos: string | null; // Puntos asociados al tanque
	x: number | null; // Coordenada X
	y: number | null; // Coordenada Y
	sector: string | null; // Sector al que pertenece el tanque
	cotaM: number | null; // Cota en metros
	volumenM: number | null; // Volumen en metros cúbicos
	capacidad: string | null; // Capacidad del tanque
	numero: string | null; // Número del tanque
}

@Injectable({
	providedIn: 'root',
})
export class UbiTanquesService {
	private apiUrl = `${environment.apiUrl}/ubi-tanques`; // URL de tu API

	constructor(private http: HttpClient) {}

	findAll(page: number = 1, limit: number = 10, filter?: string, search?: string, fields?: string): Observable<UbiTanques[]> {
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

		return this.http.get<UbiTanques[]>(this.apiUrl, {params});
	}
}
