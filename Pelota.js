class Pelota extends Esfera {

  constructor(x,y,z) {
        var textura = new THREE.TextureLoader().load('../imgs/pelota.jpg');
        var material = new THREE.MeshPhongMaterial({map: textura});

        var radio = 3;
        var masa = 5;
        super(x,y,z, masa, radio, material);
        this.tipo = "pelota";
  }

}
