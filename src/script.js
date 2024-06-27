import * as THREE from 'three'
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()


const material = new THREE.MeshBasicMaterial({color : '#ffffff'});
let index=1;
let SelectedCurrectObject=null;
let isDrawing = false;
let tempLine=null;
let ArrOfAllObject=[];

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    material
)


scene.add( plane)

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

let Points=[];
let CurrectMod="line";

document.getElementById('line').addEventListener('click',()=>{
   CurrectMod="line";
   console.log("line");
   Points=[]
})

document.getElementById('polyline').addEventListener('click',()=>{
    CurrectMod="polyline";
    console.log("polyline");
    Points=[]
 
})

document.getElementById('circle').addEventListener('click',()=>{
    CurrectMod="circle";
    Points=[]
   
    
})

document.getElementById('ellipse').addEventListener('click',()=>{
    CurrectMod="ellipse";
    Points=[]
  
})

document.getElementById('edit').addEventListener('click',()=>{
    CurrectMod="edit";
    Points=[]
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)

camera.position.z = 5

camera.lookAt(plane.position)
scene.add(camera)

const eventCanvas= document.getElementById('plane');

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
let CurrectObject=null;

const event= document.getElementById('line');

function DrawLine(p){

    const geometry = new THREE.BufferGeometry().setFromPoints(p);
    const material = new THREE.LineBasicMaterial( { color: 'red' } );
    const line = new THREE.Line(geometry, material);

    return line;
    
}

function DrawCircle(p){
     const D= p[1].x-p[0].x;
     const H= p[1].y-p[0].y;
     const Z= p[1].z-p[0].z;
     const R= Math.sqrt(D*D+H*H+Z*Z);
     const geometry = new THREE.CircleGeometry(R,32);
     const material = new THREE.MeshBasicMaterial( { color: 'blue' } );
     const circle = new THREE.Mesh(geometry, material);
     circle.position.set(p[0].x, p[0].y, p[0].z+0.01);
     circle.name="circle"+index;
     circle.userData.radius=R;
  
     return circle;
}

function drawEllipse(points) {
  
    if (points.length !== 3) {
        console.error('Exactly three points are required to define an ellipse.');
        return;
    }

    const [center, xRadiusPoint, yRadiusPoint] = points;
    console.log(center, " ", xRadiusPoint, " ", yRadiusPoint, " ");
     
    const radiusX = center.distanceTo(xRadiusPoint);
    const radiusY = center.distanceTo(yRadiusPoint);
    const ellipseShape = new THREE.Shape();
    ellipseShape.absellipse(0, 0, radiusX, radiusY, 0, 2 * Math.PI);
    const geometry = new THREE.ShapeGeometry(ellipseShape);
    const material = new THREE.MeshBasicMaterial({ color: 'yellow', side: THREE.DoubleSide });
    const ellipse = new THREE.Mesh(geometry, material);
    ellipse.position.set(center.x, center.y, center.z);
    ellipse.rotation.set(0, 0, 0); 
    ellipse.name = "ellipse" + index;
    ellipse.userData.radiusX=radiusX;
    ellipse.userData.radiusY=radiusY;
    ellipse.userData.radius=1;
    return ellipse;
}

function drawPolyline(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 'green' });
    const line = new THREE.Line(geometry, material);
    return line;
}

let listOfObject = document.getElementById('list');

const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

function FindIntersects(x,y){
    const rect = eventCanvas.getBoundingClientRect();
    console.log(rect.height,rect.top);
    mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(plane);
      return intersects;
}

function FindIntersectsForEdit(x,y){
    const rect = eventCanvas.getBoundingClientRect();
    mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(ArrOfAllObject);
      return intersects;
}

function SelectObjectColorChange( objectName ){

    const ID=objectName+"-li";
    const listItem = document.getElementById(ID);
    listItem.style.backgroundColor="red";
}

document.getElementById("delete-button").addEventListener('click', (e)=>{
    console.log("delete event active",SelectedCurrectObject);
   
    ArrOfAllObject = ArrOfAllObject.filter(item => item !== SelectedCurrectObject);
    const ID=SelectedCurrectObject.name + "-li";
    console.log(scene.children.length);
    scene.remove(SelectedCurrectObject);
    SelectedCurrectObject.geometry.dispose();
    SelectedCurrectObject.material.dispose();
    console.log("after Deletion : ",scene.children.length);
    const listItem = document.getElementById(ID);
    SelectedCurrectObject=null;
    if(listItem)
    listItem.remove();
})

