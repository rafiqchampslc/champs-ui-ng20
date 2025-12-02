import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';  
import { NgChartsModule } from 'ng2-charts';
import { NgApexchartsModule } from 'ng-apexcharts'; 

import { App } from './app';
import { Dashboard } from './dashboard/dashboard';

@NgModule({
  declarations: [
    App,
    Dashboard
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgChartsModule,
    NgApexchartsModule        
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }



