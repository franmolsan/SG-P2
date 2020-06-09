class Caja extends Cubo {

  constructor(x,y,z) {
        var loader = new THREE.TextureLoader();

        var textura = new loader.load('./imgs/caja.jpg');
        var material = new THREE.MeshPhongMaterial({map: textura});
        var mitad = 10;
        var masa = 15;
        super(x,y,z,masa,mitad,material);
        this.tipo = "caja";
  }

}
