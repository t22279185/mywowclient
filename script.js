
import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Gyroscope } from 'three/addons/misc/Gyroscope.js';

var skine_texture = new Array();
var actionlist = new Array();

let i =1;
while (i<5)
{
    skine_texture[i] = new THREE.TextureLoader().load('models/gltf/female/skine/data-'+i+'.png');
    skine_texture[i].flipY = false;
    i++;

}
i = 2;

let scene, renderer, camera, stats;
let model, skeleton, mixer, clock,obj_1;

const crossFadeControls = [];

let A0Action, A1Action, A2Action;
let A0Weight, A1Weight, A2Weight;
let actions, settings;

let singleStepMode = false;
let sizeOfNextStep = 0;

init();

function init() {

    const container = document.getElementById( 'container' );


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
    loader.load( 'models/gltf/female/humanfemale.gltf', function ( gltf ) {

        model = gltf.scene;
        scene.add( model );

        model.traverse( function ( object ) {
            if (object.isMesh ) {
                object.castShadow = true;
                if(object.name === "humanfemale_Geoset0"){
                    skine_texture[0] = object.material.map;

                }

            }
        } );

        //

        skeleton = new THREE.SkeletonHelper( model );
        skeleton.visible = false;
        scene.add( skeleton );

        //

        createPanel();


        //

        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer( model );
        let i=0;
        while(i<129){
            actionlist[i] = mixer.clipAction( animations[ i ] );
            console.log("add action" + i );
            i ++;
        }
        A0Action = actionlist[0];
        A1Action = actionlist[1];
        A2Action = actionlist[2];

        actions = [ A0Action, A1Action, A2Action ];

        activateAllActions();

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

function createPanel() {

    const panel = new GUI( { width: 210 } );

    const folder1 = panel.addFolder( '显示设置' );
    const folder2 = panel.addFolder( 'Activation/Deactivation' );
    const folder3 = panel.addFolder( 'Pausing/Stepping' );
    const folder4 = panel.addFolder( 'Crossfading' );
    const folder5 = panel.addFolder( 'Blend Weights' );
    const folder6 = panel.addFolder( 'General Speed' );

    settings = {
        '显示模型': true,
        '更换皮肤': function () {
            //var texture = new THREE.TextureLoader().load('models/gltf/female/new.png');

            model.traverse( function ( object ) {

                if (object.isMesh ) {
                    if(object.name === "humanfemale_Geoset0"){
                        object.castShadow = true;
                        object.receiveShadow = true;
                        object.material.map = skine_texture[i];
                        i ++;
                        if(i>4){i = 0;}

                    }

                }	
            } );					

        },
        'deactivate all': deactivateAllActions,
        'activate all': activateAllActions,
        'pause/continue': pauseContinue,
        'make single step': toSingleStepMode,
        'modify step size': 0.05,
        'from A1 to A0': function () {

            prepareCrossFade( A1Action, A0Action, 1.0 );

        },
        'from A0 to A1': function () {

            prepareCrossFade( A0Action, A1Action, 0.5 );

        },
        'from A1 to A2': function () {

            prepareCrossFade( A1Action, A2Action, 2.5 );

        },
        'from A2 to A1': function () {

            prepareCrossFade( A2Action, A1Action, 2.0 );

        },

        'use default duration': true,
        'set custom duration': 3.5,
        'modify A0 action': 0,
        'modify A1 action': 1,
        'modify A2 action': 2,
        'modify A0 weight': 1.0,
        'modify A1 weight': 0.0,
        'modify A2 weight': 0.0,
        'modify time scale': 1.0
    };

    folder1.add( settings, '显示模型' ).onChange( showModel );
    folder1.add( settings, '更换皮肤' );
    folder1.add( settings, 'modify A0 action', 0, 128, 1 ).listen().onChange( function ( action ) {
        setWeight( A0Action, 0 );
        A0Action = actionlist[action];

        actions = [ A0Action, A1Action, A2Action ];

        activateAllActions();	
        setWeight( A0Action, 1 );
    } );
    folder1.add( settings, 'modify A1 action' ).listen().onChange( function ( action ) {
        setWeight( A1Action, 0 );

        A1Action = actionlist[action];

        actions = [ A0Action, A1Action, A2Action ];

        activateAllActions();
        setWeight( A1Action, 1 );
    } );
    folder1.add( settings, 'modify A2 action' ).listen().onChange( function ( action ) {
        setWeight( A2Action, 0 );

        A2Action = actionlist[action];

        actions = [ A0Action, A1Action, A2Action ];

        activateAllActions();
        setWeight( A2Action, 1 );
    } );
    folder2.add( settings, 'deactivate all' );
    folder2.add( settings, 'activate all' );
    folder3.add( settings, 'pause/continue' );
    folder3.add( settings, 'make single step' );
    folder3.add( settings, 'modify step size', 0.01, 0.1, 0.001 );
    crossFadeControls.push( folder4.add( settings, 'from A0 to A1' ) );
    crossFadeControls.push( folder4.add( settings, 'from A1 to A0' ) );
    crossFadeControls.push( folder4.add( settings, 'from A1 to A2' ) );
    crossFadeControls.push( folder4.add( settings, 'from A2 to A1' ) );

    folder4.add( settings, 'use default duration' );
    folder4.add( settings, 'set custom duration', 0, 10, 0.01 );
    folder5.add( settings, 'modify A0 weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

        setWeight( A0Action, weight );

    } );
    folder5.add( settings, 'modify A1 weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

        setWeight( A1Action, weight );

    } );
    folder5.add( settings, 'modify A2 weight', 0.0, 1.0, 0.01 ).listen().onChange( function ( weight ) {

        setWeight( A2Action, weight );

    } );

    folder6.add( settings, 'modify time scale', 0.0, 1.5, 0.01 ).onChange( modifyTimeScale );

    folder1.open();
    folder2.open();
    folder3.open();
    folder4.open();
    folder5.open();
    folder6.open();

}


function showModel( visibility ) {

    model.visible = visibility;

}


function showSkeleton( visibility ) {

    skeleton.visible = visibility;

}


function modifyTimeScale( speed ) {

    mixer.timeScale = speed;

}


function deactivateAllActions() {

    actions.forEach( function ( action ) {
        setWeight( action, 0 );
        action.stop();

    } );

}

function activateAllActions() {

    actions.forEach( function ( action ) {
        action.play();

    } );

}

function pauseContinue() {

    if ( singleStepMode ) {

        singleStepMode = false;
        unPauseAllActions();

    } else {

        if ( A0Action.paused ) {

            unPauseAllActions();

        } else {

            pauseAllActions();

        }

    }

}

function pauseAllActions() {

    actions.forEach( function ( action ) {
        setWeight( action, 0 );
        action.paused = true;

    } );

}

function unPauseAllActions() {

    actions.forEach( function ( action ) {

        action.paused = false;

    } );

}

function toSingleStepMode() {

    unPauseAllActions();

    singleStepMode = true;
    sizeOfNextStep = settings[ 'modify step size' ];

}

function prepareCrossFade( startAction, endAction, defaultDuration ) {

    // Switch default / custom crossfade duration (according to the user's choice)

    const duration = setCrossFadeDuration( defaultDuration );

    // Make sure that we don't go on in singleStepMode, and that all actions are unpaused

    singleStepMode = false;
    unPauseAllActions();

    // If the current action is 'A0' (duration 4 sec), execute the crossfade immediately;
    // else wait until the current action has finished its current loop

    if ( startAction === A0Action ) {

        executeCrossFade( startAction, endAction, duration );

    } else {

        synchronizeCrossFade( startAction, endAction, duration );

    }

}

function setCrossFadeDuration( defaultDuration ) {

    // Switch default crossfade duration <-> custom crossfade duration

    if ( settings[ 'use default duration' ] ) {

        return defaultDuration;

    } else {

        return settings[ 'set custom duration' ];

    }

}

function synchronizeCrossFade( startAction, endAction, duration ) {

    mixer.addEventListener( 'loop', onLoopFinished );

    function onLoopFinished( event ) {

        if ( event.action === startAction ) {

            mixer.removeEventListener( 'loop', onLoopFinished );

            executeCrossFade( startAction, endAction, duration );

        }

    }

}

function executeCrossFade( startAction, endAction, duration ) {

    // Not only the start action, but also the end action must get a weight of 1 before fading
    // (concerning the start action this is already guaranteed in this place)

    setWeight( endAction, 1 );
    endAction.time = 0;

    // Crossfade with warping - you can also try without warping by setting the third parameter to false

    startAction.crossFadeTo( endAction, duration, true );

}

// This function is needed, since animationAction.crossFadeTo() disables its start action and sets
// the start action's timeScale to ((start animation's duration) / (end animation's duration))

function setWeight( action, weight ) {

    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

}

// Called by the render loop

function updateWeightSliders() {

    settings[ 'modify A0 weight' ] = A0Weight;
    settings[ 'modify A1 weight' ] = A1Weight;
    settings[ 'modify A2 weight' ] = A2Weight;

}

// Called by the render loop

function updateCrossFadeControls() {

    if ( A0Weight === 1 && A1Weight === 0 && A2Weight === 0) {

        crossFadeControls[ 0 ].enable();
        crossFadeControls[ 1 ].disable();
        crossFadeControls[ 2 ].disable();
        crossFadeControls[ 3 ].disable();

    }

    if ( A0Weight === 0 && A1Weight === 1 && A2Weight === 0 ) {

        crossFadeControls[ 0 ].disable();
        crossFadeControls[ 1 ].enable();
        crossFadeControls[ 2 ].enable();
        crossFadeControls[ 3 ].disable();


    }

    if ( A0Weight === 0 && A1Weight === 0 && A2Weight === 1 ) {

        crossFadeControls[ 0 ].disable();
        crossFadeControls[ 1 ].disable();
        crossFadeControls[ 2 ].disable();
        crossFadeControls[ 3 ].enable();


    }


}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function changeSkine() {

    alert("ces");

}

function animate() {

    // Render loop

    requestAnimationFrame( animate );

    A0Weight = A0Action.getEffectiveWeight();
    A1Weight = A1Action.getEffectiveWeight();
    A2Weight = A2Action.getEffectiveWeight();

    // Update the panel values if weights are modified from "outside" (by crossfadings)

    updateWeightSliders();

    // Enable/disable crossfade controls according to current weight values

    updateCrossFadeControls();

    // Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

    let mixerUpdateDelta = clock.getDelta();

    // If in single step mode, make one step and then do nothing (until the user clicks again)

    if ( singleStepMode ) {

        mixerUpdateDelta = sizeOfNextStep;
        sizeOfNextStep = 0;

    }

    // Update the animation mixer, the stats panel, and render this frame

    mixer.update( mixerUpdateDelta );

    stats.update();

    renderer.render( scene, camera );

}

