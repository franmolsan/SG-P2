class Tierra extends Esfera {

  constructor(x,y,z) {
        var loader = new THREE.TextureLoader();

        var textura = loader.load('../imgs/tierra.jpg');
        var material = new THREE.MeshPhongMaterial({map: textura});

        var radio = 30;
        var masa = 1000;
        super(x,y,z,masa,radio,material);
        this.tipo = "tierra";
  }

}
