function buildHabitat(scene) {
    //fog
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogColor = new BABYLON.Color3(0.05, 0.18, 0.28);
    scene.fogDensity = 0.035;
    
    //ocean 360
    const photoDome = new BABYLON.PhotoDome(
        "oceanSky",
        "assets/ocean-360.jpg",
        { resolution: 32, size: 500 },
        scene
    );

    //ocean floor
    const floor = BABYLON.MeshBuilder.CreateGround(
        "oceanFloor",
        { width: 80, height: 80, subdivisions: 2 },
        scene
    );

    const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
    floorMat.diffuseTexture  = new BABYLON.Texture("assets/ocean-floor.jpg", scene);
    floorMat.diffuseTexture.uScale = 8;
    floorMat.diffuseTexture.vScale = 8;
    floorMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.15); 
    floor.material = floorMat;
    floor.position.y = -1;

    //ocean sound
    const music = new BABYLON.Sound(
        "oceanMusic",
    );


}