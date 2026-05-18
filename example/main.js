/**
 * Babylon FPS Demo – main.js med mobilkontroller
 * Baserad på originalprojektet + din vapenkod
 */

// === BASIC ENGINE / SCENE SETUP ===
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);

var scene = new BABYLON.Scene(engine);
scene.gravity = new BABYLON.Vector3(0, -0.2, 0);
scene.collisionsEnabled = true;

// Kamera
var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
camera.attachControl(canvas, true);
camera.checkCollisions = true;
camera.applyGravity = true;
camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
camera.speed = 0.5;
camera.keysUp = [87];    // W
camera.keysDown = [83];  // S
camera.keysLeft = [65];  // A
camera.keysRight = [68]; // D

// Ljus
var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.9;

// Enkel mark
var ground = BABYLON.Mesh.CreateGround("ground", 200, 200, 2, scene);
ground.checkCollisions = true;

// Ljud (placeholder – byt till dina riktiga om du vill)
var hq = new BABYLON.Sound("switchWeapon", "../sound/switch.wav", scene, null, { loop: false, autoplay: false });

// === DIN BEFINTLIGA KOD (VAPEN, ANIMATIONER, PARTIKLAR) ===

var countLoad=0

function lookAt(tM, lAt) {
    lAt = lAt.subtract(tM.position);
    tM.rotation.y = -Math.atan2(lAt.z, lAt.x) - Math.PI/2;
}

var models=[
   {"fileSrc":"../example/model/fps_q1_1/", "fileName":"fps_q1_1.babylon","pName":"M60机关枪","mAttr":1,"position":new BABYLON.Vector3(0, 0, 0.5),"rotation": new BABYLON.Vector3(0, Math.PI, 0)},
   {"fileSrc":"../example/model/fps_q2_1/", "fileName":"fps_q2_1.babylon","pName":"手枪","mAttr":1,"position":new BABYLON.Vector3(0, 0, 0.1),"rotation":new BABYLON.Vector3(0, Math.PI, 0)},
   {"fileSrc":"../example/model/fps_q3_2/", "fileName":"fps_q3_2.babylon","pName":"光剑","mAttr":1,"position":new BABYLON.Vector3(0, 0, 0.3),"rotation":new BABYLON.Vector3(0, Math.PI, 0)},
];

var fps_D=[]

function loadMeshes(models,sccuess){
    var countMesh=0;
    models.forEach(function (model,i){
        BABYLON.SceneLoader.ImportMesh("", model.fileSrc, model.fileName, scene, function(newMeshes,particleSystems,skeletons) {

            countLoad++

            fps_D[i] = BABYLON.Mesh.CreateBox("crate"+i, 2, scene);
            newMeshes.forEach(function(mesh){
                mesh.alwaysSelectAsActiveMesh = true;
                mesh.computeBonesUsingShaders = false;

                mesh.renderingGroupId=1

                if (mesh.material && mesh.material.subMaterials) {
                    mesh.material.subMaterials.forEach(function (mat) {
                        mat.backFaceCulling=false;
                    });
                }

                mesh.name=model.pName;
                if(model.mAttr==1){
                    fps_D[i].material = new BABYLON.StandardMaterial("Mat"+i, scene);
                    fps_D[i].material.alpha=0;
                    fps_D[i].scaling=new BABYLON.Vector3(-0.1,0.1,0.1)
                    fps_D[i].position = model.position;
                    fps_D[i].rotation = model.rotation;
                    fps_D[i].parent=camera;
                    fps_D[i].checkCollisions = false;
                    fps_D[i].isPickable=false
                    mesh.parent= fps_D[i]
                    mesh.isPickable=false
                }
            });

            countMesh++
            if(countMesh==models.length){
                sccuess()
            }
        })
    })
}

var FpsPlayAn=[
    {
        "name":"M60机关枪",
        "id":[],
        "animations":{
            "show":[300,330],
            "keep":[0,70],
            "do":[71,90],
            "reload":[125,297]
        },
        "time":[50,400]
    },
    {
        "name":"手枪",
        "id":[],
        "animations":{
            "show":[214,243],
            "keep":[0,50],
            "do":[83,114],
            "reload":[144,212]
        },
        "time":[50,100]
    },
    {
        "name":"光剑",
        "id":[],
        "animations":{
            "show":[753,800],
            "keep":[801,919],
            "do":[920,955],
            "reload":null
        },
        "time":[50,0]
    }
];

