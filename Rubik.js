class Rubik extends Cubo {

  constructor(x,y,z) {
        var loader = new THREE.TextureLoader();

        var textura1 = loader.load('./imgs/rojo.png');
        var textura2 = loader.load('./imgs/naranja_rubik.png');
        var textura3 = loader.load('./imgs/azul.png');
        var textura4 = loader.load('./imgs/blanco.png');
        var textura5 = loader.load('./imgs/verde.png');
        var textura6 = loader.load('./imgs/amarillo.png');

        var material1 = new THREE.MeshPhongMaterial({map: textura1});
        var material2 = new THREE.MeshPhongMaterial({map: textura2});
        var material3 = new THREE.MeshPhongMaterial({map: textura3});
        var material4 = new THREE.MeshPhongMaterial({map: textura4});
        var material5 = new THREE.MeshPhongMaterial({map: textura5});
        var material6 = new THREE.MeshPhongMaterial({map: textura6});

        const materials = [material1, material2, material3, material4, material5, material6]

        var mitad = 4;
        var masa = 5;
        super(x,y,z,masa,mitad,materials);
        this.tipo = "rubik";
  }

}
