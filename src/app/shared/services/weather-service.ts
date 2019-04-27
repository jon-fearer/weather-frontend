import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
 providedIn: 'root',
})
export class WeatherService {
  constructor(private http: HttpClient) { }

  // getCurrentTemp(): Observable<Object> {
  //     return this.http
  //         .get('http://localhost:4100/currentTemp');
  // }

  getTrailingTemps(): Observable<Object> {
      return this.http
          .get('http://localhost:4100/trailingTemps');
  }

  getHighsLows(): Observable<Object> {
      return this.http
          .get('http://localhost:4100/highsLows');
  }
}
