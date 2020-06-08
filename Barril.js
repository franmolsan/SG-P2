class Barril extends Cilindro {

  constructor(x,y,z) {
        var textura_central = new THREE.TextureLoader().load('../imgs/PrimordialSoup.jpg');
        var textura_abajo = new THREE.TextureLoader().load('../imgs/abajo.png');
        var textura_arriba = new THREE.TextureLoader().load('../imgs/arriba.png');

        var material_central = new THREE.MeshPhongMaterial({map: textura_central});
        var material_abajo = new THREE.MeshPhongMaterial({map: textura_abajo});
        var material_arriba = new THREE.MeshPhongMaterial({map: textura_arriba});

        const materials = [material_central, material_abajo, material_arriba]
        var radio = 3;
        super(x,y,z,3, materials);
        // this.tipo = "lata";
  }

}
