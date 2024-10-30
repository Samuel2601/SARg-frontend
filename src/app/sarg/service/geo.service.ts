import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class GeoService {
	// Partes de la URL separadas
	private readonly siteUrl = 'https://geoapi.esmeraldas.gob.ec';
	private readonly baseUrl = '/geoserver/catastro/wms?';
	private readonly baseParams = 'service=WFS&version=1.1.0&request=GetFeature&srsname=EPSG%3A4326&typeName=';
	private readonly outputFormat = '&outputFormat=application%2Fjson';

	// Parámetros específicos para cada consulta
	private readonly wifiPointsLayer = 'catastro%3Apuntos-wifi';
	private readonly route1Layer = 'catastro%3ARUTA2-CARRO2';
	private readonly route2Layer = 'catastro%3ACAPAS-RUTAS';
	private readonly neighborhoodsLayer = 'catastro%3Ageo_barrios';

	private readonly lineaConduccionLayer = 'catastro%3ALINEA_CONDUCCION';
	private readonly ubiTaquenLayer = 'catastro%3AUBI_TAQUENS';
	private readonly geoPredioGeneralLayer = 'catastro%3Ageo_predio_general';

	constructor(private http: HttpClient) {}

	// Métodos de consulta con URLs generadas dinámicamente
	getWifiPoints(): Observable<any> {
		return this.http.get<any>(`${this.siteUrl}${this.baseUrl}${this.baseParams}${this.wifiPointsLayer}${this.outputFormat}`);
	}

	getRoute1(): Observable<any> {
		return this.http.get<any>(`${this.siteUrl}${this.baseUrl}${this.baseParams}${this.route1Layer}${this.outputFormat}`);
	}

	getRoute2(): Observable<any> {
		return this.http.get<any>(`${this.siteUrl}${this.baseUrl}${this.baseParams}${this.route2Layer}${this.outputFormat}`);
	}

	getNeighborhoods(): Observable<any> {
		return this.http.get<any>(`${this.siteUrl}${this.baseUrl}${this.baseParams}${this.neighborhoodsLayer}${this.outputFormat}`);
	}
	getLineaConduccion(): Observable<any> {
		return this.http.get<any>(`${this.siteUrl}${this.baseUrl}${this.baseParams}${this.lineaConduccionLayer}${this.outputFormat}`);
	}
	getUbiTaquen(): Observable<any> {
		return this.http.get<any>(`${this.siteUrl}${this.baseUrl}${this.baseParams}${this.ubiTaquenLayer}${this.outputFormat}`);
	}
	getGeoPredioGeneral(): Observable<any> {
		return this.http.get<any>(`${this.siteUrl}${this.baseUrl}${this.baseParams}${this.geoPredioGeneralLayer}${this.outputFormat}`);
	}
}
