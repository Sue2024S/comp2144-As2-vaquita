const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
  const scene = new BABYLON.Scene(engine);

  //camera
  const camera = new BABYLON.UniversalCamera(
    "camera",
    new BABYLON.Vector3(0, 1.6, 0), scene
  );

  camera.setTarget(new BABYLON.Vector3(0, 1.2, 5));
  camera.attachControl(canvas, true);
  camera.minZ = 0.1;

  //lighting
  const ambient = new BABYLON.HemisphericLight(
    "ambientLight",
    new BABYLON.Vector3(0, 1, 0), scene
  );

  ambient.intensity = 0.6;
  ambient.diffuse = new BABYLON.Color3(0.7, 0.85, 1.0);

  const sun = new BABYLON.DirectionalLight(
    "sunLight",
    new BABYLON.Vector3(-1, -2, 1),
    scene
  );
  sun.intensity = 0.8;
  sun.position = new BABYLON.Vector3(5, 10, -5);

  //habitat: fog
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogColor = new BABYLON.Color3(0.05, 0.18, 0.28);
  scene.fogDensity = 0.035;

  //habitat:sky
  const photDome = new BABYLON.PhotoDome("oceanSky", "media/ocean-360.jpg", { resolution: 32, size: 500 }, scene);

  //habitat: ocean floor
  const floor = BABYLON.MeshBuilder.CreateGround( 
    "oceanFloor",
    { width: 80, height: 80 },
    scene
  );

  const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
  floorMat.diffuseTexture = new BABYLON.Texture("media/ocean-floor.jpg", scene);
  floorMat.diffuseTexture.uScale = 8;
  floorMat.diffuseTexture.vScale = 8;
  floor.material = floorMat;
  floor.position.y = -1;

  //habitat: sound
  const ocean = new BABYLON.Sound( "oceanAmbient", "media/ocean-music.mp3", { loop: true, autoplay: true, volume: 0.4 });

  //bubbles
  const bubbleEmitter = BABYLON.MeshBuilder.CreateSphere("bubbleEmitter", { diameter: 0.01 }, scene);

  //Vaquita
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "",
    "models/",
    "vaquita.glb",
    scene
  );
  const vaquita = result.meshes[0];
  vaquita.position = new BABYLON.Vector3(0, 1.2, -4);

  //animation- vaquita movement
  const swimAnim = new BABYLON.Animation ("swimBob", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

  swimAnim.setKeys([{frame:0, value:1.05}, {frame:45, value:1.35}, {frame:90, value:1.05}]);

  //Info Panel
  const infoPanel = BABYLON.MeshBuilder.CreatePlane(
    "infoPanel", { width: 1.4, height: 1.1 }, scene
  );
  infoPanel.position = new BABYLON.Vector3(1.8, 1.5, -3.5);
  infoPanel.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
  infoPanel.isVisible = false;

  const panelTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    infoPanel, 1024, 820
  );
  
  const bg = new BABYLON.GUI.Rectangle();
  bg.background = "#001e2bcc";
  bg.cornerRadius = 16;
  bg.color = "#00bcd4";
  bg.thickness = 2;
  panelTexture.addControl(bg);

  const stack = new BABYLON.GUI.StackPanel();
  bg.addControl(stack);

  const closeBtn = BABYLON.GUI.Button.CreateSimpleButton("closeBtn", "✕ Close");
  closeBtn.width = "160px"; closeBtn.height = "52px";
  closeBtn.color = "#fff"; closeBtn.background = "#c0392b";
  closeBtn.fontSize = 22;
  closeBtn.onPointerClickObservable.add(() => { infoPanel.isVisible = false; });
  stack.addControl(closeBtn);

  //life journey info
  const stages = [
    {
      id: "calf",
      title: "Stage 1 — Birth",
      text: "A Vaquita calf is born in the calm lagoons of the Gulf of California.",
      scale: new BABYLON.Vector3(0.35, 0.35, 0.35),
      duration: 8000

    },
    { 
      id: "juvenile",
      title: "Stage 2 — Growing Up",
      text: "The juvenile learns to hunt, but illegal gillnets lurk everywhere.",
      scale: new BABYLON.Vector3(0.65, 0.65, 0.65),
      duration: 9000

    },
    {
      id: "adult",
      title: "Stage 3 — Adult",
      text: "Fewer than 10 adults are believed to survive today.",
      scale: new BABYLON.Vector3(1.0, 1.0, 1.0),
      duration: 10000
    },
  ];

  //life journey button
  const journeyPlane = BABYLON.MeshBuilder.CreatePlane(
    "journeyBtn", { width: 0.9, height: 0.22 }, scene
  );
  journeyPlane.position = new BABYLON.Vector3(0, 0.35, -3.5);
  journeyPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  const journeyTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    journeyPlane, 512, 128
  );
  const journeyBtn = BABYLON.GUI.Button.CreateSimpleButton(
    "startJourney", "▶  Begin Life Journey"
  );
  journeyBtn.color = "#ffffff";
  journeyBtn.background = "#006d6b";
  journeyBtn.fontSize = 28;
  journeyBtn.onPointerClickObservable.add(() => playStage(0));
  journeyTexture.addControl(journeyBtn);
  
  //enable WebXR
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [floor]
  });
    
  return scene;
};

//loop
createScene().then((scene) => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());