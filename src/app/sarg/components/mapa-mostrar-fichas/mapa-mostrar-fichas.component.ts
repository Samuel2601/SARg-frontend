import {DatePipe} from '@angular/common';
import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Loader} from '@googlemaps/js-api-loader';
import {MarkerClusterer} from '@googlemaps/markerclusterer';
import {GoogleMapsService} from '../../service/google.maps.service';
import {ImportsModule} from '../../service/import';
import proj4 from 'proj4';

interface MarkerGroup {
	position: google.maps.LatLng;
	markers: {
		marker: google.maps.Marker;
		item: any;
		infoWindow: google.maps.InfoWindow;
	}[];
}

@Component({
	selector: 'app-mapa-mostrar-fichas',
	standalone: true,
	imports: [ImportsModule],
	templateUrl: './mapa-mostrar-fichas.component.html',
	styleUrl: './mapa-mostrar-fichas.component.scss',
	providers: [DatePipe],
})
export class MapaMostrarFichasComponent implements OnInit, OnDestroy {
	@Input() feature!: any;
	@Input() poligon!: boolean;
	@Input() key_cat!: string;
	@Input() key_cat_label!: string;
	@Input() columns_info!: any[];

	@Input() incidente!: boolean;

	mapCustom: google.maps.Map;
	load_fullscreen: boolean = false;

	features_arr: any[];

	constructor(private router: Router, private googlemaps: GoogleMapsService, private datePipe: DatePipe) {}

	async ngOnInit() {
		await this.initMap();
	}

	async initMap() {
		this.googlemaps.getLoader().then(() => {
			const haightAshbury = {lat: 0.977035, lng: -79.655415};
			this.mapCustom = new google.maps.Map(document.getElementById('map2') as HTMLElement, {
				zoom: 15,
				center: haightAshbury,
				mapTypeId: 'terrain',
				fullscreenControl: false,
				mapTypeControlOptions: {
					style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
					position: google.maps.ControlPosition.LEFT_BOTTOM,
				},
				gestureHandling: 'greedy', //'cooperative', // Control de gestos
			});

			this.initFullscreenControl();
			setTimeout(async () => {
				if (this.feature) {
					if (Array.isArray(this.feature)) {
						this.features_arr = this.feature;
					} else {
						this.features_arr = [this.feature];
					}
					await this.getcategorias();
					await this.marcadoresmapa();
				} else {
					await this.listarFichaSectorialMapa();
				}
			}, 1000);
		});
	}

	async listarFichaSectorialMapa() {}
	actividades: any[] = [];
	actividad_select: any[] = [];

	async getcategorias() {
		if (this.key_cat && this.key_cat_label) {
			this.actividades = [];
			this.actividad_select = [];
			this.features_arr.forEach((item: any) => {
				const value = item[this.key_cat]?.toString();
				const label = item[this.key_cat_label]?.toString();
				if (!value) {
					return; // Saltar al siguiente elemento
				}
				// Verificar si la actividad ya existe en el array
				if (!this.actividades.find((actividad) => actividad.value === value)) {
					this.actividades.push({value, label: this.key_cat === this.key_cat_label ? value : label});
				}
			});
			this.actividad_select = this.actividades;
		}
	}

	private markers: google.maps.Marker[] = [];
	private markerGroups: MarkerGroup[] = [];
	private activeInfoWindow: google.maps.InfoWindow | null = null;
	private markerCluster: MarkerClusterer | undefined;
	private readonly GROUPING_RADIUS_METERS = 20; // Radio de agrupación en metros

