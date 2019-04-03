function WebGLThreeJS(){

  let scene,
      legoObjPromise,
      camera,
      hemisphereLight,
      directionalLight,
      pointLight,
      spotLight,
      head,
      torso,
      handRight,
      armRight,
      handLeft,
      armLeft,
      legLeft,
      legRight,
      pants,
      renderer;

  const THREE = require('three');
  const OBJLoader = require('three-obj-loader');
  OBJLoader(THREE);
  const MTLLoader = require('three-mtl-loader');

  function init(){
    setVars();
    bindEvents();
    addLegoObj();
    mainLoop();
  };

  function setVars(){

    scene = new THREE.Scene();

    legoObjPromise = loadObj( "/dist/obj/", "lego" );

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 501);
    camera.position.set(0,10,20);
    camera.lookAt( 0,0,0 );

    const skyColor = 0xa0bcd7;
    const groundColor = 0xbfbfbf;
    hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 1);
    scene.add(hemisphereLight);

    directionalLight = new THREE.DirectionalLight(0xDBDBDB, 1);
    directionalLight.position.set(0, 50, 0);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);

    pointLight = new THREE.PointLight(0xcccccc, 0.1, 0, 2);
    pointLight.position.set(-5,-5,6)
    scene.add(pointLight);

    spotLight = new THREE.SpotLight(0xa9d1ff, 0.2, 0, 1, 1, 1);
    spotLight.position.set(12,8,8);
    scene.add(spotLight);
    legoObjPromise.then(legoObj => {
      spotLight.target = legoObj;
    });

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

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

  function addLegoObj(){
    legoObjPromise.then(legoObj => {

      scene.add( legoObj );

      legoObj.traverse(function(child){
        console.log(child);
        if (child instanceof THREE.Mesh){
          child.material.side = THREE.DoubleSide;
        }
      });

      head = legoObj.getObjectByName('Head');
      head.material.color.setHex(0xffdb4d);

      torso = legoObj.getObjectByName('Torso');
      torso.material.color.setHex(0x006666);

      handRight = legoObj.getObjectByName('HandRight');
      handRight.material.color.setHex(0xffdb4d);

      armRight = legoObj.getObjectByName('ArmRight');
      armRight.material.color.setHex(0x006666);

      handLeft = legoObj.getObjectByName('HandLeft');
      handLeft.material.color.setHex(0xffdb4d);

      armLeft = legoObj.getObjectByName('ArmLeft');
      armLeft.material.color.setHex(0x006666);

      legLeft = legoObj.getObjectByName('LegLeft');
      legLeft.material.color.setHex(0x800040);

      legRight = legoObj.getObjectByName('LegRight');
      legRight.material.color.setHex(0x800040);

      pants = legoObj.getObjectByName('Pants');
      pants.material.color.setHex(0x000000);

    });
  }

  function mainLoop(){
    legoObjPromise.then(legoObj => {
      legoObj.rotation.y += 0.005;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(mainLoop);
  }

  init();

}

WebGLThreeJS();
