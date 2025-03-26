const glmatrix = document.createElement('script');
glmatrix.src = 'https://cdn.jsdelivr.net/npm/gl-matrix@2.8.1/dist/gl-matrix-min.js';
document.head.appendChild(glmatrix);
glmatrix.addEventListener('load', () => {
Objects = []
renderObjects = []
cam_debug = true
let is_load = false
let overlayText = [...document.querySelectorAll('.overlayText')];
function new_obj(){
  let obj = {
    pos: [0,0,0],
    rot: [0,0,0],
    vertices: [],
    id: ""
  }
  Objects.push(obj)
  return obj;
}
function remove_obj(id){

}
function new_c(color = [1,0,0,1],size = 1){
  size = size / 2
  return [
    -size, -size, -size, ...color,
    -size, size, -size, ...color,
    size, -size, -size, ...color,
    size, size, -size, ...color,
    -size, size, -size, ...color,
    size, -size, -size, ...color,
    -size, -size, size, ...color,
    -size, size, size, ...color,
    size, -size, size, ...color,
    size, size, size, ...color,
    -size, size, size, ...color,
    size, -size, size, ...color,
    -size, -size, -size, ...color,
    size, -size, -size, ...color,
    -size, -size, size, ...color,
    size, -size, size, ...color,
    size, -size, -size, ...color,
    -size, -size, size, ...color,
    -size, size, -size, ...color,
    size, size, -size, ...color,
    -size, size, size, ...color,
    size, size, size, ...color,
    size, size, -size, ...color,
    -size, size, size, ...color,
    -size, -size, -size, ...color,
    -size, -size, size, ...color,
    -size, size, -size, ...color,
    -size, size, size, ...color,
    -size, -size, size, ...color,
    -size, size, -size, ...color,
    size, -size, -size, ...color,
    size, -size, size, ...color,
    size, size, -size, ...color,
    size, size, size, ...color,
    size, -size, size, ...color,
    size, size, -size, ...color,
  ];
}
function new_c_more(color = [[1,0,0,1],[0,1,0,1],[0,0,1,1],[1,1,0,1],[1,0,1,1],[0,1,1,1]],size = 1){
  size = size / 2
  return [
    -size, -size, -size, ...color[0],
    -size, size, -size, ...color[0],
    size, -size, -size, ...color[0],
    size, size, -size, ...color[0],
    -size, size, -size, ...color[0],
    size, -size, -size, ...color[0],
    -size, -size, size, ...color[1],
    -size, size, size, ...color[1],
    size, -size, size, ...color[1],
    size, size, size, ...color[1],
    -size, size, size, ...color[1],
    size, -size, size, ...color[1],
    -size, -size, -size, ...color[2],
    size, -size, -size, ...color[2],
    -size, -size, size, ...color[2],
    size, -size, size, ...color[2],
    size, -size, -size, ...color[2],
    -size, -size, size, ...color[2],
    -size, size, -size, ...color[3],
    size, size, -size, ...color[3],
    -size, size, size, ...color[3],
    size, size, size, ...color[3],
    size, size, -size, ...color[3],
    -size, size, size, ...color[3],
    -size, -size, -size, ...color[4],
    -size, -size, size, ...color[4],
    -size, size, -size, ...color[4],
    -size, size, size, ...color[4],
    -size, -size, size, ...color[4],
    -size, size, -size, ...color[4],
    size, -size, -size, ...color[5],
    size, -size, size, ...color[5],
    size, size, -size, ...color[5],
    size, size, size, ...color[5],
    size, -size, size, ...color[5],
    size, size, -size, ...color[5],
  ];
}
function new_text(){
  const newDiv = document.createElement("div");
  newDiv.style.top = "100px";
  newDiv.style.left = "100px";
  newDiv.classList.add("overlayText");
  document.body.appendChild(newDiv);
  return newDiv;
}
let vertices = [];


function rotateoneVector(v, axis, angleDegrees) {
  const angle = angleDegrees * (Math.PI / 180);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const dot = v[0] * axis[0] + v[1] * axis[1] + v[2] * axis[2];
  
  return roundVector([
      v[0] * cosA + (axis[1] * v[2] - axis[2] * v[1]) * sinA + axis[0] * dot * (1 - cosA),
      v[1] * cosA + (axis[2] * v[0] - axis[0] * v[2]) * sinA + axis[1] * dot * (1 - cosA),
      v[2] * cosA + (axis[0] * v[1] - axis[1] * v[0]) * sinA + axis[2] * dot * (1 - cosA)
  ]);
}
function rotateVector(v,angle){
  if (angle[0] != 0){
    v = rotateoneVector(v,[1,0,0],angle[0])
  }
  if (angle[1] != 0){
    v = rotateoneVector(v,[0,1,0],angle[1])
  }
  if (angle[2] != 0){
    v = rotateoneVector(v,[0,0,1],angle[2])
  }
  return v
}

map_vertices = new_obj();
map_vertices.id = "map vertices"
map_vertices.pos[1] = -1
map_vertices.vertices = [
  10,0,10,0.34,0.34,0.34,1,
  -10,0,10,0.34,0.34,0.34,1,
  -10,0,-10,0.34,0.34,0.34,1,
  10,0,10,0.34,0.34,0.34,1,
  10,0,-10,0.34,0.34,0.34,1,
  -10,0,-10,0.34,0.34,0.34,1
]

const canvas = document.getElementById('3d');
const gl = canvas.getContext('webgl');

function addtriangles(verticesArray) {
    if (verticesArray.length % 21 === 0) {
        vertices.push(...verticesArray);
    }
}

function makeobjvertices(){
  for (let i = 0; i < Objects.length; i++) {
    for (let x = 0; x < Objects[i].vertices.length / 21; x++) {
        let objectvertices = [];
        for (let z = 0; z < 21; z++) {
            objectvertices[z] = Objects[i].vertices[21 * x + z];
        }
        for (let z = 0; z < 3; z++) {
          rotatedVertex = rotateVector([objectvertices[0+z*7],objectvertices[1+z*7],objectvertices[2+z*7]],Objects[i].rot)
          objectvertices[0+z*7] = rotatedVertex[0]
          objectvertices[1+z*7] = rotatedVertex[1]
          objectvertices[2+z*7] = rotatedVertex[2]
        }

        objectvertices[0] += Objects[i].pos[0];
        objectvertices[1] += Objects[i].pos[1];
        objectvertices[2] += Objects[i].pos[2];
        objectvertices[7] += Objects[i].pos[0];
        objectvertices[8] += Objects[i].pos[1];
        objectvertices[9] += Objects[i].pos[2];
        objectvertices[14] += Objects[i].pos[0];
        objectvertices[15] += Objects[i].pos[1];
        objectvertices[16] += Objects[i].pos[2];

        renderObjects.push(...objectvertices);
    }
}
}
function roundVector(vector, precision = 10) {
  return vector.map(val => Math.abs(val) < 1e-10 ? 0 : parseFloat(val.toFixed(precision)));
}

function render() {
    if (is_load){

    handleMovement();
    updateCamera();
    resizeCanvas(canvas, gl);
    if (!cam_debug) { 
      document.getElementById('cameraPosition').style.left = "-100px";
      document.getElementById('cameraYaw').style.display = "none";
      document.getElementById('cameraPitch').style.display = "none";
    } else {
      document.getElementById('cameraPosition').style.display = "";
      document.getElementById('cameraYaw').style.display = "";
      document.getElementById('cameraPitch').style.display = "";
    }
    try {
        onframe();
    } catch(error) {
      console.log(error)
    }
  
    renderObjects = []
    makeobjvertices();   

    let renderVertices = [...vertices,...renderObjects];

    renderTriangles(renderVertices);
  }
    requestAnimationFrame(() => render());
    }

function resizeCanvas(canvas, gl) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

let cameraPosition = [0, 0, 5];
let cameraFront = [0, 0, -1];
let cameraUp = [0, 1, 0];
let cameraYaw = -90;
let cameraPitch = 0;
let keysPressed = {};

document.addEventListener('keydown', (event) => {
  keysPressed[event.key] = true;
});

document.addEventListener('keyup', (event) => {
  delete keysPressed[event.key];
});

function handleMovement() {
  const cameraSpeed = 0.1;
  const rotationSpeed = 1;
  const right = vec3.cross([], cameraFront, cameraUp);

  if (keysPressed['w']) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, cameraFront, cameraSpeed);
  }
  if (keysPressed['s']) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, cameraFront, -cameraSpeed);
  }
  if (keysPressed['a']) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, right, -cameraSpeed);
  }
  if (keysPressed['d']) {
    vec3.scaleAndAdd(cameraPosition, cameraPosition, right, cameraSpeed);
  }
  if (keysPressed['e']) {
    cameraPosition[1] += cameraSpeed;
  }
  if (keysPressed['q']) {
    cameraPosition[1] -= cameraSpeed;
  }

  if (keysPressed['ArrowLeft']) {
    cameraYaw -= rotationSpeed;
  }
  if (keysPressed['ArrowRight']) {
    cameraYaw += rotationSpeed;
  }
  if (keysPressed['ArrowUp']) {
    cameraPitch += rotationSpeed;
  }
  if (keysPressed['ArrowDown']) {
    cameraPitch -= rotationSpeed;
  }

  cameraPitch = Math.max(-89, Math.min(89, cameraPitch));

  cameraFront[0] = Math.cos(glMatrix.toRadian(cameraYaw)) * Math.cos(glMatrix.toRadian(cameraPitch));
  cameraFront[1] = Math.sin(glMatrix.toRadian(cameraPitch));
  cameraFront[2] = Math.sin(glMatrix.toRadian(cameraYaw)) * Math.cos(glMatrix.toRadian(cameraPitch));
  vec3.normalize(cameraFront, cameraFront);
}


