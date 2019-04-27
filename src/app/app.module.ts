import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { CountUpModule } from 'countup.js-angular2';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { AppComponent } from './app.component';
import { BannerComponent } from './banner/banner.component';
import { WeatherSummaryComponent } from './weather-summary/weather-summary.component';
import { WeatherDetailComponent } from './weather-detail/weather-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    BannerComponent,
    WeatherSummaryComponent,
    WeatherDetailComponent
  ],
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatCardModule,
    HttpClientModule,
    CountUpModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
