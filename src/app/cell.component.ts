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
    this.cell.value = +this.cell.value;
  }

  emitChange() {
    this.cellChange.emit(this.cell);
  }
}
