
class Caja extends THREE.Object3D {

  constructor(x,y,z) {
    super();

    var material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    var halfExtents = new CANNON.Vec3(10, 10, 10);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(
      halfExtents.x * 2,
      halfExtents.y * 2,
      halfExtents.z * 2
    );

    this.body= new CANNON.Body({ mass: 10, shape: boxShape });
    this.mesh = new THREE.Mesh(boxGeometry, material);

    this.body.position.set(x, y, z);
    this.mesh.position.set(x, y, z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.add( this.mesh );

    // para seleccionar el objeto
    this.seleccionado = false;
  }

  erase(){
    // para borrar de la memoria
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.body.shape = [];
  }

  followPlayer(x, y, z){
    if (this.seleccionado){
      this.body.position.x = x;
      this.body.position.y = y;
      this.body.position.z = z;
    }
  }

  update () {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
