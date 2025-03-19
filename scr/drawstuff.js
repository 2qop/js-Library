let camera = {
    pos: [0,0,0],
    rot: [0,0,0]
};

const script = document.createElement('script');
script.src = './scr/stuff.js';
document.body.appendChild(script);


window.mystuff = {
    draw:{
        drawTriangles
    },
    cam:{
        camera
    }
};

function drawTriangles(vertices, color = [0.0, 0.0, 1.0, 1.0]) {
    const canvas = document.getElementById('3dCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL not supported!');
        return;
    }

    // Create and bind buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Vertex Shader (supports 3D coordinates)
    const vertexShaderSource = `
        attribute vec3 a_position;
        uniform mat4 u_modelViewMatrix;
        void main() {
            gl_Position = u_modelViewMatrix * vec4(a_position, 1.0); // Apply model view matrix
        }
    `;

    // Fragment Shader with dynamic color
    const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 u_color;
        void main() {
            gl_FragColor = u_color;
        }
    `;

    // Compile shaders
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Program linking failed: ' + gl.getProgramInfoLog(shaderProgram));
        return;
    }

    gl.useProgram(shaderProgram);

    // Position Attribute
    const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position');
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    // Set color uniform
    const colorLocation = gl.getUniformLocation(shaderProgram, 'u_color');
    gl.uniform4fv(colorLocation, color);

    // Set model view matrix uniform (camera transformation)
    const uModelViewMatrix = gl.getUniformLocation(shaderProgram, 'u_modelViewMatrix');
    const modelViewMatrix = mat.createMat4();  // Start with identity matrix

    // Example camera position: Move the camera back along Z-axis
    const modelView = translateMat4(modelViewMatrix, camera.pos);  // Apply translation (camera movement)

    gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(modelView));

    // Clear screen
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw triangles
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
}

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
