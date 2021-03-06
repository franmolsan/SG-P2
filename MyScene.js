// importar controles
import { PointerLockControls } from "./libs/PointerLockControls.js";

// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */
class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

    const loader = new THREE.TextureLoader();
    var textura1 = loader.load('./imgs/posx.jpg');
    var textura2 = loader.load('./imgs/negx.jpg');
    var textura3 = loader.load('./imgs/posy.jpg');
    var textura4 = loader.load('./imgs/negy.jpg');
    //textura4.anisotropy = this.renderer.getMaxAnisotropy();
    // textura4.generateMipmaps = false;
    textura4.minFilter = THREE.LinearFilter;
    //textura4.anisotropy = this.renderer.getMaxAnisotropy();
    var textura5 = loader.load('./imgs/posz.jpg');
    var textura6 = loader.load('./imgs/negz.jpg');

    var materials = [];

    materials.push(new THREE.MeshBasicMaterial({map: textura1}));
    materials.push(new THREE.MeshBasicMaterial({map: textura2}));
    materials.push(new THREE.MeshBasicMaterial({map: textura3}));
    materials.push(new THREE.MeshBasicMaterial({map: textura4}));
    materials.push(new THREE.MeshBasicMaterial({map: textura5}));
    materials.push(new THREE.MeshBasicMaterial({map: textura6}));


    for (var i=0; i<6; i++)
      materials[i].side = THREE.BackSide


    var skyboxGeo = new THREE.BoxGeometry(10000,10000,10000)
    var skybox = new THREE.Mesh(skyboxGeo,materials)
    skybox.position.y = 0;
    this.add(skybox);

    this.playerBody;
    // estado de la aplicación: no acción (0)
    this.applicationMode = MyScene.NO_ACTION;


    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights();

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera();

    // Un suelo
    this.createGround();

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper(5);
    this.axis.visible = false;
    this.add(this.axis);

    this.iniciarCanon();

    // Add boxes
    this.pickableObjects = []
    this.pickedObjectIndex = -1;

    // añadir el circuito
    this.createParkour();

    this.createCajas(4,50,50,-200,1,true);
    this.createCajas(4,50,50,200,1,true);

    // Se añade a la gui los controles para manipular los elementos de esta clase
    this.gui = this.createGUI();

    // para controles y movimiento
    this.controls = new PointerLockControls(this, this.camera, this.playerBody);
    this.add(this.controls.getObject());
    this.tiempo = Date.now();

  }

  createParkour(){
    this.createCajas(1,50,12,0, 1.2 ,false);
    this.createCajas(1,100,35,0,1.5,false);
    this.createCajas(1,180,40,0,1.25,false);

    // Rama izquierda del circuito
    this.createBarriles(1,180, 40, -30, 1.25, false);
    this.createBarriles(1,180, 40, -60, 1.25, false);

    this.createBarriles(1,180, 40, -100, 1.5, false);
    this.createBarriles(1,180, 60, -150, 1.25, false);

    this.createCajas(1, 180, 20, -200, 2, false)
    this.createRubik(4, 170, 50, -190, 0.5, true)
    this.createPelotas(1, 190, 50, -210, 1, true)

    this.createTroncos(1, 180, 55, -250, 2, false)
    this.pickableObjects[this.pickableObjects.length-1].Rotate('X', Math.PI/2)

    this.createTierras(1, 180, 60, -300, 1, false);
    this.pickableObjects[this.pickableObjects.length-1].Rotate('Y', -Math.PI/2)

    // Rama derecha del circuito
    this.createTroncos(1,180, 40, 30, 2, false);
    this.createTroncos(1,180, 40, 60, 2, false);

    this.createTroncos(1,180, 40, 100, 2, false);
    this.createBarriles(1,180, 60, 150, 1.25, false);

    this.createCajas(1, 180, 20, 200, 2, false)
    this.createDados(4, 170, 50, 190, 2, true)
    this.createNaranjas(1, 190, 50, 210, 1, true)

    this.createLatas(1, 180, 55, 250, 2, false)
    this.pickableObjects[this.pickableObjects.length-1].Rotate('X', Math.PI/2)

    this.createTierras(1, 180, 60, 300, 1, false);
    this.pickableObjects[this.pickableObjects.length-1].Rotate('Y', -Math.PI/2)

  }

  pickOrUnpickObject(){
    if(this.applicationMode === MyScene.OBJECT_PICKED){
      this.unpickObject();
    }
    else {
      this.pickObject();
    }
  }

  pickObject(){
    var centro = new THREE.Vector2();
    centro.x = 0;
    centro.y = 0;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(centro,this.camera);

    var pickableMesh = [];
    for (var i = 0; i < this.pickableObjects.length; i++) {
      pickableMesh.push(this.pickableObjects[i].mesh);
    }

    var pickedObjects = raycaster.intersectObjects(pickableMesh, true);

    if (pickedObjects.length > 0){
      var selectedObject = pickedObjects[0].object;

      var indice;
      for (var i = 0; i < pickableMesh.length; i++) {
        if(pickableMesh[i] === selectedObject){
          indice = i;
        }
      }

      // var selectedPoint = new THREE.Vector3(pickedObjects[0].point);
      this.pickedObjectIndex = indice;
      this.pickableObjects[indice].seleccionado = true;
      this.applicationMode = MyScene.OBJECT_PICKED;

      if (this.pickableObjects[indice].body.allowSleep){
          this.pickableObjects[indice].start();
      }
    }
  }

  unpickObject(){
    this.pickableObjects[this.pickedObjectIndex].seleccionado = false;
    this.pickedObjectIndex = -1;
    this.applicationMode = MyScene.NO_ACTION;
  }

  stopPickedObject(){
    // si hemos seleccionado un objecto
    if (this.applicationMode === MyScene.OBJECT_PICKED) {
      var object = this.pickableObjects[this.pickedObjectIndex];
      object.stop();
    }
  }

  stopAllObjects(){
    for (var i=0; i<this.pickableObjects.length; i++){
      this.pickableObjects[i].stop();
    }
  }

  startAllObjects(){
    for (var i=0; i<this.pickableObjects.length; i++){
      this.pickableObjects[i].start();
    }
  }

  rotatePickedObjectX(){
    // si hemos seleccionado un objecto
    if (this.applicationMode === MyScene.OBJECT_PICKED) {
      var object = this.pickableObjects[this.pickedObjectIndex];
      object.Rotate('X', Math.PI/2);
    }
  }

  rotatePickedObjectY(){
    // si hemos seleccionado un objecto
    if (this.applicationMode === MyScene.OBJECT_PICKED) {
      var object = this.pickableObjects[this.pickedObjectIndex];
      object.Rotate('Y', Math.PI/2);
    }
  }

  rotatePickedObjectZ(){
    // si hemos seleccionado un objecto
    if (this.applicationMode === MyScene.OBJECT_PICKED) {
      var object = this.pickableObjects[this.pickedObjectIndex];
      object.Rotate('Z', Math.PI/2);
    }
  }


  removePickedObject(){
    // si hemos seleccionado un objecto
    if (this.applicationMode === MyScene.OBJECT_PICKED) {
      this.removeObject(this.pickedObjectIndex);
    }

    this.pickedObjectIndex = -1;
    this.applicationMode = MyScene.NO_ACTION;
  }

  removeObject(index){
    var object = this.pickableObjects[index];
    object.erase();
    this.world.remove(object.body); // borrar parte física del objecto (body)
    this.remove( object.mesh ); // borrar parte visual del objecto (mesh)
    this.pickableObjects.splice(index, 1); // eliminar el objeto del conjunto de objetos existentes
  }

  removeAllObjectsOfType(type){
    var object;
    for (var i=0; i<this.pickableObjects.length; i++){
      object = this.pickableObjects[i];
      if (object.tipo === type){
        this.removeObject(i);
        i--; // como borramos, no podemos avanzar en el vector
      }
    }
  }

  removeAllObjects(){
    var object;
    for (var i=0; i<this.pickableObjects.length; i++){
      object = this.pickableObjects[i];
      this.removeObject(i);
      i--; // como borramos, no podemos avanzar en el vector
    }
  }

  wheelScaleObject(y){
      if (this.applicationMode === MyScene.OBJECT_PICKED) {
        var deltaSize = 0;
        // scroll hacia arriba
        if (y > 0){
          deltaSize = 0.2;
        }
        else {
          deltaSize = -0.2;
        }

        this.pickableObjects[this.pickedObjectIndex].Scale(deltaSize);
      }
  }

  throwObject(){
    if (this.applicationMode === MyScene.OBJECT_PICKED) {
      var object = this.pickableObjects[this.pickedObjectIndex];

      var dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      object.throw(dir.x, dir.y, dir.z);

      this.unpickObject();
    }
  }

  createCamera() {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      30000
    );

    // También se indica dónde se coloca
    this.camera.position.set(0,0,0);

    // añadimos el crosshair (cruceta/mirilla) a la cámara
    // de esta forma siempre la veremos en el centro
    var spriteMap = new THREE.TextureLoader().load( "./imgs/Crosshair.png" );
    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
    spriteMaterial.depthWrite = false;
    this.sprite = new THREE.Sprite( spriteMaterial );
    this.sprite.castShadow = false;

    this.sprite.scale.x = 0.05;
    this.sprite.scale.y = 0.05;
    this.sprite.scale.z = 0.05;


    this.sprite.position.set( 0, 0, -1 ); // posicionar el crosshair
    this.camera.add( this.sprite );
    this.add(this.camera);

  }

  createGround() {
    // El suelo es un Mesh, necesita una geometría y un material.

    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry(
      1000,
      0.2,
      1000
    );

    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load(
      "imgs/suelo.jpg" //textura-ajedrezada-grande
    );
    var materialGround = new THREE.MeshPhongMaterial({ map: texture })

    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh(geometryGround, materialGround);

    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.1;

    ground.receiveShadow = true;
    //ground.visible = false;


    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add(ground);
  }

  createGUI () {
    // Controles para el tamaño, la orientación y la posición de la caja

    var gui = new dat.GUI();

    var that = this;
    this.guiControls = new function () {

      this.lightIntensity = 0.5;
      this.axisOnOff = false;

      // Botones para añadir objetos
      this.addCaja = function () {
        that.createCajas(1);
      }

      this.addRubik = function () {
        that.createRubik(1);
      }

      this.addDado = function () {
        that.createDados(1);
      }

      this.addPelota = function () {
        that.createPelotas(1);
      }

      this.addTierra = function () {
        that.createTierras(1);
      }

      this.addNaraja = function () {
        that.createNaranjas(1);
      }

      this.addLata = function () {
        that.createLatas(1);
      }

      this.addBarril = function () {
        that.createBarriles(1);
      }

      this.addTronco = function () {
        that.createTroncos(1);
      }

      // Botones para eliminar objetos
      this.eraseCaja = function () {
        that.removeAllObjectsOfType("caja");
      }

      this.eraseRubik = function () {
        that.removeAllObjectsOfType("rubik");
      }

      this.eraseDado = function () {
        that.removeAllObjectsOfType("dado");
      }

      this.erasePelota = function () {
        that.removeAllObjectsOfType("pelota");
      }

      this.eraseTierra = function () {
        that.removeAllObjectsOfType("tierra");
      }

      this.eraseNaranja = function () {
        that.removeAllObjectsOfType("naranja");
      }

      this.eraseLata = function () {
        that.removeAllObjectsOfType("lata");
      }

      this.eraseBarril = function () {
        that.removeAllObjectsOfType("barril");
      }

      this.eraseTronco = function () {
        that.removeAllObjectsOfType("tronco");
      }

      this.eraseAll = function () {
        that.removeAllObjects();
      }

    }

    // Se crea una sección para los controles de la caja
    // Estas lineas son las que añaden los componentes de la interfaz
    // Las tres cifras indican un valor mínimo, un máximo y el incremento
    // El método   listen()   permite que si se cambia el valor de la variable en código, el deslizador de la interfaz se actualice
    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder("Luz y Ejes");

    // Se le añade un control para la intensidad de la luz
    folder
      .add(this.guiControls, "lightIntensity", 0, 1, 0.1)
      .name("Intensidad de la Luz : ");

    // Y otro para mostrar u ocultar los ejes
    folder.add (this.guiControls, 'axisOnOff').name ('Mostrar ejes : ');

    var folderCreacion = gui.addFolder("Crear figuras");

    folderCreacion.add (this.guiControls, 'addCaja').name ('Añadir caja');
    folderCreacion.add (this.guiControls, 'addRubik').name ('Añadir rubik');
    folderCreacion.add (this.guiControls, 'addDado').name ('Añadir dado');
    folderCreacion.add (this.guiControls, 'addPelota').name ('Añadir pelota');
    folderCreacion.add (this.guiControls, 'addTierra').name ('Añadir Tierra');
    folderCreacion.add (this.guiControls, 'addNaraja').name ('Añadir naranja');
    folderCreacion.add (this.guiControls, 'addLata').name ('Añadir lata');
    folderCreacion.add (this.guiControls, 'addBarril').name ('Añadir barril');
    folderCreacion.add (this.guiControls, 'addTronco').name ('Añadir tronco');


    var folderEliminar = gui.addFolder("Eliminar figuras");

    folderEliminar.add (this.guiControls, 'eraseCaja').name ('Eliminar cajas');
    folderEliminar.add (this.guiControls, 'eraseRubik').name ('Eliminar rubik')
    folderEliminar.add (this.guiControls, 'eraseDado').name ('Eliminar dado')
    folderEliminar.add (this.guiControls, 'erasePelota').name ('Eliminar pelotas');
    folderEliminar.add (this.guiControls, 'eraseTierra').name ('Eliminar Tierras');
    folderEliminar.add (this.guiControls, 'eraseNaranja').name ('Eliminar naranjas');
    folderEliminar.add (this.guiControls, 'eraseLata').name ('Eliminar latas');
    folderEliminar.add (this.guiControls, 'eraseBarril').name ('Eliminar barriles');
    folderEliminar.add (this.guiControls, 'eraseTronco').name ('Eliminar troncos');
    folderEliminar.add (this.guiControls, 'eraseAll').name ('Eliminar todos');

    return gui;
  }

  createLights() {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    // La añadimos a la escena
    this.add(ambientLight);

    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.spotLight = new THREE.SpotLight(0xffffff, 0.5);
    this.spotLight.position.set(0, 450, 0);
    this.spotLight.castShadow = true;
    this.add(this.spotLight);
  }

  createRenderer(myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer();

    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xeeeeee), 1.0);

    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);

    // para las sombras
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  // crear cajas
  createCajas(num_boxes,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todas las cajas (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apiladas
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_boxes; i++) {
       var y_colocacion = y + i*50;

      var caja = new Caja (x,y_colocacion,z)

      if (escala != 1){
        caja.Scale(escala - 1)
      }
      if (!sePuedeMover){
        caja.stop();
      }
      this.world.addBody(caja.body);
      this.add(caja.mesh);

      this.pickableObjects.push(caja);
    }
  }

  createRubik(num_rubik,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos los cubos (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apilados
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }


    for (var i = 0; i < num_rubik; i++) {
      var y_colocacion = y + i*50; 50;

      var rubik = new Rubik (x,y_colocacion,z)

      if (escala != 1){
        rubik.Scale(escala - 1)
      }
      if (!sePuedeMover){
        rubik.stop();
      }
      this.world.addBody(rubik.body);
      this.add(rubik.mesh);

      this.pickableObjects.push(rubik);
    }
  }

  createDados(num_dados,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos los dados (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apilados
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_dados; i++) {
      var y_colocacion = y + i*50; 50;

      var dado = new Dado (x,y_colocacion,z)

      if (escala != 1){
        dado.Scale(escala-1)
      }
      if (!sePuedeMover){
        dado.stop();
      }
      this.world.addBody(dado.body);
      this.add(dado.mesh);

      this.pickableObjects.push(dado);
    }
  }

  // crear pelotas
  createPelotas(num_pelotas,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos las pelotas (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apiladas
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_pelotas; i++) {
      var y_colocacion = y + i*50; 50;

      var p = new Pelota (x,y_colocacion,z)

      if (escala != 1){
        p.Scale(escala-1)
      }
      if (!sePuedeMover){
        p.stop();
      }
      this.world.addBody(p.body);
      this.add(p.mesh);

      this.pickableObjects.push(p);
    }
  }

  createTierras(num_tierras,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos las Tierras (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apiladas
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_tierras; i++) {
      var y_colocacion = y + i*50; 50;

      var tierra = new Tierra (x,y_colocacion,z)

      if (escala != 1){
        tierra.Scale(escala-1)
      }
      if (!sePuedeMover){
        tierra.stop();
      }
      this.world.addBody(tierra.body);
      this.add(tierra.mesh);

      this.pickableObjects.push(tierra);
    }
  }

  createNaranjas(num_naranjas,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos las naranjas (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apiladas
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_naranjas; i++) {
      var y_colocacion = y + i*50; 50;

      var naranja = new Naranja (x,y_colocacion,z)

      if (escala != 1){
        naranja.Scale(escala-1)
      }
      if (!sePuedeMover){
        naranja.stop();
      }
      this.world.addBody(naranja.body);
      this.add(naranja.mesh);

      this.pickableObjects.push(naranja);
    }
  }

  // crear latas
  createLatas(num_latas,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos las latas (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apiladas
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_latas; i++) {
      var y_colocacion = y + i*50; 50;

      var cyl = new Lata (x,y_colocacion,z)

      if (escala != 1){
        cyl.Scale(escala-1)
      }
      if (!sePuedeMover){
        cyl.stop();
      }
      this.world.addBody(cyl.body);
      this.add(cyl.mesh);

      this.pickableObjects.push(cyl);
    }
  }

  // crear barriles
  createBarriles(num_barriles,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos los barriles (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apilados
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_barriles; i++) {
      var y_colocacion = y + i*50; 50;

      var cyl = new Barril (x,y_colocacion,z)

      if (escala != 1){
        cyl.Scale(escala-1)
      }
      if (!sePuedeMover){
        cyl.stop();
      }
      this.world.addBody(cyl.body);
      this.add(cyl.mesh);

      this.pickableObjects.push(cyl);
    }
  }

  // crear Troncos
  createTroncos(num_troncos,x,y,z,escala,sePuedeMover){

    // Si no definen las coordenadas x, z
    // serán iguales para todos los troncos (aleatorio)
    // la coordenada y va aumentando
    // así aparecerán apilados
    if (x === undefined){
      x = Math.random() * 300
    }
    if (y === undefined){
      y = 150
    }
    if (z === undefined){
      z = Math.random() * 300
    }
    if (sePuedeMover === undefined){
      sePuedeMover = true;
    }
    if (escala === undefined){
      escala = 1;
    }

    for (var i = 0; i < num_troncos; i++) {
      var y_colocacion = y + i*50; 50;

      var cyl = new Tronco (x,y_colocacion,z)

      if (escala != 1){
        cyl.Scale(escala-1)
      }
      if (!sePuedeMover){
        cyl.stop();
      }
      this.world.addBody(cyl.body);
      this.add(cyl.mesh);

      this.pickableObjects.push(cyl);
    }
  }


  getCamera() {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }

  setCameraAspect(ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect(window.innerWidth / window.innerHeight);

    // Y también el tamaño del renderizador
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  iniciarCanon() {

   // Crear el mundo
   this.world = new CANNON.World();
   this.world.gravity.set(0, -200, 0);
   this.world.quatNormalizeSkip = 0;
   this.world.quatNormalizeFast = false;

   var solver = new CANNON.GSSolver();

   this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
   this.world.defaultContactMaterial.contactEquationRelaxation = 4;

   solver.iterations = 10;
   solver.tolerance = 0.1;
   var split = true;
   if (split) this.world.solver = new CANNON.SplitSolver(solver);

   else this.world.solver = solver;
   this.world.allowSleep = false;
   this.world.broadphase = new CANNON.NaiveBroadphase();

   // Create a slippery material (friction coefficient = 0.0)
   var physicsMaterial = new CANNON.Material("slipperyMaterial");
   var physicsContactMaterial = new CANNON.ContactMaterial(
     physicsMaterial,
     physicsMaterial,
     0.0, // friction coefficient
     0.3
   ); // restitution
   // We must add the contact materials to the this.world
   this.world.addContactMaterial(physicsContactMaterial);

   // Crear el suelo
   var groundShape = new CANNON.Plane();
   var groundBody = new CANNON.Body({ mass: 0 });
   groundBody.addShape(groundShape);
   groundBody.quaternion.setFromAxisAngle(
     new CANNON.Vec3(1, 0, 0),
     -Math.PI / 2
   );
   this.world.addBody(groundBody);

    // pared -z
    var paredShapeZmin = new CANNON.Plane();
    var paredZmin = new CANNON.Body({ mass: 0 });
    paredZmin.addShape(paredShapeZmin);
    paredZmin.position.set(0,0,-450);
    this.world.addBody(paredZmin);

    // pared +x
    // hay que rotarla para que esté en el lugar adecuado
    // ya que en cannon, los planos "miran" en dirección Z positiva por defecto
    var paredShapeXmax = new CANNON.Plane();
    var paredXmax = new CANNON.Body({ mass: 0 });
    paredXmax.addShape(paredShapeXmax);
    paredXmax.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),-Math.PI/2);
    paredXmax.position.set(450,0,0);
    this.world.addBody(paredXmax);

    // pared +Z
    // rotamos la pared en el eje Y
    // ya que todo lo que hay "debajo" del plano es sólido
    var paredShapeZmax = new CANNON.Plane();
    var paredZmax = new CANNON.Body({ mass: 0 });
    paredZmax.addShape(paredShapeZmax);
    paredZmax.position.set(0,0,450);
    paredZmax.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),Math.PI);
    this.world.addBody(paredZmax);

    // pared -X
    // al igual que la anterior, es necesario rotarla en el eje Y
    // ya que en cannon todo lo que hay "debajo" del plano es sólido
    var paredShapeXmin = new CANNON.Plane();
    var paredXmin = new CANNON.Body({ mass: 0 });
    paredXmin.addShape(paredShapeXmin);
    paredXmin.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0),-3*Math.PI/2);
    paredXmin.position.set(-450,0,0);
    this.world.addBody(paredXmin);


    // Crear una esfera (el cuerpo del personaje)
    var mass = 100;
    var radio = 15;
    var sphereShape = new CANNON.Sphere(radio);
    this.playerBody = new CANNON.Body({ mass: mass , shape: sphereShape});
    this.playerBody.position.set(0, 30, 0);
    this.playerBody.linearDamping = 0.9;
    this.playerBody.angularDamping = 0.9;
    this.playerBody.allowSleep = false;
    this.world.addBody(this.playerBody);

 }


  update() {
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.

    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update());

    // Se actualizan los elementos de la escena para cada frame
    // Se actualiza la intensidad de la luz con lo que haya indicado el usuario en la gui
    this.spotLight.intensity = this.guiControls.lightIntensity;

    // Se muestran o no los ejes según lo que idique la GUI
    this.axis.visible = this.guiControls.axisOnOff;

    var dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);


    if (this.controls.enabled) {
      // simular el mundo físico (cannon)
      this.world.step(1 / 60)

      // con la siguiente línea se tiene en cuenta la diferencia de tiempo
      // entre cada actualización (interpolación)
      // this.world.step(1 / 60, ((Date.now() - this.tiempo) / 1000), 10)
      // por algún motivo no funciona correctamente, parece ser un bug de cannon
      // https://github.com/schteppe/cannon.js/issues/371
      // también en otros forks de cannon
      // https://github.com/react-spring/cannon-es/issues/16


      // si hemos cogido un objeto, que nos siga
      if (this.applicationMode === MyScene.OBJECT_PICKED){

        var objeto_seleccionado = this.pickableObjects[this.pickedObjectIndex];

        objeto_seleccionado.followPlayer( this.controls.getObject().position.x + (70* dir.x ),
                                          this.controls.getObject().position.y + (70 * dir.y),
                                          this.controls.getObject().position.z + (70 * dir.z ));
      }

      // actualizar objetos
      for (var i = 0; i < this.pickableObjects.length; i++) {
        this.pickableObjects[i].update();
      }
    }

    // actualizar controles (jugador)
    this.controls.update(Date.now() - this.tiempo);

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render(this, this.getCamera());
    this.tiempo = Date.now();
  }

}

