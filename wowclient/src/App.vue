<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var actionlist = new Array();

let scene, renderer, camera, stats;
let model, mixer, clock;

init();

function init() {

    //const container = document.body;
    const container = document.getElementById( 'container' );

    container.innerHTML = "";

    camera = new THREE.PerspectiveCamera( 40, 800 / 600, 0.1, 100 );

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
        model.position.set( 0, 4, 0 );
        camera.position.set( 15, 6, 0 );
        camera.lookAt( 0, 6, 0 );
    
        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer( model );

        let i=0;
        while(i < 140){
            actionlist[animations[ i ].name] = mixer.clipAction( animations[ i ] );
            console.log(animations[ i ].name);
            i ++;
        }
        actionlist["EmoteDance (ID 69 variation 0)"].play();
  

        animate();

    } );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize );

    // CONTROLS
    let controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 6, 0 );
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

    renderer.render( scene, camera );

}


</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
   <RouterView />

</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
