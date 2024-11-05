import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PrimeNGConfig} from 'primeng/api';
import {ImportsModule} from 'src/app/sarg/service/import';
import {UbiTanques, UbiTanquesService} from 'src/app/sarg/service/ubi-tanques.service';
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
	selector: 'app-ubi-tanques',
	standalone: true,
	imports: [ImportsModule, MapaMostrarFichasComponent],
	templateUrl: './ubi-tanques.component.html',
	styleUrl: './ubi-tanques.component.scss',
})
export class UbiTanquesComponent {
	@Input() viewChildBoolean: boolean = true;

	data: any[] = [];
	totalRecords: number = 0;
	page: number = 1;
	limit: number = 10;
	search: string = '';
	filter: string = '';
	// Definición de columnas con encabezado, visibilidad y campo
	columns: Column[] = [
		{field: 'id', header: 'ID', visible: true, selected: true, disabled_selected: true, disabled_visible: true},
		{field: 'geom', header: 'Geolocalización', visible: false, selected: true, disabled_selected: true, disabled_visible: false},
		{field: 'puntos', header: 'Puntos', visible: false, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'x', header: 'X', visible: false, selected: false, disabled_selected: false, disabled_visible: false},
		{field: 'y', header: 'Y', visible: false, selected: false, disabled_selected: false, disabled_visible: false},
		{field: 'sector', header: 'Sector', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'cotaM', header: 'Cota M', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'volumenM', header: 'Volumen M', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'capacidad', header: 'Capacidad', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'numero', header: 'Número', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
	];

	displayColumnDialog: boolean = false; // Controla la visibilidad del diálogo
	columnOrderList: Column[] = [...this.columns]; // Crea una copia para la configuración de columnas
	first: number = 0;

	constructor(private ubiTanquesService: UbiTanquesService, private geoService: GeoService, private primengConfig: PrimeNGConfig) {}

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
		this.ubiTanquesService.findAll(this.page, this.limit, this.filter, this.search, selectedFields).subscribe((response: any) => {
			this.data = response.data;
			this.notifyParent();
			this.totalRecords = response.total;
			this.updateRowsOptions();
			this.loading = false;
		});
	}
	notifyParent() {
		if (this.dataUpdated.observers.length > 0) {
			this.dataUpdated.emit(); // Solo se emite si alguien está escuchando
		}
	}

	options: number[] = [5, 10, 20, 100, 1000];
	rowsOptions: number[] = []; // Para almacenar las opciones a mostrar
	// Método para actualizar las opciones de filas
	updateRowsOptions() {
		this.rowsOptions = this.options.filter((option) => option <= this.totalRecords);
		this.rowsOptions.push(this.totalRecords); // Asegúrate de incluir totalRecords
		this.rowsOptions = Array.from(new Set(this.rowsOptions)); // Elimina duplicados
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