	async marcadoresmapa() {
		try {
			if (!this.poligon) {
				const bounds = new google.maps.LatLngBounds();

				// Limpiar marcadores y grupos existentes
				this.markers.forEach((marker) => {
					marker.setMap(null);
				});
				this.markers = [];
				this.markerGroups = [];

				if (this.markerCluster) {
					this.markerCluster.clearMarkers();
				}

				// Agrupar marcadores por posición
				this.features_arr.forEach((item: any) => {
					const geomType = item.geom?.type || '';
					const coordinates = item.geom?.coordinates;
					const crsName = item.geom?.crs?.properties?.name;

					// Verificar si es un punto y tiene coordenadas válidas
					if (
						geomType === 'Point' &&
						coordinates &&
						(!item[this.key_cat] || this.actividad_select.some((act: any) => act.value === item[this.key_cat]))
					) {
						// Definir la proyección en proj4 solo si aún no está definida
						if (!proj4.defs[crsName]) {
							// Agregar definiciones de proyecciones conocidas
							if (!crsName) {
								proj4.defs('EPSG:32617', '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs');
							} else {
								proj4.defs(crsName, '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs');
							}
							// Aquí puedes agregar más definiciones para otros CRS
						}

						// Convertir coordenadas de UTM a latitud/longitud utilizando el CRS detectado
						const [lat, lng] = proj4(crsName, proj4.WGS84, [coordinates[0], coordinates[1]]);
						const position = new google.maps.LatLng(lng, lat);

						const marker = this.createMarker(position, item);
						const infoWindow = this.createInfoWindow(item);

						// Buscar grupo cercano existente o crear uno nuevo
						let nearestGroup = this.findNearestGroup(position);

						if (nearestGroup) {
							nearestGroup.markers.push({marker, item, infoWindow});
							this.updateGroupCenter(nearestGroup);
						} else {
							const newGroup = {
								position: position,
								markers: [{marker, item, infoWindow}],
							};
							this.markerGroups.push(newGroup);
						}

						this.markers.push(marker);
						bounds.extend(position);
					}
					// Si es un polígono, puedes agregar lógica adicional aquí
					else if (geomType === 'Polygon') {
						// Lógica específica para manejar polígonos
					}
				});

				// Configurar listeners para cada grupo
				this.markerGroups.forEach((group) => {
					group.markers.forEach(({marker}) => {
						if (group.markers.length > 1) {
							marker.setPosition(group.position);
						}

						marker.addListener('click', () => {
							if (group.markers.length > 1) {
								this.handleGroupClick(group);
							} else {
								this.setupSingleMarkerListeners(marker, group.markers[0].infoWindow, group.position);
							}
						});
					});
				});

				if (this.mapCustom) {
					this.markerCluster = new MarkerClusterer({
						map: this.mapCustom,
						markers: this.markers,
					});
					this.mapCustom.fitBounds(bounds);
				}
			}
		} catch (error) {
			console.error(error);
		}
	}

	private updateGroupCenter(group: MarkerGroup) {
		// Calcular el centro promedio del grupo
		let totalLat = 0;
		let totalLng = 0;
		const count = group.markers.length;

		group.markers.forEach(({marker}) => {
			totalLat += marker.getPosition()!.lat();
			totalLng += marker.getPosition()!.lng();
		});

		group.position = new google.maps.LatLng(totalLat / count, totalLng / count);
	}

	private findNearestGroup(position: google.maps.LatLng): MarkerGroup | null {
		for (const group of this.markerGroups) {
			const distance = this.calculateDistance(position, group.position);
			if (distance <= this.GROUPING_RADIUS_METERS) {
				return group;
			}
		}
		return null;
	}
	private calculateDistance(pos1: google.maps.LatLng, pos2: google.maps.LatLng): number {
		// Usar la fórmula haversine para calcular la distancia en metros
		const R = 6371000; // Radio de la Tierra en metros
		const φ1 = this.toRadians(pos1.lat());
		const φ2 = this.toRadians(pos2.lat());
		const Δφ = this.toRadians(pos2.lat() - pos1.lat());
		const Δλ = this.toRadians(pos2.lng() - pos1.lng());

		const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c; // Distancia en metros
	}

	private toRadians(degrees: number): number {
		return (degrees * Math.PI) / 180;
	}

