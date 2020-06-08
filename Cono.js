class Cono extends Objeto {

  constructor(x,y,z) {
        super();

        this.radio = 10;
        this.altura = 20;
        this.segmentos = 30;

        var material = new THREE.MeshLambertMaterial({ color: 0xdddddd });
        var shape = new CANNON.Cylinder(1,this.radio,this.altura,this.segmentos);

        var cylinderGeometry = new THREE.CylinderGeometry(1,this.radio,this.altura,this.segmentos);
        cylinderGeometry.rotateX(Math.PI/2); // rotarlo para que coincida con el Cilindro de cannon

        this.body= new CANNON.Body({ mass: 10, shape: shape });
        // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2);
        this.mesh = new THREE.Mesh(cylinderGeometry, material);

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

        this.tipo = "cono";
  }

  followPlayer(x, y, z){
    if (this.seleccionado){

      if(y < this.radio * this.size){
        y = this.radio * this.size;
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

    this.body.shapes = [];
    var shape = new CANNON.Cylinder(1,this.radio*this.size,this.altura*this.size,this.segmentos*this.size);
    this.body.addShape(shape);
    this.body.mass = 10 * Math.pow(this.size,3);

    this.body.shapes[0].updateBoundingSphereRadius ();

    this.body.updateBoundingRadius();
    this.body.updateMassProperties();

  }
}