// Estado de la aplicación
MyScene.NO_ACTION = 0;
MyScene.OBJECT_PICKED = 1;

/// La función   main
$(function () {
  var blocker = document.getElementById("blocker");
  var instructions = document.getElementById("instructions");

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());

  // pointerlock (controles)
  var blocker = document.getElementById("blocker");
  var instructions = document.getElementById("instructions");

  var havePointerLock =
    "pointerLockElement" in document ||
    "mozPointerLockElement" in document ||
    "webkitPointerLockElement" in document;

  if (havePointerLock) {
    var element = document.body;

    var pointerlockchange = function (event) {
      if (
        document.pointerLockElement === element ||
        document.mozPointerLockElement === element ||
        document.webkitPointerLockElement === element
      ) {
        scene.controls.enabled = true;

        blocker.style.display = "none";
      } else {
        scene.controls.enabled = false;

        blocker.style.display = "-webkit-box";
        blocker.style.display = "-moz-box";
        blocker.style.display = "box";

        instructions.style.display = "";
      }
    };

    var pointerlockerror = function (event) {
      instructions.style.display = "";
    };

    // Hook pointer lock state change events
    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener(
      "webkitpointerlockchange",
      pointerlockchange,
      false
    );

    document.addEventListener("pointerlockerror", pointerlockerror, false);
    document.addEventListener("mozpointerlockerror", pointerlockerror, false);
    document.addEventListener(
      "webkitpointerlockerror",
      pointerlockerror,
      false
    );

    instructions.addEventListener(
      "click",
      function (event) {
        instructions.style.display = "none";

        // Ask the browser to lock the pointer
        element.requestPointerLock =
          element.requestPointerLock ||
          element.mozRequestPointerLock ||
          element.webkitRequestPointerLock;

        element.requestPointerLock();
      },
      false
    );
  } else {
    instructions.innerHTML = "Su navegador no soporta la API Pointer Lock";
  }

  // Que no se nos olvide, la primera visualización.
  scene.update();
});
