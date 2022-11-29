const bcrypt = require("bcrypt");

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    email: String,
    loginHistory: [{
        dateTime: Date,
        userAgent: String
    }]

});

let User;
let database;
module.exports.initialize = () => {
    return new Promise(function(resolve,reject){
        database = mongoose.createConnection(`mongodb+srv://aamfahim:eE1BFBcVdQFiaIc5@bti325-app.77f5efh.mongodb.net/Login`);
        database.on("error", (error)=>{
            reject(error);
        });
        database.once("open", ()=>{
            User = database.model("users", userSchema);
            resolve();
        });
    });    
};

module.exports.registerUser = (userData) =>{
    return new Promise(function(resolve,reject){
        if(userData.password.length == 0 || userData.password.trim().length == 0 || userData.password2.length == 0 || userData.password2.trim().length == 0)
        {
            reject("Error: user name cannot be empty or only white spaces!");

        }
        else if(userData.password != userData.password2)
        {
            reject("Error: Passwords do not match");
        }
        else if(userData.password == userData.password2)
        {   
            bcrypt.hash(userData.password, 15)
            .then((hash)=>{ 
                userData.password = hash;
                userData.password2 = hash;

                let newUser = new User(userData);
                newUser.save()
                .then(()=>{ resolve(); })
                .catch((err)=>{
                    if(err.code == 11000)
                    {
                        reject("User Name already taken");
    
                    }else
                    {
                        reject("There was an error creating the user: "+ err );
                    }
                });
            })
            .catch((err)=>{ reject("There was an error encrypting the password")});

        }
    });

};

module.exports.checkUser = (userData) =>{
    return new Promise((resolve,reject) => {
        User.findOne({ userName : userData.userName })
        .exec()
        .then((foundUser)=>{
            if(foundUser == {}) //COMPLETE
            {
                reject( "Unable to find user: " + userData.userName);
            }
            else
            {
                bcrypt.compare(userData.password, foundUser.password)
                .then((result)=>{
                    if(result == true)
                    {
                        foundUser.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});

                        User.updateOne({userName: foundUser.userName}, {$set:{loginHistory: foundUser.loginHistory}})
                        .exec()
                        .then(()=>{ resolve(foundUser); })
                        .catch((err)=>{ reject("There was an error verifying the user: "+ err); });
                    }
                    else
                    {
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                })
                //.catch();
            }

        })
        .catch(()=>{ reject("Unable to find user: "+ userData.userName); });
    });
}