<main>
  <canvas id="canvas" width="600" height="600"></canvas>
  <div class="controls">
    <button on:click={changeMode}>{buttonText}</button>
  </div>
</main>

<script>
// @ts-nocheck

  import { onMount } from "svelte";
  import * as THREE from 'three';

  let buttonText = "HELLO";
  let raveMode = false;
  let changeMode = () => {};

  const debugLineGeometry = new THREE.BufferGeometry();
  const debugLine = new THREE.Line( debugLineGeometry, new THREE.LineBasicMaterial( { color: 0x990099 } ) );
  debugLine.rotateZ(Math.PI/3); // for rave mode

  const debugLineGeometry2 = new THREE.BufferGeometry();
  const debugLine2 = new THREE.Line( debugLineGeometry2, new THREE.LineBasicMaterial( { color: 0x999900 } ) );

  const debugVectorGeometry = new THREE.BufferGeometry();
  const debugVector = new THREE.Line( debugVectorGeometry, new THREE.LineBasicMaterial( { color: 0x999999 } ) );

  onMount(() => {
    const _canvas = document.querySelector("#canvas");
    const gl = _canvas?.getContext("webgl2") || new WebGL2RenderingContext();
    if (gl === null) return;

    let pointerdown = false;

    document.onpointerdown = () => {pointerdown = true;};
    document.onpointerup = () => {pointerdown = false;};

    const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera( 75, _canvas.clientWidth / _canvas.clientHeight, 0.1, 1000 );
      camera.position.set( 0, 0, 100 );
      camera.lookAt( 0, 0, 0 );

    const renderer = new THREE.WebGLRenderer({canvas: _canvas});

    // mark origin
    const originMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00} );
    const originMarker = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), originMaterial);
    scene.add(originMarker);

    // mark target point
    const targetMaterial = new THREE.MeshBasicMaterial({color: 0xff0000} );
    const targetMarker = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), targetMaterial);
    targetMarker.position.set(10, 10, 0);
    scene.add(targetMarker);

    // render bones
    let boneLength = 20;
    let bones = [
      new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
      new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
      new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
      new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
      // new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
      // new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
      // new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
      // new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)),
    ];

    const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );

    let points = solveFK(bones, boneLength, originMarker.position);

    const lineBaseGeometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( lineBaseGeometry, lineMaterial );
    scene.add(line);
    
    // debug line declared globally
    // scene.add(debugLine);
    scene.add(debugLine2);
    scene.add(debugVector);

    let tempBonesCopy = Array.from(bones);
    let tempBoneLengthCopy = boneLength;
    changeMode = function() {
      raveMode = !raveMode;
      if (raveMode) {
        scene.add(debugLine);
        scene.remove(debugLine2);
        scene.remove(debugVector);
        scene.remove(originMarker);
        scene.remove(targetMarker);
        tempBonesCopy = Array.from(bones);
        tempBoneLengthCopy = boneLength;
        boneLength = 50;
        bones = new Array(10).fill(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0)));
      } else {
        scene.remove(debugLine);
        scene.add(debugLine2);
        scene.add(debugVector);
        scene.add(originMarker);
        scene.add(targetMarker);
        boneLength = tempBoneLengthCopy;
        bones = tempBonesCopy;
      }
    };
    
    let frameCount = 0;
    function animate() {
      requestAnimationFrame( animate );
      frameCount++;

      if (!raveMode) {
        buttonText = `(${targetMarker.position.x}, ${targetMarker.position.y}, ${targetMarker.position.z})`;

        solveIK(bones, boneLength, originMarker.position, targetMarker.position, 10);
        // console.log(...bones[0].elements);

        points = solveFK(bones, boneLength, originMarker.position, 10);
        line.geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const lineGeometry = line.setGeometry(new THREE.BufferGeometry().setFromPoints(points));

        // debugging stuff
        let debugBones = new Array(bones.length);
        for (let i = 0; i < points.length - 1; i++) {
          let rotMatrix = getRotMatrixBetweenVectors(points[i], points[i+1]);
          let lastBone = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0));
          // for (let j = 0; j < i; j++) {
          //   lastBone.multiply(bones[j]);
          // }
          rotMatrix.multiply(lastBone.transpose());
          debugVectorDisplay(new THREE.Vector3(20, 0, 0).applyMatrix4(rotMatrix));
          debugBones[i] = rotMatrix;
        }
        let debugPoints = solveFK(debugBones, boneLength, originMarker.position, 10);
        debugLine2.geometry = new THREE.BufferGeometry().setFromPoints(debugPoints);
      } else { // ---------------------------------------------------------------------
        buttonText = "RAVE MODE ACTIVATED";

        let rotationAngle = Math.log(frameCount) / 100000;
        for (let i = 0; i < bones.length; i++) {
          bones[i].multiply(new THREE.Matrix4().makeRotationZ(rotationAngle));
        }

        points = solveFK(bones, boneLength, originMarker.position, 10);
        line.geometry = new THREE.BufferGeometry().setFromPoints(points);
        debugLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
        line.rotateZ(2*Math.PI/3);
        debugLine.rotateZ(2*Math.PI/3);
      }
      
      renderer.render( scene, camera );
    }
    animate();

    _canvas.onpointermove = e => {
      if (!pointerdown) return;
      e.preventDefault();
      let pointerX = ((e.clientX - _canvas.offsetLeft) / _canvas.clientWidth) * 2 - 1;
      let pointerY = ((e.clientY - _canvas.offsetTop) / _canvas.clientHeight) * 2 - 1;
      
      let pointerVector = new THREE.Vector3(pointerX, -pointerY, -1).unproject(camera).sub(camera.position).normalize();
      const raycaster = new THREE.Raycaster(camera.position, pointerVector);
      const rayAngle = pointerVector.angleTo(new THREE.Vector3(0, 0, -1));
      const castRay = new THREE.Vector3(
        camera.position.x + raycaster.ray.direction.x*camera.position.z/Math.cos(rayAngle),
        camera.position.y + raycaster.ray.direction.y*camera.position.z/Math.cos(rayAngle),
        camera.position.z + raycaster.ray.direction.z*camera.position.z/Math.cos(rayAngle),
      );
      targetMarker.position.set(...castRay);
    };
  });

  function solveFK(bones, boneLength, originVec3) {
    const points = [];
    let bonePosition = new THREE.Vector3(...originVec3);  
    let lastRotationMatrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0));
    points.push( new THREE.Vector3( ...bonePosition ) );
    for (let i = 0; i < bones.length; i++) {
      let newBoneTranslation = new THREE.Vector3(boneLength, 0, 0);
      lastRotationMatrix.multiply(bones[i]);
      newBoneTranslation.applyMatrix4(lastRotationMatrix);
      bonePosition.add(newBoneTranslation);
      points.push( new THREE.Vector3( ...bonePosition ) );
    }
    return points;
  }

  function solveIK(bones, boneLength, originVec3, targetVec3, numIterations) {
    const distanceToTargetSq = targetVec3.clone().sub(originVec3).lengthSq();
    const chainLengthSq = (bones.length * boneLength) * (bones.length * boneLength);
    const currentPoints = solveFK(bones, boneLength, originVec3);

    if (distanceToTargetSq < chainLengthSq) {
      for (let i = 0; i < numIterations; i++) {
        FABRIKBackwards(currentPoints, targetVec3, boneLength);
        FABRIKForwards(currentPoints, originVec3, boneLength);
        const errorToTarget = currentPoints[currentPoints.length-1].clone().sub(targetVec3).lengthSq(); // using square value for performance reasons
        const errorToOrigin = currentPoints[0].clone().sub(originVec3).lengthSq();
        if ((errorToTarget+errorToOrigin) < 0.0002) break;
      }
      debugLine.geometry = new THREE.BufferGeometry().setFromPoints(currentPoints) // add debug line
      for (let i = 0; i < bones.length; i++) {
        const updatedPoints = solveFK(bones, boneLength, originVec3);
        bones[i] = getRotMatrixBetweenVectors(updatedPoints[i], currentPoints[i+1]);
      }
    } else {
      for (let i = 0; i < bones.length; i++) {
        bones[i] = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, 0))
      }
      // bones[0] = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
      bones[0] = getRotMatrixBetweenVectors(originVec3, targetVec3);
    }
  }

  function FABRIKBackwards(currentPoints, targetVec3, boneLength) {
    // let currentPoints = Array.from(currentPoints);
    currentPoints[currentPoints.length-1] = targetVec3;
    for (let i = currentPoints.length-1; i > 0; i--) {
      currentPoints[i-1] = currentPoints[i-1].clone().sub(currentPoints[i]).normalize().multiplyScalar(boneLength).add(currentPoints[i]);
    }
  }

  function FABRIKForwards(currentPoints, originVec3, boneLength) {
    // let currentPoints = Array.from(currentPoints);
    currentPoints[0] = originVec3;
    for (let i = 0; i < currentPoints.length - 1; i++) {
      currentPoints[i+1] = currentPoints[i+1].clone().sub(currentPoints[i]).normalize().multiplyScalar(boneLength).add(currentPoints[i]);
    }
  }

  function clockwiseAngleBetween(vec1, vec2) {
    return ((vec1.clone().cross(vec2).z < 0 ? 1 : -1)*Math.acos(vec1.dot(vec2)));
  }

  function getRotMatrixBetweenVectors(vec1, vec2) {
    const v1 = ((vec1.x == 0 && vec1.y == 0 && vec1.z == 0) ? new THREE.Vector3(1, 0, 0) : vec1.clone()).normalize();
    const v3 = vec2.clone().sub(vec1).normalize();
    let rotAxis = v1.clone().cross(v3).normalize();
    // if (Math.abs(Math.abs(rotAxis.z) - 1) > 0.1) console.log(...rotAxis); // oops but idk what to do about that
    const rotAngle = v3.angleTo(v1);
    rotAxis = new THREE.Vector3(0, 0, (rotAxis.z > 0) ? 1 : -1); // fix this vec to be z only since I'm just dealing with 2d for now and it makes it more stable
    return new THREE.Matrix4().makeRotationAxis(rotAxis, rotAngle);
  }

  function debugVectorDisplay(vec) {
    debugVector.geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), vec]);
  }
</script>

<style>
  :global(*) {
    padding: 0;
    margin: 0;
  }

  :global(html), :global(body), main {
    height: 100%;
    width: 100%;
  }

  #canvas {
    height: 100%;
    max-width: 100%;
  }

  main {
    background: #111;
    display: grid;
    grid-template-rows: 1fr 5rem;
    place-items: center;
  }

  @media screen and (width > 100vh) {
    main {
      grid-template-rows: 1fr;
      grid-template-columns: 1fr 20rem
    }
  }
</style>