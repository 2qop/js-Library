function rotateMat4(matrix, angle) {
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    let newMatrix = matrix.slice(); // Create a copy to avoid modifying the original matrix

    newMatrix[0] = cosA;
    newMatrix[2] = -sinA;
    newMatrix[8] = sinA;
    newMatrix[10] = cosA;

    return newMatrix;
}

function translateMat4(matrix, translation) {
    let [tx, ty, tz] = translation;
    let newMatrix = matrix.slice(); // Create a copy to avoid modifying the original matrix

    newMatrix[12] += tx;
    newMatrix[13] += ty;
    newMatrix[14] += tz;

    return newMatrix;
}

function createMat4() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]; // This is the identity matrix
}

window.mat = {
    createMat4,
    translateMat4,
    rotateMat4
};