import { Component, OnInit, NgZone } from "@angular/core";

const options = {autoSolve:true};

@Component({
  selector: "sudoku",
  templateUrl: "./sudoku.component.html",
  styleUrls: ["./sudoku.component.css"]
})
export class Sudoku implements OnInit {
  title = "Sudoku Solver";
  matrix = [];
  matrixHistory = [];
  solved=false;
  importData = "";

  constructor(zone: NgZone){}

  lock(){
    let list = this.matrixToList();
    let sublist = list.filter(e=>e.numbers.length==0);
    sublist.forEach(e=>e.fixed=true);
  }

  checkSudoku(){
    if(this.solved) return true;
    let sum = 9*9*10/2;
    let list = this.matrixToList();
    list = list.filter(e=>!!e.value).map(e=>e.value);
    let checkSum = list && list.length > 0 ? list.reduce((a,b)=>a+b) : 0;

    this.checkEmpty();
    this.checkRows();
    this.checkCols();
    this.checkBlocks();
    
    this.checkMosseInvalidanti();

    return this.matrixToList().filter(e=>!!e.wrongNumber).length === 0;
    
  }

  solveByStep(){
    options.autoSolve = false;
    this.solve();
  }
  autosolve(){
    options.autoSolve = true;
    this.solve();
  }

  solve(){
    let list = this.matrixToList();
    let sublist = list.filter(e=>e.numbers.length==1);
    try{
      if(sublist.length>0){
        sublist.forEach(e=>{
          e.value=e.numbers[0];
          this.cellChange(e);
          if(!options.autoSolve) throw {}; 
        });
        if(options.autoSolve) this.solve();
      }else{
        list = list.filter(e=> e.numbers.length> 0 );
        list = list.sort( (a,b) => a.numbers.length - b.numbers.length);
        list.forEach(e => {
          e.numbers.forEach(n => {
            let r = 0;
            let c = 0;
            let exist = false;

            //Cerco sulla stessa riga
            r = e.r-1;
            for(c = 0; c<9 && !exist; c++){
              if(this.matrix[r][c].numbers.length > 0){
                exist = this.matrix[r][c].numbers.indexOf(n) >= 0;
              }
            }

            //Cerco sulla stessa colonna
            c = e.c-1;
            for(r = 0; r<9 && !exist; r++){
              if(this.matrix[r][c].numbers.length > 0){
                exist = this.matrix[r][c].numbers.indexOf(n) >= 0;
              }
            }

            //Cerco nello stesso blocco
            let br = Math.floor((e.r-1)/3);
            let bc = Math.floor((e.c-1)/3);
            for(r=0; r<=2;r++){
              for(c=0; c<=2; c++){
                if(this.matrix[br*3+r][bc*3+c].numbers.length > 0){
                  exist = this.matrix[br*3+r][bc*3+c].numbers.indexOf(n) >= 0;
                }
              }
            }
            
            if(!exist){
              let lista = this.matrixToList();
              //Seleziono eventuali celle della stessa riga con gli stessi numbers residui
              let sublistRow = lista.filter(_e=> _e.r===e.r && this.isEqual(_e.numbers,e.numbers));
              let emptyInRow = lista.filter(_e=> _e.r===e.r && !_e.value);
              //Seleziono eventuali elementi della stessa colonna con gli stessi numbers residui
              let sublistCol = lista.filter(_e=>_e.c===e.c && this.isEqual(_e.numbers,e.numbers));
              let emptyInCol = lista.filter(_e=> _e.c===e.c && !_e.value);
              //Se ci sono:
              if(sublistRow.length>1 && sublistRow.length === emptyInRow.length || sublistCol.length>1 && sublistCol.length === emptyInCol.length){
                //Scrematura necessaria!
                this.pruning();
                //this.solve();
              }
              else{
                e.value=n;
                this.cellChange(e);
                if(options.autoSolve) this.solve();
                if(this.checkSudoku()){
                  //Condizione di stop del ForEach
                  throw {};  
                }else{
                  //Se la mossa corrente ha invalidato il sudoku annullala
                  this.undo();
                }
              }
            }

          });
        });
      }
    }catch(e){}
  }

