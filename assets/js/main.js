function WebGLThreeJS(){

  'use strict';

  let scene,
      objPromise,
      camera,
      hemisphereLight,
      directionalLight,
      pointLight,
      spotLight,
      renderer,
      domContainer;

  const THREE = require('three');
  const OBJLoader = require('three-obj-loader');
  OBJLoader(THREE);
  const MTLLoader = require('three-mtl-loader');

  function init(){
    setVars();
    bindEvents();
    addObj();
    mainLoop();
  }

  function setVars(){

    scene = new THREE.Scene();

    objPromise = loadObj( "./../dist/obj/", "Autositz_Teil-20190702" );

    objPromise.then(obj => {
      console.log(obj);
    });

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 250);
    camera.position.set(0,0,25);
    camera.lookAt( 0,0,0 );

    const skyColor = 0xfdfeff;
    const groundColor = 0xbfbfbf;
    // HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
    hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 0.8);
    scene.add(hemisphereLight);

    // DirectionalLight( color : Integer, intensity : Float )
    directionalLight = new THREE.DirectionalLight(0xDBDBDB, 0.7);
    directionalLight.position.set(0, 50, 0);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);

    // PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )
    pointLight = new THREE.PointLight(0xf4fbff, 0.3, 0, 2);
    pointLight.position.set(-500,0,500);
    scene.add(pointLight);

    spotLight = new THREE.SpotLight(0xecf8fb, 0.2, 0, 1, 1, 1);
    spotLight.position.set(500,100,300);
    scene.add(spotLight);
    objPromise.then(obj => {
      spotLight.target = obj;
    });

    domContainer = document.getElementsByClassName('header_3d__three_container')[0];

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(domContainer.offsetWidth, domContainer.offsetHeight);

    domContainer.appendChild(renderer.domElement);

  }

  function bindEvents(){
    window.addEventListener('resize', resizeRenderer);
  }

  function resizeRenderer(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function loadObj(path, name){

    let progress = console.log;

    return new Promise(function( resolve, reject ){

      const mtlLoader = new MTLLoader();

      mtlLoader.setPath( path );
      mtlLoader.load( name + ".mtl", function( materials ){

        materials.preload();

        const objLoader = new THREE.OBJLoader();

        objLoader.setMaterials( materials );
        objLoader.setPath( path );
        objLoader.load( name + ".obj", resolve, progress, reject );

      }, progress, reject );

    });

  }

  function addObj(){
    const yellow = 0xE5C754;
    const texture = new THREE.TextureLoader().load('/dist/img/test.jpg');
    const lambert = new THREE.MeshLambertMaterial();
    const physical = new THREE.MeshPhysicalMaterial();
    const standard = new THREE.MeshStandardMaterial();
    const phong = new THREE.MeshPhongMaterial();

    objPromise.then(obj => {

      obj.traverse(function(child){
        console.log(child);
        if (child instanceof THREE.Mesh){

          // soften hard edges. at least a try
          let a = new THREE.Geometry().fromBufferGeometry( child.geometry );
          a.mergeVertices();
          child.geometry.fromGeometry( a );
          child.geometry.computeVertexNormals();

          child.material = new THREE.MeshStandardMaterial({
            flatShading: false,
            side: THREE.DoubleSide,
            color: 0xffffff
          });
        }
      });

      scene.add(obj);

    });
  }

  function mainLoop(){

    renderer.render(scene, camera);
    requestAnimationFrame(mainLoop);

  }

  init();

}

WebGLThreeJS();
