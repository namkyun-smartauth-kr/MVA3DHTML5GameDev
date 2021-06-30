/*
window.onload = function () {
  main();
};

var canvas;
function main() {
  setControls();

    canvas = document.querySelector("#renderCanvas");
  var engine = new BABYLON.Engine(canvas, true);
  var scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.75, 0.75, 0.75);
  scene.ambientColor = new BABYLON.Color3(1, 1, 1);

  scene.debugLayer.show({ showExplorer: true, embedMode: true });

  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.3;

  var light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(-1, -1, -1), scene);
  light2.position = new BABYLON.Vector3(0, 128, 0);
  light2.intensity = 0.7;

  let groundMaterial = createGroundMaterial(scene);
  var ground = createGround(scene, groundMaterial);
  loadPlayer(scene, engine, canvas);

  window.addEventListener("resize", function () {
    engine.resize();
  });
}
*/

var cc;

function loadPlayer(scene, engine, canvas) {
  BABYLON.SceneLoader.ImportMesh("", "player/", "Vincent-frontFacing.babylon", scene, function (meshes, particleSystems, skeletons) {
    var player = meshes[0];
    var skeleton = skeletons[0];
    player.skeleton = skeleton;

    skeleton.enableBlending(0.1);
    //if the skeleton does not have any animation ranges then set them as below
    // setAnimationRanges(skeleton);

    var sm = player.material;
    if (sm.diffuseTexture != null) {
      sm.backFaceCulling = true;
      sm.ambientColor = new BABYLON.Color3(1, 1, 1);
    }

    player.position = new BABYLON.Vector3(0, 12, 0);
    player.checkCollisions = true;
    player.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
    player.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

    //rotate the camera behind the player
    //player.rotation.y = Math.PI / 4;
    //var alpha = -(Math.PI / 2 + player.rotation.y);
    var alpha = 0;
    var beta = Math.PI / 2.5;
    var target = new BABYLON.Vector3(player.position.x, player.position.y + 1.5, player.position.z);

    var camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", alpha, beta, 5, target, scene);

    //standard camera setting
    camera.wheelPrecision = 15;
    camera.checkCollisions = false;
    //make sure the keyboard keys controlling camera are different from those controlling player
    //here we will not use any keyboard keys to control camera
    camera.keysLeft = [];
    camera.keysRight = [];
    camera.keysUp = [];
    camera.keysDown = [];
    //how close can the camera come to player
    camera.lowerRadiusLimit = 2;
    //how far can the camera go from the player
    camera.upperRadiusLimit = 20;
    camera.attachControl(canvas, false);

    cc = new CharacterController(player, camera, scene);
    cc.setFaceForward(true);
    cc.setMode(0);
    cc.setTurnSpeed(45);
    //below makes the controller point the camera at the player head which is approx
    //1.5m above the player origin
    cc.setCameraTarget(new BABYLON.Vector3(0, 1.5, 0));

    //if the camera comes close to the player we want to enter first person mode.
    cc.setNoFirstPerson(false);
    //the height of steps which the player can climb
    cc.setStepOffset(0.4);
    //the minimum and maximum slope the player can go up
    //between the two the player will start sliding down if it stops
    cc.setSlopeLimit(30, 60);

    //tell controller
    // - which animation range should be used for which player animation
    // - rate at which to play that animation range
    // - wether the animation range should be looped
    //use this if name, rate or looping is different from default
    cc.setIdleAnim("idle", 1, true);
    cc.setTurnLeftAnim("turnLeft", 0.5, true);
    cc.setTurnRightAnim("turnRight", 0.5, true);
    cc.setWalkBackAnim("walkBack", 0.5, true);
    cc.setIdleJumpAnim("idleJump", 0.5, false);
    cc.setRunJumpAnim("runJump", 0.6, false);
    cc.setFallAnim("fall", 2, false);
    cc.setSlideBackAnim("slideBack", 1, false);

    var ua = window.navigator.userAgent;
    var isIE = /MSIE|Trident/.test(ua);
    if (isIE) {
      //IE specific code goes here
      cc.setJumpKey("spacebar");
    }

    cc.start();

    engine.runRenderLoop(function () {
      scene.render();
    });

    cmds = [cc.walk, cc.walkBack, cc.run, cc.jump, cc.turnLeft, cc.turnRight, cc.strafeLeft, cc.strafeRight];
    showControls();
    canvas.focus();
  });
}

