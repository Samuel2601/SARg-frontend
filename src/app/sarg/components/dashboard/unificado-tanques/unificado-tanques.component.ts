import {Component, OnInit} from '@angular/core';
import {ImportsModule} from 'src/app/sarg/service/import';
import {MapaMostrarFichasComponent} from '../../mapa-mostrar-fichas/mapa-mostrar-fichas.component';
import {UbiTanquesService} from 'src/app/sarg/service/ubi-tanques.service';
import {GeoService} from 'src/app/sarg/service/geo.service';
import {PrimeNGConfig} from 'primeng/api';
import {AreaTanquesService} from 'src/app/sarg/service/area-tanques.service';

interface Column {
	field: string;
	header: string;
	visible: boolean;
	selected: boolean;
	disabled_visible: boolean;
	disabled_selected: boolean;
}

@Component({
	selector: 'app-unificado-tanques',
	standalone: true,
	imports: [ImportsModule, MapaMostrarFichasComponent],
	templateUrl: './unificado-tanques.component.html',
	styleUrl: './unificado-tanques.component.scss',
})
export class UnificadoTanquesComponent {
	data_Ubitanque: any[] = [];
	totalRecords_Ubitanque: number = 0;
	page_Ubitanque: number = 1;
	limit_Ubitanque: number = 10;
	search_Ubitanque: string = '';
	filter_Ubitanque: string = '';

	data_Area: any[] = [];
	totalRecords_Area: number = 0;
	page_Area: number = 1;
	limit_Area: number = 10;
	search_Area: string = '';
	filter_Area: string = '';

	// Definición de columnas con encabezado, visibilidad y campo
	columnsUbiTanque: Column[] = [
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

	// Definición de columnas con encabezado, visibilidad y campo
	columnsAreaTanque: Column[] = [
		{field: 'id', header: 'ID', visible: true, selected: true, disabled_selected: true, disabled_visible: true},
		{field: 'geom', header: 'Geolocalización', visible: false, selected: true, disabled_selected: true, disabled_visible: false},
		{field: 'nomTanque', header: 'Nombre del Tanque', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'orden', header: 'Orden', visible: false, selected: false, disabled_selected: false, disabled_visible: false},
		{field: 'sector', header: 'Sector', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'capacidad', header: 'Capacidad', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'numero', header: 'Número', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
	];

	displayColumnDialog_Ubitanque: boolean = false; // Controla la visibilidad del diálogo
	columnOrderList_Ubitanque: Column[] = [...this.columnsUbiTanque]; // Crea una copia para la configuración de columnas

	displayColumnDialog_Area: boolean = false; // Controla la visibilidad del diálogo
	columnOrderList_Area: Column[] = [...this.columnsAreaTanque]; // Crea una copia para la configuración de columnas

	constructor(private ubiTanquesService: UbiTanquesService, private areaTanquesService: AreaTanquesService, private primengConfig: PrimeNGConfig) {}
	data: any[] = [];

	loading: boolean = true;

	async ngOnInit() {
		await this.loadDataUbiTanques();
		await this.loadData_Area();
		//console.log(this.data);
		this.primengConfig.ripple = true; // Habilita los efectos de ripple de PrimeNG
	}

	loading_Ubitanque: boolean = true;

	async loadDataUbiTanques() {
		const selectedFields = this.columnsUbiTanque
			.filter((col) => col.selected)
			.map((col) => col.field)
			.join(',');

		this.loading_Ubitanque = true;
		this.loading = true;
		this.ubiTanquesService
			.findAll(this.page_Ubitanque, this.limit_Ubitanque, this.filter_Ubitanque, this.search_Ubitanque, selectedFields)
			.subscribe((response: any) => {
				this.data_Ubitanque = response.data;
				this.data = this.data_Area;
				this.data = [...this.data, ...this.data_Ubitanque];
				this.totalRecords_Ubitanque = response.total;
				//console.log(this.data_Ubitanque);
				this.loading_Ubitanque = false;
				this.loading = false;
			});
	}

	onSearchChange_Ubitanque() {
		this.page_Ubitanque = 1; // Reset to first page on search
		this.loadDataUbiTanques();
	}

	onPageChange_Ubitanque(event: any) {
		this.page_Ubitanque = event.page + 1; // Increment page number
		this.limit_Ubitanque = event.rows; // Set limit
		this.loadDataUbiTanques();
	}

	// Abrir el diálogo de configuración de columnas
	openColumnDialog_Ubitanque() {
		this.displayColumnDialog_Ubitanque = true;
		this.columnOrderList_Ubitanque = [...this.columnsUbiTanque]; // Clonar para el reordenamiento
	}

	// Guardar la configuración de columnas y cerrar el diálogo

	saveColumnSettings_Ubitanque() {
		this.columnsUbiTanque = [...this.columnOrderList_Ubitanque];
		this.displayColumnDialog_Ubitanque = false;

		this.loadDataUbiTanques(); // Recargar datos con los campos actualizados
	}

	loading_Area: boolean = true;

	async loadData_Area() {
		const selectedFields = this.columnsAreaTanque
			.filter((col) => col.selected)
			.map((col) => col.field)
			.join(',');

		this.loading_Area = true;
		this.loading = true;
		this.areaTanquesService
			.findAll(this.page_Area, this.limit_Area, this.filter_Area, this.search_Area, selectedFields)
			.subscribe(async (response: any) => {
				this.data_Area = response.data;
				this.data = this.data_Ubitanque;
				this.data = [...this.data_Area, ...this.data];
				this.totalRecords_Area = response.total;
				//console.log(this.data_Area);
				this.loading_Area = false;
				this.loading = false;
			});
	}

	onSearchChange_Area() {
		this.page_Area = 1; // Reset to first page on search
		this.loadData_Area();
	}

	onPageChange_Area(event: any) {
		this.page_Area = event.page + 1; // Increment page number
		this.limit_Area = event.rows; // Set limit
		this.loadData_Area();
	}

	// Abrir el diálogo de configuración de columnas
	openColumnDialog_Area() {
		this.displayColumnDialog_Area = true;
		this.columnOrderList_Area = [...this.columnsAreaTanque]; // Clonar para el reordenamiento
	}

	// Guardar la configuración de columnas y cerrar el diálogo
	saveColumnSettings_Area() {
		this.columnsAreaTanque = [...this.columnOrderList_Area];
		this.displayColumnDialog_Area = false;
		this.loadData_Area(); // Recargar datos con los campos actualizados
	}

}
