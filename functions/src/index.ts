import * as functions from 'firebase-functions';
import * as express from 'express';
import * as bodyParser from "body-parser";
import  axios from 'axios';
const nodemailer = require('nodemailer');
const app = express();
const main = express();
const cors = require('cors');
// const config = require('config');
const async = require('async');
var firebase = require("firebase");
const shortid = require('shortid');

//ChatBot
const {WebhookClient} = require('dialogflow-fulfillment');
//const {Card, Suggestion} = require('dialogflow-fulfillment');

var firebaseConfig = {
    apiKey: "AIzaSyBCAMm4QyTYA_sL7zTo9U5da7Q4E_4AUI8",
    authDomain: "remedy18apilog.firebaseapp.com",
    databaseURL: "https://remedy18apilog.firebaseio.com",
    projectId: "remedy18apilog",
    storageBucket: "remedy18apilog.appspot.com",
    messagingSenderId: "952362249337",
    appId: "1:952362249337:web:86db69691c61f53c6678a8",
    measurementId: "G-3EZY85ZNY0"
}

// var firebaseConfig = {
//     apiKey: "AIzaSyAin0ZMzHCj9_85ULG02jWVYbbdQXJLghY",
//     authDomain: "portal-enddata.firebaseapp.com",
//     databaseURL: "https://portal-enddata.firebaseio.com",
//     projectId: "portal-enddata",
//     storageBucket: "portal-enddata.appspot.com",
//     messagingSenderId: "402799261874",
//     appId: "1:402799261874:web:ae670a0f54662b8a6db1ab",
//     measurementId: "G-4VPTT29E0J"
// }

firebase.initializeApp(firebaseConfig);
main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});


