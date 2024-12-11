import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ImportsModule} from 'src/app/sarg/service/import';
import {PrimeNGConfig} from 'primeng/api';
import {TubWincheleService} from 'src/app/sarg/service/tub-winchele.service';
import {MapaMostrarFichasComponent} from '../../mapa-mostrar-fichas/mapa-mostrar-fichas.component';
import { IndexedDbService } from 'src/app/sarg/service/indexed-db.service';
import { DialogService } from 'primeng/dynamicdialog';
import { TableDialogComponent } from 'src/app/sarg/core/table-dialog/table-dialog.component';

interface Column {
	field: string;
	header: string;
	visible: boolean;
	selected: boolean;
	disabled_visible: boolean;
	disabled_selected: boolean;
}

@Component({
	selector: 'app-tub-winchele',
	standalone: true,
	imports: [ImportsModule, MapaMostrarFichasComponent,TableDialogComponent],
	templateUrl: './tub-winchele.component.html',
	styleUrls: ['./tub-winchele.component.scss'],
    providers: [DialogService],
})
export class TubWincheleComponent {
	@Input() viewChildBoolean: boolean = true;

	data: any[] = [];
	totalRecords: number = 0;
	page: number = 1;
	limit: number = 10;
	search: string = '';
	filter: string = '';
	columns: Column[] = [
		{field: 'id', header: 'ID', visible: true, selected: true, disabled_selected: true, disabled_visible: true},
		{field: 'geom', header: 'Geolocalización', visible: false, selected: true, disabled_selected: true, disabled_visible: false},
		{field: 'fid', header: 'FID', visible: false, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'entity', header: 'Entidad', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'layer', header: 'Capa', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'color', header: 'Color', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'linetype', header: 'Tipo de Línea', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'elevation', header: 'Elevación', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'linewt', header: 'Peso de Línea', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'refname', header: 'Nombre de Referencia', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'nivel', header: 'Nivel', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'e22', header: 'E22', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'diametro', header: 'Diámetro', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'tanque', header: 'Tanque', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
		{field: 'canton', header: 'Cantón', visible: true, selected: true, disabled_selected: false, disabled_visible: false},
	];

	displayColumnDialog: boolean = false;
	columnOrderList: Column[] = [...this.columns];
	first: number = 0;

	constructor(
		private tubWincheleService: TubWincheleService,
		private primengConfig: PrimeNGConfig,
		private indexedDbService: IndexedDbService,
		private dialogService: DialogService,
	) {}

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
		this.tubWincheleService.findAll(this.page, this.limit, this.filter, this.search, selectedFields).subscribe((response: any) => {
			this.data = response.data;
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

	onpenTable() {
		this.dialogService.open(TableDialogComponent, {
			data: {
				data: this.data,
				columns: this.columns,
			},
			header: 'Detalles de la Tabla',
			width: '90vw', // Ancho responsive
			height: '90vh', // Alto responsive
			style: {
				padding: '0',
				background: 'rgba(0, 0, 0, 0.5)',
			},
			contentStyle: {
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				background: 'white',
				borderRadius: '0px',
			},
			breakpoints: {
				'960px': '75vw',
				'640px': '90vw',
			},
		});
	}

	// Opciones de filtrado
	filterOptions: any[] = [
		{label: 'Comienza con', value: 'startsWith'},
		{label: 'Contiene', value: 'contains'},
		{label: 'Termina con', value: 'endsWith'},
		{label: 'Igual a', value: 'equals'},
		{label: 'Diferente de', value: 'notEquals'},
	];

	async onFilterChange(event: any) {
		//console.log(event);
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
		//console.log(result, this.filter);
		if (result === this.filter) {
			result = null;
		}
		return result;
	}

	async applyFilters() {
		// Convierte los filtros en un string que puede pasarse a la consulta
		const filterString = this.buildFilterString(this.filters);
		//console.log('Filtro aplicado:', filterString);
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
		//console.log(result, this.filter);
		if (result === this.filter) {
			result = null;
		}
		return result;
	}

	openFilterDialog() {
		this.displayFilterDialog = true;
	}
}
