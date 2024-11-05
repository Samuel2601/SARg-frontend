import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ImportsModule} from 'src/app/sarg/service/import';
import {MapaMostrarFichasComponent} from '../../mapa-mostrar-fichas/mapa-mostrar-fichas.component';
import {GeoPredioGeneralService} from 'src/app/sarg/service/geo-predio-general.service';
import {PrimeNGConfig} from 'primeng/api';

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

	data: any[] = [];
	totalRecords: number = 0;
	page: number = 1;
	limit: number = 10;
	search: string = '';
	filter: string = '';

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

	ngOnInit() {
		this.loadData();
		this.primengConfig.ripple = true;
	}

	loading: boolean = true;
	@Output() dataUpdated = new EventEmitter<void>();

	loadData() {
		const selectedFields = this.columns
			.filter((col) => col.selected)
			.map((col) => col.field)
			.join(',');

		this.loading = true;
		this.geoPredioGeneralService.findAll(this.page, this.limit, this.filter, this.search, selectedFields).subscribe((response: any) => {
			// Transformar los datos para renombrar 'poligono' a 'geom' y eliminar 'poligono'
			this.data = response.data.map((item: any) => {
				const {poligono, ...rest} = item; // Desestructuración para extraer 'poligono' y mantener el resto
				return {
					...rest,
					geom: poligono, // Renombrar 'poligono' a 'geom'
				};
			});

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
