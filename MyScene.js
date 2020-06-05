/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

import { PointerLockControls2 } from './libs/PointerLockControls2.js';
var sphereBody;
class MyScene extends THREE.Scene {
  constructor(myCanvas) {
    super();

    // estado de la aplicación: no acción (0)
    this.applicationMode = MyScene.noAction;

    // fondo
    //this.background = new THREE.TextureLoader().load( "imgs/tierra.jpg" );

    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);

    // Se añade a la gui los controles para manipular los elementos de esta clase
    this.gui = this.createGUI();

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights();

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera();

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    // Un suelo
    this.createGround ();

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    this.axis = new THREE.AxesHelper(5);
    this.add(this.axis);

    this.world = iniciarCanon();

    // Add boxes
    var material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
    var halfExtents = new CANNON.Vec3(15,15,15);
    var boxShape = new CANNON.Box(halfExtents);
    var boxGeometry = new THREE.BoxGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);

    this.boxes = [];
    this.boxMeshes = [];
    for(var i=0; i<7; i++){
        var x = (Math.random()-0.5)*500;
        var y = 15 + (Math.random())*50;
        var z = (Math.random()-0.5)*500;
        var boxBody = new CANNON.Body({ mass: 5 });
        boxBody.addShape(boxShape);
        var boxMesh = new THREE.Mesh( boxGeometry, material );
        this.world.addBody(boxBody);
        this.add(boxMesh);
        boxBody.position.set(x,y,z);
        boxMesh.position.set(x,y,z);
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        this.boxes.push(boxBody);
        this.boxMeshes.push(boxMesh);
    }

   // para controles y movimiento
    this.controls = new PointerLockControls2( this.camera, sphereBody );
    this.add(this.controls.getObject());
    this.VELOCIDAD_PERSONAJE = 1000;
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.tiempo = Date.now();
  }

  createCamera() {
    // Para crear una cámara le indicamos
    //   El ángulo del campo de visión en grados sexagesimales
    //   La razón de aspecto ancho/alto
    //   Los planos de recorte cercano y lejano
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
    // También se indica dónde se coloca
    this.camera.position.set(0, 30, 0);

    /* GESTOR DE CAMARA */
    /* hay que sustituir por raycasting */
    // Y hacia dónde mira
    //var look = new THREE.Vector3(0, 0, 0);

    //this.camera.lookAt(look);

    this.add(this.camera);

    // Para el control de cámara usamos una clase que ya tiene implementado los movimientos de órbita
    /*
    this.cameraControl = new THREE.TrackballControls(
      this.camera,
      this.renderer.domElement
    );
    // Se configuran las velocidades de los movimientos
    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    // Debe orbitar con respecto al punto de mira de la cámara
    this.cameraControl.target = look;
    */
  }

  createGround () {
    // El suelo es un Mesh, necesita una geometría y un material.

    // La geometría es una caja con muy poca altura
    var geometryGround = new THREE.BoxGeometry ( window.innerWidth,0.2, window.innerWidth);

    // El material se hará con una textura de madera
    var texture = new THREE.TextureLoader().load('imgs/textura-ajedrezada-grande.jpg');
    var materialGround = new THREE.MeshPhongMaterial ({map: texture});

    // Ya se puede construir el Mesh
    var ground = new THREE.Mesh (geometryGround, materialGround);

    // Todas las figuras se crean centradas en el origen.
    // El suelo lo bajamos la mitad de su altura para que el origen del mundo se quede en su lado superior
    ground.position.y = -0.1;

    // Que no se nos olvide añadirlo a la escena, que en este caso es  this
    this.add (ground);
  }

  createGUI() {
    // Se crea la interfaz gráfica de usuario
    var gui = new dat.GUI();

    // La escena le va a añadir sus propios controles.
    // Se definen mediante una   new function()
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = new (function () {
      // En el contexto de una función   this   alude a la función
      this.lightIntensity = 0.5;
      this.axisOnOff = true;
    })();

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder("Luz y Ejes");

    // Se le añade un control para la intensidad de la luz
    folder
      .add(this.guiControls, "lightIntensity", 0, 1, 0.1)
      .name("Intensidad de la Luz : ");

    // Y otro para mostrar u ocultar los ejes
    folder.add(this.guiControls, "axisOnOff").name("Mostrar ejes : ");

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

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
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

  update() {
    // Este método debe ser llamado cada vez que queramos visualizar la escena de nuevo.

    // Literalmente le decimos al navegador: "La próxima vez que haya que refrescar la pantalla, llama al método que te indico".
    // Si no existiera esta línea,  update()  se ejecutaría solo la primera vez.
    requestAnimationFrame(() => this.update());

    this.raycaster.ray.origin.copy( this.controls.getObject().position );
		this.raycaster.ray.origin.y -= 10;


    // Se actualizan los elementos de la escena para cada frame
    // Se actualiza la intensidad de la luz con lo que haya indicado el usuario en la gui
    this.spotLight.intensity = this.guiControls.lightIntensity;

    // Se muestran o no los ejes según lo que idique la GUI
    this.axis.visible = this.guiControls.axisOnOff;

    // Se actualiza la posición de la cámara según su controlador
    //this.cameraControl.update();

    this.tiempo = Date.now();
    var delta = (this.tiempo - this.tiempoAnterior) / 1000;
/*
    // deceleración
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    if (this.controls.getObject().position.y > 30){
      	this.velocity.y -= 9.8 * 100.0 * delta; // gravedad - masa = 100
        if (this.applicationMode === MyScene.jumping){
          this.applicationMode = MyScene.noAction;
        }
    }
    else {
      this.velocity.y = 0;
    }
*/


    /*
    if (this.applicationMode === MyScene.moveForward){
        this.velocity.z -=  this.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
        this.controls.moveForward(- this.velocity.z * delta)
    }
    else if (this.applicationMode === MyScene.moveBackward){
        this.velocity.z +=  this.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
        this.controls.moveForward(- this.velocity.z * delta)
    }
    else if (this.applicationMode === MyScene.moveRight){
        this.velocity.x -=  this.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
        this.controls.moveRight(- this.velocity.x * delta)
    }
    else if (this.applicationMode === MyScene.moveLeft){
        this.velocity.x +=  this.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
        this.controls.moveRight(- this.velocity.x * delta)
    }
    else if (this.applicationMode === MyScene.jumping){
      this.velocity.y += this.VELOCIDAD_PERSONAJE/3 ;
    }

    this.controls.getObject().position.y += ( this.velocity.y * delta ); // new behavior
    */

    //this.controls.update( delta );


    if(this.controls.enabled){
      this.world.step(1/60);

      // Update box positions
      for(var i=0; i<this.boxes.length; i++){
          this.boxMeshes[i].position.copy(this.boxes[i].position);
          this.boxMeshes[i].quaternion.copy(this.boxes[i].quaternion);
      }
    }


    this.controls.update( Date.now() - this.tiempo );
    //this.controls.update( delta );

    // Le decimos al renderizador "visualiza la escena que te indico usando la cámara que te estoy pasando"
    this.renderer.render(this, this.getCamera());
    this.tiempo = Date.now();
  }
}