  matrixToList(){
    let list = [];
    for(let r=0; r<=8;r++)
      for(let c=0; c<=8; c++)
        list.push(this.matrix[r][c]);
    return list;
  }

  cellChange(cell) {
    this.saveMatrix(cell);
    this.setMatrix(cell);
    this.updateNumbers(cell);
    this.checkSudoku();
  }

  saveMatrix(cell){
    let m = JSON.parse(JSON.stringify(this.matrix));
    m[cell.r-1][cell.c-1].value=undefined;
    this.matrixHistory.push(m);
  }
  setMatrix(cell){
    if(cell.value){
      this.matrix[cell.r-1][cell.c-1].value = cell.value;
      this.matrix[cell.r-1][cell.c-1].numbers = [];
    }
    if(cell.fixed){
      this.matrix[cell.r-1][cell.c-1].fixed = cell.fixed;
    }
  }

  updateNumbers(cell) {
    cell.numbers = [];
    this.removeValueFromRow(cell);
    this.removeValueFromCol(cell);
    this.removeValueFromBlock(cell);
  }

  removeValueFromRow(cell) {
    let v = cell.value;
    let r = cell.r - 1;
    for (let c = 0; c < 9; c++) {
      let numbers = this.matrix[r][c].numbers;
      if(numbers.indexOf(v)>=0) numbers.splice(numbers.indexOf(v), 1);
    }
  }
  removeValueFromCol(cell) {
    let v = cell.value;
    let c = cell.c - 1;
    for (let r = 0; r < 9; r++) {
      let numbers = this.matrix[r][c].numbers;
      if(numbers.indexOf(v)>=0) numbers.splice(numbers.indexOf(v), 1);
    }
  }
  removeValueFromBlock(cell) {
    let br = Math.floor((cell.r-1)/3);
    let bc = Math.floor((cell.c-1)/3);
    for(let r=1; r<=3;r++)
      for(let c=1; c<=3; c++)
        this.removeValueFromCell(cell.value, br*3+r,bc*3+c);
  }
  removeValueFromCell(v,r,c){
    let numbers = this.matrix[r-1][c-1].numbers;
    if(numbers.indexOf(v)>=0) numbers.splice(numbers.indexOf(v), 1);
  }

  checkEmpty() {
    let list = this.matrixToList().filter(e=>!e.value && e.numbers.length===0);
    list.forEach(n=>{
      n.wrongNumber=true;
    });
  }
  checkRows(){
    let list = this.matrixToList();
    for(let r=1; r<=9; r++){
      let sublist = list.filter(e=>e.r===r && !!e.value);
      sublist.forEach(n=>{
        if(sublist.filter(e=>e.value===n.value || e.numbers.length === 1 && this.isEqual(e.numbers,n.numbers)).length>1)
          n.wrongNumber=true;
      });
    }
  }
  checkCols() {
    let list = this.matrixToList();
    for(let c=1; c<=9; c++){
      let sublist = list.filter(e=>e.c===c && !!e.value);
      sublist.forEach(n=>{
        if(sublist.filter(e=>e.value===n.value || e.numbers.length === 1 && this.isEqual(e.numbers,n.numbers)).length>1)
          n.wrongNumber=true;
      });
    }
  }
  checkBlocks() {
    let list = this.matrixToList();
    for(let br=0; br<=2; br++){
      for(let bc=0; bc<=2; bc++){
        let minR=br*3+1,maxR=br*3+3,minC=bc*3+1,maxC=bc*3+3;
        let sublist = list.filter(e=>e.r>=minR && e.r<=maxR && !!e.value);
        sublist = sublist.filter(e=>e.c>=minC && e.c<=maxC && !!e.value);
        sublist.forEach(n=>{
          if(sublist.filter(e=>e.value===n.value || e.numbers.length === 1 && this.isEqual(e.numbers,n.numbers)).length>1)
            n.wrongNumber=true;
        });
      } 
    }
  }

