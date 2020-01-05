import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "cell",
  templateUrl: "./cell.component.html",
  styleUrls: ["./cell.component.css"]
})
export class Cell implements OnInit {
  @Input() cell;

  @Output() cellChange = new EventEmitter();

  toNumber() {
    if(this.cell.value && this.cell.value!==0 && this.cell.value!=='' && !isNaN(+this.cell.value)){
      this.cell.value = +this.cell.value;
      this.cellChange.emit(this.cell);
    }else{
      this.cell.value = undefined;
    }
  }
  
  ngOnInit(){ }
}
