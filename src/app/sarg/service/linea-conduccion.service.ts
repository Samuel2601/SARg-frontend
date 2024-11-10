import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';

export interface LineaConduccion {
	id: number;
	geom: string | null; // Geometría de la línea de conducción, puede ser null
	fid: string | null; // ID único, puede ser null
	diMetro: string | null; // Diámetro de la línea
	descripci: string | null; // Descripción
	long: number | null; // Longitud
}

@Injectable({
	providedIn: 'root',
})
export class LineaConduccionService {
	private apiUrl = `${environment.apiUrl}/linea-conduccion`; // URL de tu API

	constructor(private http: HttpClient) {}

	findAll(page: number = 1, limit: number = 10, filter?: string, search?: string, fields?: string): Observable<LineaConduccion[]> {
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

		return this.http.get<LineaConduccion[]>(this.apiUrl, {params});
	}
}