  checkMosseInvalidanti(){
    let list = this.matrixToList();
    for(let r=1; r<=9; r++){
      let sublist = list.filter(e=>e.r===r && !e.value);
      sublist.forEach(n=>{
        if(sublist.filter(e=>e.numbers.length === 1 && this.isEqual(e.numbers,n.numbers)).length>1)
          n.wrongNumber=true;
      });
    }
    for(let c=1; c<=9; c++){
      let sublist = list.filter(e=>e.c===c && !e.value);
      sublist.forEach(n=>{
        if(sublist.filter(e=>e.numbers.length === 1 && this.isEqual(e.numbers,n.numbers)).length>1)
          n.wrongNumber=true;
      });
    }
    for(let br=0; br<=2; br++){
      for(let bc=0; bc<=2; bc++){
        let minR=br*3+1,maxR=br*3+3,minC=bc*3+1,maxC=bc*3+3;
        let sublist = list.filter(e=>e.r>=minR && e.r<=maxR && !e.value);
        sublist = sublist.filter(e=>e.c>=minC && e.c<=maxC && !e.value);
        sublist.forEach(n=>{
          if(sublist.filter(e=>e.numbers.length === 1 && this.isEqual(e.numbers,n.numbers)).length>1)
            n.wrongNumber=true;
        });
      } 
    }
  }

  pruning(){
    let pruned=false;
    let lista = this.matrixToList();
    lista.filter(e=>e.numbers.length>0).forEach(e=>{
      //Seleziono eventuali elementi della stessa riga con gli stessi numbers residui
      let sublistRow = lista.filter(_e=> _e.r===e.r && this.isEqual(_e.numbers,e.numbers));
      let emptyInRow = lista.filter(_e=> _e.r===e.r && !_e.value);
      //Seleziono eventuali elementi della stessa colonna con gli stessi numbers residui
      let sublistCol = lista.filter(_e=>_e.c===e.c && this.isEqual(_e.numbers,e.numbers));
      let emptyInCol = lista.filter(_e=> _e.c===e.c && !_e.value);
      //Se ci sono:
      console.log("sublistRow: ",sublistRow);
      console.log("sublistCol: ",sublistCol);
      console.log("e",e);
      if(sublistRow.length>1 && sublistRow.length === emptyInRow.length){
        //Posso scartare quei numbers dalle altre celle nel blocco corrente che NON sono sulla riga corrente
        let minR=Math.floor((e.r-1)/3)*3;
        let maxR=minR+2;
        let minC=Math.floor((e.c-1)/3)*3;
        let maxC=minC+2;
        console.log("minR",minR);
        console.log("maxR",maxR);
        console.log("minC",minC);
        console.log("maxC",maxC);
        for(let r=minR;r<=maxR;r++){
          for(let c=minC;c<=maxC;c++){
            let numbers = this.matrix[r][c].numbers;
            console.log("this.matrix["+r+"]["+c+"]",this.matrix[r][c]);
            if(r != e.r-1 && numbers.length>0 && !this.isEqual(numbers,e.numbers) ){
              e.numbers.forEach(n=>{
                if(numbers.indexOf(n)>=0) {
                  numbers.splice(numbers.indexOf(n), 1);
                  pruned=true;
                }
              });
            }
          }
        }
      }
      //Se ci sono:
      if(sublistCol.length>1 && sublistCol.length === emptyInCol.length){
        //Posso scartare quei numbers dalle altre celle nel blocco corrente che NON sono sulla colonna corrente
        let minR=Math.floor((e.r-1)/3)*3;
        let maxR=minR+2;
        let minC=Math.floor((e.c-1)/3)*3;
        let maxC=minC+2;
        for(let r=minR;r<=maxR;r++){
          for(let c=minC;c<=maxC;c++){
            let numbers = this.matrix[r][c].numbers;
            if(c != e.c-1 && numbers.length>0 && !this.isEqual(numbers,e.numbers) ){
              e.numbers.forEach(n=>{
                if(numbers.indexOf(n)>=0){
                  numbers.splice(numbers.indexOf(n), 1);
                  pruned=true;
                }
              });
            }
          }
        }
      }
    });
    //Se hai potato, prova ancora!
    if(pruned) this.pruning();
  }