function AniFps(FpsPlayAn,i){
    var showTime;
    var doTime;

    this.keep=function(){
        var mesh=scene.getMeshByName(FpsPlayAn[i].name)
        scene.beginAnimation(mesh, FpsPlayAn[i].animations.keep[0], FpsPlayAn[i].animations.keep[1], true, 0.7);
    }
    this.do=function(){
        clearTimeout(doTime)
        var mesh=scene.getMeshByName(FpsPlayAn[i].name)
        scene.beginAnimation(mesh, FpsPlayAn[i].animations.do[0], FpsPlayAn[i].animations.do[1], false, 0.7);

        doTime=setTimeout(function(){
            scene.beginAnimation(mesh, FpsPlayAn[i].animations.keep[0], FpsPlayAn[i].animations.keep[1], true, 0.7);
        },(FpsPlayAn[i].animations.do[1]-FpsPlayAn[i].animations.do[0])*FpsPlayAn[i].time[0])
    }
    this.reload=function(){
        clearTimeout(doTime)
        var mesh=scene.getMeshByName(FpsPlayAn[i].name)
        if (FpsPlayAn[i].animations.reload) {
            scene.beginAnimation(mesh, FpsPlayAn[i].animations.reload[0], FpsPlayAn[i].animations.reload[1], false, 0.7);

            doTime=setTimeout(function(){
                scene.beginAnimation(mesh, FpsPlayAn[i].animations.keep[0], FpsPlayAn[i].animations.keep[1], true, 0.7);
            },(FpsPlayAn[i].animations.do[1]-FpsPlayAn[i].animations.do[0])*FpsPlayAn[i].time[1])
        }
    }

    this.show=function(){
        clearTimeout(showTime)
        var mesh=scene.getMeshByName(FpsPlayAn[i].name)

        FpsPlayAn.forEach(function (fpsmesh) {
            var m = scene.getMeshByName(fpsmesh.name);
            if (m) m.visibility=0;
        })

        mesh.visibility=1
        scene.beginAnimation(mesh, FpsPlayAn[i].animations.show[0], FpsPlayAn[i].animations.show[1], false, 0.7);

        showTime=setTimeout(function(){
            scene.beginAnimation(mesh, FpsPlayAn[i].animations.keep[0], FpsPlayAn[i].animations.keep[1], true, 0.7);
        },(FpsPlayAn[i].animations.show[1]-FpsPlayAn[i].animations.show[0])*50)
    }
}

var v_1= new AniFps(FpsPlayAn,0)
var v_2= new AniFps(FpsPlayAn,1)
var v_3= new AniFps(FpsPlayAn,2)

var qiangState = 1;
var jumpState=0;

// Tangentbordsinput
function keyevent(e){
    var code = e.keyCode || e.which;
    if(code==49){ // 1
        v_1.show()
        qiangState=1
        setTimeout(function(){ hq.play() },500)
    }else if(code==50){ // 2
        v_2.show()
        qiangState=2
        setTimeout(function(){ hq.play() },500)
    }else if(code==51){ // 3
        v_3.show()
        qiangState=3
        setTimeout(function(){ hq.play() },500)
    }else if(code==81){ // Q
        setTimeout(function(){ hq.play() },500)
        if(qiangState==1){
            qiangState=2
        }else{
            qiangState=1
        }
    }else if(code==82){ // R
        if(qiangState==1){
            v_1.reload()
        }else if(qiangState==2){
            v_2.reload()
        }else if(qiangState==3){
            v_3.reload()
        }
    }else if(code==32){ // SPACE
        if(jumpState==0){
            scene.gravity = new BABYLON.Vector3(0, 0.4, 0);
            setTimeout(function(){
                scene.gravity = new BABYLON.Vector3(0, -0.2, 0);
            },100)

            jumpState=1
            setTimeout(function(){
                scene.gravity = new BABYLON.Vector3(0, -0.2, 0);
                jumpState=0
            },500)
        }
    }
}

function keyevent2(e){
    // Släpp-tangent om du vill lägga något här
}

//枪得状态 – används inte här men lämnas kvar
function setQiangState(qiangState){
    // Lämnar denna orörd, men dina mesh-ID:n finns troligen i originalscenen
}

