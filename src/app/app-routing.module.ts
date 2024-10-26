import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {AppLayoutComponent} from './layout/app.layout.component';
import {DashboardModule} from './sarg/components/dashboard/dashboard.module';
import {PagesModule} from './sarg/components/pages/pages.module';
import {AuthModule} from './sarg/components/auth/auth.module';

@NgModule({
	imports: [
		RouterModule.forRoot(
			[
				{
					path: '',
					component: AppLayoutComponent,
					children: [
						{path: '', loadChildren: () => import('./sarg/components/dashboard/dashboard.module').then((m) => m.DashboardModule)},
						{path: 'pages', loadChildren: () => import('./sarg/components/pages/pages.module').then((m) => m.PagesModule)},
					],
				},
				{path: 'auth', loadChildren: () => import('./sarg/components/auth/auth.module').then((m) => m.AuthModule)},
				{path: '**', redirectTo: '/notfound'},
			],
			{scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload'},
		),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
