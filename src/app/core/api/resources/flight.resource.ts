import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/share';
import {of} from 'rxjs/index';
import {Observable} from 'rxjs/Observable';

import {environment} from '../../../../environments/environment';
import {flights} from '../mock.data';
import {Flight} from '../models/flight';

@Injectable({
  providedIn: 'root'
})
export class FlightResource {

  useMockData = false;
  baseUrl: string;
  resourceName = 'flight';

  constructor(private http: HttpClient) {
    this.baseUrl = [environment.baseUrl, this.resourceName].join('/');
  }

  findById(id: string): Observable<Flight> {
    const reqObj = {params: null}
    const params = new HttpParams().set('id', id);
    reqObj.params = params

    if (this.useMockData) {
      return of({...flights[0], id: id.toString()});
    }

    return this.http
      .get<Flight>(this.baseUrl, reqObj)
      .catch(error => Observable.throw(error.json()))

  }


  find(from: string, to: string): Observable<Flight[]> {
    const reqObj = {
      params: new HttpParams()
        .set('from', from || '')
        .set('to', to || '')
    }

    if (this.useMockData) {
      return of(flights);
    }

    return this
      .http
      .get<Flight[]>(this.baseUrl, reqObj)
      .catch(e => {
        console.log('error', e)
        let errMsg
        if (e instanceof HttpErrorResponse) {
          switch (e.status) {
            case 0:
              errMsg = 'You are offline'
              break
            default:
              errMsg = 'Client Error or Network Error'
          }
          return Observable.throw(errMsg)
        }
      })
  }

  post(flight: Flight): Observable<Flight> {
    return this
      .http
      .post<Flight>(this.baseUrl, flight)
      .share()
      .catch((e: HttpErrorResponse) => {
        let errMsg = 'Client Error or Network Error'

        if (e instanceof HttpErrorResponse) {
          switch (e.status) {
            case 0:
              errMsg = 'You are offline'
              break
            case 400:
              errMsg = e.message
              break
            case 500:
              errMsg = 'You got a 500! :-('
              break
            default:
              errMsg = 'Server Error'
          }

        }
        return Observable.throw({message: errMsg})
      })
  }

}
