// Procedural recognition models, not vehicle CAD. All geometry is generic.
export function createComponentGeometry(THREE, palette) {
  const material = key => new THREE.MeshStandardMaterial({color:palette[key],metalness:key==='rubber'||key==='plastic'?0:.72,roughness:key==='rubber'?.86:.38});
  const box=(x,y,z,key,px=0,py=0,pz=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(x,y,z),material(key));m.position.set(px,py,pz);return m};
  const cyl=(r,h,key,x=0,y=0,z=0,axis='y',segments=32)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),material(key));m.position.set(x,y,z);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;return m};
  const ring=(r,t,key,x=0,y=0,z=0,axis='y')=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,36),material(key));m.position.set(x,y,z);if(axis==='y')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.y=Math.PI/2;return m};
  const tube=(points,r,key)=>new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,10,false),material(key));
  const group=(...meshes)=>{const g=new THREE.Group();g.add(...meshes);return g};
  const bolts=(g,length,width,y)=>{for(const x of [-length/2+.12,length/2-.12])for(const z of [-width/2+.1,width/2-.1])g.add(cyl(.045,.045,'metal',x,y,z,'y',6))};
  const socket=(x,y,z)=>group(box(.17,.13,.16,'plastic',x,y,z),box(.09,.04,.18,'rubber',x,y+.08,z));
  return function refine(id,original) {
    original.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(original),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
    const type=id.replace(/\d+$/,'');let g;
    if(type==='alt') {
      g=group(cyl(.27,.48,'brass',0,0,0,'x'),ring(.33,.055,'metal',-.28,0,0,'x'),ring(.33,.055,'metal',.28,0,0,'x'),cyl(.16,.12,'rubber',.4,0,0,'x'),cyl(.06,.14,'metal',.45,0,0,'x',6),socket(-.24,.29,0));
      for(let i=0;i<12;i++){const a=i*Math.PI/6,y=Math.sin(a)*.32,z=Math.cos(a)*.32;const rib=box(.48,.035,.065,'metal',0,y,z);rib.rotation.x=-a;g.add(rib);g.add(cyl(.018,.58,'metal',0,Math.sin(a)*.28,Math.cos(a)*.28,'x'))}
      for(const x of [-.21,.21])g.add(box(.13,.17,.17,'metal',x,-.4,0),cyl(.04,.19,'darkMetal',x,-.43,0,'z'));
      for(let i=0;i<3;i++)g.add(ring(.16,.012,'metal',.35+i*.04,0,0,'x'));
    } else if(type==='int') {
      const length=size.x;g=group(cyl(.23,length*.93,'metal',0,.15,0,'x'),box(length,.09,.86,'darkMetal',0,-.24,0));
      for(let j=0;j<3;j++)for(const side of [-1,1]){const x=(j-1)*length/3;g.add(tube([[x,.15,0],[x,.17,side*.23],[x,-.05,side*.42],[x,-.26,side*.43]],.105,'metal'));g.add(box(.28,.07,.23,'metal',x,-.25,side*.44))}
      for(let j=0;j<5;j++)g.add(box(length*.8,.025,.018,'metal',0,.37,j*.055-.11));
      g.add(ring(.21,.035,'metal',-length/2,.15,0,'x'));bolts(g,length,.86,-.18);
    } else if(type==='thr'||type==='maf') {
      const radius=type==='thr'?.24:.19,length=type==='thr'?.43:.58;
      g=group(ring(radius,.035,type==='thr'?'metal':'rubber',-length/2,0,0,'x'),ring(radius,.035,type==='thr'?'metal':'rubber',length/2,0,0,'x'));
      // Open bore built from strips; no solid cylinder blocking the butterfly.
      for(let j=0;j<24;j++){const a=j*Math.PI/12;const wall=box(length,.055,.045,type==='thr'?'metal':'plastic',0,Math.sin(a)*radius,Math.cos(a)*radius);wall.rotation.x=a;g.add(wall)}
      if(type==='thr'){const plate=cyl(radius*.9,.016,'brass',0,0,0,'x');plate.rotation.y=.55;g.add(plate,cyl(.018,.5,'metal',0,0,0,'z'),box(.3,.29,.16,'plastic',0,0,.3))}
      else g.add(box(.23,.13,.22,'plastic',0,.23,0),box(.016,.17,.03,'metal',0,.08,0));
      g.add(socket(0,.2,.2));
    } else if(type==='coil') {
      g=group(cyl(.075,.36,'rubber',0,-.1,0),box(.26,.14,.22,'plastic',0,.15,0),socket(.16,.15,0),box(.13,.045,.12,'metal',-.16,.12,0),cyl(.028,.05,'darkMetal',-.17,.15,0));
    } else if(type==='plug') {
      g=group(cyl(.033,.18,'ceramic',0,.07,0),cyl(.065,.065,'metal',0,-.06,0,'y',6),cyl(.04,.13,'metal',0,-.14,0),cyl(.022,.06,'metal',0,.18,0),cyl(.008,.035,'metal',0,-.22,0),tube([[.032,-.2,0],[.032,-.235,0],[.009,-.235,0]],.007,'metal'));
      for(let j=0;j<5;j++)g.add(ring(.034,.006,'ceramic',0,.025+j*.025,0));
      for(let j=0;j<6;j++)g.add(ring(.04,.003,'darkMetal',0,-.105-j*.017,0));
    } else if(type==='inj') {
      g=group(cyl(.055,.3,'metal'),cyl(.033,.11,'metal',0,-.2,0),cyl(.035,.09,'metal',0,.19,0),box(.12,.15,.12,'plastic',.06,.07,0),socket(.13,.08,0),ring(.055,.016,'rubber',0,-.11,0),ring(.039,.013,'rubber',0,.2,0));
    } else if(['crk','cam','map','oilp','knk','vvt'].includes(type)) {
      if(type==='knk')g=group(ring(.085,.032,'metal'),cyl(.035,.1,'darkMetal'),socket(.09,.03,0));
      else if(type==='oilp')g=group(cyl(.06,.14,'brass',0,-.08,0),cyl(.09,.07,'metal',0,0,0,'y',6),cyl(.09,.13,'plastic',0,.08,0),socket(0,.18,0));
      else if(type==='vvt')g=group(cyl(.065,.32,'metal',-.06,0,0,'x'),cyl(.1,.14,'plastic',.17,0,0,'x'),socket(.17,.11,0),box(.14,.035,.18,'metal'));
      else g=group(cyl(.06,.2,'plastic',0,-.055,0),box(.18,.11,.14,'plastic',0,.08,0),socket(.14,.08,0),box(.12,.035,.14,'metal',-.13,.01,0),cyl(.025,.04,'darkMetal',-.13,.04,0));
    } else if(type==='ect') {
      g=group(cyl(.21,.22,'metal'),cyl(.12,.4,'metal',.15,0,0,'x'),ring(.12,.024,'darkMetal',.36,0,0,'x'),cyl(.055,.13,'brass',-.08,.18,0),socket(-.08,.27,0));bolts(g,.38,.34,.14);
    } else if(type==='egr') {
      g=group(box(.3,.065,.3,'metal',0,-.18,0),cyl(.13,.2,'metal',0,-.06,0),cyl(.14,.2,'plastic',0,.14,0),socket(.13,.18,0),tube([[0,-.05,0],[.18,-.03,0],[.26,-.16,0]],.065,'metal'));bolts(g,.3,.3,-.14);
    } else if(type==='cov'||type==='head'||type==='block'||type==='pan') {
      const x=size.x,y=size.y,z=size.z;
      g=group(box(x*.93,y*.8,z*.9,type==='cov'?'metal':type==='pan'?'darkMetal':'metal'),box(x,.045,z,'darkMetal',0,-y*.42,0));
      for(let j=0;j<6;j++)g.add(box(x*.83,.025,.025,'metal',0,y*.41,(j-2.5)*z/8));
      bolts(g,x,z,y*.44);
      if(type==='block')g.traverse(m=>{if(m.isMesh){m.material.transparent=true;m.material.opacity=.42;m.material.depthWrite=false}});
      if(type==='cov')for(let j=0;j<3;j++)g.add(ring(.11,.025,'darkMetal',(j-1)*x/3,y*.4,0));
      if(type==='cov'&&id==='cov0')g.add(cyl(.13,.08,'plastic',x*.31,y*.48,z*.23),box(.15,.055,.035,'darkMetal',x*.31,y*.54,z*.23));
      if(type==='head')for(let j=0;j<3;j++)for(const side of [-1,1])g.add(ring(.12,.026,'darkMetal',(j-1)*x/3,0,side*z*.46,'z'));
      if(type==='pan')g.add(cyl(.055,.09,'metal',x*.32,-y*.43,z*.25,'y',6));
    } else if(type==='exh') {
      g=group(box(size.x,.1,.09,'metal',0,.14,0),cyl(.105,size.x*.9,'cast',0,-.08,0,'x'));
      for(let j=0;j<3;j++){const x=(j-1)*size.x/3;g.add(tube([[x,.15,0],[x,.12,.18],[x*.7,-.08,.22],[x*.65,-.08,0]],.07,'cast'))}
      g.add(ring(.1,.03,'metal',size.x*.48,-.08,0,'x'));
    } else if(type==='rail') {
      g=group(cyl(.05,size.x,'metal',0,0,0,'x'));
      for(let j=0;j<3;j++)g.add(cyl(.035,.15,'metal',(j-1)*size.x/3,-.07,0),box(.15,.035,.22,'metal',(j-1)*size.x/3,.05,0));
      g.add(cyl(.065,.1,'brass',size.x/2,0,0,'x'));
    } else if(type==='pulley') {
      g=group(cyl(.4,.15,'darkMetal',0,0,0,'x'),cyl(.22,.19,'metal',.03,0,0,'x'),cyl(.055,.08,'metal',.16,0,0,'x',6));
      for(let j=0;j<4;j++)g.add(ring(.4,.012,'rubber',-.07+j*.04,0,0,'x'));
    } else return original;
    g.position.copy(center);return group(g);
  };
}