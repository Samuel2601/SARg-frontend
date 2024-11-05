import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ImportsModule} from 'src/app/sarg/service/import';
import {PrimeNGConfig} from 'primeng/api';
import {TubWincheleService} from 'src/app/sarg/service/tub-winchele.service';
import {MapaMostrarFichasComponent} from '../../mapa-mostrar-fichas/mapa-mostrar-fichas.component';

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
	imports: [ImportsModule, MapaMostrarFichasComponent],
	templateUrl: './tub-winchele.component.html',
	styleUrls: ['./tub-winchele.component.scss'],
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

	constructor(private tubWincheleService: TubWincheleService, private primengConfig: PrimeNGConfig) {}

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
}