	private createInfoWindow(item: any): google.maps.InfoWindow {
		// Convertir coordenadas usando el CRS especificado, si existe
		const crsName = item.geom?.crs?.properties?.name || 'EPSG:32617'; // Usa 'EPSG:32617' como predeterminado
		const coordinates = item.geom?.coordinates;
		let lat, lng;

		if (coordinates && crsName) {
			// Asegurarse de que el CRS esté definido en proj4
			if (!proj4.defs[crsName]) {
				// Definir el CRS en proj4 (si es necesario)
				if (crsName === 'EPSG:32617') {
					proj4.defs('EPSG:32617', '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs');
				}
				// Agrega aquí más definiciones de CRS si es necesario
			}

			// Convertir a WGS84
			[lat, lng] = proj4(crsName, proj4.WGS84, [coordinates[0], coordinates[1]]);
		}

		// Formatear fecha del evento
		const formattedDate = this.datePipe.transform(this.incidente ? item.createdAt : item.fecha_evento, 'short');

		// Crear contenido del InfoWindow
		const infoContent = this.buildInfoContent(item, lng, lat, formattedDate);
		const columns_headers = this.columns_info.find((element: any) => {
			if (element.visible && element.selected && element.field != 'id') {
				return element;
			}
		});

		return new google.maps.InfoWindow({
			headerContent: item[columns_headers.field] || 'Información',
			content: infoContent,
			maxWidth: 400,
		});
	}

	// Método auxiliar para construir el contenido de InfoWindow dinámicamente
	private buildInfoContent(item: any, lat: number, lng: number, formattedDate: string): string {
		let infoContent = `<div class="info-window-content">`;
		if (this.columns_info.length > 0) {
			this.columns_info.forEach((element: any) => {
				if (element.selected && element.visible) {
					infoContent += `<p style="margin: 0" ><strong>${element.header}:</strong> ${item[element.field]}</p>`;
				}
			});
		} else {
			// Iterar sobre todas las propiedades de item, excluyendo geom y polígono
			Object.entries(item).forEach(([key, value]) => {
				if (key !== 'geom' && key !== 'poligono' && value !== undefined && value !== null) {
					const formattedValue = key === 'volumenM' ? `${value} m³` : value;
					infoContent += `<p><strong>${this.formatLabel(key)}:</strong> ${formattedValue}</p>`;
				}
			});
		}

		// Agregar enlace de Google Maps, si las coordenadas están disponibles
		if (lat && lng) {
			infoContent += `
			<a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}"
				target="_blank" class="btn-direcciones">
				Cómo llegar
			</a>`;
		}
		infoContent += `</div>`;

		return infoContent;
	}

