const glmatrix = document.createElement('script');
glmatrix.src = 'https://cdn.jsdelivr.net/npm/gl-matrix@2.8.1/dist/gl-matrix-min.js';
document.head.appendChild(glmatrix);
glmatrix.addEventListener('load', () => {

let vertices = [];
const map_vertices = [
    10,-1,10,0x59/255,0x59/255,0x59/255,1,
    -10,-1,10,0x59/255,0x59/255,0x59/255,1,
    -10,-1,-10,0x59/255,0x59/255,0x59/255,1,
    10,-1,10,0x59/255,0x59/255,0x59/255,1,
    10,-1,-10,0x59/255,0x59/255,0x59/255,1,
    -10,-1,-10,0x59/255,0x59/255,0x59/255,1
]

const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');

function addtriangles(verticesArray) {
    if (verticesArray.length % 21 === 0) {
        vertices.push(...verticesArray);
    }
}


function render() {

    handleMovement();
    updateCamera();
    resizeCanvas(canvas, gl);
    
    let renderVertices = [...map_vertices,...vertices];
    renderTriangles(renderVertices);
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


const vertexShaderSource = `
attribute vec3 aPosition;
attribute vec4 aColor;
varying vec4 vColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  vColor = aColor;
}
`;

const fragmentShaderSource = `
precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}
`;

function createShader(gl, type, source) {
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

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
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
    addtriangles
};
})
