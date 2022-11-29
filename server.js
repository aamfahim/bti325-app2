/*********************************************************************************
* BTI325 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
* 
* Name: Abdullah Al Mamun Fahim Student ID: 101448207 Date: 15/11/2022
*
* Online (cyclic) URL: https://combative-blazer-calf.cyclic.app 
* _______________________________________________________
*
********************************************************************************/
var express = require("express");
var app = express();
var dataservice = require("./data-service.js");
var dataServiceAuth = require("./data-service-auth.js");
var clientSessions= require("client-sessions");
var multer = require("multer");
const exphbs = require('express-handlebars');
var file = require("fs");

var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.use(express.json()); 
app.use(express.urlencoded({extended: true}))

var storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({ storage: storage });

app.engine('.hbs', exphbs.engine({
    extname: '.hbs', 
    defaultLayout: "main",
    helpers:
    {
        navLink: function(url, options)
        {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options)
        {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            } 
        } 
    }
}));

app.set('view engine', '.hbs');

app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "NumberUnmanagedDoodleGallstoneReproach", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));


app.use((req,res,next) => {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    }
    else
    {
      next();
    }
};


app.get("/", function(req, res){
    
    res.status(200).render('home');


});


app.get("/about", function(req,res){
    res.status(200).render('about');

});


app.get("/employees", ensureLogin, (req,res) =>{

    if (req.query.status) {
        dataservice.getEmployeesByStatus(req.query.status)
        .then((data)=>{
            if(data.length > 0)
            {
                res.status(200).render("employees",{employee:data});
            }
            else
            {
                res.status(200).render("employees",{message: "no results"});
            }
            
        }).catch((error)=>{            
            res.status(400).render("employees", {message: error});
        });
    }else if(req.query.department){
        dataservice.getEmployeesByDepartment(req.query.department)
        .then((data)=>{
            if(data.length > 0)
            {
                res.status(200).render("employees",{employee:data});
            }
            else
            {
                res.status(200).render("employees",{message: "no results"});
            }
            
        }).catch((error)=>{            
            res.status(400).render("employees", {message: error});
        });
    }else if(req.query.manager){
        dataservice.getEmployeesByManager(req.query.manager)
        .then((data)=>{
            if(data.length > 0)
            {
                res.status(200).render("employees",{employee:data});
            }
            else
            {
                res.status(200).render("employees",{message: "no results"});
            }
            
        }).catch((error)=>{            
            res.status(400).render("employees", {message: error});
        });
    }
    else{
        dataservice.getAllEmployees()
        .then((data)=>{
            if(data.length > 0)
            {
                res.status(200).render("employees",{employee:data});
            }
            else
            {
                res.status(200).render("employees",{message: "no results"});
            }
            
        }).catch((error)=>{            
            res.status(400).render("employees", {message: error});
        });
    }
});


app.get("/employees/add", ensureLogin, (req,res)=>{
    dataservice.getAllDepartments()
    .then((data)=>{res.status(200).render('addEmployee',{departments: data});})
    .catch(()=>{res.status(404).render("addEmployee", {departments: []});
});

});

app.post("/employees/add", ensureLogin, (req, res) => {
    dataservice.addEmployee(req.body)
    .then(()=>{
        res.status(200).redirect("/employees");
    })
    .catch((err)=>{
        res.status(400).json({"message": err});
    })
});

app.post("/employee/update", ensureLogin, (req, res) => {
    dataservice.updateEmployee(req.body)
    .then((data)=>{
        res.status(200).redirect("/employees")
    }).catch((err)=>{
        res.status(400).json({"message": err});
    });
});



app.get("/employee/:empNum", ensureLogin, (req, res) => {
        // initialize an empty object to store the values
        let viewData = {};
        dataservice.getEmployeeByNum(req.params.empNum)
        .then((data) => {
            if (data) 
            {
                viewData.employee = data; //store employee data in the "viewData" object as "employee"
            } 
            else
            {
                viewData.employee = null; // set employee to null if none were returned
            }
        })
        .catch(() => {viewData.employee = null;}) // set employee to null if there was an error 
        .then(() => {dataservice.getAllDepartments();})
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
                                         // loop through viewData.departments and once we have found the departmentId that matches
                                         // the employee's "department" value, add a "selected" property to the matching 
                                         // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++)
            {
                if (viewData.departments[i].departmentId == viewData.employee.department)
                {
                    viewData.departments[i].selected = true;
                }
            }
        })
        .catch(() => {viewData.departments = [];}) // set departments to empty if there was an error
        .then(() => {
                if (viewData.employee == null) // if no employee - return an error
                {
                    res.status(404).send("Employee Not Found");
                } 
                else
                {
                    res.status(200).render("employee", { viewData: viewData }); // render the "employee" view
                }
            });
});
       



