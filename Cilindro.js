class Cilindro extends Objeto {

  constructor(x,y,z, masa, radius,materials) {
        super();

        this.masa_base = masa;
        this.radio_base = radius;
        this.altura = radius*2;
        this.segmentos = 30;


        var shape = new CANNON.Cylinder(this.radio_base,this.radio_base,this.altura,this.segmentos);

        var cylinderGeometry = new THREE.CylinderGeometry(this.radio_base,this.radio_base,this.altura,this.segmentos);
        cylinderGeometry.rotateX(Math.PI/2); // rotarlo para que coincida con el Cilindro de cannon

        this.body= new CANNON.Body({ mass: masa, shape: shape });
        //this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2);

        this.body.linearDamping = 0.5;
        this.body.angularDamping = 0.5;

        this.mesh = new THREE.Mesh(cylinderGeometry, materials);

        this.body.position.set(x, y, z);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;
        this.body.allowSleep = false;

        this.add( this.mesh );

        // para escalar con la rueda del ratón
        this.size = 1;
        this.sizeMAX = 2;
        this.sizeMIN = 0.4;

        // para seleccionar el objeto
        this.seleccionado = false;

        this.tipo = "cilindro";
  }

  followPlayer(x, y, z){
    if (this.seleccionado){

      if(y < this.radio_base * this.size){
        y = this.radio_base * this.size;
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
    var dimensions = this.radio_base*this.size;

    this.body.shapes = [];
    var shape = new CANNON.Cylinder(dimensions,dimensions,this.altura*this.size,this.segmentos*this.size);
    this.body.addShape(shape);
    this.body.mass = this.masa_base * Math.pow(this.size,3);

    this.body.shapes[0].updateBoundingSphereRadius ();

    this.body.updateBoundingRadius();
    this.body.updateMassProperties();

  }
}
