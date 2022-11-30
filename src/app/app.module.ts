import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './crud-grid/content/material/material.module';
import { CrudGridModule } from './crud-grid/crud-grid.module';
import { MappingComponent } from './mapping/mapping.component';

@NgModule({
  declarations: [
    AppComponent,
    MappingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    CrudGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