function updateCamera() {
    const cameraTarget = [
      cameraPosition[0] + cameraFront[0],
      cameraPosition[1] + cameraFront[1],
      cameraPosition[2] + cameraFront[2]
    ];
    mat4.lookAt(modelViewMatrix, cameraPosition, cameraTarget, cameraUp);
}


function createShader(gl, type) {
  let source;
  if (type === gl.VERTEX_SHADER) {
      source = "attribute vec3 aPosition;attribute vec4 aColor;varying vec4 vColor;uniform mat4 uModelViewMatrix;uniform mat4 uProjectionMatrix;void main(){gl_Position=uProjectionMatrix*uModelViewMatrix*vec4(aPosition,1.0);vColor=aColor;}";
  } else if (type === gl.FRAGMENT_SHADER) {
      source = "precision mediump float;varying vec4 vColor;void main(){gl_FragColor=vColor;}";
  }

  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
  }
  return shader;
}


function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER);
const program = createProgram(gl, vertexShader, fragmentShader);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

const aPosition = gl.getAttribLocation(program, 'aPosition');
const aColor = gl.getAttribLocation(program, 'aColor');

const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');

const modelViewMatrix = mat4.create();
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);

if (!gl) {
  console.error('WebGL not supported!');
  return;
}

overlayText[0].style.top = "10px";
overlayText[1].style.top = "40px";
overlayText[2].style.top = "70px";

function renderTriangles(vertices) {

  document.getElementById('cameraPosition').textContent = `[${cameraPosition.map(coord => coord.toFixed(1)).join(', ')}]`; 
  document.getElementById('cameraYaw').textContent = cameraYaw; 
  document.getElementById('cameraPitch').textContent = cameraPitch;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(program); 

    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (vertices.length > 0) {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(aPosition);

        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(aColor);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 7);
    }
}


render(); 

window.draw = {
    addtriangles,
    obj:{
      new_obj,
      remove_obj,
      vertices:{
        new_c,
        new_c_more
      }
    },
    text:{
        new_text,
        cam_debug
    },
    keysPressed,
    overlayText,
    roundVector,
    cam:{
      cameraPosition,
      cameraYaw,
      cameraPitch,
      cam_debug
    },
    Objects
};
is_load = true
})