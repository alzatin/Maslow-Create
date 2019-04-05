import Menu from './js/menu'
import GlobalVariables from './js/globalvariables'
import Molecule from './js/molecules/molecule.js'
import GitHubMolecule from './js/molecules/githubmolecule.js'
import { api, readFileSync, trianglesToThreejsDatasets, watchFile, watchFileCreation, writeFileSync } from './js/JSxCAD.js';

GlobalVariables.canvas = document.querySelector('canvas')
GlobalVariables.c = GlobalVariables.canvas.getContext('2d')

GlobalVariables.canvas.width = innerWidth
GlobalVariables.canvas.height = innerHeight/2

let lowerHalfOfScreen = document.querySelector('.flex-parent');
lowerHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");
let upperHalfOfScreen = document.querySelector('#flow-canvas');
upperHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");

var url = window.location.href;
GlobalVariables.runMode = url.includes("run"); //Check if we are using the run mode based on url

// Event Listeners
let flowCanvas = document.getElementById('flow-canvas');

flowCanvas.addEventListener('mousemove', event => {
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickMove(event.clientX,event.clientY);        
    });
});

flowCanvas.addEventListener('mousedown', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        
        if (molecule.clickDown(event.clientX,event.clientY, clickHandledByMolecule) == true){
            clickHandledByMolecule = true;
        }

    });
    
    if(!clickHandledByMolecule){
        GlobalVariables.currentMolecule.backgroundClick();
    }
    
    //hide the menu if it is visible
    if (!document.querySelector('.menu').contains(event.target)) {
        Menu.hidemenu();
    }
    
});

flowCanvas.addEventListener('dblclick', event => {
    //every time the mouse button goes down
    
    var clickHandledByMolecule = false;
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        if (molecule.doubleClick(event.clientX,event.clientY) == true){
            clickHandledByMolecule = true;
        }
    });
    
    if (clickHandledByMolecule == false){
        console.log("double click menu open not working in flowDraw.js");
        //showmenu(event);
    }
});

flowCanvas.addEventListener('mouseup', event => {
    //every time the mouse button goes up
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.clickUp(event.clientX,event.clientY);      
    });
});

window.addEventListener('keydown', event => {
    //every time the mouse button goes up
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.keyPress(event.key);      
    });
});


// Implementation

function init() {
    if(!GlobalVariables.runMode){ //If we are in CAD mode load an empty project as a placeholder
        GlobalVariables.currentMolecule = new Molecule({
            x: 0, 
            y: 0, 
            topLevel: true, 
            name: "Maslow Create",
            atomType: "Molecule",
            uniqueID: GlobalVariables.generateUniqueID()
        });
    }
    else{
        var ID = window.location.href.split('?')[1];
        //Have the current molecule load it
        if(typeof ID != undefined){
            GlobalVariables.currentMolecule = new GitHubMolecule({
                projectID: ID
            });
        }
    }
    
    GlobalVariables.api = api;
    
    //Add the JSXCAD window
    camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500);
    [camera.position.x, camera.position.y, camera.position.z] = [0, 0, 50];
    //
    controls = new THREE.TrackballControls(camera, targetDiv);
    controls.rotateSpeed = 4.0;
    controls.zoomSpeed = 4.0;
    controls.panSpeed = 2.0;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.1;
    controls.keys = [65, 83, 68];
    controls.addEventListener('change', () => { render(); });
    //
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xB0AEB0);
    scene.add(camera);
    //
    var ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    // var light1 = new THREE.PointLight(0xffffff, 0, 1);
    // camera.add(light1);
    var light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(1, 1, 1);
    camera.add(light2);
    // scene.add( light2 );

    //
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    targetDiv.appendChild(renderer.domElement);
    //
    //
    gui = new dat.GUI({ autoPlace: false });
    //targetDiv.appendChild(gui.domElement);
    // gui.add( material, 'wireframe' );
    //
    window.addEventListener('resize', () => { onWindowResize(); }, false);

    onWindowResize();
    animate();
}

function onWindowResize() {
    camera.aspect = targetDiv.clientWidth / (targetDiv.clientHeight - 1);
    camera.updateProjectionMatrix();
    controls.handleResize();
    renderer.setSize(targetDiv.clientWidth, targetDiv.clientHeight - 1);
    
    var bounds = GlobalVariables.canvas.getBoundingClientRect();
    GlobalVariables.canvas.width = bounds.width;
    GlobalVariables.canvas.height = bounds.height; 
    //reset screen parameters 
    lowerHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");
    upperHalfOfScreen.setAttribute("style","height:"+innerHeight/2+"px");

    GlobalVariables.scaleFactorXY =  GlobalVariables.canvas.width/1000;
    GlobalVariables.scaleFactorR =  GlobalVariables.canvas.width/1200;
}

const makeMaterial = (material) => {
    switch (material) {
      case 'metal':
        return new THREE.MeshStandardMaterial({
                 color: 0x779aac,
                 emissive: 0x7090a0,
                 roughness: 0.65,
                 metalness: 0.99,
               });
      default:
        return new THREE.MeshNormalMaterial();
    }
}

function drawOnWindow(file) {
    const { data } = file;
    // Delete any previous dataset in the window.
    for (const { controller, mesh } of datasets) {
        if (controller) {
          gui.remove(controller);
        }
        scene.remove(mesh);
    }
    // Build new datasets from the written data, and display them.
    datasets = trianglesToThreejsDatasets({}, ...data);
    for (const dataset of datasets) {
        let geometry = new THREE.BufferGeometry();
        let { properties = {}, indices, positions, normals } = dataset;
        let { material, tags = [] } = properties;
        geometry.setIndex( indices );
        geometry.addAttribute('position', new THREE.Float32BufferAttribute( positions, 3));
        geometry.addAttribute('normal', new THREE.Float32BufferAttribute( normals, 3));
        let threeMaterial = new THREE.MeshStandardMaterial({
                 color: 0x5f6670,
                 emissive: 0x5f6670,
                 roughness: 0.65,
                 metalness: 0.40,
               });
        dataset.mesh = new THREE.Mesh(geometry, threeMaterial);
        scene.add(dataset.mesh);
    }
}

function render() {
    renderer.render( scene, camera );
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    GlobalVariables.c.clearRect(0, 0, GlobalVariables.canvas.width, GlobalVariables.canvas.height);
    
    GlobalVariables.currentMolecule.nodesOnTheScreen.forEach(molecule => {
        molecule.update();
    });
    
    render();
    controls.update();
}

//Create a new jsxcad canvas here by copying from my PR
        
let datasets = [];
let camera;
let controls;
let scene;
let renderer;
let stats;
let mesh;
let gui;
let targetDiv = document.getElementById("viewerContext");

init();

watchFile('window', drawOnWindow);

//api.writeStl({ path: 'window' },api.sphere());

