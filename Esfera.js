
class Esfera extends Objeto {

  constructor(x,y,z) {
        super();
        var radio = 10;
        var material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
        var shape = new CANNON.Sphere(radio);
        var sphereGeometry = new THREE.SphereGeometry(radio, 30, 30);

        this.body= new CANNON.Body({ mass: 10, shape: shape });
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        this.body.position.set(x, y, z);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;

        this.add( this.mesh );

        // para escalar con la rueda del ratón
        this.size = 1;
        this.sizeMAX = 2;
        this.sizeMIN = 0.4;

        // para seleccionar el objeto
        this.seleccionado = false;

        this.tipo = "esfera";
  }

  followPlayer(x, y, z){
    if (this.seleccionado){

      if(y < this.body.shapes[0].radius){
        y = this.body.shapes[0].radius;
      }

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
    var dimensions = 10*this.size;

    this.body.shapes[0].radius = dimensions;
    this.body.mass = 10 * Math.pow(this.size,3);

    this.body.shapes[0].updateBoundingSphereRadius ();

    this.body.updateBoundingRadius();
    this.body.updateMassProperties();

  }
}