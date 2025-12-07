import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';  
import { NgChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from 'ng-apexcharts'; 
import { RouterModule, Routes } from '@angular/router';

import { App } from './app';
import { Dashboard } from './dashboard/dashboard';
import { PopulationPyramids } from './population-pyramids/population-pyramids';

const routes: Routes = [
  { path: '', component: Dashboard },  // default route
  { path: 'population-pyramids', component: PopulationPyramids }
];
@NgModule({
  declarations: [
    App,
    Dashboard,
    PopulationPyramids
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgChartsModule,
    NgApexchartsModule,
    RouterModule.forRoot(routes)         
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }



