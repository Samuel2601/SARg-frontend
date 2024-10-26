import {NgModule} from '@angular/core';
import {HashLocationStrategy, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AppLayoutModule} from './layout/app.layout.module';

@NgModule({
	declarations: [AppComponent],
	imports: [AppRoutingModule, AppLayoutModule],
	providers: [{provide: LocationStrategy, useClass: PathLocationStrategy}],
	bootstrap: [AppComponent],
})
export class AppModule {}
