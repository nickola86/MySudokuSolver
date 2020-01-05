import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "cell",
  templateUrl: "./cell.component.html",
  styleUrls: ["./cell.component.css"]
})
export class Cell implements OnInit {
  @Input() cell;

  ngOnInit() {}
}
