const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const _ = require('lodash');
const axios = require('axios');
const config = require('./config.js')
const flock = require('flockos')


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3668;

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {fileSize: 10 * 1024 * 1024},
    fileFilter: function(req, file, cb){
        return cb(null, true);
    }
}).array('documents');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

function concatenateFiles(files, topic) {
    let combinedContent = '';
    console.log("here", files);
    for (const file of files) {
        console.log(file.path);
        try{
            const fileContent = fs.readFileSync("/Users/shivam.r/Desktop/flai/" + file.path, 'utf8', (err) => {console.log(err)});
            console.log(fileContent);
            combinedContent += fileContent + '\n'; // Add a newline between files
        } catch (err) {
            console.error(err);
        }
    }

    const combinedFilePath = path.join(uploadsDir, 'context.txt');
    console.log('path: ', combinedFilePath);
    fs.writeFile(combinedFilePath, combinedContent, (err) => {console.log(err)});

    return combinedFilePath;
}

app.post('/topics', (req, res) => {    
    upload(req, res, (err) => {
        if(err){
            console.log('1');
            console.log(err);
            res.status(400).send({message: err});
        } else {
            if(req.files == undefined){
                console.log('2');
                res.status(400).send({message: 'No file selected!'});
            } else {
                concatenateFiles(req.files, req.body.topic);
                const faqs = JSON.parse(req.body.faqs);
                if (!_.isEmpty(faqs)) {
                    let prefix = "-----------------------------------------------------\n";
                    prefix += "Following are some Frequently asked questions:\n\n";
                    let formattedFaqs = '';
                    console.log(faqs);
                    faqs.forEach(faq => {
                        formattedFaqs += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
                    });

                    const filePath = path.join(__dirname, 'uploads', 'context.txt');
                    fs.appendFile(filePath, prefix + formattedFaqs, (err) => {
                        if(err){
                            console.log('3');
                            console.log(err);
                        }
                    });
                }
                res.send({
                    message: 'Files Uploaded!',
                    files: req.files
                });
            }
        }
    });
});

app.post('/query', async (req, res) => {
    console.log(req.body);
    const topic = req.body.topic;
    const question = req.body.question;
    const filePath = path.join(__dirname, 'uploads', 'context.txt');
    const prompt = getPrompt(filePath, question);
    const response = await callGPT4API(prompt, apiKey, req.body.history);
    res.json({answer: response});
});

app.post('/chats', async (req, res) => {
    const contacts = req.body.contacts; // Assuming contacts are sent as a query parameter
    console.log(contacts);
    if (!contacts) {
        return res.status(400).json({ message: 'No contacts provided' });
    }

    let messages = "";

    contacts.forEach(contact => {
        const filePath = path.join(__dirname, 'chats', contact + '.txt');
        const contactMessages = readTextFile(filePath);
        messages += contactMessages;
    });

    console.log("------------------------------------------");
    console.log(messages);

    const result = await callGPT4API(getExtractionPrompt(messages), apiKey);
    res.json({ faqs: result });
});

app.get('/suggestions', async (req, res) => {
    const filePath = path.join(__dirname, 'uploads', 'context.txt');
    const prompt = getSuggestionsPrompt(filePath);
    const result = await callGPT4API(prompt, apiKey);
    res.json({ suggestions: result });
});

//  ----------------------------------------

function getSuggestionsPrompt(fileName) {
    const documentContent = readTextFile(fileName);
    var prompt = documentContent;
    prompt += '\n';
    prompt += `I have this doc, for a person. Assume this constitutes the knowledge that our bot has. 
    I need to know in a 4-5 phrases of length 2-6 what the user can enquire from this bot. Return the 
    answer in the following json format.
    
    [
    "This is Phrase1",
    "This is Phrase2",
    "This is Phrase3",
    "This is Phrase4"
    ]
    `;
    prompt += '\n';
    return prompt;
}

