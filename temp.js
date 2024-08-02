const path = require('path');
const fs = require('fs');


const uploadsDir = path.join(__dirname, 'uploads');
console.log(uploadsDir);

fs.readdir(uploadsDir, (err, files) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(files);
    concatenateFiles(files);
});

function concatenateFiles(files) {
    let combinedContent = '';
    console.log("here", files);
    // return;
    for (const file of files) {
        console.log(file.path);
        try{
            const fileContent = fs.readFileSync("/Users/shivam.r/Desktop/flai/uploads/" + file, 'utf8', (err) => {console.log(err)});
            console.log(fileContent);
            combinedContent += fileContent + '\n'; // Add a newline between files
        } catch (err) {
            console.error(err);
        }
    }

    const combinedFilePath = path.join(uploadsDir, 'combined-' + Date.now() + '.txt');
    console.log('path: ', combinedFilePath);
    fs.writeFile(combinedFilePath, combinedContent, (err) => {console.log(err)});

    return combinedFilePath;
}

