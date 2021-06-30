/// <reference path="/scripts/babylon.js" />

"use strict";

var canvas;
var engine;
var scene;

document.addEventListener("DOMContentLoaded", startBabylonJS, false);

function startBabylonJS() {
    if (BABYLON.Engine.isSupported()) {

        canvas = document.getElementById("renderCanvas");

        engine = new BABYLON.Engine(canvas, true);

        scene = new BABYLON.Scene(engine);

        var cam = new BABYLON.FreeCamera("freecam", new BABYLON.Vector3(0, 5, -10), scene);
        ///var cam = new BABYLON.ArcRotateCamera("arcCam", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), scene);
        cam.setTarget(new BABYLON.Vector3.Zero());
        cam.attachControl(canvas, false);
        //cam.checkCollisions = true
        //cam.applyGravity = true;

        var hemi = new BABYLON.HemisphericLight("hLight", BABYLON.Vector3(0,1,0), scene)
        //var light = new BABYLON.PointLight("pLight", new BABYLON.Vector3(5, 10, -5), scene);
        //light.diffuse = BABYLON.Color3.Blue();

        //var cube = new BABYLON.Mesh.CreateBox("cube", 2, scene);
        //cube.position.y += 2;
        //cube.checkCollisions = true

        var sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 2, scene);
        sphere.position.y = 1;

        var ground = BABYLON.Mesh.CreateGround("floor", 100, 100, 2, scene);
        ground.checkCollisions = true

        // Once the scene is loaded, just register a render loop to render it
        engine.runRenderLoop(function () {
            //engine.clear(new BABYLON.Color3(0.2, 0.2, 0.3), true);
            //cube.rotation.x += 0.01;
            //cube.rotation.y += 0.01;
            scene.render()
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        })
    }
}