  isEqual(a,b){
    return JSON.stringify(a)===JSON.stringify(b)
  }

  undo() {
    var m = this.matrixHistory.pop();
    this.matrix = m;
  }

  ngOnInit() {
    this.initEmptyMatrix();
    this.mockSchema();
  }



  initEmptyMatrix() {
    this.solved=false;
    for (let i = 0; i < 9; i++) {
      this.matrix[i] = [];
      for (let j = 0; j < 9; j++) {
        let cell = {
          r: i + 1,
          c: j + 1,
          value: undefined,
          numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        };
        this.matrix[i][j] = cell;
      }
    }
    this.matrixHistory.push(JSON.parse(JSON.stringify(this.matrix)));
  }


  mockSchema(){    
    this.cellChange({r:1,c:8,value:6,fixed:true});
    this.cellChange({r:1,c:9,value:4,fixed:true});
    this.cellChange({r:2,c:2,value:2,fixed:true});
    this.cellChange({r:2,c:3,value:9,fixed:true});
    this.cellChange({r:2,c:4,value:8,fixed:true});
    this.cellChange({r:2,c:5,value:3,fixed:true});
    this.cellChange({r:3,c:1,value:5,fixed:true});
    this.cellChange({r:3,c:9,value:3,fixed:true});
    this.cellChange({r:4,c:1,value:1,fixed:true});
    this.cellChange({r:4,c:2,value:7,fixed:true});
    this.cellChange({r:4,c:3,value:5,fixed:true});
    this.cellChange({r:4,c:4,value:9,fixed:true});
    this.cellChange({r:4,c:5,value:4,fixed:true});
    this.cellChange({r:4,c:6,value:2,fixed:true});
    this.cellChange({r:5,c:1,value:9,fixed:true});
    this.cellChange({r:5,c:3,value:8,fixed:true});
    this.cellChange({r:5,c:7,value:5,fixed:true});
    this.cellChange({r:5,c:9,value:2,fixed:true});
    this.cellChange({r:6,c:4,value:5,fixed:true});
    this.cellChange({r:6,c:5,value:8,fixed:true});
    this.cellChange({r:6,c:6,value:3,fixed:true});
    this.cellChange({r:6,c:7,value:1,fixed:true});
    this.cellChange({r:6,c:8,value:9,fixed:true});
    this.cellChange({r:6,c:9,value:7,fixed:true});
    this.cellChange({r:7,c:1,value:6,fixed:true});
    this.cellChange({r:7,c:9,value:9,fixed:true});
    this.cellChange({r:8,c:5,value:7,fixed:true});
    this.cellChange({r:8,c:6,value:5,fixed:true});
    this.cellChange({r:8,c:7,value:6,fixed:true});
    this.cellChange({r:8,c:8,value:2,fixed:true});
    this.cellChange({r:9,c:1,value:3,fixed:true});
    this.cellChange({r:9,c:2,value:1,fixed:true});
  }

  import(){
    this.initEmptyMatrix();
    var lines = this.importData.split("\n");
    lines.forEach((line,r)=>{
      line.split('').forEach((char,c)=>{
        let v = +char;
        this.cellChange({r:r+1,c:c+1,value:v,fixed:true});
      });
    })
  }

}
