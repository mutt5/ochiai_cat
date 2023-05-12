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
      this.isJumping = false;
      this.isScared = false;
      this.isAttacking = false;
      this.isCurious = false;
      this.isSleeping = true;
      this.isPlaying = false;
      this.speed = new Vector3(0.01, 0, 0);
      this.world = world;
      this.geometry = new BoxGeometry(1, 1, 1);
      this.material = new MeshBasicMaterial({ color: 0xff00ff });
      this.mesh = new Mesh(this.geometry, this.material);
      this.mesh.position.set(5, 0, 0);
      this.world.scene.add(this.mesh);
    }
  
    // Add a method to randomly change the cat's state
    updateState() {
      let rand = Math.random();
      this.mesh.position.x -= this.speed.x;
      if(this.mesh.position.x < -5) {
        this.mesh.position.x = 5;
      }
      // this.isJumping = rand < 0.1;
      // this.isScared = rand >= 0.1 && rand < 0.2;
      // this.isAttacking = rand >= 0.2 && rand < 0.3;
      // this.isCurious = rand >= 0.3 && rand < 0.4;
      // this.isSleeping = rand >= 0.4 && rand < 0.5;
      // this.isPlaying = rand >= 0.5;
    }
  }
  
  class Roomba {
    constructor(world) {
      this.world = world;
      this.geometry = new BoxGeometry(2, 0.5, 2);
      this.material = new MeshBasicMaterial({ color: 0x00ffff });
      this.mesh = new Mesh(this.geometry, this.material); 
      this.mesh.position.set(0, 0, 0);
      this.world.scene.add(this.mesh);
      this.isDetecting = false;
      this.isHitting = false;
      this.isCleaning = false;
      this.isAvoiding = false;
      this.speed = new Vector3(0, 0, 0);
    }
  
    // Add a method to randomly change the roomba's state
    updateState() {
      // this.mesh.roation.x -= this.speed.x;
      // if(this.mesh.roation.x < -3) {
      //   this.mesh.roation.x = 3;
      // }
      let rand = Math.random();
      this.isDetecting = rand < 0.25;
      this.isHitting = rand >= 0.25 && rand < 0.5;
      this.isCleaning = rand >= 0.5 && rand < 0.75;
      this.isAvoiding = rand >= 0.75;
    }
  }
  
  class CatMeetsRoomba {
    constructor(cat, roomba) {
      this.cat = cat;
      this.roomba = roomba;
      this.jumpDistance = 1;
      this.fearDistance = 2;
      this.attackDistance = 1;
      this.followDistance = 4;
      this.detectDistance = 5;
      this.hitDistance = 6;
      this.ignoreDistance = 7;
      this.cleanDistance = 8;
      this.playDistance = 9;
      this.avoidDistance = 10;
      this.runAwaySpeed = 1;
      this.attackImpact = 1;
      this.followSpeed = 1;
      this.playSpeed = 1;
      this.avoidSpeed = 1;
    }
  
    // Implement the interaction scenarios here
    updateCatMeetsRoombaPerFrame() {
        // Interaction scenario 1: Cat jumps on the roomba
        if (this.cat.mesh.position.distanceTo(this.roomba.mesh.position) < this.jumpDistance && this.cat.isJumping) {
          this.cat.speed.set(0, 0, 0);  // Cat stops moving
          this.cat.mesh.position.copy(this.roomba.mesh.position);  // Cat is now on the roomba
          console.log(`Cat jumps on the roomba`);
        }
        
        // Interaction scenario 2: Cat is scared of the roomba and runs away
        else if (this.cat.mesh.position.distanceTo(this.roomba.mesh.position) < this.fearDistance && this.cat.isScared) {
          this.cat.speed.addScaledVector(this.roomba.mesh.position.clone().sub(this.cat.mesh.position).normalize(), -this.runAwaySpeed);
          console.log(`Interaction scenario 2`);
        }
        
        // Interaction scenario 3: Cat attacks the roomba
        else if (this.cat.mesh.position.distanceTo(this.roomba.mesh.position) < this.attackDistance && this.cat.isAttacking) {
          this.roomba.speed.addScaledVector(this.cat.mesh.position.clone().sub(this.roomba.mesh.position).normalize(), -this.attackImpact);
        }
    
        // Interaction scenario 4: Cat is curious about the roomba and follows it
        else if (this.cat.mesh.position.distanceTo(this.roomba.mesh.position) < this.followDistance && this.cat.isCurious) {
          this.cat.speed.addScaledVector(this.roomba.mesh.position.clone().sub(this.cat.mesh.position).normalize(), this.followSpeed);
        }
    
        // Interaction scenario 5: Roomba changes its direction because it detects the cat
        else if (this.roomba.mesh.position.distanceTo(this.cat.mesh.position) < this.detectDistance && this.roomba.isDetecting) {
          this.roomba.speed.negate();
        }
    
        // Interaction scenario 6: Roomba stops because it hits the cat
        else if (this.roomba.mesh.position.distanceTo(this.cat.mesh.position) < this.hitDistance && this.roomba.isHitting) {
          this.roomba.speed.set(0, 0, 0);;  // Roomba stops moving
        }
    
        // Interaction scenario 7: Cat is sleeping and does not react to the roomba
        else if (this.cat.mesh.position.distanceTo(this.roomba.mesh.position) < this.ignoreDistance && this.cat.isSleeping) {
          // Do nothing
        }
    
        // Interaction scenario 8: Roomba cleans the area where the cat is
        else if (this.roomba.mesh.position.distanceTo(this.cat.mesh.position) < this.cleanDistance && this.roomba.isCleaning) {
          // Roomba continues its cleaning path
        }
    
        // Interaction scenario 9: Cat plays with the roomba
        else if (this.cat.mesh.position.distanceTo(this.roomba.mesh.position) < this.playDistance && this.cat.isPlaying) {
          this.cat.speed.addScaledVector(this.roomba.mesh.position.clone().sub(this.cat.mesh.position).normalize(), this.playSpeed);
        }
    
        // Interaction scenario 10: Roomba tries to avoid the cat
        else if (this.roomba.mesh.position.distanceTo(this.cat.mesh.position) < this.avoidDistance && this.roomba.isAvoiding) {
          this.roomba.speed.addScaledVector(this.cat.mesh.position.clone().sub(this.roomba.mesh.position).normalize(), -this.avoidSpeed);
        }
      }
    }

    class PhysicalWorld {
      constructor() {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(10, 5, 10);
        this.camera.lookAt(this.scene.position);
    
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }
    
      updatePhysicalWorldPerFrame() {
          this.renderer.render(this.scene, this.camera);
      }
    }
// オブジェクトの生成
const physicalWorld = new PhysicalWorld();
const cat = new Cat(physicalWorld);
const roomba = new Roomba(physicalWorld);
const catMeetsRoomba = new CatMeetsRoomba(cat, roomba);

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  
  // Update the state of the cat and the roomba
  cat.updateState();
  roomba.updateState();
  
  // Update other elements of the simulation
  physicalWorld.updatePhysicalWorldPerFrame();
  catMeetsRoomba.updateCatMeetsRoombaPerFrame();

  // renderer.render(Scene, camera);
}

// アニメーション開始
animate();