app.post('/signIn', (req, res) => {

    console.log("Call initiated : ", JSON.stringify(req.body));
    var retObj = {

    };

    async.parallel([

        function (callback: any) {

            prepareLogin(req.body.email, req.body.password)

                .then((Response: any) => {

                    console.log("Successfull login");
                    retObj = {

                        message: "Successfull login!",
                        code: "200"
                    }

                    callback(null, retObj)

                }).catch((Response: any) => {

                    console.log("=====Login Error====");

                    retObj = {

                        message: Response.message,
                        code: "406"
                    }

                    callback(null, retObj)

                })



        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
            // return hstatus.ok(reply, reqResponse);
        });



})

app.post('/registeruser', (req, res) => {

    console.log("Call initiated : ", JSON.stringify(req.body));
    var retObj = {};

    async.parallel([

        function (callback: any) {

            prepareRegistration(req.body.email, req.body.password)

                .then((Response: any) => {
                    
                    console.log("====On Registration====");

                    let employee = {
                        empID: shortid.generate(),
                        name: req.body.name,
                        surname : req.body.surname,
                        phoneNumber : req.body.phoneNumber,
                        username: req.body.username,
                        roleID : req.body.roleID,
                        status: "Active",
                        userImage:req.body.userImage,
                        email: req.body.email
                    }
                  

                    let ref = firebase.firestore().collection("empTable").add(employee);
                    ref.then(function(response: Response) {

                        console.log("Document successfully written!");

                        retObj = {
                            message: "Successfull Registration!",
                            code: "200"
                        }
                        callback(null, retObj);
                    })
                    .catch(function(error: Error) {
                        console.error("Error writing document: ", error);
                        retObj = {
                            message: "Error saving to database, please check your fields",
                            code: "406"
        
                        }
                        callback(null, retObj);
                    });
                  
                }).catch((Response: any) => {

                    console.log("====Error ----  Registration====");

                    retObj = {

                        message: Response.message,
                        code: "406"
                    }
                    callback(null, retObj)

                })

        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
        });



})

app.get('/getUsers', (req, res) => {

    console.log("Initiated a call.getting all users...");
    var retObj: any = {};

    async.parallel([

        function (callback: any) {

            let res = firebase.firestore().collection('empTable')
            res.onSnapshot((querySnapshot: any) => {
                let users: any = [];
                querySnapshot.forEach((doc: any) => {
                    let data = doc.data();
                    users.push({
                        empID: data.empID,
                        name: data.name,
                        surname : data.surname,
                        phoneNumber : data.phoneNumber,
                        username: data.username,
                        roleID : data.roleID,
                        status: data.status,
                        userImage:data.userImage,
                        email: data.email
                       
                    });
                });
                retObj = {
                    users: users,
                    code :"200"
                }
                callback(null, retObj)

            });


        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
        });


})

app.get('/getRoles', (req, res) => {

    console.log("Initiated a call.getting all roles...");
    var retObj: any = {};

    async.parallel([

        function (callback: any) {

            let res = firebase.firestore().collection('roles')
            res.onSnapshot((querySnapshot: any) => {
                let roles: any = [];
                querySnapshot.forEach((doc: any) => {
                    let data = doc.data();
                    roles.push({
  
                        admin: data.admin,
                        employee: data.employee
                       
                    });
                });
                retObj = {
                    roles: roles,
                    code :"200"
                }
                callback(null, retObj)

            });


        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
        });


})

app.post('/passwordReset', (req, res) => {

    console.log("Call initiated : ", JSON.stringify(req.body));
    var retObj = {};

    async.parallel([

        function (callback: any) {

            preparePasswordReset(req.body.email)

                .then((Response: any) => {

                    console.log("====Password Reset====");

                    retObj = {

                        message: "A link for password reset has been sent to your email.",
                        code: "200"
                    }



                    callback(null, retObj)

                }).catch((Response: any) => {

                    console.log("====Error ----  Password Reset====");
                    console.log(Response.message);
                    retObj = {

                        message: Response.message,
                        code: "406"
                    }

                    callback(null, retObj)

                })

        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
        });



})

app.post('/mailer', (req, res) => {

    //req.body.email
    console.log("Call initiated : ", JSON.stringify(req.body));
    var retObj = {
        message:""
    };

    async.parallel([

        function (callback: any) {
                
            const transporter = nodemailer.createTransport({ 
                service: 'Gmail',
                auth: {
                  user: 'emailsend283@gmail.com',
                  pass: 'sendEm@il01'
                }
              });

              const mailOptionsForClient = {
                from: 'emailsend283@gmail.com',
                to: req.body.from,
                subject: 'Bonny Xilaveko Project and Training',
                  html:  'Dear '+req.body.name+' <br> <br>Your message has been received. We will get back to you. Thanks.<br><br> <br> Regards, <br> Bonny Xilaveko Project and Training'
                };

              mailToOwner(req.body.from,req.body.name,req.body.mailBody,transporter).then(response=>{
                console.log("ToOwner First Instance");
                console.log(response);
                transporter.sendMail(mailOptionsForClient, function(error: any, info: any){
                    if (error) {
                      console.log(error.response);
                      retObj.message = error.response;
                      callback(null, retObj);
                    } else {
                      console.log('Email sent: ' + info.response);
                      retObj.message = 'Email sent';
                      callback(null, retObj);
                    }
                  });
                    

              })

              

        } 
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
        });



})

function mailToOwner(emailFrom: string, name : string, content: string, transporter: any)
{
    return new Promise((resolve, reject)=>{

        const mailOptions = {
            from: emailFrom,
              to: 'emailsend283@gmail.com',
              subject: 'Client Mail',
              html:  'You have an email. <br> <br><b>Below is the email content:</b> <br>'+content +' <br> <b>Email from<b> <br>' +'Email: '+emailFrom+'<br>Name:'+name
            };

            transporter.sendMail(mailOptions, function (err: any, info:any) {
                if(err)
                  {
                    console.log(err)
                    resolve({"sent":false});
                  }
                else
                  {
                    console.log(info);
                    resolve({"sent":true});
                  }
             });


    });
}

app.post('/chat', (request, response) => {

    console.log("Initiated a call....");
        
    console.log("--->>>>>We are here|||||||");
    const agent = new WebhookClient({ request: request, response : response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    

    const transporter = nodemailer.createTransport({ 
        service: 'Gmail',
        auth: {
          user: 'emailsend283@gmail.com',
          pass: 'sendEm@il01'
        }
      });
   
    function welcome(agent: any) {
     console.log("Request Data-Agent->> Incoming");
     console.log(request.body.queryResult.queryText);
      agent.add(`Hi, there :)`);
      console.log("Sending mail...-->>>>>");
      const mailOptions = {
        from: 'emailsend283@gmail.com',
          to: 'emailsend283@gmail.com',
          subject: 'ChatBot User Interaction',
          html:  'User says : '+request.body.queryResult.queryText +"<br>ChatBot replied: Hi, there :)"
        };

          transporter.sendMail(mailOptions, function (err: any, info:any) {
            if(err)
              {
                console.log(err)
              }
            else
              {
                console.log(info);
              }
         });
    }
   
    function fallback(agent:any) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
      const mailOptions = {
        from: 'emailsend283@gmail.com',
          to: 'emailsend283@gmail.com',
          subject: 'ChatBot - Fall Back Section',
          html:  'User says : '+request.body.queryResult.queryText +"<br>ChatBot replied: I'm sorry, can you try again?"
        };

          transporter.sendMail(mailOptions, function (err: any, info:any) {
            if(err)
              {
                console.log(err)
              }
            else
              {
                console.log(info);
              }
         });
    }
  
    // // Uncomment and edit to make your own intent handler
    // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function yourFunctionHandler(agent) {
    //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
    //   agent.add(new Card({
    //       title: `Title: this is a card title`,
    //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
    //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
    //       buttonText: 'This is a button',
    //       buttonUrl: 'https://assistant.google.com/'
    //     })
    //   );
    //   agent.add(new Suggestion(`Quick Reply`));
    //   agent.add(new Suggestion(`Suggestion`));
    //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
    // }
  
    // // Uncomment and edit to make your own Google Assistant intent handler
    // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
    // // below to get this function to be run when a Dialogflow intent is matched
    // function googleAssistantHandler(agent) {
    //   let conv = agent.conv(); // Get Actions on Google library conv instance
    //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
    //   agent.add(conv); // Add Actions on Google library responses to your agent's response
    // }
    // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
    // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample
  
    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    // intentMap.set('your intent name here', yourFunctionHandler);
    // intentMap.set('your intent name here', googleAssistantHandler);
    agent.handleRequest(intentMap);




})


function prepareLogin(email: string, password: string) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

function prepareRegistration(email: string, password: string) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
}

function preparePasswordReset(email: string) {
    return firebase.auth().sendPasswordResetEmail(email);
}

app.get('/ping', (req, res) => {

    console.log("PING");
    
    res.status(200).send("PING....PING...");
   


})

//EXT
app.post('/history', (req, res) => {


    console.log("Call initiated : ", JSON.stringify(req.body));
    var retObj = {

    };
    console.log("I am req.body data");
    console.log(req.body);
    console.log("I am req.body data");
    console.log("==About to save Data==");

    async.parallel([

       
        function (callback: any) {

            

            axios.post(firebaseConfig.databaseURL + "/history.json", req.body).then((response) => {

                console.log("Success----Saved Data");
                callback(null, retObj);
            }).catch(err => {

                console.log("I am getting an Errrrrr :(");
                console.log(err);
                callback(null, retObj)
               

            })



        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
            
        });



})

app.post('/log', (req, res) => {


    console.log("Call initiated : ", JSON.stringify(req.body));
    var retObj = {

    };
    console.log("I am req.body data");
    console.log(req.body);
    console.log("I am req.body data");
    console.log("==About to process Data==");

    let processedData = JSON.parse(req.body.log);
    console.log("JSON Parse");
    console.log(processedData);
    console.log("JSON Parse");
    async.parallel([

       
        function (callback: any) {

                console.log("...Now Updating...");
                
            
                logUpdate(processedData.CRQ1,processedData.status, processedData.approveDate).then(dataRes=>{
                    console.log("I have made an update = "+dataRes);
                    callback(null, retObj);
                })



        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
            
        });



})

app.post('/logger', (req, res) => {


    console.log("Call initiated : ", JSON.stringify(req.body));
    var retObj = {

    };
    console.log("I am req.body data");
    console.log(req.body);
    console.log("I am req.body data");
    console.log("===-----About to process Data----==");

    let processedData = JSON.parse(req.body.log);
    console.log("JSON Parse");
    console.log(processedData);
    console.log("JSON Parse");
    async.parallel([

       
        function (callback: any) {

                console.log("...Now Sending...");
                
                let change = processedData[0].change.split("#");
                let crq =  change[2];
                let approveDate = change[6];
                if(change[0]=="App" || change[0]=="AppRel" || change[0]=="ServerCreate" )
                {
                    console.log("Change == App");
                    approveDate = change[4];

                }
                compareUpdate(crq, processedData,approveDate).then(dataRes=>{
                    console.log("I have made an update = "+dataRes);
                    callback(null, retObj);
                })

                //callback(null, retObj);



        }
    ],
        function (err: any, results: any) {

            var reqResponse = {
                'body': retObj,
                'details': 'success'
            };
            res.status(200).send(reqResponse);
            
        });



})


function compareUpdate(crq: string, processed:any, approveDate: string)
{

    return new Promise((resolve, reject)=>{

    let list  =[];
    let hasUpdated = false;
    list = firebase.database().ref('/history');
    list.on('value', (dataSnapshot: any) => {
      console.log("Getting Data");

      dataSnapshot.forEach((childSnapshot: any) => {
        console.log("For Each CRQ");
        let data = childSnapshot.val();
        data.key = childSnapshot.key;
       
        if(data.CRQ1 == crq)
        {
            data.change = processed;
            data.approveDate = approveDate;
            firebase.database().ref('history/' + data.key).update(data);
            hasUpdated = true;
        }

       

      });

      resolve({"updated":hasUpdated});


    });
    })

}


function logUpdate(crq: string, stat:string, dateApproved: string)
{

    return new Promise((resolve, reject)=>{

    let list  =[];
    let hasUpdated = false;
    list = firebase.database().ref('/history');
    list.on('value', (dataSnapshot: any) => {
      console.log("Getting Data");

      dataSnapshot.forEach((childSnapshot: any) => {
        console.log("For Each CRQ");
        let data = childSnapshot.val();
        data.key = childSnapshot.key;
       
        if(data.CRQ1 == crq)
        {
            data.status = stat;
            data.approveDate = dateApproved;
            firebase.database().ref('history/' + data.key).update(data);
            hasUpdated = true
        }

       

      });

      resolve({"updated":hasUpdated});


    });
    })

}

export const webApi = functions.https.onRequest(main);

