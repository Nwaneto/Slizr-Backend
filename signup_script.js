const http = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const nodemailer = require('nodemailer');

const port = 5000;

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'usersdb'
});

let email = '';
const app = express();

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(__dirname +'/public')); // configure express to use public folder

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/public/signup.html'));
});

app.post('/login.html', function(request, response) {
    const firstName = request.body.firstName;
    const lastName = request.body.lastName;
    const phoneNumber = request.body.phoneNumber;
    const emailAddress = request.body.emailAddress;
    email = emailAddress;
    const pin = randomNumber();

    function randomNumber() {
        return Math.floor(1000000000 + Math.random() * 9000000000);
    }
    
	if (firstName && lastName && phoneNumber && emailAddress && pin) {
        db.query("INSERT INTO users (firstname, lastname, phoneNumber, email, pin) VALUES (" + "'" + firstName + "'" +", " + "'" + lastName + "'" +", " + "'" + phoneNumber + "'" + ", "+ "'" + emailAddress + "'" + ", " + "'" + pin + "'" + ");", (err, res) => {
            if(err) throw err;
                console.log('inserted successfully');
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'chidi.test.development@gmail.com',
                      pass: '08038111804'
                    }
                  });
                  
                  var mailOptions = {
                    from: 'chidi.test.development@gmail.com',
                    to: email,
                    subject: `Slizr registration Verification using the pin ( ${pin} )...`,
                    text: `Dear ${firstName},
                    Thank you for signing up on SLIZR, 
                    Here is your Pin to verify your identity => ${pin}.
                    
                    Regards,
                    Team Slizr.`
                  };
                  
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                response.redirect('/login.html');
            });
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.post('/auth', function(req, res) {
    const pin = req.body.pin;
    console.log(pin);
    if(pin) {
        let data = {}
        db.query(`SELECT firstname, lastname, phoneNumber, email FROM users WHERE pin =  ${pin}`, function (err, result, fields) { 
            // if any error while executing above query, throw error
            if (err) throw err;
            console.log(result);
            
            let userInfo = JSON.stringify(result);
            console.log(userInfo);

            
            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <title>Welcome - </title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta charset="utf-8">
                <link rel="stylesheet" type="text/css" href="login_style.css">
                <script src="/signup_script.js" type="text/javascript"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
                <link href='https://fonts.googleapis.com/css?family=Titillium+Web:400,300,600' rel='stylesheet' type='text/css'>  
            </head>
            <body class="body">
                <div class="login-page">
                    <div class="auth-page"> Welcome ${result[0].firstname}, here are your Details </div><br><hr/>
                    <table>
                    <tr>
                        <td class="info">First Name:</td>
                        <td id="firstNameTbl">${result[0].firstname}</td>
                    </tr>
                    <tr>
                        <td class="info">Last Name:</td>
                        <td id="lastNameTbl">${result[0].lastname}</td>
                    </tr>
                    <tr>
                        <td class="info">Phone Number:</td>
                        <td id="phoneNoTbl">${result[0].phoneNumber}</td>
                    </tr>
                    <tr>
                        <td class="info">Email Address:</td>
                        <td id="emailTbl">${result[0].email}</td>
                    </tr>
                    </table><br><hr/>
                    
                </div>
                </body>
            </html>`)
            
        });
        
    }
    
})

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});



app.get('/login', function(request, response) {
    response.sendFile(path.join(__dirname + '/public/login.html'));
});

global.db = db;
db.end;

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