//this is how you might set the animation ranges for a skeleton
function setAnimationRanges(skel) {
  delAnimRanges(skel);

  skel.createAnimationRange("fall", 0, 16);
  skel.createAnimationRange("idle", 21, 65);
  skel.createAnimationRange("jump", 70, 94);
  skel.createAnimationRange("run", 100, 121);
  skel.createAnimationRange("slideBack", 125, 129);
  skel.createAnimationRange("strafeLeft", 135, 179);
  skel.createAnimationRange("strafeRight", 185, 229);
  skel.createAnimationRange("turnLeft", 240, 262);
  skel.createAnimationRange("turnRight", 270, 292);
  skel.createAnimationRange("walk", 300, 335);
  skel.createAnimationRange("walkBack", 340, 366);
}
/*
 * delete all existing ranges
 * @param {type} skel
 * @returns {undefined}
 */
function delAnimRanges(skel) {
  let ars = skel.getAnimationRanges();
  let l = ars.length;
  for (let i = 0; i < l; i++) {
    let ar = ars[i];
    console.log(ar.name + "," + ar.from + "," + ar.to);
    skel.deleteAnimationRange(ar.name, false);
  }
}

function createGround(scene, groundMaterial) {
  BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "ground",
    "ground/ground_heightMap.png",
    {
      width: 128,
      height: 128,
      minHeight: 0,
      maxHeight: 10,
      subdivisions: 32,
      onReady: function (grnd) {
        grnd.material = groundMaterial;
        grnd.checkCollisions = true;
        grnd.isPickable = true;
        grnd.freezeWorldMatrix();
      },
    },
    scene
  );
}

function createGroundMaterial(scene) {
  let groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
  groundMaterial.diffuseTexture = new BABYLON.Texture("ground/ground.jpg", scene);
  groundMaterial.diffuseTexture.uScale = 4.0;
  groundMaterial.diffuseTexture.vScale = 4.0;

  groundMaterial.bumpTexture = new BABYLON.Texture("ground/ground-normal.png", scene);
  groundMaterial.bumpTexture.uScale = 12.0;
  groundMaterial.bumpTexture.vScale = 12.0;

  groundMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.6, 0.4);
  groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  return groundMaterial;
}

var showHelp = function () {
  var el = document.getElementById("overlay");
  el.style.visibility = el.style.visibility == "visible" ? "hidden" : "visible";
  canvas.focus();
};

function showControls() {
  var el = document.getElementById("controls");
  el.style.visibility = "visible";
}

var w,
  wb,
  wbf,
  r,
  j,
  tl,
  tlf,
  tr,
  trf,
  sl,
  slf,
  sr,
  srf = false;

function toggleClass(e) {
  e.target.classList.toggle("w3-pale-red");
  e.target.classList.toggle("w3-pale-green");
  canvas.focus();
}
function setControls() {
  const x = document.getElementsByTagName("button");

  for (i = 0; i < x.length; i++) {
    x[i].className = "w3-btn w3-border w3-round w3-pale-red";
  }

  document.getElementById("pl").onclick = function (e) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock || false;
    if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
    canvas.focus();
  };

  document.getElementById("w").onclick = function (e) {
    cc.walk((w = !w));
    toggleClass(e);
  };
  document.getElementById("wb").onclick = function (e) {
    cc.walkBack((wb = !wb));
    toggleClass(e);
  };
  document.getElementById("wbf").onclick = function (e) {
    cc.walkBackFast((wbf = !wbf));
    toggleClass(e);
  };
  document.getElementById("r").onclick = function (e) {
    cc.run((r = !r));
    toggleClass(e);
  };
  document.getElementById("j").onclick = function (e) {
    cc.jump();
    canvas.focus();
  };
  document.getElementById("tl").onclick = function (e) {
    cc.turnLeft((tl = !tl));
    toggleClass(e);
  };
  document.getElementById("tlf").onclick = function (e) {
    cc.turnLeftFast((tlf = !tlf));
    toggleClass(e);
  };
  document.getElementById("tr").onclick = function (e) {
    cc.turnRight((tr = !tr));
    toggleClass(e);
  };
  document.getElementById("trf").onclick = function (e) {
    cc.turnRightFast((trf = !trf));
    toggleClass(e);
  };
  document.getElementById("sl").onclick = function (e) {
    cc.strafeLeft((sl = !sl));
    toggleClass(e);
  };
  document.getElementById("slf").onclick = function (e) {
    cc.strafeLeftFast((slf = !slf));
    toggleClass(e);
  };
  document.getElementById("sr").onclick = function (e) {
    cc.strafeRight((sr = !sr));
    toggleClass(e);
  };
  document.getElementById("srf").onclick = function (e) {
    cc.strafeRightFast((srf = !srf));
    toggleClass(e);
  };

  document.getElementById("tp").onclick = function (e) {
    cc.setMode(0);
    canvas.focus();
  };
  document.getElementById("td").onclick = function (e) {
    cc.setMode(1);
    canvas.focus();
  };
  document.getElementById("toff").onclick = function (e) {
    cc.setTurningOff(e.target.checked);
    canvas.focus();
  };
  document.getElementById("kb").onclick = function (e) {
    cc.enableKeyBoard(e.target.checked);
    canvas.focus();
  };
  document.getElementById("help").onclick = showHelp;
  document.getElementById("closehelp").onclick = showHelp;
}

