class Objeto extends THREE.Object3D {

  constructor() {
    super();
  }

  erase(){
    // para borrar de la memoria
    this.mesh.geometry.dispose();
    this.body.shape = [];
    this.shape = 0;
  }

  throw(dirX, dirY, dirZ){
    //this.body.allowSleep = false;
    // la velocidad que obtenga el objeto al lanzarlo dependerá de su masa
    // multiplcamos la masa por 0.5 para que las diferencias no sean tan grandes
    this.body.velocity.x = 150/(this.body.mass*0.5) * dirX;
    this.body.velocity.y = 150/(this.body.mass*0.5) * dirY;
    this.body.velocity.z = 150/(this.body.mass*0.5) * dirZ;

  }

  stop(){
    this.body.allowSleep = true;
    this.body.type = 4 // 4 == Body.KINEMATIC -> no le afectan las fuezas,
                       // pero responde a las colosiones
    this.body.sleep();
  }

  start(){
    this.body.allowSleep = false;
    this.body.type = 1; // 1 == Body.DYNAMIC -> por defecto
    this.body.wakeUp();
  }

  update () {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
