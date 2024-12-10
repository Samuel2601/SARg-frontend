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
	@Input() dimencion!: {width: string; height: string};

	@Input() feature!: any;
	@Input() key_cat!: string;
	@Input() key_cat_label!: string;
	@Input() columns_info!: any[];

	@Input() incidente!: boolean;

	mapCustom: google.maps.Map;
	load_fullscreen: boolean = false;

	features_arr: any[];

	constructor(private router: Router, private googlemaps: GoogleMapsService, private datePipe: DatePipe) {}
	// Estilos dinámicos para el mapa
	mapStyle: {[key: string]: string} = {};
	async ngOnInit() {
		await this.initMap();
		this.mapStyle = {
			width: this.dimencion?.width || '100%', // Valor predeterminado: 100% de ancho
			height: this.dimencion?.height || '400px', // Valor predeterminado: 400px de alto
		};
	}
	mapStyles: google.maps.MapTypeStyle[] = [
		{
			featureType: 'poi',
			stylers: [{visibility: 'off'}], // Oculta puntos de interés
		},
		{
			featureType: 'transit',
			stylers: [{visibility: 'off'}], // Oculta transporte público
		},
		{
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{visibility: 'on'}], // Mantiene la geometría de las carreteras
		},
		{
			featureType: 'road',
			elementType: 'labels',
			stylers: [{visibility: 'on'}], // Mantiene las etiquetas de las carreteras
		},
		{
			featureType: 'administrative',
			elementType: 'labels',
			stylers: [{visibility: 'off'}], // Oculta etiquetas administrativas
		},
	];

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
				styles: this.mapStyles, // Aplica el estilo personalizado
			});
			this.initFullscreenControl();
			this.initFeature(this.feature);
		});
	}

	async initFeature(feature: any) {
		if (feature) {
			this.features_arr = [];
			if (Array.isArray(feature)) {
				this.features_arr = feature;
			} else {
				this.features_arr = [feature];
			}
			console.log(this.features_arr);
			await this.getcategorias();
			await this.marcadoresmapa();
		}
	}
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
	private polygons: google.maps.Polygon[] = []; // Array para almacenar los polígonos
	private polylines: google.maps.Polyline[] = [];

	async clearAll() {
		this.clearPolygons();
		this.clearPolylines();
		this.clearMarkerClusterer();
	}
	// Método para limpiar todos los polígonos del mapa
	async clearPolygons() {
		this.polygons.forEach((polygon) => {
			polygon.setMap(null); // Elimina el polígono del mapa
		});
		this.polygons = []; // Vacía el array de polígonos
	}
	// Método para limpiar todos los polígonos del mapa
	async clearPolylines() {
		this.polylines.forEach((polyline) => {
			polyline.setMap(null); // Elimina la polilínea del mapa
		});
		this.polylines = []; // Vacía el array de polilíneas
	}
	async clearMarkerClusterer() {
		// Limpiar marcadores y grupos existentes
		this.markers.forEach((marker) => {
			marker.setMap(null);
		});
		this.markers = [];
		this.markerGroups = [];

		if (this.markerCluster) {
			this.markerCluster.clearMarkers();
		}
	}

	async marcadoresmapa() {
		try {
			const bounds = new google.maps.LatLngBounds();

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
					}

					// Convertir coordenadas de UTM a latitud/longitud utilizando el CRS detectado
					//const [lat, lng] = proj4(crsName, proj4.WGS84, [coordinates[0], coordinates[1]]);
					const position = new google.maps.LatLng(coordinates[1], coordinates[0]);

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
				// Si es un polígono o un multipolígono, agregar lógica adicional
				else if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
					const polys = geomType === 'Polygon' ? [coordinates] : coordinates;
					polys.forEach((polygonCoords: any) => {
						polygonCoords.forEach((ring: any) => {
							const path = ring.map((coord: any) => {
								// Convertir coordenadas de UTM a latitud/longitud
								//const [lat, lng] = proj4(crsName, proj4.WGS84, [...coord]);
								const position = new google.maps.LatLng(coord[1], coord[0]);
								bounds.extend(position);
								return position;
							});

							// Calcular el área del polígono para determinar el zIndex
							let polygonArea = 0;
							try {
								polygonArea = google.maps.geometry.spherical.computeArea(path);
							} catch (error) {
								console.error('Error al calcular el área del polígono:', error);
							}
							const zIndexValue = Math.round(1000 - polygonArea);

							// Obtener los valores de las variables CSS
							const rootStyle = getComputedStyle(document.documentElement);
							const primaryColor = rootStyle.getPropertyValue('--highlight-text-color').trim();
							const surfaceColor = rootStyle.getPropertyValue('--text-color').trim();

							// Crear el polígono con el zIndex calculado
							const polygon = new google.maps.Polygon({
								paths: path,
								strokeColor: surfaceColor,
								strokeOpacity: 0.8,
								strokeWeight: 2,
								fillColor: primaryColor,
								fillOpacity: 0.35,
								zIndex: zIndexValue, // Usar el zIndex basado en el tamaño del área
							});
							polygon.setMap(this.mapCustom);
							this.polygons.push(polygon); // Guardar el polígono en el array

							// Escuchar el evento de clic en el polígono
							google.maps.event.addListener(polygon, 'click', (event) => {
								// Cerrar el InfoWindow anterior si existe
								if (this.activeInfoWindow) {
									this.activeInfoWindow.close();
								}

								// event.latLng contiene la posición donde se hizo clic
								const clickPosition = {
									lat: event.latLng.lat(),
									lng: event.latLng.lng(),
								};

								// Crear y abrir un nuevo InfoWindow
								this.activeInfoWindow = this.createInfoWindow(item, clickPosition);
								this.activeInfoWindow.setPosition(clickPosition);
								this.activeInfoWindow.open(this.mapCustom);
							});
						});
					});
				} else if (geomType === 'MultiLineString') {
					// MultiLineString contiene múltiples líneas
					coordinates.forEach((lineString: any) => {
						const path = lineString.map((coord: any) => {
							// Convertir coordenadas de UTM a latitud/longitud
							const [lat, lng] = proj4(crsName, proj4.WGS84, [...coord]);
							const position = new google.maps.LatLng(coord[1], coord[0]); //(lng, lat);
							bounds.extend(position);
							return position;
						});

						// Obtener los valores de las variables CSS
						const rootStyle = getComputedStyle(document.documentElement);
						const primaryColor = rootStyle.getPropertyValue('--highlight-text-color').trim();
						const surfaceColor = rootStyle.getPropertyValue('--text-color').trim();

						// Crear la polilínea
						const polyline = new google.maps.Polyline({
							path: path,
							strokeColor: primaryColor,
							strokeOpacity: 0.8,
							strokeWeight: 3, // Puedes ajustar el grosor de la línea aquí
						});

						polyline.setMap(this.mapCustom); // Agregar la polilínea al mapa
						this.polylines.push(polyline); // Guardar la polilínea en el array (si prefieres un array separado, usa otro)

						// Escuchar el evento de clic en la polilínea
						google.maps.event.addListener(polyline, 'click', (event) => {
							// Cerrar el InfoWindow anterior si existe
							if (this.activeInfoWindow) {
								this.activeInfoWindow.close();
							}

							const clickPosition = {
								lat: event.latLng.lat(),
								lng: event.latLng.lng(),
							};

							// Crear y abrir un nuevo InfoWindow
							this.activeInfoWindow = this.createInfoWindow(item, clickPosition);
							this.activeInfoWindow.setPosition(clickPosition);
							this.activeInfoWindow.open(this.mapCustom);
						});
					});
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
				if (this.markers.length > 0) {
					this.markerCluster = new MarkerClusterer({
						map: this.mapCustom,
						markers: this.markers,
					});
				}

				this.mapCustom.fitBounds(bounds);

				// Agregar el listener de zoom
				google.maps.event.addListener(this.mapCustom, 'zoom_changed', () => {
					const zoomLevel = this.mapCustom.getZoom();

					// Controlar la visibilidad de los polígonos
					/*this.polygons.forEach((polygon) => {
						if (zoomLevel <= 15) {
							polygon.setMap(this.mapCustom); // Mostrar en zoom lejano
						} else {
							polygon.setMap(null); // Ocultar en zoom cercano
						}
					});*/

					// Controlar la visibilidad de las líneas
					this.polylines.forEach((polyline) => {
						if (zoomLevel > 14) {
							polyline.setMap(this.mapCustom); // Mostrar en zoom cercano
						} else {
							polyline.setMap(null); // Ocultar en zoom lejano
						}
					});
				});
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

	private createInfoWindow(item: any, coordinates_poligon?: {lat: number; lng: number}): google.maps.InfoWindow {
		// Convertir coordenadas usando el CRS especificado, si existe
		const crsName = item.geom?.crs?.properties?.name || 'EPSG:32617'; // Usa 'EPSG:32617' como predeterminado
		const coordinates = item.geom?.coordinates ? item.geom?.coordinates : coordinates_poligon;
		let lat = coordinates_poligon?.lat || null,
			lng = coordinates_poligon?.lng || null;

		if (coordinates && crsName && !coordinates_poligon) {
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

		// Crear contenido del InfoWindow
		const infoContent = this.buildInfoContent(item, lng, lat);
		const columns_headers =
			(this.columns_info &&
				this.columns_info.length > 0 &&
				this.columns_info.find((element: any) => {
					if (element.visible && element.selected && element.field != 'id') {
						return element;
					}
				})) ||
			null;

		return new google.maps.InfoWindow({
			headerContent: columns_headers ? item[columns_headers.field] : 'Información',
			content: infoContent,
			maxWidth: 400,
		});
	}

	// Método auxiliar para construir el contenido de InfoWindow dinámicamente
	private buildInfoContent(item: any, lat: number, lng: number): string {
		let infoContent = `<div class="info-window-content">`;
		if (this.columns_info && this.columns_info.length > 0) {
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
		const geomType = item.geom?.type || '';
		// Agregar enlace de Google Maps, si las coordenadas están disponibles
		if (lat && lng && geomType === 'Point') {
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
				url: item.icono_marcador || 'https://i.postimg.cc/FHd2yrXM/alfiler.png',
				scaledSize: this.getMarkerSize(item),
			},
		});
	}

	private getMarkerSize(item: any): google.maps.Size {
		const isPast = new Date(item.fecha_evento).getTime() < new Date().getTime();
		const hasCustomIcon = item.icono_marcador && item.icono_marcador !== 'https://i.postimg.cc/FHd2yrXM/alfiler.png';

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
