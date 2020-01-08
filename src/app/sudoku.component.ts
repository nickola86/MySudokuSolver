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
  importData = "000039700\n000708250\n008005036\n010000698\n800000002\n569000070\n370800900\n025304000\n006250000";
  exportData="";
  cleanupEffective=false;
  loopDetection=false;

  constructor(zone: NgZone){}

  lock(){
    let list = this.matrixToList();
    let sublist = list.filter(e=>e.numbers.length==0);
    sublist.forEach(e=>e.fixed=true);
  }
  export(){
    this.exportData=this.matrix.map(r=>{
      return r.map(c=>{
        return c.value || 0;
      }).join('');
    }).join('\n');
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

  cellChange(cell) {
    this.saveMatrix(cell);
    this.setMatrix(cell);
    this.updateNumbers(cell);
    this.checkSudoku();
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
    //if(this.loopDetection) return;
    let list = this.matrixToList();
    let sublist = list.filter(e=>e.numbers.length==1);
    try{
      //Cerco le caselle con una sola scelta possibile e le assegno in modo ricorsivo
      if(sublist.length>0){
        sublist.forEach(e=>{
          e.value=e.numbers[0];
          this.cellChange(e);
          if(!options.autoSolve) throw {}; 
        });
        if(options.autoSolve) this.solve();
      }else{

        //Non ci sono caselle assegnabili in modo semplice e ricorsivo
        //Faccio un giro di pulizia della matrice che magari saltano fuori
        let cleaned = false;
        cleaned = this.rowCleanup() || cleaned;
        cleaned = this.colCleanup() || cleaned;
        cleaned = this.blockCleanup() || cleaned;
        
        if(options.autoSolve) this.solve();

      }
    }catch(e){}
  }

  rowCleanup(){
    let cleaned = false;
    let list = this.matrixToList();
    for(let r=1; r<=9; r++){
      let sublist = list.filter(e=>e.r===r && !e.value);
      cleaned = this.sublistCleanup(sublist);
    }
    return cleaned;
  }
  colCleanup(){
    let cleaned = false;
    let list = this.matrixToList();
    for(let c=1; c<=9; c++){
      let sublist = list.filter(e=>e.c===c && !e.value);
      cleaned = this.sublistCleanup(sublist);
    }
    return cleaned;
  }
  blockCleanup(){
    let cleaned = false;
    let list = this.matrixToList();
    for(let br=0; br<=2; br++){
      for(let bc=0; bc<=2; bc++){
        let minR=br*3+1,maxR=br*3+3,minC=bc*3+1,maxC=bc*3+3;
        let sublist = list.filter(e=>e.r>=minR && e.r<=maxR && !e.value);
        sublist = sublist.filter(e=>e.c>=minC && e.c<=maxC && !e.value);
        cleaned = this.sublistCleanup(sublist);
      } 
    }
    return cleaned;
  }
  sublistCleanup(sublist){
    let cleaned = false;
    let candidati=[];
    //Per ogni cella sulla riga
    sublist.forEach(e=>{
      //Per ogni candidato nella cella
      e.numbers.forEach(n=>{
        //Aggiungo la cella "e" alla lista di candidati per il numero "n"
        candidati[n] = candidati[n] || [];
        candidati[n].push({number:n,candidato:e});
      });
    });
    //Filtro dai candidati solo i candidati che compaiono in una sola cella della riga (sempre che ci siano)
    candidati = candidati.filter(e=>e.length===1);
    candidati.forEach(e=>{ //Se ho culo ne trovo uno, ma metto cmq un forEach perchè fa figo...
      e[0].candidato.value=e[0].number;
      this.cellChange(e[0].candidato);
      cleaned = true;
    });
    return cleaned;
  }


  matrixToList(){
    let list = [];
    for(let r=0; r<=8;r++)
      for(let c=0; c<=8; c++)
        list.push(this.matrix[r][c]);
    return list;
  }

  saveMatrix(cell){
    this.loopDetection=false;
    //Se gli ultimi due schemi salvati in history coincidono sono in un potenziale loop!
    let m = JSON.parse(JSON.stringify(this.matrix));
    m[cell.r-1][cell.c-1].value=undefined;
    let m_last_1 = this.matrixHistory[this.matrixHistory.length-1];
    let m_last_2 = this.matrixHistory[this.matrixHistory.length-2];
    if(false) this.loopDetection=true;
    //Altrimenti è tutto ok, non sono in un loop, e salvo lo stato del sudoku
    else this.matrixHistory.push(m);
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
        this.cellChange({r:r+1,c:c+1,value:v,fixed:v>0});
      });
    })
  }

}