function SelectObject(event){
    const intersects = FindIntersectsForEdit(event.clientX,event.clientY);
    console.log(intersects.length);
    if(SelectedCurrectObject){ console.log("hhsjkhd");
    const ID=SelectedCurrectObject.name+"-li";
    const listItem = document.getElementById(ID);
    listItem.style.backgroundColor="#f4f4f4";
    }
    CurrectObject=intersects[0].object.name;
    SelectedCurrectObject=intersects[0].object;
    SelectObjectColorChange(CurrectObject);

}

function getCircleRadius(circle) {
    if (circle.geometry instanceof THREE.CircleGeometry) {
        return circle.userData.radius;
    } else {
        console.error("The object is not a circle.");
        return null;
    }
}

function setCircleRadius(circle, newRadius) {
    if (circle.geometry instanceof THREE.CircleGeometry) {
        const segments = circle.geometry.parameters.segments;
        circle.geometry.dispose(); // Dispose of the old geometry
        circle.geometry = new THREE.CircleGeometry(newRadius, segments); // Create new geometry with the new radius
        circle.userData.radius = newRadius; // Update the stored radius
    } else {
        console.error("The object is not a circle.");
    }
}

function getEllipseRadius(shape, axis) {
    if (axis === 'circle') {
        return shape.userData.radius || 1;  // default to 1 if radius is not defined
    } else if (axis === 'x') {
        return shape.userData.radiusX || 1;  // default to 1 if x radius is not defined
    } else if (axis === 'y') {
        return shape.userData.radiusY || 1;  // default to 1 if y radius is not defined
    }
}

 function setEllipseRadius(shape, radius, axis) {
    if (axis === 'circle') {
        shape.geometry.dispose();
        shape.geometry = new THREE.CircleGeometry(radius, 32);
        shape.userData.radius = radius;
    } else {
        const radiusX = axis === 'x' ? radius : getEllipseRadius(shape, 'x');
        const radiusY = axis === 'y' ? radius : getEllipseRadius(shape, 'y');
        
        shape.geometry.dispose();
        const ellipseShape = new THREE.Shape();
        ellipseShape.absellipse(0, 0, radiusX, radiusY, 0, 2 * Math.PI);
        shape.geometry = new THREE.ShapeGeometry(ellipseShape);
        shape.userData.radiusX = radiusX;
        shape.userData.radiusY = radiusY;
    }
}

function ChangeColor(Objectname,color){
    for(const Object of ArrOfAllObject){
        if(Object.name==Objectname){
          Object.material.color.set(color)
        }
    }
}

function GetObject(ObjectName){
    console.log("ssacsd");
    // scene.traverse(function(node) {
    //     if (node instanceof THREE.Scene) {
    //         console.log(node.name);
    //         if(node.name===ObjectName)return node; // Output: "Main Scene"
    //     }
    // })
    for(const it of ArrOfAllObject){
        console.log(it.name);
        if(ObjectName===it.name){
            return it;
        }
    }
}

function AddHtmlObject(object, color) {
    const ObjectName=GetObject(object);
    console.log(ObjectName.name, object);
    const listItem = document.createElement("li");
    listItem.id = object + "-li";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = object;
    listItem.appendChild(nameSpan);
    const colorInput = document.createElement("input");
    colorInput.addEventListener('change',(e)=>{
        ChangeColor(object,e.target.value);
    })
    colorInput.type = "color";
    colorInput.id = object;
    colorInput.value = color;
    colorInput.className = "custom-color-input";
    listItem.appendChild(colorInput);

    if (CurrectMod === "circle") {
        const radiusInput = document.createElement("input");
        radiusInput.type = "number";
        radiusInput.id = object + "radius";
        radiusInput.value = getCircleRadius(ObjectName);
        radiusInput.className = "radius-input";
        radiusInput.addEventListener('change', (e) => {
            const newRadius = parseFloat(e.target.value);
            setCircleRadius(ObjectName, newRadius);
        });
        listItem.appendChild(radiusInput);
    }else if (CurrectMod === "ellipse" ) {
        const xRadiusInput = document.createElement("input");
        xRadiusInput.type = "number";
        xRadiusInput.id = object + "xRadius";
        xRadiusInput.value = getEllipseRadius(ObjectName, 'x');
        xRadiusInput.className = "radius-input";
        xRadiusInput.addEventListener('change', (e) => {
            const newXRadius = parseFloat(e.target.value);
            setEllipseRadius(ObjectName, newXRadius, 'x');
        });
        listItem.appendChild(xRadiusInput);
        
        const yRadiusInput = document.createElement("input");
        yRadiusInput.type = "number";
        yRadiusInput.id = object + "yRadius";
        yRadiusInput.value = getEllipseRadius(ObjectName, 'y');
        yRadiusInput.className = "radius-input";
        yRadiusInput.addEventListener('change', (e) => {
            const newYRadius = parseFloat(e.target.value);
            setEllipseRadius(ObjectName, newYRadius, 'y');
        });
        listItem.appendChild(yRadiusInput);
    }

    listOfObject.appendChild(listItem);
}

