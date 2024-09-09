const fs = require('fs');

// Funzione per leggere un file JSON
function readJSONFile(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

// Funzione per scrivere un file JSON
function writeJSONFile(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

// Funzione per convertire gli angoli da Blender a Three.js
function convertAngles(blenderAngles, threeJSBasePose) {
    const convertedAngles = {};
    for (const [boneName, blenderRotation] of Object.entries(blenderAngles)) {
        if (threeJSBasePose[boneName]) {
            convertedAngles[boneName] = {
                x: blenderRotation.rotation_x + threeJSBasePose[boneName].x,
                y: blenderRotation.rotation_y + threeJSBasePose[boneName].y,
                z: blenderRotation.rotation_z + threeJSBasePose[boneName].z
            };
        }
    }
    return convertedAngles;
}

// Funzione principale
function convertPose(blenderPoseFile, threeJSBasePoseFile, outputFile) {
    const blenderPose = readJSONFile(blenderPoseFile);
    const threeJSBasePose = readJSONFile(threeJSBasePoseFile);
    
    const convertedPose = convertAngles(blenderPose, threeJSBasePose);
    
    writeJSONFile(outputFile, convertedPose);
    console.log(`Converted pose saved to ${outputFile}`);
}

// Uso della funzione
convertPose('A Pose Blender.json', 'A pose.json', 'converted_pose.json');