import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {UbiTanquesComponent} from './ubi-tanques/ubi-tanques.component';
import {AreaTanquesComponent} from './area-tanques/area-tanques.component';
import {LineaConduccionComponent} from './linea-conduccion/linea-conduccion.component';
import {TubWincheleComponent} from './tub-winchele/tub-winchele.component';
import {GeoPredioGeneralComponent} from './geo-predio-general/geo-predio-general.component';

@NgModule({
	imports: [
		RouterModule.forChild([
			{path: '', component: DashboardComponent},
			{path: 'ubi-tanques', component: UbiTanquesComponent},
			{path: 'area-tanques', component: AreaTanquesComponent},
			{path: 'linea-conduccion', component: LineaConduccionComponent},
			{path: 'tub-winchele', component: TubWincheleComponent},
			{path: 'geo-predio-general', component: GeoPredioGeneralComponent},
		]),
	],
	exports: [RouterModule],
})
export class DashboardsRoutingModule {}
