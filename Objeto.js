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



  /*
  followPlayer (velX, velY, velZ){
    if (this.seleccionado){
      this.body.velocity.x = velX;
      this.body.velocity.y = velY;
      this.body.velocity.z = velZ;
    }
  }
  */

  update () {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
