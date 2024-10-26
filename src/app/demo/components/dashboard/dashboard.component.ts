import {Component, OnInit, OnDestroy} from '@angular/core';
import {MenuItem} from 'primeng/api';
import {Product} from '../../api/product';
import {Subscription, debounceTime} from 'rxjs';
import {LayoutService} from 'src/app/layout/service/app.layout.service';
import {GeoService} from '../../service/geo.service';
import {GeoFeature} from '../../api/poligon';

@Component({
	templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
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
	ngOnInit() {
		this.initChart();
		this.geoService.getNeighborhoods().subscribe(
			(data) => {
				this.features = data.features;
				console.log(this.features);
			},
			(error) => console.error('Error:', error),
		);

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
}
