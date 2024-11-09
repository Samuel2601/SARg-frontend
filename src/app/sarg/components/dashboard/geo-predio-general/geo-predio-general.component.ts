import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ImportsModule} from 'src/app/sarg/service/import';
import {MapaMostrarFichasComponent} from '../../mapa-mostrar-fichas/mapa-mostrar-fichas.component';
import {GeoPredioGeneralService} from 'src/app/sarg/service/geo-predio-general.service';
import {PrimeNGConfig} from 'primeng/api';
import {Table} from 'primeng/table';

interface Column {
	field: string;
	header: string;
	visible: boolean;
	selected: boolean;
	disabled_visible: boolean;
	disabled_selected: boolean;
}

@Component({
	selector: 'app-geo-predio-general',
	standalone: true,
	imports: [ImportsModule, MapaMostrarFichasComponent],
	templateUrl: './geo-predio-general.component.html',
	styleUrls: ['./geo-predio-general.component.scss'],
})
export class GeoPredioGeneralComponent {
	@Input() viewChildBoolean: boolean = true;
	@ViewChild('dt1') table!: Table;

	data: any[] = [];
	data_const: any[] = [];
	totalRecords: number = 0;
	page: number = 1;
	limit: number = 10;
	search: string = '';
	filter: string = '';

	// Opciones de filtrado
	filterOptions: any[] = [
		{label: 'Comienza con', value: 'startsWith'},
		{label: 'Contiene', value: 'contains'},
		{label: 'Termina con', value: 'endsWith'},
		{label: 'Igual a', value: 'equals'},
		{label: 'Diferente de', value: 'notEquals'},
	];

	async onFilterChange(event: any) {
		console.log(event);
		if (this.buildFilterStringTable(event.filters)) {
			this.data = event.filteredValue;

			this.onMapDataUpdated();
		}
	}
	@ViewChild(MapaMostrarFichasComponent) mapComponent!: MapaMostrarFichasComponent;
	async onMapDataUpdated() {
		if (this.mapComponent) {
			this.loading = true;
			// Enviar los datos recogidos al componente de mapa
			await this.mapComponent.clearAll();
			this.mapComponent.initFeature([...this.data]);
			this.loading = false;
		}
	}

	displayFilterDialog: boolean = false;
	filters: {[key: string]: string} = {}; // Almacenará los valores de los filtros para cada columna

	buildFilterStringTable(filters: any): string {
		const filterArray = [];
		for (const key in filters) {
			if (filters[key]) {
				filters[key].forEach((element: any) => {
					if (element.value) {
						const filterCondition = `${key}=${element.value}`;
						filterArray.push(filterCondition);
					}
				});
			}
		}
		let result = filterArray.join(',');
		console.log(result, this.filter);
		if (result === this.filter) {
			result = null;
		}
		return result;
	}

	async applyFilters() {
		// Convierte los filtros en un string que puede pasarse a la consulta
		const filterString = this.buildFilterString(this.filters);
		console.log('Filtro aplicado:', filterString);
		this.filter = filterString; // Actualiza el filtro actual para su comparación
		this.displayFilterDialog = false; // Cierra el diálogo
		await this.loadData();
	}
	buildFilterString(filters: any): string | null {
		const filterArray = [];
		for (const key in filters) {
			if (filters[key]) {
				const filterCondition = `${key}=${filters[key]}`;
				filterArray.push(filterCondition);
			}
		}
		let result = filterArray.join(',');
		console.log(result, this.filter);
		if (result === this.filter) {
			result = null;
		}
		return result;
	}

	openFilterDialog() {
		this.displayFilterDialog = true;
	}

	columns: Column[] = [
		{field: 'id', header: 'ID', visible: true, selected: true, disabled_selected: true, disabled_visible: true},
		{field: 'claveCatastral', header: 'Clave Catastral', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'poligono', header: 'Geometria', visible: false, selected: true, disabled_selected: true, disabled_visible: false},
		{
			field: 'claveCatastralAnterior',
			header: 'Clave Catastral Anterior',
			visible: true,
			selected: true,
			disabled_selected: false,
			disabled_visible: false,
		},
		{field: 'tipoPredio', header: 'Tipo de Predio', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'uso', header: 'Uso', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'agua', header: 'Agua', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'sanitarias', header: 'Sanitarias', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'energia', header: 'Energía', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{
			field: 'documentoPropietario',
			header: 'Documento Propietario',
			visible: true,
			selected: true,
			disabled_selected: false,
			disabled_visible: false,
		},
		{field: 'propietario', header: 'Propietario', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'tipoPersona', header: 'Tipo de Persona', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'personeria', header: 'Personería', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'area', header: 'Área', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
	];

	displayColumnDialog: boolean = false;
	columnOrderList: Column[] = [...this.columns];
	first: number = 0;

	constructor(private geoPredioGeneralService: GeoPredioGeneralService, private primengConfig: PrimeNGConfig) {}

	async ngOnInit() {
		await this.loadData();
		this.primengConfig.ripple = true;
	}

	loading: boolean = true;
	@Output() dataUpdated = new EventEmitter<void>();

	async loadData() {
		if (this.table) {
			this.table.clear();
		}
		const selectedFields = this.columns
			.filter((col) => col.selected)
			.map((col) => col.field)
			.join(',');

		this.loading = true;
		this.geoPredioGeneralService.findAll(this.page, this.limit, this.filter, this.search, selectedFields).subscribe((response: any) => {
			// Transformar los datos para renombrar 'poligono' a 'geom' y eliminar 'poligono'
			this.data = [];
			this.data_const = response.data.map((item: any) => {
				const {poligono, ...rest} = item; // Desestructuración para extraer 'poligono' y mantener el resto
				return {
					...rest,
					geom: poligono, // Renombrar 'poligono' a 'geom'
				};
			});
			this.data = this.data_const;
			this.onMapDataUpdated();
			this.notifyParent();
			this.totalRecords = response.total;
			this.updateRowsOptions();
			this.loading = false;
		});
	}

	notifyParent() {
		if (this.dataUpdated.observers.length > 0) {
			this.dataUpdated.emit();
		}
	}

	options: number[] = [5, 10, 20, 100, 1000, 5000, 10000, 15000];
	rowsOptions: number[] = [];

	updateRowsOptions() {
		this.rowsOptions = this.options.filter((option) => option <= this.totalRecords);
		this.rowsOptions.push(this.totalRecords);
		this.rowsOptions = Array.from(new Set(this.rowsOptions));
	}

	onSearchChange() {
		this.page = 1;
		this.loadData();
	}

	onPageChange(event: any) {
		this.page = event.page + 1;
		this.limit = event.rows;
		this.loadData();
	}

	openColumnDialog() {
		this.displayColumnDialog = true;
		this.columnOrderList = [...this.columns];
	}

	saveColumnSettings() {
		this.columns = [...this.columnOrderList];
		this.displayColumnDialog = false;
		this.loadData();
	}
}
