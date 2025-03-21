
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import CANNON from 'cannon';



var actionlist = new Array();

let house,scene, renderer, camera,controls;
let model, mixer, clock,body;


const world = new CANNON.World();
world.gravity.set(0,-9.82, 0)


export function init() {

    //const container = document.body;
    const container = document.getElementById( 'container' );

    container.innerHTML = "";

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );

    clock = new THREE.Clock();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
    //scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

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
    const axesHelper = new THREE.AxesHelper(100);
    scene.add(axesHelper);
    

    // ground

    const groundMaterial = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
    groundMaterial.rotation.x = - Math.PI / 2;
    groundMaterial.receiveShadow = true;

    scene.add( groundMaterial );

   
/*
 */

    const grounBody = new CANNON.Body({
        mass: 0, // 质量为0，始终保持静止，不会受到力碰撞或加速度影响
        shape: new CANNON.Plane(),
        material: groundMaterial,
      });
      grounBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);//旋转规律类似threejs 平面
      world.addBody(grounBody);

    const loader = new GLTFLoader();
   
/* */


    loader.load( 'models/gltf/chapel/duskwoodchapel.gltf', function ( gltf ) {

        house = gltf.scene;
        house.position.set( 0, 0, 30 );
        scene.add( house );
        house.traverse( function ( item ) {

           // console.log(item.name);

//            if ( item instanceof THREE.Mesh ) {
            if ( item.name == "duskwoodchapel_int011" ) {

                item.castShadow = true;
                item.receiveShadow = true;

                //item.material.wireframe = true;
                const geometry = item.geometry;
                const material = item.material;
                const tempmesh = new THREE.Mesh( geometry, material );
                //tempmesh.material.wireframe = true;
                tempmesh.position.set( 20, -1, 0 );

                scene.add( tempmesh );
                let wTrack = new CANNON.Body({
                    mass: 0,
                    material: groundMaterial,
                });
                const position = tempmesh.geometry.attributes.position;
                const vertices = new Float32Array(position.count * 3);
                for (let i = 0; i < position.count; i++) {
                    vertices[i * 3] = position.getX(i);
                    vertices[i * 3 + 1] = position.getY(i);
                    vertices[i * 3 + 2] = position.getZ(i);
                }
                let indices = tempmesh.geometry.index.array;
                let wShape = new CANNON.Trimesh(vertices,indices);
                wTrack.addShape(wShape);
                wTrack.position.copy(tempmesh.position);
                wTrack.quaternion.copy(tempmesh.quaternion);
                //wTrack.quaternion.setFromEuler(-Math.PI / 2, 0, 0);//旋转规律类似threejs 平面
                console.log(wTrack);

                world.addBody(wTrack);

            }     
          })
      

    } );

    loader.load( 'models/gltf/female/humanfemale.gltf', function ( gltf ) {

        model = gltf.scene;
        model.controls = controls;
        scene.add( model );
        model.position.set( 40, 6, 0 );
        camera.position.set( 60, 7, 0 );
        camera.lookAt( 40, 0, 0 );
    
        const animations = gltf.animations;

        mixer = new THREE.AnimationMixer( model );

        let i=0;
        while(i < 140){
            actionlist[animations[ i ].name] = mixer.clipAction( animations[ i ] );
            //console.log(animations[ i ].name);
            i ++;
        }
        //actionlist["EmoteDance (ID 69 variation 0)"].play();
        



        const box3 = new THREE.Box3();
        box3.expandByObject(model);//计算模型包围盒
        const size = new THREE.Vector3();
        box3.getSize(size);//包围盒计算箱子的尺寸
        model.size = size;

        body = new CANNON.Body({
        mass: 1,//碰撞体质量
        material: groundMaterial,//碰撞体材质
        shape: new CANNON.Box(new CANNON.Vec3(size.x/2, size.y/2, size.z/2))
        });
        body.position.copy(model.position);
        world.addBody(body);
        body.addEventListener('collide', (event) => {
            console.log('碰撞事件', event);
        })     
        // 设置地面材质和小球材质之间的碰撞反弹恢复系数
        const contactMaterial = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
            restitution: 0.1, //反弹恢复系数
        })

        // 把关联的材质添加到物理世界中
        world.addContactMaterial(contactMaterial)

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
    controls.target.set( 40, 6, 0 );
    controls.update();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {

    // Render loop

    world.step(1/60);//更新物理计算
    if(body.y < -10){
        body.position.set( 0, 6, 0 );
    }
    model.position.copy(body.position);// 网格小球与物理小球位置同步
    model.position.y -= model.size.y/2; //中心点矫正
    
    //boxmesh.position.copy(body.position);// 网格小球与物理小球位置同步

    requestAnimationFrame( animate );
    let mixerUpdateDelta = clock.getDelta();
    mixer.update( mixerUpdateDelta );

    renderer.render( scene, camera );

}


export function getActionlist() {
    return actionlist;
  }

  export function getControls() {
    console.log(controls);

    return controls;
  }

export function getPlayerPosition() {
    return body.position;
  }
    
export default {
    getPlayerPosition,
    getControls,
    getActionlist,
    init,
  };
  