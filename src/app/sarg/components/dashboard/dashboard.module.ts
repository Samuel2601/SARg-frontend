import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DashboardComponent} from './dashboard.component';
import {ChartModule} from 'primeng/chart';
import {MenuModule} from 'primeng/menu';
import {TableModule} from 'primeng/table';
import {ButtonModule} from 'primeng/button';
import {StyleClassModule} from 'primeng/styleclass';
import {PanelMenuModule} from 'primeng/panelmenu';
import {DashboardsRoutingModule} from './dashboard-routing.module';
import {MapaMostrarFichasComponent} from '../mapa-mostrar-fichas/mapa-mostrar-fichas.component';
import {UbiTanquesComponent} from './ubi-tanques/ubi-tanques.component';
import {AreaTanquesComponent} from './area-tanques/area-tanques.component';
import {UnificadoTanquesComponent} from './unificado-tanques/unificado-tanques.component';
import {LineaConduccionComponent} from './linea-conduccion/linea-conduccion.component';
import {TubWincheleComponent} from './tub-winchele/tub-winchele.component';
import {GeoPredioGeneralComponent} from './geo-predio-general/geo-predio-general.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ChartModule,
		MenuModule,
		TableModule,
		StyleClassModule,
		PanelMenuModule,
		ButtonModule,
		DashboardsRoutingModule,
		MapaMostrarFichasComponent,
		UbiTanquesComponent,
		AreaTanquesComponent,
		UnificadoTanquesComponent,
		LineaConduccionComponent,
		TubWincheleComponent,
		GeoPredioGeneralComponent,
	],
	declarations: [DashboardComponent],
})
export class DashboardModule {}