// constantes numéricas para los estados
// de la aplicación
MyScene.noAction = 0;
MyScene.moveForward = 1;
MyScene.moveBackward = 2;
MyScene.moveLeft = 3;
MyScene.moveRight = 4;
MyScene.jumping = 5;

/// La función   main
$(function () {

  var blocker = document.getElementById( 'blocker' );
  var instructions = document.getElementById( 'instructions' );

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());

  var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

    var element = document.body;

    var pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

            scene.controls.enabled = true;

            blocker.style.display = 'none';

        } else {

            scene.controls.enabled = false;

            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';

        }

    }

    var pointerlockerror = function ( event ) {
        instructions.style.display = '';
    }

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    instructions.addEventListener( 'click', function ( event ) {
        instructions.style.display = 'none';

        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

        if ( /Firefox/i.test( navigator.userAgent ) ) {

            var fullscreenchange = function ( event ) {

                if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                    document.removeEventListener( 'fullscreenchange', fullscreenchange );
                    document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                    element.requestPointerLock();
                }

            }

            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

            element.requestFullscreen();

        } else {

            element.requestPointerLock();

        }

    }, false );

} else {

    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}
/*
  function onKeyDown ( event ) {

    // la tecla que ha pulsado el usuario
    var tecla = event.which || event.keyCode;
    var delta = (this.tiempo - this.tiempoAnterior) / 1000;

      switch (tecla) {

        case 38: // up
        case 87: // w
          scene.velocity.z -=  scene.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
          scene.controls.moveForward(- scene.velocity.z * delta)
          break;

        case 37: // left
        case 65: // a
        scene.velocity.x -=  scene.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
        scene.controls.moveRight(- scene.velocity.x * delta)
          break;

        case 40: // down
        case 83: // s
        scene.velocity.z +=  scene.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
        scene.controls.moveForward(- scene.velocity.z * delta)
          break;

        case 39: // right
        case 68: // d
        scene.velocity.x +=  scene.VELOCIDAD_PERSONAJE * delta; // avance en el eje z
        scene.controls.moveRight(- scene.velocity.x * delta)
          break;

        case 32: // space
          if ( scene.applicationMode != MyScene.jumping ){
            scene.velocity.y += scene.VELOCIDAD_PERSONAJE/3 ;
          }
          break;
      }

  };

  function onKeyUp ( event ) {

    // la tecla que ha pulsado el usuario
    var tecla = event.which || event.keyCode;

    switch (tecla) {
      case 38: // up
      case 87: // w
        if (scene.applicationMode === MyScene.moveForward){
            scene.applicationMode = MyScene.noAction
        }
        break;

      case 37: // left
      case 65: // a
        if (scene.applicationMode === MyScene.moveLeft){
          scene.applicationMode = MyScene.noAction
        }
        break;

      case 40: // down
      case 83: // s
        if (scene.applicationMode === MyScene.moveBackward){
          scene.applicationMode = MyScene.noAction
        }
        break;

      case 39: // right
      case 68: // d
        if (scene.applicationMode === MyScene.moveRight){
          scene.applicationMode = MyScene.noAction;
        }
        break;
    }

  };
  */
