'use strict';

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
      renderer,
      runRotation,
      runAnimation,
      explodeHead,
      explodeArmLeftY,
      explodeArmLeftZ,
      explodeArmRightY,
      explodeArmRightZ,
      explodeHandLeftY,
      explodeHandLeftDelay,
      explodeHandLeftZ,
      explodeHandRightY,
      explodeHandRightZ,
      explodeLegLeftY,
      explodeLegLeftZ,
      explodeLegLeftX,
      explodeLegRightX,
      explodeLegRightY,
      explodeLegRightZ,
      explodePantsY,
      explodeTorsoY,
      pauseCounter,
      pause;

  const THREE = require('three');
  const OBJLoader = require('three-obj-loader');
  OBJLoader(THREE);
  const MTLLoader = require('three-mtl-loader');

  function init(){
    setVars();
    bindEvents();
    addLegoObj();
    setAnimation();
    mainLoop();
  };

  function setVars(){
    runRotation = true;
    runAnimation = true;

    scene = new THREE.Scene();

    legoObjPromise = loadObj( "/dist/obj/", "lego" );

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 501);
    camera.position.set(0,10,20);
    camera.lookAt( 0,0,0 );

    const skyColor = 0xa0bcd7;
    const groundColor = 0xbfbfbf;
    // HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
    hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, 1);
    scene.add(hemisphereLight);

    directionalLight = new THREE.DirectionalLight(0xDBDBDB, 1);
    directionalLight.position.set(0, 50, 0);
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);

    // PointLight( color : Integer, intensity : Float, distance : Number, decay : Float )
    pointLight = new THREE.PointLight(0xcccccc, 0.1, 0, 2);
    pointLight.position.set(-10,-2,8)
    scene.add(pointLight);

    spotLight = new THREE.SpotLight(0xcccccc, 0.2, 0, 1, 1, 1);
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
    const yellow = 0xE5C754;

    legoObjPromise.then(legoObj => {

      scene.add(legoObj);
      legoObj.rotation.y = -1;

      legoObj.traverse(function(child){
        console.log(child);
        if (child instanceof THREE.Mesh){
          child.material.side = THREE.DoubleSide;
        }
      });

      head = legoObj.getObjectByName('Head');
      head.material.color.setHex(yellow);

      torso = legoObj.getObjectByName('Torso');
      torso.material.color.setHex(0x006666);

      handRight = legoObj.getObjectByName('HandRight');
      handRight.material.color.setHex(yellow);

      armRight = legoObj.getObjectByName('ArmRight');
      armRight.material.color.setHex(0x006666);

      handLeft = legoObj.getObjectByName('HandLeft');
      handLeft.material.color.setHex(yellow);

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

  function setAnimation(){

    pauseCounter = 0;
    pause = true;

    explodeHead = {'ex': false};

    explodeHandLeftY = {'ex': true};
    explodeHandLeftZ = {'ex': true};

    explodeHandRightY = {'ex': true};
    explodeHandRightZ = {'ex': true};

    explodeArmLeftY = {'ex': true};
    explodeArmLeftZ = {'ex': true};

    explodeArmRightY = {'ex': true};
    explodeArmRightZ = {'ex': true};

    explodeLegLeftY = {'ex': true};
    explodeLegLeftZ = {'ex': true};
    explodeLegLeftX = {'ex': false};

    explodeLegRightY = {'ex': true};
    explodeLegRightZ = {'ex': true};
    explodeLegRightX = {'ex': false};

    explodePantsY = {'ex': false};

    explodeTorsoY = {'ex': true};

    explodeHandLeftDelay = 0;

  }

  function animateConstruction(){

    if(pause){
      pauseCounter += 1;
      if(pauseCounter >= 300){
        pause = false;
      }
      return;
    }


    animateDissemble(head, 'y', 0, 1.5, 0.0075, explodeHead);

    animateDissemble(handLeft, 'y', 0, -2, 0.01, explodeHandLeftY);
    animateDissemble(handLeft, 'z', 0, -2, 0.01, explodeHandLeftZ);

    animateDissemble(handRight, 'y', 0, -2, 0.01, explodeHandRightY);
    animateDissemble(handRight, 'z', 0, 2, 0.01, explodeHandRightZ);

    animateDissemble(armLeft, 'z', 0, -2, 0.01, explodeArmLeftZ);
    animateDissemble(armLeft, 'y', 0, 1, 0.005, explodeArmLeftY);

    animateDissemble(armRight, 'z', 0, 2, 0.01, explodeArmRightZ);
    animateDissemble(armRight, 'y', 0, 1, 0.005, explodeArmRightY);

    animateDissemble(legLeft, 'y', 0, -2, 0.01, explodeLegLeftY);
    animateDissemble(legLeft, 'z', 0, -1, 0.005, explodeLegLeftZ);

    animateDissemble(legRight, 'y', 0, -2, 0.01, explodeLegRightY);
    animateDissemble(legRight, 'z', 0, 1, 0.005, explodeLegRightZ);

    animateDissemble(pants, 'y', 0, -0.5, 0.0025, explodePantsY);

    animateDissemble(torso, 'y', 0, 0.5, 0.0025, explodeTorsoY);

  }

  function animateDissemble(obj, axis, from, to, speed, explodeSwitch){

    const position = obj.position;
    const speedFactorFast = 5;
    const speedFactorSlow = 1;

    let speedDef;

    // calculate definitive speed
    if(explodeSwitch.ex && from < to){
      speedDef = speed * speedFactorFast;
    }
    else if(!explodeSwitch.ex && from < to){
      speedDef = speed * speedFactorSlow;
    }
    else if(explodeSwitch.ex && from > to){
      speedDef = speed * speedFactorSlow;
    }
    else if(!explodeSwitch.ex && from > to){
      speedDef = speed * speedFactorFast;
    }

    // calculate new position
    if(explodeSwitch.ex){
      if(axis == 'x'){
        obj.position.setX(position[axis] -= speedDef);
      }
      else if(axis == 'y'){
        obj.position.setY(position[axis] -= speedDef);
      }
      else{
        obj.position.setZ(position[axis] -= speedDef);
      }
      if(from > to && position[axis] <= to){
        explodeSwitch.ex = false;
      }
      else if(from < to && position[axis] <= from){
        if(obj.name == 'Torso'){
          pauseCounter = 0;
          pause = true;
        }
        explodeSwitch.ex = false;
      }
    }
    else{
      if(axis == 'x'){
        obj.position.setX(position[axis] += speedDef);
      }
      else if(axis == 'y'){
        obj.position.setY(position[axis] += speedDef);
      }
      else{
        obj.position.setZ(position[axis] += speedDef);
      }
      if(from > to && position[axis] >= from){
        explodeSwitch.ex = true;
      }
      else if(from < to && position[axis] >= to){
        if(obj.name == 'Head'){
          pauseCounter = 0;
          pause = true;
        }
        explodeSwitch.ex = true;
      }
    }
  }

  function mainLoop(){

    if(runRotation){
      legoObjPromise.then(legoObj => {
        legoObj.rotation.y += 0.005;
      });
    }

    if(runAnimation){
      legoObjPromise.then(legoObj => {
        animateConstruction();
      });
    }

    renderer.render(scene, camera);
    requestAnimationFrame(mainLoop);

  }

  init();

}

WebGLThreeJS();
