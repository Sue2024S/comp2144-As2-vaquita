const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    //lighting
    const ambientLight = new BABYLON.HemisphericLight(
    "ambientLight",
    new BABYLON.Vector3(0, 1, 0),
    scene
    );
    ambientLight.intensity = 0.6;
    ambientLight.diffuse   = new BABYLON.Color3(0.7, 0.85, 1.0);

    //directional sun to simulate sun
    const sunLight = new BABYLON.DirectionalLight(
        "sunLight",
        new BABYLON.Vector3(-1, -2, -1),
        scene
    );
    sunLight.intensity = 0.8;
    sunLight.positon = new BABYLON.Vector3(5, 10, -5);

    //camera
    const camera = new BABYLON.UniversalCamera(
        "camera",
        new BABYLON.Vector3(0, 1.6, 0),
        scene
    );
    camera.setTarget(new BABYLON.Vector3(0, 1.2, 5));
    camera.attachControl(canvas, true);
    camera.speed = 0.1;

};