eventCanvas.addEventListener('click', (e)=>{
    if(CurrectMod=="edit"){
    SelectObject(e);
    return;
    }

    if (tempLine) {
        console.log("tempLine",tempLine);
        scene.remove(tempLine);
        tempLine.geometry.dispose();
        tempLine.material.dispose();
    }
    isDrawing=true;
  const intersects = FindIntersects(e.clientX,e.clientY);

  if (intersects.length > 0) {
    intersects[0].point.z=0.01;
    Points.push(intersects[0].point);
    console.log(Points);
  }
  if(Points.length==2){
    if(CurrectMod=="line"){
    const temp=DrawLine(Points);
    temp.name="line"+index;
    index++;
    console.log(temp);
     ArrOfAllObject.push(temp);
    AddHtmlObject(temp.name,"#ff0000");

    scene.add(temp);
    isDrawing=false;
    tempLine=null;
    Points=[];
    }
    if(CurrectMod=="circle"){   
    const temp=DrawCircle(Points);
    temp.name="circle"+index;
    index++;
    ArrOfAllObject.push(temp);
   
    AddHtmlObject(temp.name,"#0000ff");
    scene.add(temp);
    isDrawing=false;
    tempLine=null;
    Points=[];
    }
  }
  if(Points.length>=3 && CurrectMod=="polyline"){
    drawPolyline(Points);
    // Points=[];
  }
  if(Points.length==3 && CurrectMod=="ellipse"){
    const temp=drawEllipse(Points);
    temp.name="ellipse"+index;
    index++;
    ArrOfAllObject.push(temp);
    AddHtmlObject(temp.name,"#ffff00");
 
    scene.add(temp);
    isDrawing=false;
    tempLine=null;
    Points=[];
  }
});

eventCanvas.addEventListener('mousemove', (e)=>{
    console.log("event mousemove",Points.length);
  if(isDrawing==true && Points.length > 0){

    const intersects = FindIntersects(e.clientX, e.clientY);
    const newPoints = [...Points, intersects[0].point];
    if (tempLine) {
        console.log("tempLine",tempLine);
        scene.remove(tempLine);
        tempLine.geometry.dispose();
        tempLine.material.dispose();
    }
    if(newPoints.length == 2 && CurrectMod=="line"){
    tempLine = DrawLine(newPoints);
    scene.add(tempLine);
  
    }
    else if(newPoints.length == 2 && CurrectMod=="circle"){
        tempLine= DrawCircle(newPoints);
        console.log(tempLine);
        scene.add(tempLine);
      
    }
    else if(newPoints.length == 3 && CurrectMod=="ellipse"){
        tempLine= drawEllipse(newPoints);
        scene.add(tempLine);
        
    }
    else if(newPoints.length >= 3 && CurrectMod=="polyline"){
        tempLine= DrawLine(newPoints);
        scene.add(tempLine);
    }
  
}
});

eventCanvas.addEventListener('contextmenu', (e)=>{
      if(CurrectMod=="polyline" && Points.length > 0){
          const intersects = FindIntersects(e.clientX, e.clientY);
          const newPoints = [...Points, intersects[0].point];
          if (tempLine) {
            scene.remove(tempLine);
            tempLine.geometry.dispose();
            tempLine.material.dispose();
        }
          tempLine= DrawLine(newPoints);
          tempLine.name="polyline"+index;
          index++;
          ArrOfAllObject.push(tempLine);
          AddHtmlObject(tempLine.name,"#ff0000");
          scene.add(tempLine);
          tempLine=null;
          Points=[];
          //CurrectMod="edit"
      }
})

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}
tick()