app.get("/employees/delete/:empNum", ensureLogin, (req,res)=>{
    dataservice.deleteEmployeeByNum(req.params.empNum)
    .then(()=>{ res.status(200).redirect("/employees");})
    .catch(()=>{res.status(500).send("Unable to Remove Employee / Employee not found");});
});


app.get("/departments", ensureLogin, (req,res) =>{
    dataservice.getAllDepartments()
    .then((data)=>{
        if(data.length > 0)
        {
            res.status(200).render("departments", {department:data});
        }
        else
        {
            res.status(200).render("departments", {message: "no results"});
        }
    }).catch((error)=>{
        res.status(400).render("departments", {message: error});

    });
});

app.get("/departments/add", ensureLogin, (req,res)=>{

    res.status(200).render('addDepartment');

});

app.post("/departments/add", ensureLogin, (req, res) => {
    dataservice.addDepartment(req.body)
    .then(()=>{
        res.status(200).redirect("/departments");
    })
    .catch((err)=>{
        res.status(400).json({"message": err});
    })
});

app.post("/department/update", ensureLogin, (req, res) => {
    dataservice.updateDepartment(req.body)
    .then((data)=>{
        res.status(200).redirect("/departments")
    })
    .catch((err)=>{
        var error =[{"message" : err}];
        res.status(400).json(error);
    });
});


app.get("/department/:departmentId", ensureLogin, (req,res) => {

    dataservice.getDepartmentById(req.params.departmentId)
    .then((data)=>{
        if(data)
        {
            res.status(200).render("department", {department: data});
        }
        else
        {
            res.status(400).render("department", {message:"no results"});
        }
    })
    .catch(()=>{
        res.status(400).render("department", {message:"no results"});
    });
});




app.get("/images", ensureLogin, (req,res)=>{
    dataservice.getAllImages()
    .then((data)=>{
        res.status(200).render("images", {somedata:data});
    }).catch((err)=>{
        res.status(400).render("images", {message: "no results"});
    });
});

app.get("/images/add", ensureLogin, (req,res)=>{

    res.status(200).render('addImage');

});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {

    res.redirect("/images");
});


app.get("/login", (req, res) =>{
    res.status(200).render("login");
});

app.post("/login", (req, res) =>{
    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/employees');
    })
    .catch((err) => { res.status(400).render("login", {errorMessage: err, userName: req.body.userName}); });
});

app.get("/register", (req, res) =>{
    res.status(200).render("register");
});

app.post("/register", (req, res) => {
    dataServiceAuth.registerUser(req.body)
    .then(() => { res.status(200).render("register", {successMessage: "User created"}); })
    .catch((err) => { res.status(400).render("register", {errorMessage: err, userName: req.body.userName}); });
});

app.get("/logout", (req,res) =>{
    req.session.reset();
    res.status(200).redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res) => {
    res.status(200).render("userHistory");
});

// app.get('*',function(req,res){
//     res.status(404).sendFile(path.join(__dirname,"/views/error.html"))
// });

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/error.html"))
});



function onHTTPstart(){
    console.log("Express http server listening on " + HTTP_PORT);
}



// dataservice.initialize()
// .then((resolve)=>{
//     app.listen(HTTP_PORT, onHTTPstart);
// })
// .catch((problem)=>{
//     console.log(problem);
// });




dataservice.initialize()
.then(dataServiceAuth.initialize)
.then(() => {
    app.listen(HTTP_PORT, onHTTPstart);
})
.catch((err) => {
    console.log("unable to start server: " + err);
});







// app.get("/managers",function(req,res){
//     dataservice.getAllManagers()
//     .then((data)=>{
//         res.status(200).json(data);
//     }).catch(()=>{
//         var error =[{"message" : err}];
//         res.status(400).json(error);
//     })
// });