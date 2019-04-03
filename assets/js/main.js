function WebGLThreeJS(){
  const THREE = require('three');
  const OBJLoader = require('three-obj-loader');
  const MTLLoader = require('three-mtl-loader');
  OBJLoader(THREE);

  const scene = new THREE.Scene();

  var myObjPromise = loadObj( "/dist/obj/", "lego" );

  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 501);
  camera.position.set(0,13,20);
  camera.lookAt( 0,0,0 );

  const skyColor = 0xa0bcd7;
  const groundColor = 0xbfbfbf;
  const intensity = 1;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);

  const color = 0xDBDBDB;
  const intensity2 = 0.8;
  const light2 = new THREE.DirectionalLight(color, intensity);
  light2.position.set(0, 50, 0);
  light2.target.position.set(0, 0, 0);
  scene.add(light2);
  scene.add(light2.target);

  const pointLight = new THREE.PointLight(0xcccccc, 0.1, 0, 2);
  pointLight.position.set(-6,-6,4)
  scene.add(pointLight);

  const spotLight = new THREE.SpotLight(0xededed, 0.2, 0, 1, 1, 1);
  spotLight.position.set(12,8,8);
  scene.add(spotLight);

  myObjPromise.then(myObj => {
    spotLight.target = myObj;
  });

  function loadObj( path, name ){

    var progress = console.log;

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


  myObjPromise.then(myObj => {

    scene.add( myObj );

    // console.log('children START');
    myObj.traverse(function(child){
      console.log(child);
      if (child instanceof THREE.Mesh){
        console.log(child.material.uuid);
        child.material.side = THREE.DoubleSide;
    //     console.log('is THREE.Mesh');
    //     console.log(child.name);
    //     if(child.name == 'HandLeft_Cylinder.001'){
    //       console.log('if');
    //       child.material.color.setHex(0xffdb4d);
    //     }
    //     else{
    //       console.log('else');
    //       child.material.color.setHex(0x818181);
    //     }
      }
    //   console.log('-------------------');
    });
    // console.log('children END');

    const head = myObj.getObjectByName('Head');
    head.material.color.setHex(0xffdb4d);

    const torso = myObj.getObjectByName('Torso');
    torso.material.color.setHex(0x006666);

    const handRight = myObj.getObjectByName('HandRight');
    handRight.material.color.setHex(0xffdb4d);

    const armRight = myObj.getObjectByName('ArmRight');
    armRight.material.color.setHex(0x006666);

    const handLeft = myObj.getObjectByName('HandLeft');
    handLeft.material.color.setHex(0xffdb4d);

    const armLeft = myObj.getObjectByName('ArmLeft');
    armLeft.material.color.setHex(0x006666);

    const legLeft = myObj.getObjectByName('LegLeft');
    legLeft.material.color.setHex(0x800040);

    const legRight = myObj.getObjectByName('LegRight');
    legRight.material.color.setHex(0x800040);

  });

  const renderer = new THREE.WebGLRenderer({
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  function mainLoop(){
    myObjPromise.then(myObj => {
      myObj.rotation.y += 0.01;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(mainLoop);
  }

  mainLoop();
}

WebGLThreeJS();
