class Tierra extends Esfera {

  constructor(x,y,z) {
        var textura = new THREE.TextureLoader().load('../imgs/tierra.jpg');
        var material = new THREE.MeshPhongMaterial({map: textura});

        var radio = 20;
        var masa = 1000;
        super(x,y,z,masa,radio,material);
        this.tipo = "tierra";
  }

}
