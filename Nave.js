
class Nave extends THREE.Object3D {

  constructor() {
    super();

    var geometry = new THREE.ConeGeometry( 1.5, 5, 3 );

    geometry.rotateX(Math.PI/2);
    // El material se hará con una textura de ajedrez
    var texture = new THREE.TextureLoader().load('imgs/textura-ajedrezada.jpg');
    var material = new THREE.MeshPhongMaterial ({map: texture})
    this.nave = new THREE.Mesh( geometry, material );

    this.add( this.nave );

  }


  update () {

  }
}
