
class Esfera extends Objeto {

  constructor(x,y,z,masa, radius,material) {
        super();
        this.masa_base = masa
        this.radio_base = radius;
        var shape = new CANNON.Sphere(radius);
        var sphereGeometry = new THREE.SphereGeometry(radius, 30, 30);

        this.body= new CANNON.Body({ mass: masa, shape: shape });
        this.mesh = new THREE.Mesh(sphereGeometry, material);

        this.body.position.set(x, y, z);
        this.mesh.position.set(x, y, z);
        this.mesh.castShadow = true;
        this.body.allowSleep = false;

        this.body.linearDamping = 0.5;
        this.body.angularDamping = 0.5;

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

      var posicion_muro = 450;

      if(y < this.body.shapes[0].radius){
        y = this.body.shapes[0].radius;
      }

      if(x > -this.body.shapes[0].radius+posicion_muro){
        x = -this.body.shapes[0].radius+posicion_muro;
      }

      if(x < this.body.shapes[0].radius-posicion_muro){
        x = this.body.shapes[0].radius-posicion_muro;
      }

      if(z > -this.body.shapes[0].radius+posicion_muro){
        z = -this.body.shapes[0].radius+posicion_muro;
      }

      if(z < this.body.shapes[0].radius-posicion_muro){
        z = this.body.shapes[0].radius-posicion_muro;
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

    this.body.shapes[0].radius = dimensions;
    this.body.mass = this.masa_base * Math.pow(this.size,3);

    this.body.shapes[0].updateBoundingSphereRadius ();

    this.body.updateBoundingRadius();
    this.body.updateMassProperties();

  }
}