function getExtractionPrompt(msg) {
    var prompt = msg;
    prompt += '\n';
    prompt += `Based on the conversations above generate Ques and Ans which can provide context for all the topics 
    that were covered if multiple topics are covered in a single chat then generate multiple Q and A's so that specific 
    answers are given for a specific question also make sure all context gets converted to Q and A.
    Follow the below json format. The output should strictly follow the format. Extract at most two Questions.

    {
    "Q/A":[
    {"Q":" ",
    "A":" " },]
    }
    `;
    prompt += '\n';
    return prompt;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// -------------------------------

function getPrompt(file, question) {
    var prompt = readTextFile(file);
    prompt += '\n';
    prompt += `You will be asked queries regarding the policies in this document, use the information in the 
    document to answer those queries respectfully and if you dont have enough context to answer that 
    query just reply with "Not enough context available", if you don't fully understand the query just 
    reply "Didn't understand the query please provide more context in the query". Answer in less than 100 words.`;
    prompt += '\n';
    prompt += question;
    return prompt;
}

const callGPT4API = async (prompt, apiKey, history) => {
    try {
        let prevMessages = [];
        if (!_.isEmpty(history)) {
            history.forEach(message => {
                prevMessages.push({ role: 'user', content: message.question });
                prevMessages.push({ role: 'assistant', content: message.answer });
            }) 
        }
        console.log(prevMessages);
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                ...prevMessages,
                { role: 'user', content: prompt},
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            const chatResponse = response.data.choices[0].message.content;
            console.log("ChatGPT says:", chatResponse);
            console.log("completed");
            return chatResponse;
        } else {
            console.error(`Request failed with status code ${response.status}`);
        }
    } catch (error) {
        console.log(error);
        console.error("Error calling GPT-4 API:", error.message);
    }
};

const readTextFile = (filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
};


// ---------------------------------------------
flock.appId=config.appId;
flock.appSecret=config.appSecret;

// var app=express();

app.use(flock.events.tokenVerifier);
app.use('/slash',flock.events.listener);
app.use('/events',flock.events.listener);

flock.events.on('app.install',function(event,callback){
    
    const filePath = './tokens.json';

    // Create a new token object from the event
    const userToken = {
        userId: event.userId,
        token: event.token,
    };

    fs.readFile(filePath, (err, data) => {
        let tokens = [];
        if (!err) {
            tokens = JSON.parse(data);
        }

        tokens.push(userToken);

        fs.writeFile(filePath, JSON.stringify(tokens, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('Token saved successfully');
            }
            callback();
        });
    callback();
    });

});


flock.events.on('client.slashCommand',function(event,callback){
    console.log(event);
    console.log(event.text);
    sendResponse(event.userId,"Hello welcome");
    callback(null,{text:"Hello"});
});


var sendResponse= function (user,text){
    flock.chat.sendMessage(config.botToken,{
        to:user,
        text:text
    });
}

function getToken(data, targetUserId) {
    for (let entry of data) {

      if (entry.userId === targetUserId) {

        return entry.token;
      }
    }
    return null;
  }
  flock.events.on('chat.receiveMessage',function(event,callback){
    let text=event.message.text;
    let parts = text.split('|');
    if(parts.length<2){
        sendResponse(event.userId,"Wrong syntax");
    }
    else{
        let part1 = parts[0];
    let query = parts[1];
    if(part1.toLowerCase()=="hr"){
        const filePath = __dirname + '/uploads' + '/hr.txt';
        console.log(filePath);
        const prompt = getPrompt(filePath, query);
        console.log(prompt);
        callGPT4API(prompt, apiKey, []).then((answer) => {
            console.log("Answer: ", answer);
            sendResponse(event.userId,answer);
        });
        // sendResponse(event.userId,answer);
    }
    else{
        sendResponse(event.userId,"Product Query");
    }
    }
    
    callback();
  })

flock.events.on('client.messageAction',function(event,callback){
    var messages=event.messages;
    if(!(messages && messages.length>0)){
        console.log('chat',event.chat);
    }
    const filePath = './tokens.json';
    var token="Wow";
     var file=fs.readFileSync(filePath,"utf-8");
   
        let tokens = [];
        tokens = JSON.parse(file);
        console.log(tokens);
        token=getToken(tokens, event.userId);
        console.log(typeof token);

    flock.chat.fetchMessages(token,{
        chat:event.chat,
        uids:event.messageUids
    }, function(error,messages){
        if(error){
            console.warn('Got Error');
            callback(error);
        }
        else{
            console.log("Reached");
            console.log(messages[0].text);
        }
    })
});
