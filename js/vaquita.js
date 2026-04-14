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
  const ocean = new BABYLON.Sound( "oceanAmbient", "media/ocean-music.mp3", scene, function() { ocean.play();}, { loop:true, volume:0.5 } );

  //bubbles
  const bubbleEmitter = BABYLON.MeshBuilder.CreateSphere("bubbleEmitter", { diameter: 0.01 }, scene);
  bubbleEmitter.position = new BABYLON.Vector3(0, 0, -4);

  const bubbles = new BABYLON.ParticleSystem("bubbles", 80, scene);
  bubbles.emitter = bubbleEmitter;
  bubbles.direction1 = new BABYLON.Vector3(-0.1, 1, -0.1);
  bubbles.direction2 = new BABYLON.Vector3(0.1, 1.5, 0.1);
  bubbles.minLifeTime = 3; bubbles.maxLifeTime = 6;
  bubbles.emitRate = 15;
  bubbles.minSize = 0.02; bubbles.maxSize = 0.07;
  bubbles.color1 = new BABYLON.Color4(0.7, 0.9, 1.0, 0.6);
  bubbles.color2 = new BABYLON.Color4(0.5, 0.75, 1.0, 0.3);
  bubbles.start();

  //Vaquita
  // const result = await BABYLON.SceneLoader.ImportMeshAsync(
  //   "",
  //   "/models/",
  //   "vaquita.glb",
  //   scene
  // );
  // const vaquita = result.meshes[0];
  // vaquita.position = new BABYLON.Vector3(0, 1.2, -4);
  const result = await BABYLON.SceneLoader.ImportMeshAsync(
    "","/models/","vaquita.glb", scene
  );

  const vaquita = result.meshes.find(m => m.name !== "__root__");

  vaquita.position = new BABYLON.Vector3(0, 1, 2);
  vaquita.scaling = new BABYLON.Vector3(2, 2, 2);

  vaquita.showBoundingBox = true; 

  //animation- vaquita movement
  const swimAnim = new BABYLON.Animation ("swimBob", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

  swimAnim.setKeys([{frame:0, value:1.05}, {frame:45, value:1.35}, {frame:90, value:1.05}]);

  const driftAnim = new BABYLON.Animation ("driftSway", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

  driftAnim.setKeys([{frame:0, value:-0.18}, {frame:90, value:0.18}, {frame:180, value:-0.18}]);

  const easing = new BABYLON.SineEase();
  easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT); 
  swimAnim.setEasingFunction(easing);
  driftAnim.setEasingFunction(easing);

  vaquita.animations = [swimAnim, driftAnim];
  scene.beginAnimation (vaquita, 0, 180, true);

  vaquita.actionManager = new BABYLON.ActionManager(scene);
  vaquita.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger,() => { infoPanel.isVisible = true; })
  );

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

  const addRow = (label, value, isHeader = false) => {
    const txt = new BABYLON.GUI.TextBlock();
    txt.text = isHeader ? label : `${label}: ${value}`;
    txt.color = isHeader ? "#00bcd4" : "#ddeeff";
    txt.fontSize = isHeader ? 36 : 24;
    txt.textWrapping = true;
    txt.height = isHeader ? "80px" : "60px";
    stack.addControl(txt);
  };

    addRow("Vaquita  (Phocoena sinus)", "", true);
    addRow("Status",  "Critically Endangered — ~10 remain");
    addRow("Habitat", "Northern Gulf of California, Mexico");
    addRow("Diet",    "Small fish, squid, crustaceans");
    addRow("Threat",  "Bycatch in illegal gillnets");
    addRow("Act",     "Support Sea Shepherd Conservation");




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

  const playStage = (index) => {
    if (index >= stages.length) {
      document.getElementById("subtitle-overlay").textContent =
        "The Vaquita's future depends on us. Click the animal to learn more.";
      infoPanel.isVisible = true;
      return;
    }
    
    const s = stages[index];
    BABYLON.Animation.CreateAndStartAnimation(
      "stageScale", vaquita, "scaling", 30, 20,
      vaquita.scaling.clone(), s.scale,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    document.getElementById("subtitle-overlay").textContent =
      `${s.title}: ${s.text}`;
    setTimeout(() => playStage(index + 1), s.duration);
    };



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
    floorMeshes: [floor],
    optionalFeatures: true
  });
    
  return scene;
};

//loop
createScene().then((scene) => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());