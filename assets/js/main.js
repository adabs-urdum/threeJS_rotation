'use strict';

function WebGLThreeJS(){

  let scene,
      legoObjPromise,
      camera,
      hemisphereLight,
      directionalLight,
      pointLight,
      spotLight,
      spotLight2,
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
      pause,
      buckle,
      explodeBuckle,
      shellBack,
      explodeShellBack,
      shellTop,
      shellFront,
      explodeShellFront,
      zipfel,
      glowShellTopEmissiveIntensity,
      spotLight3;

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

    legoObjPromise = loadObj( "/dist/obj/", "buckle" );

    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 501);
    camera.position.set(0,70,350);
    camera.lookAt( 0,0,0 );

    if(example == 2 || example == 3){
      camera.position.setY(200);
      camera.lookAt(0, 20, 0);
    }

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
    pointLight.position.set(-500,0,500)
    scene.add(pointLight);

    spotLight = new THREE.SpotLight(0xecf8fb, 0.2, 0, 1, 1, 1);
    spotLight.position.set(500,100,300);
    scene.add(spotLight);
    legoObjPromise.then(legoObj => {
      spotLight.target = legoObj;
    });

    if(example == 2 || example == 3){
      spotLight2 = new THREE.SpotLight(0xffffff, 0.2, 0, 1, 1, 1);
      spotLight2.position.set(-500,200,300);
      scene.add(spotLight2);
      legoObjPromise.then(legoObj => {
        spotLight2.target = legoObj;
      });

      spotLight3 = new THREE.SpotLight(0xffffff, 0.2, 0, 1, 1, 1);
      spotLight3.position.set(0,0,500);
      scene.add(spotLight3);
      legoObjPromise.then(legoObj => {
        spotLight3.target = legoObj;
      });
    }

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
    const texture = new THREE.TextureLoader().load('/dist/img/test.jpg');
    const lambert = new THREE.MeshLambertMaterial();
    const physical = new THREE.MeshPhysicalMaterial();
    const standard = new THREE.MeshStandardMaterial();
    const phong = new THREE.MeshPhongMaterial();

    legoObjPromise.then(legoObj => {

      if(example == 2 || example == 3){
        legoObj.rotation.z = -3;
        legoObj.rotation.x = -5;
        legoObj.rotation.y = Math.PI;
      }

      legoObj.traverse(function(child){
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
            color: 0x2D2D2D
          });
        }
      });

      scene.add(legoObj);
      // legoObj.rotation.y = -1;

      buckle = legoObj.getObjectByName('buckle');
      buckle.material = physical;
      buckle.material.color.setHex(0xFAFAFA);

      shellTop = legoObj.getObjectByName('shell_top');
      shellTop.material = new THREE.MeshPhongMaterial({
        color: 0xCC0000,
        // emissive: 0xCC0000,
        // emissiveIntensity: 0
      });

      shellFront = legoObj.getObjectByName('shell_front');
      shellFront.material = new THREE.MeshStandardMaterial({
        transparent: true,
        color: 0x2D2D2D
      });

      shellBack = legoObj.getObjectByName('shell_back');
      shellBack.material = new THREE.MeshStandardMaterial({
        transparent: true,
        color: 0x2D2D2D
      });

      zipfel = legoObj.getObjectByName('zipfel');
      zipfel.material = new THREE.MeshPhysicalMaterial({
        color: 0xFAFAFA
      });

      // head = legoObj.getObjectByName('Head');
      // head.material = lambert;
      // head.material.color.setHex(yellow);

      // torso = legoObj.getObjectByName('Torso');
      // torso.material = new THREE.MeshPhysicalMaterial({
      //   color: 0xEEE
      // });

      // handRight = legoObj.getObjectByName('HandRight');
      // handRight.material = lambert;
      // handRight.material.color.setHex(yellow);
      //
      // armRight = legoObj.getObjectByName('ArmRight');
      // armRight.material = physical;
      // armRight.material.color.setHex(0x006666);
      //
      // handLeft = legoObj.getObjectByName('HandLeft');
      // handLeft.material = lambert;
      // handLeft.material.color.setHex(yellow);
      //
      // armLeft = legoObj.getObjectByName('ArmLeft');
      // armLeft.material = physical;
      // armLeft.material.color.setHex(0x006666);
      //
      // legLeft = legoObj.getObjectByName('LegLeft');
      // legLeft.material = standard;
      // legLeft.material.color.setHex(0x800040);
      //
      // legRight = legoObj.getObjectByName('LegRight');
      // legRight.material = standard;
      // legRight.material.color.setHex(0x800040);
      //
      // pants = legoObj.getObjectByName('Pants');
      // pants.material.color.setHex(0x000000);

    });
  }

  function setAnimation(){

    pauseCounter = 0;
    pause = true;

    explodeBuckle = {'ex': false};

    explodeShellBack = {'ex': true};

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

    glowShellTopEmissiveIntensity = {'ex' : true};

    explodeHandLeftDelay = 0;

  }

  function animateConstruction(){

    if(pause){
      pauseCounter += 1;
      if(pauseCounter >= 120){
        pause = false;
      }
      return;
    }

    animateDissemble(buckle, 'z', 0, 35, 1, explodeBuckle);

    // animateDissemble(head, 'y', 0, 1.5, 0.0075, explodeHead);
    //
    // animateDissemble(handLeft, 'y', 0, -2, 0.01, explodeHandLeftY);
    // animateDissemble(handLeft, 'z', 0, -2, 0.01, explodeHandLeftZ);
    //
    // animateDissemble(handRight, 'y', 0, -2, 0.01, explodeHandRightY);
    // animateDissemble(handRight, 'z', 0, 2, 0.01, explodeHandRightZ);
    //
    // animateDissemble(armLeft, 'z', 0, -2, 0.01, explodeArmLeftZ);
    // animateDissemble(armLeft, 'y', 0, 1, 0.005, explodeArmLeftY);
    //
    // animateDissemble(armRight, 'z', 0, 2, 0.01, explodeArmRightZ);
    // animateDissemble(armRight, 'y', 0, 1, 0.005, explodeArmRightY);
    //
    // animateDissemble(legLeft, 'y', 0, -2, 0.01, explodeLegLeftY);
    // animateDissemble(legLeft, 'z', 0, -1, 0.005, explodeLegLeftZ);
    //
    // animateDissemble(legRight, 'y', 0, -2, 0.01, explodeLegRightY);
    // animateDissemble(legRight, 'z', 0, 1, 0.005, explodeLegRightZ);
    //
    // animateDissemble(pants, 'y', 0, -0.5, 0.0025, explodePantsY);
    //
    // animateDissemble(torso, 'y', 0, 0.5, 0.0025, explodeTorsoY);

  }

  function animateDissemble(obj, axis, from, to, speed, explodeSwitch){

    const position = obj.position;
    const speedFactorFast = 1;
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
        if(obj.name == 'buckle'){
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
        if(obj.name == 'buckle'){
          pauseCounter = 0;
          pause = true;
        }
        explodeSwitch.ex = true;
      }
    }
  }

  function removeFrontShell(){
    legoObjPromise.then(legoObj => {
      if(buckle.position.z > 15){
        const shellFrontPosition = shellBack.position;
        if(shellFrontPosition.z < 10){
          shellBack.position.z += 0.5;
        }
        else{
          if(shellFrontPosition.y < 20){
            shellBack.position.y += 0.7;
          }
          else{
            if(shellFrontPosition.x > -50){
              shellBack.position.x -= 0.7;
            }
            else if(example == 3 && shellBack.material.opacity > 0.7){
              shellBack.material.opacity -= 0.01;
              shellFront.material.opacity -= 0.01;
            }
          }
        }

        let shellTopEmissiveIntensity = shellTop.material.emissiveIntensity;

        // blink glow
        // const blinkTempo = 0.005;
        // if(buckle.position.z > 13){
        //   if(glowShellTopEmissiveIntensity.ex){
        //     shellTop.material.emissiveIntensity += blinkTempo;
        //     if(shellTopEmissiveIntensity >= 0.5){
        //       glowShellTopEmissiveIntensity.ex = false;
        //     }
        //   }
        //   else{
        //     shellTop.material.emissiveIntensity -= blinkTempo;
        //     if(shellTopEmissiveIntensity <= 0){
        //       glowShellTopEmissiveIntensity.ex = true;
        //     }
        //   }
        // }
        // else{
        //   if(shellTopEmissiveIntensity > 0){
        //     shellTop.material.emissiveIntensity -= blinkTempo;
        //   }
        // }

      }
    });
  }

  function mainLoop(){

    if(example == 2 || example == 3){
      removeFrontShell();
    }

    legoObjPromise.then(legoObj => {
      if(runRotation && example == 1){
        legoObj.rotation.y += 0.005;
      }
      else if(runRotation && example == 2 || example == 3){
        legoObj.rotation.z += 0.008;
      }
    });

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
