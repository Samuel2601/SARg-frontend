import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {AppLayoutComponent} from './layout/app.layout.component';

@NgModule({
	imports: [
		RouterModule.forRoot(
			[
				{
					path: '',
					component: AppLayoutComponent,
					children: [
						{path: '', loadChildren: () => import('./demo/components/dashboard/dashboard.module').then((m) => m.DashboardModule)},
						{path: 'pages', loadChildren: () => import('./demo/components/pages/pages.module').then((m) => m.PagesModule)},
					],
				},
				{path: 'auth', loadChildren: () => import('./demo/components/auth/auth.module').then((m) => m.AuthModule)},
				{path: '**', redirectTo: '/notfound'},
			],
			{scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload'},
		),
	],
	exports: [RouterModule],
})
export class AppRoutingModule {}
