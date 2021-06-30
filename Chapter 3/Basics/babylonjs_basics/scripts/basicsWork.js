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
        //var cam = new BABYLON.FreeCamera("freecam", new BABYLON.Vector3(0, 2, -10), scene);
        var cam = new BABYLON.ArcRotateCamera("arcCam", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), scene);
        cam.attachControl(canvas);
        cam.checkCollisions = true
        cam.applyGravity = true;

        //var mySimpleMesh = new BABYLON.Mesh("myMesh", scene);
        //var myPlane = CreatePlane(2);
        //myPlane.applyToMesh(mySimpleMesh);

        var cube = new BABYLON.Mesh.CreateBox("cube", 2, scene);
        cube.position.y += 2;
        cube.checkCollisions = true

        var light = new BABYLON.PointLight("pLight", new BABYLON.Vector3(5, 10, -5), scene);
        light.diffuse = BABYLON.Color3.Blue();

        var hemi = new BABYLON.HemisphericLight("hLight", BABYLON.Vector3.Zero(), scene)

        var ground = BABYLON.Mesh.CreateGround("floor", 24, 25, 12, scene);
        ground.checkCollisions = true

        // Once the scene is loaded, just register a render loop to render it
        engine.runRenderLoop(function () {
            //engine.clear(new BABYLON.Color3(0.2, 0.2, 0.3), true);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            scene.render()
        });
    }
}

function CreatePlane(size) {
    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];

    size = size || 1;

    // Vertices
    var halfSize = size / 2.0;
    positions.push(-halfSize, -halfSize, 0);
    normals.push(0, 0, -1.0);
    uvs.push(0.0, 0.0);

    positions.push(halfSize, -halfSize, 0);
    normals.push(0, 0, -1.0);
    uvs.push(1.0, 0.0);

    positions.push(halfSize, halfSize, 0);
    normals.push(0, 0, -1.0);
    uvs.push(1.0, 0.0);

    positions.push(-halfSize, halfSize, 0);
    normals.push(0, 0, -1.0);
    uvs.push(0.0, 1.0);

    // Indices
    indices.push(0);
    indices.push(1);
    indices.push(2);

    indices.push(0);
    indices.push(2);
    indices.push(3);

    // Result
    var vertexData = new BABYLON.VertexData();

    vertexData.indices = indices;
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.uvs = uvs;

    return vertexData;
}