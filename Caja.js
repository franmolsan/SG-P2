
class Caja extends THREE.Object3D {

  constructor(x,y,z) {
    super();

    var material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
    var halfExtents = new CANNON.Vec3(10, 10, 10);
    var shape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(
      halfExtents.x * 2,
      halfExtents.y * 2,
      halfExtents.z * 2
    );

    this.body= new CANNON.Body({ mass: 10, shape: shape });
    this.mesh = new THREE.Mesh(boxGeometry, material);

    this.body.position.set(x, y, z);
    this.mesh.position.set(x, y, z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.add( this.mesh );

    // para escalar con la rueda del ratón
    this.size = 1;
    this.sizeMAX = 2;
    this.sizeMIN = 0.5;

    // para seleccionar el objeto
    this.seleccionado = false;
  }

  erase(){
    // para borrar de la memoria
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.body.shape = [];
    this.shape = 0;
  }

  followPlayer(x, y, z){
    if (this.seleccionado){
      this.body.position.x = x;
      this.body.position.y = y;
      this.body.position.z = z;
    }
  }

  wheelScale(deltaSize){

    // cambiar el tamaño para escalarlo
    this.size += deltaSize;

    if(this.size < this.sizeMIN){
      this.size = this.sizeMIN;
    }
    if(this.size > this.sizeMAX){
      this.size = this.sizeMAX;
    }

    // escalar malla de THREE
    this.mesh.scale.x = this.size;
    this.mesh.scale.y = this.size;
    this.mesh.scale.z = this.size;

    // escalar física de cannon
    var massAndDimensions = 10*this.size;

    this.body.shapes[0].halfExtents.x = massAndDimensions;
    this.body.shapes[0].halfExtents.y = massAndDimensions;
    this.body.shapes[0].halfExtents.z = massAndDimensions;
    this.body.mass = massAndDimensions;

    this.body.shapes[0].boundingSphereRadiusNeedsUpdate = true;
    this.body.shapes[0].updateConvexPolyhedronRepresentation();

    //console.log(this.body)

  }

  update () {
    this.mesh.position.copy(this.body.position);
    this.mesh.quaternion.copy(this.body.quaternion);
  }
}
