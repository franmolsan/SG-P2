// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */
import { PointerLockControls } from "./libs/pointerLockControls2.js";
import { Estado } from "./estados.js";

class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();

    this.sphereBody;
    // estado de la aplicación: no acción (0)
    this.applicationMode = Estado.NO_ACTION;

    // fondo
    this.background = new THREE.Color( 0x000000 );

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

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
    this.add(this.axis);

    this.iniciarCanon();

    // Add boxes
    this.pickableObjects = []
    this.pickedObjectIndex = -1;
    this.createBoxes(6);
    this.createSpheres(6);
    this.createLatas(3);
    this.createBarriles(2);


    // Se añade a la gui los controles para manipular los elementos de esta clase
    this.gui = this.createGUI();

    // para controles y movimiento
    this.controls = new PointerLockControls(this, this.camera, this.sphereBody);
    this.add(this.controls.getObject());
    this.tiempo = Date.now();
    this.tiempoCannon = Date.now();
  }

  pickObject(){
    var mouse = new THREE.Vector2();
    mouse.x = 0//(event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = 0//1 - 2* (event.clientY /window.innerHeight);

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse,this.camera);

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
      this.applicationMode = Estado.OBJECT_PICKED;

      if (this.pickableObjects[indice].body.allowSleep){
          this.pickableObjects[indice].start();
      }
    }
  }

  unpickObject(){
    this.pickableObjects[this.pickedObjectIndex].seleccionado = false;
    this.pickedObjectIndex = -1;
    this.applicationMode = Estado.NO_ACTION;
  }

  stopPickedObject(){
    // si hemos seleccionado un objecto
    if (this.applicationMode === Estado.OBJECT_PICKED) {
      var object = this.pickableObjects[this.pickedObjectIndex];
      object.stop();
    }
  }

  removePickedObject(){
    // si hemos seleccionado un objecto
    if (this.applicationMode === Estado.OBJECT_PICKED) {
      this.removeObject(this.pickedObjectIndex);
    }

    this.pickedObjectIndex = -1;
    this.applicationMode = Estado.NO_ACTION;
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
      if (this.applicationMode === Estado.OBJECT_PICKED) {
        var deltaSize = 0;
        // scroll hacia arriba
        if (y > 0){
          deltaSize = 0.2;
        }
        else {
          deltaSize = -0.2;
        }

        this.pickableObjects[this.pickedObjectIndex].wheelScale(deltaSize);
      }
  }

  throwObject(){
    if (this.applicationMode === Estado.OBJECT_PICKED) {
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
      1,
      1000
    );

    // También se indica dónde se coloca
    this.camera.position.set(0,0,0);
    this.add(this.camera);

  }

  createGround() {
    // El suelo es un Mesh, necesita una geometría y un material.

    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry(
      window.innerWidth,
      0.2,
      window.innerWidth
    );

    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load(
      "imgs/textura-ajedrezada-grande.jpg"
    );
    var materialGround = new THREE.MeshPhongMaterial({ map: texture });

    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh(geometryGround, materialGround);

    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.1;

    ground.receiveShadow = true;


    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add(ground);
  }

  createGUI () {
    // Controles para el tamaño, la orientación y la posición de la caja

    var gui = new dat.GUI();

    var that = this;
    this.guiControls = new function () {

      this.lightIntensity = 0.5;
      this.axisOnOff = true;
      // Un botón para dejarlo todo en su posición inicial
      // Cuando se pulse se ejecutará esta función.
      this.addBox = function () {
        that.createBoxes(1);
      }

      this.addSphere = function () {
        that.createSpheres(1);
      }

      this.addLata = function () {
        that.createLatas(1);
      }

      this.addBarril = function () {
        that.createBarriles(1);
      }

      this.eraseBox = function () {
        that.removeAllObjectsOfType("caja");
      }

      this.eraseSphere = function () {
        that.removeAllObjectsOfType("esfera");
      }

      this.eraseLata = function () {
        that.removeAllObjectsOfType("lata");
      }

      this.eraseBarril = function () {
        that.removeAllObjectsOfType("barril");
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

    var folderCreacion = gui.addFolder("Crear figuras");

    folderCreacion.add (this.guiControls, 'addBox').name ('Añadir caja');
    folderCreacion.add (this.guiControls, 'addSphere').name ('Añadir esfera');
    folderCreacion.add (this.guiControls, 'addLata').name ('Añadir lata');
    folderCreacion.add (this.guiControls, 'addBarril').name ('Añadir barril');

    var folderEliminar = gui.addFolder("Eliminar figuras");

    folderEliminar.add (this.guiControls, 'eraseBox').name ('Eliminar cajas');
    folderEliminar.add (this.guiControls, 'eraseSphere').name ('Eliminar esferas');
    folderEliminar.add (this.guiControls, 'eraseLata').name ('Eliminar latas');
    folderEliminar.add (this.guiControls, 'eraseBarril').name ('Eliminar barriles');
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
    this.spotLight.position.set(0, 300, 0);
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

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  // crear cajas
  createBoxes(num_boxes){

    // las coordenadas x,z son iguales para todas las cajas
    // la coordenada y va aumentando
    // así aparecerán apiladas
    var x =  this.world.bodies[0].position.x //Math.random() * 300 ;
    var z = this.world.bodies[0].position.z - 60//Math.random() * 300;
    for (var i = 0; i < num_boxes; i++) {
      var y = 150 + i * 50;

      var caja = new Caja (x,y,z)
      this.world.addBody(caja.body);
      this.add(caja.mesh);

      this.pickableObjects.push(caja);
    }
  }

  // crear esferas
  createSpheres(num_spheres){

    // las coordenadas x,z son iguales para todas las esferas
    // la coordenada y va aumentando
    // así aparecerán apiladas
    var x =  Math.random() * 300 ;
    var z =  Math.random() * 300;
    for (var i = 0; i < num_spheres; i++) {
      var y = 150 + i * 50;

      var esfera = new Esfera (x,y,z)
      this.world.addBody(esfera.body);
      this.add(esfera.mesh);

      this.pickableObjects.push(esfera);
    }
  }

  // crear latas
  createLatas(num_latas){

    // las coordenadas x,z son iguales para todas las latas
    // la coordenada y va aumentando
    // así aparecerán apiladas
    var x =  Math.random() * 300 ;
    var z =  Math.random() * 300;
    for (var i = 0; i < num_latas; i++) {
      var y = 150 + i * 50;

      var cyl = new Lata (x,y,z)
      this.world.addBody(cyl.body);
      this.add(cyl.mesh);

      this.pickableObjects.push(cyl);
    }
  }

  // crear barriles
  createBarriles(num_barriles){

    var x =  Math.random() * 300 ;
    var z =  Math.random() * 300;
    for (var i = 0; i < num_barriles; i++) {
      var y = 150 + i * 50;

      var cyl = new Barril (x,y,z)
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
   this.world.gravity.set(0, -100, 0);
   this.world.quatNormalizeSkip = 0;
   this.world.quatNormalizeFast = false;

   var solver = new CANNON.GSSolver();

   this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
   this.world.defaultContactMaterial.contactEquationRelaxation = 4;

   solver.iterations = 5;
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

   // Create a sphere
   var mass = 100;
   var radio = 15;
   var sphereShape = new CANNON.Sphere(radio);
   this.sphereBody = new CANNON.Body({ mass: mass , shape: sphereShape});
   //this.sphereBody.addShape(sphereShape);
   this.sphereBody.position.set(0, 30, 0);
   this.sphereBody.linearDamping = 0.9;
   this.sphereBody.allowSleep = false;
   this.world.addBody(this.sphereBody);

   // Create a plane
   var groundShape = new CANNON.Plane();
   var groundBody = new CANNON.Body({ mass: 0 });
   groundBody.addShape(groundShape);
   groundBody.quaternion.setFromAxisAngle(
     new CANNON.Vec3(1, 0, 0),
     -Math.PI / 2
   );
   this.world.addBody(groundBody);
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


    //this.tiempo = Date.now();

    if (this.controls.enabled) {
      this.world.step(1 / 60)
      //this.world.step(1 / 60, ((Date.now() - this.tiempo) / 1000), 10);

      if (this.applicationMode === Estado.OBJECT_PICKED){
        var dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        var objeto_seleccionado = this.pickableObjects[this.pickedObjectIndex];

        objeto_seleccionado.followPlayer( this.controls.getObject().position.x + (50 * dir.x ),
                                          this.controls.getObject().position.y + (70 * dir.y),
                                          this.controls.getObject().position.z + (50 * dir.z ));
      }

      // Update box positions
      for (var i = 0; i < this.pickableObjects.length; i++) {
        this.pickableObjects[i].update();
      }
    }

    this.controls.update(Date.now() - this.tiempo);

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render(this, this.getCamera());
    this.tiempo = Date.now();
  }
}


/// La función   main
$(function () {
  var blocker = document.getElementById("blocker");
  var instructions = document.getElementById("instructions");

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());

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

        if (/Firefox/i.test(navigator.userAgent)) {
          var fullscreenchange = function (event) {
            if (
              document.fullscreenElement === element ||
              document.mozFullscreenElement === element ||
              document.mozFullScreenElement === element
            ) {
              document.removeEventListener(
                "fullscreenchange",
                fullscreenchange
              );
              document.removeEventListener(
                "mozfullscreenchange",
                fullscreenchange
              );

              element.requestPointerLock();
            }
          };

          document.addEventListener(
            "fullscreenchange",
            fullscreenchange,
            false
          );
          document.addEventListener(
            "mozfullscreenchange",
            fullscreenchange,
            false
          );

          element.requestFullscreen =
            element.requestFullscreen ||
            element.mozRequestFullscreen ||
            element.mozRequestFullScreen ||
            element.webkitRequestFullscreen;

          element.requestFullscreen();
        } else {
          element.requestPointerLock();
        }
      },
      false
    );
  } else {
    instructions.innerHTML =
      "Your browser doesn't seem to support Pointer Lock API";
  }


  // Que no se nos olvide, la primera visualización.
  scene.update();
});
