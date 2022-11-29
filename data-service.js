const Sequelize = require('sequelize');

var sequelize = new Sequelize('prceizmh', 'prceizmh', 'ACjLRfxooOM8is-QiY4KVY3OlL921cuN', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: true
    },
    query:{raw: true}
});


sequelize.authenticate()
.then(()=>console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err))


var Employees = sequelize.define('Employee', {
    employeeNum: {type: Sequelize.INTEGER,
                  primaryKey: true,
                  autoIncrement: true},
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING

});

var Departments = sequelize.define('Department', {
    departmentId: {type: Sequelize.INTEGER,
                   primaryKey: true,
                   autoIncrement: true}, 
    departmentName: Sequelize.STRING
});


module.exports.initialize = () => {
    return new Promise(function(resolve,reject){
        sequelize.sync()
        .then(()=>resolve())
        .catch(()=>reject('unable to sync the database'));
    });    
};


module.exports.getAllEmployees = () =>{
    return new Promise(function(resolve,reject){
        Employees.findAll({order: ["employeeNum"]})
        .then((data)=>resolve(data))
        .catch(()=>reject("no results returned"));
    });
}



module.exports.getEmployeesByStatus = (empStatus) =>{
    return new Promise((resolve,reject)=>{
        if (empStatus[0] == 'F') {
            empStatus = 'Full Time'
        }else{
            empStatus = 'Part Time'
        }
        Employees.findAll({
            where: {
                status: empStatus
            },
            order: ["employeeNum"]
        })
        .then((data)=>resolve(data))
        .catch(()=>reject("no results returned"));
    });
}

module.exports.getEmployeesByDepartment = (empDepartment) =>{
    return new Promise((resolve,reject)=>{
        Employees.findAll({
            where: {
                department: empDepartment
            },
            order: ["employeeNum"]
        })
        .then((data)=>resolve(data))
        .catch(()=>reject("no results returned"));
    });
}


module.exports.getEmployeesByManager = (empManagerNum) =>{
    return new Promise((resolve,reject)=>{
        Employees.findAll({
            where: {
                employeeManagerNum: empManagerNum
            },
            order: ["employeeNum"]
        })
        .then((data)=>resolve(data))
        .catch(()=>reject("no results returned"));
    });
}


module.exports.getEmployeeByNum = (empNum) =>{
    return new Promise((resolve,reject)=>{
        Employees.findAll({
            where: {
                employeeNum: empNum
            },
            order: ["employeeNum"]
        })
        .then((data)=>resolve(data[0]))
        .catch(()=>reject("no results returned"));
    });
}


module.exports.getAllDepartments = () =>{
    return new Promise(function(resolve,reject){
        Departments.findAll({order: ["departmentId"]})
        .then((data)=>resolve(data))
        .catch(()=>reject("no results returned"));
    });
}


module.exports.addEmployee = (employeeData) => {
    return new Promise ((resolve, reject)=>{
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (const property in employeeData) {
            if (employeeData[property] == "")
            {            
                employeeData[property] = null;                    
            }
        };

        Employees.create(employeeData)
        .then(()=>resolve())
        .catch(()=>reject('unable to create employee'));
    });
}


module.exports.updateEmployee = (employeeData) =>{
    return new Promise((resolve,reject)=>{
        employeeData.isManager = (employeeData.isManager) ? true : false;

        for (const property in employeeData) {
            if (employeeData[property] == "")
            {            
                employeeData[property] = null;                    
            }
        };

        Employees.update(employeeData,{
            where: {
                employeeNum: employeeData.employeeNum
            }
        })
        .then(()=>resolve())
        .catch(()=>reject('unable to create employee'));
    });
}

module.exports.addDepartment = (departmentData)=>{
    return new Promise((resolve, reject)=>{
        
        for (const property in departmentData) {
            if (departmentData[property] == "")
            {            
                departmentData[property] = null;
            }
        };

        Departments.create(departmentData)
        .then(()=>resolve())
        .catch(()=>reject('unable to create department'));
    });
}


module.exports.updateDepartment = (departmentData) =>{
    return new Promise((resolve,reject)=>{
        for (const property in departmentData) {
            if (departmentData[property] == "")
            {            
                departmentData[property] = null;                    
            }
        };

        Departments.update(departmentData,{
            where: {
                departmentId: departmentData.departmentId
            }
        })
        .then(()=>resolve())
        .catch(()=>reject('unable to create department'));
    });

}


module.exports.getDepartmentById = (id) =>{
    return new Promise((resolve,reject)=>{
        Departments.findAll({
            where: {
                departmentId: id
            },
            order: ["departmentId"]
        })
        .then((data)=>resolve(data[0]))
        .catch(()=>reject("no results returned")); 
    });
}




module.exports.deleteEmployeeByNum = (empNum) =>{
    return new Promise((resolve,reject)=>{
        Employees.destroy({
            where:{ employeeNum : empNum}
        })
        .then(()=>{resolve();})
        .catch(()=>{reject("Unable to delete");});

    });
}



var file = require("fs");
module.exports.getAllImages = () => {
    return new Promise((resolve,reject)=>{
        file.readdir("./public/images/uploaded", function(err, items){
            var msg;
            if(err){
                msg =  "unable to read folder";
                reject(err);
            }else{                
                if (items.length) {
                    resolve(items);
                }else{
                    msg = "Directory is empty";
                    reject(msg);
                }
    
            }
        });
    });   
}


module.exports.getAllManagers = () =>{
    return new Promise(function(resolve,reject){
        reject();
    });
}