var prevTarget;
var prevlinename;
var prevtargetname;
var click;

var makeOverOut = function (mesh, scene, advancedTexture) {
    console.log('makeOverOut - in');
    mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOutTrigger, mesh, 'visibility', 1, 300));
    console.log('makeOverOut - 1');
    mesh.actionManager.registerAction(new BABYLON.InterpolateValueAction(BABYLON.ActionManager.OnPointerOverTrigger, mesh, 'visibility', .2, 300));
    console.log('makeOverOut - 2');
    mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,
            function () {
                //click.play();
                var items = BABYLON.SceneSerializer.SerializeMesh(mesh);
                var font_type = "Arial";
                if (prevTarget) {
                    advancedTexture.removeControl(prevtargetname);
                    advancedTexture.removeControl(prevlinename);
                }
                console.log('makeOverOut - 3 : ' + items.meshes[0].name);
                var intext = JSON.stringify(items.meshes[0].name);
                intext = retTexttoShow(intext);
                var label = new BABYLON.GUI.TextBlock();
                label.text = intext;

                console.log('makeOverOut - 4 : ' + label.text);
                var target = getTarget();
                var rect1 = getRect();
                var line1 = getLine();

                console.log('makeOverOut - 5');
                advancedTexture.addControl(line1);
                advancedTexture.addControl(rect1);
                advancedTexture.addControl(target);
                rect1.addControl(label);

                console.log('makeOverOut - 6');
                target.linkWithMesh(mesh);
                line1.linkWithMesh(mesh);
                line1.connectedControl = rect1;

                console.log('makeOverOut - 7');
                prevTarget = true;
                prevtargetname = target;
                prevlinename = line1;
            }
        )
    );
    console.log('makeOverOut - out');
}

function retTexttoShow(inptext) {
    /*
    var outtext = "Info";
    if (inptext.toString().include("Tree")) {
        outtext = "Info- Tree";
    }
    */
    outtext = "Info- " + inptext;
    return outtext;
}

function getRect() {
    var rect1 = new BABYLON.GUI.Rectangle();
    rect1.width = 0.2;
    rect1.height = "140px";
    rect1.cornerRadius = 20;
    rect1.color = "#e8eded";
    rect1.thickness = 4;
    rect1.background = "#202438"
    rect1.top = "-200px"
    rect1.left = "50px";
    rect1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    return rect1;
}

function getTarget() {
    var target = new BABYLON.GUI.Ellipse();
    target.width = "20px";
    target.height = "20px";
    target.color = "#005791";
    target.thickness = 1;
    target.background = "#202438"
    return target;
}

function getLine() {
    var line = new BABYLON.GUI.Line();
    line.lineWidth = 4;
    line.color = "#e8eded"
    line.y2 = 20;
    line.dash = [5, 10];
    return line;
}

function addMeshatRuntime() {
    var fontType = "Arial";
    var planeWidth = 10;
    var planeHeight = 3;
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", { width: planeWidth, height: planeHeight }, scene);
    var DTWidth = planeWidth * 60;
    var DTHeight = planeHeight * 60;
    var text = JSON.stringify(items.meshes[0].name);
    if (text.toString().includes("Tree")) {
        text = "Info- Tree";
    }
}