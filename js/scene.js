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
    camera.minZ = 0.1;

    //enable hand tracking
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [scene.getMeshByName("oceanFloor")],
        optionalFeatures: true 
    });

    //position user looking at Vaquita
    xrHelper.baseExperience.onStateChangedObservable.add((state) => {
        if (state === BABYLON.WebXRState.IN_XR) {
            xrHelper.baseExperience.setPositionOfCameraUsingContainer(
                new BABYLON.Vector3(0, xrHelper.baseExperience.camera.position.y, 0)
            );
        }
    });

    return scene;

};