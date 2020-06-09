class Naranja extends Esfera {

  constructor(x,y,z) {
        var loader = new THREE.TextureLoader();

        var textura = new loader.load('../imgs/naranja.png');
        var material = new THREE.MeshPhongMaterial({map: textura});

        var radio = 2;
        var masa = 2;
        super(x,y,z,masa, radio, material);
        this.tipo = "naranja";
  }

}