//枪口火焰
function freeHuoConstructor(mesh){
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("../images/boom.png", scene);
    particleSystem.emitter = mesh;
    particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0);
    particleSystem.minEmitBox = new BABYLON.Vector3(0, -0, -0);
    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 0.5);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 0.5);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0);
    particleSystem.minSize =0.5;
    particleSystem.maxSize = 0.8;
    particleSystem.minLifeTime = 0.0001;
    particleSystem.maxLifeTime = 0.0001;
    particleSystem.emitRate = 150;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
    particleSystem.direction1 = new BABYLON.Vector3(-0, -0, 1000);
    particleSystem.direction2 = new BABYLON.Vector3(0, 0, 1000);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 5;

    this.start=function(){ particleSystem.start(); }
    this.stop=function(){ particleSystem.stop(); }
}

//雨雪
function Yu(mesh){
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("../images/yun.png", scene);
    particleSystem.emitter = mesh;
    particleSystem.maxEmitBox = new BABYLON.Vector3(150, 150, 150);
    particleSystem.minEmitBox = new BABYLON.Vector3(-150, -150, -150);
    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1);
    particleSystem.color2 = new BABYLON.Color4(1,1, 1.0, 1);
    particleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 1);
    particleSystem.minSize =1;
    particleSystem.maxSize = 4;
    particleSystem.minLifeTime = 0.4;
    particleSystem.maxLifeTime = 5;
    particleSystem.emitRate = 900;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    particleSystem.gravity = new BABYLON.Vector3(0, -100, 0);
    particleSystem.direction1 = new BABYLON.Vector3(-2, -2, -2);
    particleSystem.direction2 = new BABYLON.Vector3(2, -2, 2);
    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;
    particleSystem.minEmitPower = 10;
    particleSystem.maxEmitPower = 30;
    particleSystem.updateSpeed = 0.009;

    this.start=function(){ particleSystem.start(); }
    this.stop=function(){ particleSystem.stop(); }
}

//枪孔爆炸烟雾
function setBooms(position){
    var fountain = BABYLON.Mesh.CreateBox("fountain", 1.0, scene);
    fountain.isPickable=false
    fountain.visibility=0;
    fountain.rotation.x=Math.PI*0.9;
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("../images/yun.png", scene);
    particleSystem.emitter = fountain;
    particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
    particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 1);
    particleSystem.color2 = new BABYLON.Color4(0.8,0.8, 0.8, 1);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);
    particleSystem.minSize = 0.2;
    particleSystem.maxSize = 1;
    particleSystem.minLifeTime = 6;
    particleSystem.maxLifeTime = 6;
    particleSystem.emitRate = 5;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    particleSystem.direction1 = new BABYLON.Vector3(0, -0.4, 0);
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 1;
    particleSystem.updateSpeed = 100;
    particleSystem.stop();

    this.start=function(){ particleSystem.start(); }
    this.stop=function(){ particleSystem.stop(); }
    this.Position=function(position){ fountain.position=position; }

    fountain.position=position;
}

//喷射血液
function Xues(position){
    var fountain = BABYLON.Mesh.CreateBox("fountainXue", 1.0, scene);
    fountain.isPickable=false
    fountain.visibility=0;
    fountain.rotation.x=Math.PI*0.9;
    var particleSystem = new BABYLON.ParticleSystem("particlesXue", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("../images/yun.png", scene);
    particleSystem.emitter = fountain;
    particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0);
    particleSystem.color1 = new BABYLON.Color4(.8, 0, 0 ,1.0);
    particleSystem.color2 = new BABYLON.Color4(.8, 0, 0 ,1.0);
    particleSystem.colorDead = new BABYLON.Color4(.8, 0, 0 ,0);
    particleSystem.minSize = .2;
    particleSystem.maxSize = 1;
    particleSystem.minLifeTime = 6;
    particleSystem.maxLifeTime = 6;
    particleSystem.emitRate = 5;
    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
    particleSystem.direction1 = new BABYLON.Vector3(0.2, 0.3, 0.2);
    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 1;
    particleSystem.updateSpeed = 100;
    particleSystem.stop();

    this.start=function(){ particleSystem.start(); }
    this.stop=function(){ particleSystem.stop(); }
    this.Position=function(position){ fountain.position=position; }

    fountain.position=position;
}

// === MOBILKONTROLLER ===

function isMobile() {
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
}