	// Método auxiliar para formatear la etiqueta de cada propiedad (convierte key a texto legible)
	private formatLabel(key: string): string {
		// Convertir camelCase a Capitalizado con espacios (e.g., "cotaM" -> "Cota M")
		return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (str) => str.toUpperCase());
	}

	private createMarker(position: google.maps.LatLng, item: any): google.maps.Marker {
		return new google.maps.Marker({
			title: this.incidente ? 'Incidente' : item.title_marcador,
			position: position,
			map: this.mapCustom,
			icon: {
				url: item.icono_marcador || 'https://i.postimg.cc/QdcR9bnm/puntero-del-mapa.png',
				scaledSize: this.getMarkerSize(item),
			},
		});
	}

	private getMarkerSize(item: any): google.maps.Size {
		const isPast = new Date(item.fecha_evento).getTime() < new Date().getTime();
		const hasCustomIcon = item.icono_marcador && item.icono_marcador !== 'https://i.postimg.cc/QdcR9bnm/puntero-del-mapa.png';

		if (isPast) return new google.maps.Size(50, 50);
		if (hasCustomIcon) return new google.maps.Size(80, 80);
		return new google.maps.Size(60, 60);
	}

	private handleGroupClick(group: MarkerGroup) {
		// Cerrar InfoWindow activo si existe
		if (this.activeInfoWindow) {
			this.activeInfoWindow.close();
		}

		// Crear contenido para múltiples marcadores
		const content = this.createGroupInfoWindowContent(group);
		const infoWindow = new google.maps.InfoWindow({
			content: content.content,
			maxWidth: 400,
		});

		infoWindow.setPosition(group.position);
		infoWindow.open(this.mapCustom);
		this.activeInfoWindow = infoWindow;
		if (this.mapCustom) {
			this.mapCustom.setCenter(group.position);
		}
	}

	private createGroupInfoWindowContent(group: MarkerGroup): {
		content: string;
	} {
		let content = '<div class="marker-group-content">';
		group.markers.forEach(({item}, index) => {
			const formattedDate = this.datePipe.transform(this.incidente ? item.createdAt : item.fecha_evento, 'short');

			content += `
            <div class="marker-item" ${index > 0 ? 'style="border-top: 1px solid #ccc; margin-top: 10px; padding-top: 10px;"' : ''}>
                <h5>${this.incidente ? 'Incidente' : item.title_marcador}</h5>
                <p>Fecha: ${formattedDate}</p>
                ${
									item.es_articulo && this.router.url !== `/ver-feature/${item._id}`
										? `<a href="/ver-feature/${item._id}" class="btn-ver-articulo">Ver Artículo</a>`
										: ''
								}
                <a href="https://www.google.com/maps/dir/?api=1&destination=${item.direccion_geo.latitud},${item.direccion_geo.longitud}" 
                   target="_blank" class="btn-direcciones">
                    Cómo llegar
                </a>
            </div>
        `;
		});

		return {content: content + '</div>'};
	}

	private setupSingleMarkerListeners(marker: google.maps.Marker, infoWindow: google.maps.InfoWindow, position: google.maps.LatLng) {
		if (this.activeInfoWindow) {
			this.activeInfoWindow.close();
		}
		infoWindow.open(this.mapCustom, marker);
		this.activeInfoWindow = infoWindow;

		if (this.mapCustom) {
			this.mapCustom.setCenter(position);
		}
	}

	verArticulo(fichaId: string): void {
		// Redirigir a la página de detalle de la feature sectorial como artículo
		this.router.navigate(['/ver-feature', fichaId]);
	}

	initFullscreenControl(): void {
		const elementToSendFullscreen = this.mapCustom.getDiv().firstChild as HTMLElement;
		const fullscreenControl = document.querySelector('.fullscreen-control') as HTMLElement;
		this.mapCustom.controls[google.maps.ControlPosition.RIGHT_TOP].push(fullscreenControl);
		fullscreenControl.onclick = () => {
			if (this.isFullscreen(elementToSendFullscreen)) {
				this.mapCustom.setOptions({mapTypeControl: true});
				this.load_fullscreen = false;
				this.exitFullscreen();
			} else {
				this.load_fullscreen = true;
				this.mapCustom.setOptions({mapTypeControl: false});
				this.requestFullscreen(elementToSendFullscreen);
			}
		};

		document.onfullscreenchange = () => {
			if (this.isFullscreen(elementToSendFullscreen)) {
				fullscreenControl.classList.add('is-fullscreen');
			} else {
				fullscreenControl.classList.remove('is-fullscreen');
			}
		};
	}
	isFullscreen(element: any): boolean {
		return (
			(document.fullscreenElement ||
				(document as any).webkitFullscreenElement ||
				(document as any).mozFullScreenElement ||
				(document as any).msFullscreenElement) == element
		);
	}
	requestFullscreen(element: any) {
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.webkitRequestFullScreen) {
			element.webkitRequestFullScreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.msRequestFullScreen) {
			element.msRequestFullScreen();
		}
	}
	exitFullscreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if ((document as any).webkitExitFullscreen) {
			(document as any).webkitExitFullscreen();
		} else if ((document as any).mozCancelFullScreen) {
			(document as any).mozCancelFullScreen();
		} else if ((document as any).msExitFullscreen) {
			(document as any).msExitFullscreen();
		}
	}

	onClickHandlerMap = async (e: any) => {
		if (this.mapCustom) {
			console.log(e.latLng.lat(), e.latLng.lng());
		}
	};
	ngOnDestroy(): void {
		// Limpia el mapa cuando el componente se destruye
		if (this.mapCustom) {
			google.maps.event.clearInstanceListeners(this.mapCustom);
			this.mapCustom = null;
			console.log('Mapa liberado');
		}
	}
}
