import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import {ImportsModule} from 'src/app/sarg/service/import';
import {AreaTanques, AreaTanquesService} from 'src/app/sarg/service/area-tanques.service';
import {MapaMostrarFichasComponent} from '../../mapa-mostrar-fichas/mapa-mostrar-fichas.component';
import {GeoService} from 'src/app/sarg/service/geo.service';

interface Column {
	field: string;
	header: string;
	visible: boolean;
	selected: boolean;
	disabled_visible: boolean;
	disabled_selected: boolean;
}

@Component({
	selector: 'app-area-tanques',
	standalone: true,
	imports: [ImportsModule, MapaMostrarFichasComponent],
	templateUrl: './area-tanques.component.html',
	styleUrls: ['./area-tanques.component.scss'],
})
export class AreaTanquesComponent {
	@Input() viewChildBoolean: boolean = true;

	data: AreaTanques[] = [];
	totalRecords: number = 0;
	page: number = 1;
	first: number = 0;
	limit: number = 5;
	search: string = '';
	filter: string = '';

	// Definición de columnas con encabezado, visibilidad y campo
	columns: Column[] = [
		{field: 'id', header: 'ID', visible: true, selected: true, disabled_selected: true, disabled_visible: true},
		{field: 'geom', header: 'Geolocalización', visible: false, selected: true, disabled_selected: true, disabled_visible: false},
		{field: 'nomTanque', header: 'Nombre del Tanque', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'orden', header: 'Orden', visible: false, selected: false, disabled_selected: false, disabled_visible: false},
		{field: 'sector', header: 'Sector', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'capacidad', header: 'Capacidad', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'numero', header: 'Número', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
	];

	displayColumnDialog: boolean = false; // Controla la visibilidad del diálogo
	columnOrderList: Column[] = [...this.columns]; // Crea una copia para la configuración de columnas

	constructor(private areaTanquesService: AreaTanquesService, private geoService: GeoService, private primengConfig: PrimeNGConfig) {}

	ngOnInit() {
		this.loadData();
		this.primengConfig.ripple = true; // Habilita los efectos de ripple de PrimeNG
	}

	loading: boolean = true;
	@Output() dataUpdated = new EventEmitter<void>();
	loadData() {
		const selectedFields = this.columns
			.filter((col) => col.selected)
			.map((col) => col.field)
			.join(',');

		this.loading = true;
		this.areaTanquesService.findAll(this.page, this.limit, this.filter, this.search, selectedFields).subscribe((response: any) => {
			console.log(response);
			this.data = response.data;
			this.notifyParent();
			this.totalRecords = response.total;
			this.loading = false;
		});
	}
	notifyParent() {
		if (this.dataUpdated.observers.length > 0) {
			this.dataUpdated.emit(); // Solo se emite si alguien está escuchando
		}
	}

	onSearchChange() {
		this.page = 1; // Reset to first page on search
		this.loadData();
	}

	onPageChange(event: any) {
		this.page = event.page + 1; // Increment page number
		this.limit = event.rows; // Set limit
		this.loadData();
	}

	// Abrir el diálogo de configuración de columnas
	openColumnDialog() {
		this.displayColumnDialog = true;
		this.columnOrderList = [...this.columns]; // Clonar para el reordenamiento
	}

	// Guardar la configuración de columnas y cerrar el diálogo
	saveColumnSettings() {
		this.columns = [...this.columnOrderList];
		this.displayColumnDialog = false;
		this.loadData(); // Recargar datos con los campos actualizados
	}
}
