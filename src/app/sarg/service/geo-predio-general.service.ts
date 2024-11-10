import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from 'src/environments/environment';

export interface GeoPredioGeneral {
	id: string;
	poligono: string | null;
	claveCatastral: string | null;
	claveCatastralAnterior: string | null;
	tipoPredio: string | null;
	uso: string | null;
	agua: string | null;
	sanitarias: string | null;
	energia: string | null;
	documentoPropietario: string | null;
	propietario: string | null;
	tipoPersona: string | null;
	personeria: string | null;
	area: number | null;
}

@Injectable({
	providedIn: 'root',
})
export class GeoPredioGeneralService {
	private apiUrl = `${environment.apiUrl}/geo-predio-general`;

	constructor(private http: HttpClient) {}

	findAll(page: number = 1, limit: number = 10, filter?: string, search?: string, fields?: string): Observable<any> {
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

		return this.http.get<any>(this.apiUrl, {params});
	}
}
