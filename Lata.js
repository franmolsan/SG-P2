class Lata extends Cilindro {

  constructor(x,y,z) {
        var textura_central = new THREE.TextureLoader().load('../imgs/PrimordialSoup.jpg');
        var textura_top_bot = new THREE.TextureLoader().load('../imgs/abajo.png');

        var material_central = new THREE.MeshPhongMaterial({map: textura_central});
        var material_top_bot = new THREE.MeshPhongMaterial({map: textura_top_bot});

        const materials = [material_central, material_top_bot, material_top_bot]
        var radio = 3;
        super(x,y,z,radio, materials);
        this.tipo = "lata";
  }

}
