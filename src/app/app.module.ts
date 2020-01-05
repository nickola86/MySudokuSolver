import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { Sudoku } from "./sudoku.component";
import { Cell } from "./cell.component";

@NgModule({
  declarations: [AppComponent, Sudoku, Cell],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
