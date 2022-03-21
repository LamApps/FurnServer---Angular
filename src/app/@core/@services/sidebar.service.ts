import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private currentCompany: number;

  constructor() { }

  setData(data:number){
    this.currentCompany = data;
  } 

  getData(){
    return this.currentCompany || 0;
  }

}