/*
  document.addEventListener( 'keydown', event => onKeyDown(event), false );
  document.addEventListener( 'keyup',  event => onKeyUp(event), false );
*/

/*
  instructions.addEventListener( 'click', function () {

    scene.controls.lock();

  }, false );


  scene.controls.getObject().addEventListener( 'lock', function () {

    instructions.style.display = 'none';
    blocker.style.display = 'none';

  } );

  scene.controls.getObject().addEventListener( 'unlock', function () {

    blocker.style.display = 'block';
    instructions.style.display = '';

  } );
*/

  // Que no se nos olvide, la primera visualización.
  scene.update();
});

function iniciarCanon() {

  var world;
  // Crear el mundo
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  var solver = new CANNON.GSSolver();

  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 7;
  solver.tolerance = 0.1;
  var split = true;
  if(split)
      world.solver = new CANNON.SplitSolver(solver);
  else
      world.solver = solver;

  world.gravity.set(0,-20,0);
  world.broadphase = new CANNON.NaiveBroadphase();

  // Create a slippery material (friction coefficient = 0.0)
  var physicsMaterial = new CANNON.Material("slipperyMaterial");
  var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial,
                                                          0.0, // friction coefficient
                                                          0.3);  // restitution
  // We must add the contact materials to the this.world
  world.addContactMaterial(physicsContactMaterial);

  // Create a sphere
  var mass = 5, radius = 1.3;
  var sphereShape = new CANNON.Sphere(radius);
  sphereBody = new CANNON.Body({ mass: mass });
  sphereBody.addShape(sphereShape);
  sphereBody.position.set(0,5,0);
  sphereBody.linearDamping = 0.9;
  world.addBody(sphereBody);

  // Create a plane
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  world.addBody(groundBody);

  return world;
}
