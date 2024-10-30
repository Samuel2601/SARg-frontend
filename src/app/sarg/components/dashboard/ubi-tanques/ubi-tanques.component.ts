import {Component} from '@angular/core';
import {ImportsModule} from 'src/app/sarg/service/import';
import {UbiTanques, UbiTanquesService} from 'src/app/sarg/service/ubi-tanques.service';

interface Column {
	field: string;
	header: string;
	visible: boolean;
}

@Component({
	selector: 'app-ubi-tanques',
	standalone: true,
	imports: [ImportsModule],
	templateUrl: './ubi-tanques.component.html',
	styleUrl: './ubi-tanques.component.scss',
})
export class UbiTanquesComponent {
	data: any[] = [];
	totalRecords: number = 0;
	page: number = 1;
	limit: number = 10;
	search: string = '';
	filter: string = '';
	fields: string = 'id,sector,capacidad,numero,puntos,x,y,cotaM,volumenM';

	constructor(private ubiTanquesService: UbiTanquesService) {}

	ngOnInit() {
		this.loadData();
	}
	loading: boolean = true;
	loadData() {
		this.loading = true;
		this.ubiTanquesService.findAll(this.page, this.limit, this.filter, this.search, this.fields).subscribe((response: any) => {
			this.data = response.data;
			this.totalRecords = response.total;
			console.log(response);
			this.loading = false;
		});
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
}
