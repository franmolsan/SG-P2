class Objeto extends THREE.Object3D {

  constructor() {
    super();
  }

  erase(){
    // para borrar de la memoria
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.body.shape = [];
    this.shape = 0;
  }

  throw(dirX, dirY, dirZ){

    // la velocidad que obtenga el objeto al lanzarlo dependerá de su masa
    // multiplcamos la masa por 0.5 para que las diferencias no sean tan grandes
    this.body.velocity.x = 150/(this.body.mass*0.5) * dirX;
    this.body.velocity.y = 150/(this.body.mass*0.5) * dirY;
    this.body.velocity.z = 150/(this.body.mass*0.5) * dirZ;

  }

  update () {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