function createMobileUI() {
    const ui = document.createElement("div");
    ui.innerHTML = `
        <style>
            .btn {
                position: fixed;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: rgba(255,255,255,0.25);
                border: 2px solid white;
                color: white;
                font-size: 22px;
                text-align: center;
                line-height: 80px;
                z-index: 20;
                user-select: none;
            }
            #shootBtn { right: 20px; bottom: 20px; }
            #jumpBtn { right: 120px; bottom: 20px; }
            #leftJoy, #rightJoy {
                position: fixed;
                width: 140px;
                height: 140px;
                border-radius: 50%;
                background: rgba(255,255,255,0.1);
                border: 2px solid rgba(255,255,255,0.3);
                z-index: 20;
            }
            #leftJoy { left: 20px; bottom: 20px; }
            #rightJoy { right: 20px; bottom: 140px; }
        </style>

        <div id="leftJoy"></div>
        <div id="rightJoy"></div>
        <div id="shootBtn" class="btn">🔥</div>
        <div id="jumpBtn" class="btn">⬆</div>
    `;
    document.body.appendChild(ui);
}

let moveJoy = { active:false, id:null, sx:0, sy:0, x:0, y:0 };
let lookJoy = { active:false, id:null, sx:0, sy:0, x:0, y:0 };

function setupMobileControls(scene, camera) {
    const canvas = scene.getEngine().getRenderingCanvas();

    canvas.addEventListener("pointerdown", evt => {
        if (evt.clientX < window.innerWidth/2 && !moveJoy.active) {
            moveJoy.active = true;
            moveJoy.id = evt.pointerId;
            moveJoy.sx = evt.clientX;
            moveJoy.sy = evt.clientY;
        }
        else if (!lookJoy.active) {
            lookJoy.active = true;
            lookJoy.id = evt.pointerId;
            lookJoy.sx = evt.clientX;
            lookJoy.sy = evt.clientY;
        }
    });

    canvas.addEventListener("pointermove", evt => {
        if (evt.pointerId === moveJoy.id) {
            moveJoy.x = evt.clientX - moveJoy.sx;
            moveJoy.y = evt.clientY - moveJoy.sy;
        }
        if (evt.pointerId === lookJoy.id) {
            lookJoy.x = evt.clientX - lookJoy.sx;
            lookJoy.y = evt.clientY - lookJoy.sy;
        }
    });

    canvas.addEventListener("pointerup", evt => {
        if (evt.pointerId === moveJoy.id) {
            moveJoy.active = false;
            moveJoy.x = moveJoy.y = 0;
        }
        if (evt.pointerId === lookJoy.id) {
            lookJoy.active = false;
            lookJoy.x = lookJoy.y = 0;
        }
    });

    scene.onBeforeRenderObservable.add(() => {
        if (moveJoy.active) {
            const speed = 0.02;
            camera.cameraDirection.x += (moveJoy.x / 80) * speed;
            camera.cameraDirection.z += (moveJoy.y / 80) * speed;
        }

        if (lookJoy.active) {
            const sens = 0.002;
            camera.rotation.y -= lookJoy.x * sens;
            camera.rotation.x -= lookJoy.y * sens;

            const maxPitch = Math.PI/2.2;
            camera.rotation.x = Math.max(-maxPitch, Math.min(maxPitch, camera.rotation.x));
        }
    });
}

function setupMobileButtons() {
    document.getElementById("shootBtn").addEventListener("touchstart", e => {
        e.preventDefault();
        if (qiangState === 1) v_1.do();
        if (qiangState === 2) v_2.do();
        if (qiangState === 3) v_3.do();
    });

    document.getElementById("jumpBtn").addEventListener("touchstart", e => {
        e.preventDefault();
        if (jumpState === 0) {
            scene.gravity = new BABYLON.Vector3(0, 0.4, 0);
            setTimeout(() => scene.gravity = new BABYLON.Vector3(0, -0.2, 0), 100);
            jumpState = 1;
            setTimeout(() => {
                scene.gravity = new BABYLON.Vector3(0, -0.2, 0);
                jumpState = 0;
            }, 500);
        }
    });
}

// === STARTA SPELET ===

loadMeshes(models, function(){
    // Visa första vapnet
    v_1.show();
});

// Tangentbord
window.addEventListener("keydown", keyevent);
window.addEventListener("keyup", keyevent2);

// Mobil
if (isMobile()) {
    createMobileUI();
    setupMobileControls(scene, camera);
    setupMobileButtons();
}

// Render-loop
engine.runRenderLoop(function () {
    scene.render();
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
