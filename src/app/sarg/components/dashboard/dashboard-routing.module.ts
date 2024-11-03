import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {UbiTanquesComponent} from './ubi-tanques/ubi-tanques.component';
import {AreaTanquesComponent} from './area-tanques/area-tanques.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{path: '', component: DashboardComponent},
			{path: 'ubi-tanques', component: UbiTanquesComponent},
			{path: 'area-tanques', component: AreaTanquesComponent},
		]),
	],
	exports: [RouterModule],
})
export class DashboardsRoutingModule {}
