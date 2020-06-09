class Tronco extends Cilindro {

  constructor(x,y,z) {
        var loader = new THREE.TextureLoader();

        var textura_central = loader.load('../imgs/dry-wood-texture.jpg');
        var textura_top_bot = loader.load('../imgs/log.png');

        var material_central = new THREE.MeshPhongMaterial({map: textura_central});
        var material_top_bot = new THREE.MeshPhongMaterial({map: textura_top_bot});

        const materials = [material_central, material_top_bot, material_top_bot]
        var radio = 6;
        var masa = 12;
        super(x,y,z,masa, radio, materials);
        this.tipo = "tronco";
  }

}
