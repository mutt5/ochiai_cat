const {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
    Vector3
} = THREE;

class Cat {
  constructor(world) {
    this.world = world;
    this.speed = new Vector3(0, 0, 0.01);
    this.geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshBasicMaterial({ color: 0xff00ff });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(5, 0, 0);
    this.world.scene.add(this.mesh);
    this.detectionRadius = 2;

    // The state of the cat can be changed dynamically based on its interactions with the environment
    this.state = {
      position: this.mesh.position,
      isScared: false,
      isResting: false,
    };
  }

  detectRoomba(position, isRoombaMoving) {
    const distance = this.state.position.distanceTo(position);
    
    // If the cat is resting, it ignores the Roomba unless it's very close
    const detectionRadius = this.state.isResting ? this.detectionRadius / 2 : this.detectionRadius;
    
    // If the Roomba is moving, the cat can detect it from farther away
    const effectiveDetectionRadius = isRoombaMoving ? detectionRadius * 2 : detectionRadius;
    
    return distance < effectiveDetectionRadius;
  }
  
  updateState(position, isRoombaMoving) {
    this.updatePosition();
    
    // Detect if the roomba is nearby and moving
    const roombaIsNearby = this.detectRoomba(position, isRoombaMoving);
    console.log(`roombaIsNearby: ${roombaIsNearby}`);
  
    // If the roomba is nearby and moving, the cat gets scared
    if (roombaIsNearby && isRoombaMoving) {
      this.state.isScared = false;
    } else {
      this.state.isScared = false;
    }
  
    // The cat's behavior changes based on its state
    if (this.state.isScared) {
      this.runAway(position);
    } else if (this.state.isResting) {
      this.rest();
    } else {
      this.wanderAround();
    }
  }

  // Different skills/behaviors the cat can perform
  runAway(position) {
    // The cat changes its speed to move away from the roomba
    // const direction = this.state.position.clone().sub(position).normalize();
    // this.speed = direction.multiplyScalar(0.05);
  }

  rest() {
    // The cat stops moving
    this.speed.set(0, 0, 0);
  }

  wanderAround() {
    // The cat changes direction randomly
    this.speed.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(0.01);
  }

  // // A method to detect if the roomba is nearby
  // detectRoomba() {
  //   // Calculate the distance between the cat and the roomba
  //   const distance = this.state.position.distanceTo(this.roomba.state.position);

  //   // If the distance is less than a certain value, the roomba is considered to be nearby
  //   return distance < 5;
  // }

  // A method to update the cat's position based on its speed
  updatePosition() {
    // Create a temporary new position
    const newPosition = this.mesh.position.clone().add(this.speed);
  
    // Check if the new position is within the desired range
    if (newPosition.length() < 10) {
      // If it is, update the cat's position
      this.mesh.position.copy(newPosition);
      this.state.position.copy(newPosition);
    } else {
      // If it's not, change the direction of the speed vector to stay within the bounds
      this.speed.negate();
    }
  
    // Randomly change direction every now and then to mimic a cat's unpredictable movement
    if (Math.random() < 0.01) { // 1% chance per frame
      this.speed.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(0.01);
    }
  }

  // Interactions based on CatMeetsRoomba
  moveAwayFrom(position) {
    const direction = this.state.position.clone().sub(position).normalize();
    this.speed = direction.multiplyScalar(0.05);
  }

  watch(position) {
    // The cat looks at the position
    this.mesh.lookAt(position);
  }
}


class Roomba {
  constructor(world) {
    this.speed = new Vector3(0.01, 0, 0);
    this.world = world;
    this.state = {
      position: new Vector3(0, 0, 0),
      isMoving: true // Add this line
    };

    // Create a Roomba as a box for simplicity
    this.geometry = new BoxGeometry(1, 0.5, 1);
    this.material = new MeshBasicMaterial({ color: 0x00ff00 });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.world.scene.add(this.mesh);
  }

  updateState() {
    // Update the position
    this.mesh.position.add(this.speed);
    this.state.position.copy(this.mesh.position);

    // Check if the roomba is out of bounds
    if (this.state.position.length() > 5) {
        // Calculate a new direction towards the origin
        const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), this.state.position).normalize();

        // Set the new speed
        this.speed = direction.multiplyScalar(this.speed.length());
    }
}

  startCleaning() {
    // For this simple example, the Roomba just moves in a straight line
    this.updatePosition();
  }
}

class CatMeetsRoomba {
  constructor(cat, roomba, physicalWorld) {
    this.cat = cat;
    this.roomba = roomba;
    this.physicalWorld = physicalWorld;
    this.interactionState = 'none'; // possible states: none, observing, running_away, riding
  }

  updateInteractionState() {
    const distance = this.cat.state.position.distanceTo(this.roomba.state.position);

    // Update the state of the cat and the roomba
    this.cat.updateState(this.roomba.state.position, this.roomba.state.isMoving);
    this.roomba.updateState();

    if (this.cat.state.isScared) {
      if (distance < 1 && !this.roomba.state.isMoving) {
        this.interactionState = 'running_away';  // Scared but somehow ends up on the stationary roomba
      } else {
        this.interactionState = 'observing';  // Scared and trying to get as far as possible
      }
    } else {
      if (distance < 2 && this.roomba.state.isMoving) {
        this.interactionState = 'riding';  // Not scared, curious about the roomba, and roomba is moving
      } else if (this.cat.state.isResting || distance >= 10 || !this.roomba.state.isMoving) {
        this.interactionState = 'observing';  // Resting, not interested in the roomba, or roomba is not moving
      }
    }

    console.log(`interactionState: ${this.interactionState}`);
  }

  executeInteraction() {
    switch (this.interactionState) {
      case 'riding':
        this.cat.state.position.copy(this.roomba.state.position);
        break;
      case 'running_away':
        this.cat.moveAwayFrom(this.roomba.state.position);
        break;
      case 'observing':
        this.cat.watch(this.roomba.state.position);
        break;
      case 'none':
        this.cat.wanderAround();
        break;
    }
  }
}

class PhysicalWorld {
  constructor() {
    // Set the bounds of the world
    // this.bounds = bounds;

    // Create a three.js scene
    this.scene = new Scene();

    // Create a camera
    this.camera = new PerspectiveCamera(
      100, // fov — Camera frustum vertical field of view.
      window.innerWidth / window.innerHeight, // aspect — Camera frustum aspect ratio.
      0.1, // near — Camera frustum near plane.
      1000 // far — Camera frustum far plane.
    );

    // Set the camera position
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Create a WebGLRenderer and set its size
    this.renderer = new WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Append the renderer to the body
    document.body.appendChild(this.renderer.domElement);
  }

}
// オブジェクトの生成
const physicalWorld = new PhysicalWorld();
const cat = new Cat(physicalWorld);
const roomba = new Roomba(physicalWorld);
const catMeetsRoomba = new CatMeetsRoomba(cat, roomba, physicalWorld);

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  
  // Update the state of the cat and the roomba
  // cat.updateState();
  // roomba.updateState();
  
  // Update other elements of the simulation
  // physicalWorld.updatePhysicalWorldPerFrame();
  physicalWorld.renderer.render(physicalWorld.scene, physicalWorld.camera);
  catMeetsRoomba.updateInteractionState();
  catMeetsRoomba.executeInteraction();
  // renderer.render(Scene, camera);
}

// アニメーション開始
animate();
