
class Camino extends THREE.Object3D {

  constructor() {
    super();

    this.nave = new Nave();

    this.add( this.nave );

    this.spline = new THREE.CatmullRomCurve3( [
      new THREE.Vector3( 0, 0, 0 ),
      new THREE.Vector3( 12, -5, -16 ),
      new THREE.Vector3( 0, 0, -20 ),
      new THREE.Vector3( -12, 5, -16 ),
      new THREE.Vector3( 0, 5, 0 ),
      new THREE.Vector3( 12, -5, 16 ),
      new THREE.Vector3( 0, 0, 20 ),
      new THREE.Vector3( -12, 5, 16 ),
      new THREE.Vector3( 0, 0, 0 )
    ] );

    var geometryLine = new THREE.Geometry();
    geometryLine.vertices = this.spline.getPoints(100);
    var materialLine = new THREE.LineBasicMaterial ({color : 0xff0000});
    var visibleSpline = new THREE.Line (geometryLine, materialLine);
    this.add(visibleSpline)

    this.animacion1();

  }

  animacion1(){
    this.inicio1 = {progreso: 0};
    this.fin1 = {progreso:0.5};

    this.animacion1 = new TWEEN.Tween(this.inicio1).to(this.fin1,4000);
    this.animacion1.easing(TWEEN.Easing.Quadratic.InOut);
    var that = this;
    this.animacion1.onUpdate(function(){
       var pos= that.spline.getPointAt(that.inicio1.progreso);
       that.nave.position.copy(pos);

       var tangente = that.spline.getTangentAt(that.inicio1.progreso);
       pos.add(tangente);
       that.nave.lookAt(pos);
    });


    this.inicio2 = {progreso: 0.5};
    this.fin2 = {progreso:1};

    this.animacion2 = new TWEEN.Tween(this.inicio2).to(this.fin2,8000);
    this.animacion2.easing(TWEEN.Easing.Quadratic.InOut);
    var that = this;
    this.animacion2.onUpdate(function(){
       var pos= that.spline.getPointAt(that.inicio2.progreso);
       that.nave.position.copy(pos);

       var tangente = that.spline.getTangentAt(that.inicio2.progreso);
       pos.add(tangente);
       that.nave.lookAt(pos);
    });

    this.animacion1.chain(this.animacion2);
    this.animacion2.chain(this.animacion1);

    this.animacion1.start();


  }



  update () {

    TWEEN.update();
  }
}
