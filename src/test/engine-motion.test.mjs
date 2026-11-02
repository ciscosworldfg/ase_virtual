import test from "node:test";
import assert from "node:assert/strict";
import { createEngineMotion } from "../../public/engine-lab/engine-kinematics.js";

class Vector3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
  clone(){return new Vector3(this.x,this.y,this.z)}
  copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}
  add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}
  multiplyScalar(n){this.x*=n;this.y*=n;this.z*=n;return this}
  length(){return Math.hypot(this.x,this.y,this.z)}
  normalize(){const n=this.length()||1;return this.multiplyScalar(1/n)}
}
class Group {
  constructor(){this.children=[];this.position=new Vector3();this.rotation={x:0,y:0,z:0};this.scale={x:1,y:1,z:1}}
  add(...items){this.children.push(...items)}
}
class Mesh extends Group {
  constructor(geometry,material){super();this.geometry=geometry;this.material=material;this.quaternion={setFromUnitVectors(){}}}
}
class Geometry { constructor(...args){this.args=args} }
class Material { constructor(options){this.options=options} }
const THREE={Group,Mesh,Vector3,CylinderGeometry:Geometry,TorusGeometry:Geometry,MeshStandardMaterial:Material,DoubleSide:2};

test("builds six animated cylinder assemblies across two V banks",()=>{
  const banks=[new Group(),new Group()];
  const motion=createEngineMotion(THREE,banks,{n:6,v:1});
  assert.equal(motion.cylinders,6);
  assert.ok(banks.every(bank=>bank.children.length>=3));
});

test("moves piston and connecting rod at a commanded RPM",()=>{
  const bank=new Group();
  const motion=createEngineMotion(THREE,[bank],{n:4,v:0});
  const piston=bank.children[4];
  const rod=bank.children[5];
  assert.equal(piston.position.y,0);
  motion.update(0.02,750);
  assert.ok(piston.position.y>0);
  assert.ok(rod.scale.y>0.7);
});

test("opens the intake valve and rotates camshaft at half crank speed",()=>{
  const bank=new Group();
  const motion=createEngineMotion(THREE,[bank],{n:4,v:0});
  const intakeCam=bank.children[1];
  const intakeValve=bank.children[6];
  motion.update(0.02,750); // 90 crank degrees
  assert.ok(intakeValve.position.y<1.35);
  assert.ok(Math.abs(intakeCam.rotation.x+Math.PI/4)<1e-8);
});
