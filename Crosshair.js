
class Crosshair extends THREE.Line {

  constructor(camera) {
    super();

    var material = new THREE.LineBasicMaterial({ color: 0xAAFFAA });
    // crosshair size
    var x = 0.01, y = 0.01;

    var geometry = new THREE.Geometry();

    // crosshair
    geometry.vertices.push(new THREE.Vector3(0, y, 0));
    geometry.vertices.push(new THREE.Vector3(0, -y, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(x, 0, 0));
    geometry.vertices.push(new THREE.Vector3(-x, 0, 0));

    var object = new THREE.Line( geometry, material );

    // place it in the center
    var crosshairPercentX = 50;
    var crosshairPercentY = 50;
    var crosshairPositionX = (crosshairPercentX / 100) * 2 - 1;
    var crosshairPositionY = (crosshairPercentY / 100) * 2 - 1;

    object.position.x = crosshairPositionX * camera.aspect;
    object.position.y = crosshairPositionY;

    object.position.z = -0.3;
  }
}
