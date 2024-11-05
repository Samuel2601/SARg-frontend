import {Component, OnInit, OnDestroy, ViewChild, AfterViewInit} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {Product} from '../../api/product';
import {Subscription, debounceTime} from 'rxjs';
import {LayoutService} from 'src/app/layout/service/app.layout.service';
import {GeoService} from '../../service/geo.service';
import {GeoFeature} from '../../api/poligon';
import {UbiTanquesComponent} from './ubi-tanques/ubi-tanques.component';
import {AreaTanquesComponent} from './area-tanques/area-tanques.component';
import {MapaMostrarFichasComponent} from '../mapa-mostrar-fichas/mapa-mostrar-fichas.component';

@Component({
	templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
	items!: MenuItem[];

	products!: Product[];

	chartData: any;

	chartOptions: any;

	subscription!: Subscription;

	constructor(private geoService: GeoService, public layoutService: LayoutService) {
		this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe((config) => {
			this.initChart();
		});
	}
	features: GeoFeature[];
	is_mapa_mostrar_fichas: boolean = false;
	ngOnInit() {
		this.initChart();
		this.items = [
			{label: 'Add New', icon: 'pi pi-fw pi-plus'},
			{label: 'Remove', icon: 'pi pi-fw pi-minus'},
		];
	}

	initChart() {
		const documentStyle = getComputedStyle(document.documentElement);
		const textColor = documentStyle.getPropertyValue('--text-color');
		const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
		const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

		this.chartData = {
			labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
			datasets: [
				{
					label: 'First Dataset',
					data: [65, 59, 80, 81, 56, 55, 40],
					fill: false,
					backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
					borderColor: documentStyle.getPropertyValue('--bluegray-700'),
					tension: 0.4,
				},
				{
					label: 'Second Dataset',
					data: [28, 48, 40, 19, 86, 27, 90],
					fill: false,
					backgroundColor: documentStyle.getPropertyValue('--green-600'),
					borderColor: documentStyle.getPropertyValue('--green-600'),
					tension: 0.4,
				},
			],
		};

		this.chartOptions = {
			plugins: {
				legend: {
					labels: {
						color: textColor,
					},
				},
			},
			scales: {
				x: {
					ticks: {
						color: textColorSecondary,
					},
					grid: {
						color: surfaceBorder,
						drawBorder: false,
					},
				},
				y: {
					ticks: {
						color: textColorSecondary,
					},
					grid: {
						color: surfaceBorder,
						drawBorder: false,
					},
				},
			},
		};
	}

	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}
	ubiTanquesData: any[] = [];
	areaTanquesData: any[] = [];

	@ViewChild(UbiTanquesComponent) ubiTanquesComponent!: UbiTanquesComponent;
	@ViewChild(AreaTanquesComponent) areaTanquesComponent!: AreaTanquesComponent;
	@ViewChild(MapaMostrarFichasComponent) mapComponent!: MapaMostrarFichasComponent;

	// Método que recoge los datos de los subcomponentes
	loading: boolean = true;
	ngAfterViewInit() {
		this.collectData();
	}
	collectData() {
		this.ubiTanquesData = this.ubiTanquesComponent.data;
		this.areaTanquesData = this.areaTanquesComponent.data;

		this.onMapDataUpdated();
	}
	onMapDataUpdated() {
		this.loading = true;
		// Enviar los datos recogidos al componente de mapa
		this.mapComponent.initFeature([...this.ubiTanquesData, ...this.areaTanquesData]);
		this.loading = false;
	}

	// Puedes agregar métodos que los subcomponentes llamen al actualizar los datos
	onUbiTanquesDataUpdated() {
		this.ubiTanquesData = [];
		this.ubiTanquesData = this.ubiTanquesComponent.data;
		console.log(this.ubiTanquesData, this.areaTanquesData);
		this.onMapDataUpdated();
	}

	onAreaTanquesDataUpdated() {
		this.areaTanquesData = [];
		this.areaTanquesData = this.areaTanquesComponent.data;
		console.log(this.ubiTanquesData, this.areaTanquesData);
		this.onMapDataUpdated();
	}
}
