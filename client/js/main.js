
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var actionlist = new Array();

let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;

init();

function init() {

    const container = document.body;


    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 10, 2, 0 );
    camera.lookAt( 1, 20, 0 );

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
    hemiLight.position.set( 0, 20, 0 );
    scene.add( hemiLight );

    const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
    dirLight.position.set( - 3, 10, - 10 );
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = - 2;
    dirLight.shadow.camera.left = - 2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add( dirLight );

    // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

    

    // ground

    const mesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    const loader = new GLTFLoader();
    loader.load( 'models/gltf/chapel/duskwoodchapel.gltf', function ( gltf ) {

        const house = gltf.scene;
        scene.add( house );

    } );

    loader.load( 'models/gltf/female/humanfemale.gltf', function ( gltf ) {

        model = gltf.scene;
        scene.add( model );

        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer( model );
        let i=0;
        while(i<129){
            actionlist[i] = mixer.clipAction( animations[ i ] );
            console.log("add action" + i );
            i ++;
        }
        actionlist[127].play();
  

        animate();

    } );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    container.appendChild( renderer.domElement );

    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize );


    // CONTROLS

    let controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0.5, 0 );
    controls.update();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

    // Render loop

    requestAnimationFrame( animate );
    let mixerUpdateDelta = clock.getDelta();
    mixer.update( mixerUpdateDelta );

    stats.update();

    renderer.render( scene, camera );

}