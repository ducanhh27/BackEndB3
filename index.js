const { json } = require('body-parser')
const { error } = require('console')
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs')
const departmentFile = 'department.json';
const employeeFile = 'employee.json'
//Phân tích body yêu cầu có dạng JSON
app.use(express.json());

//Hàm đọc file
const readFile = (nameFile)=>{
    if(!fs.existsSync(nameFile)){
        fs.writeFileSync(nameFile,JSON.stringify([]));
    }
    const data = fs.readFileSync(nameFile);
    return JSON.parse(data);
}

//Hàm ghi file
const writeFile = (data,path)=>{
    fs.writeFileSync(path,JSON.stringify(data,null,1),'utf8');
}
//*******************     DEPARTMENT  ************************* 
//Lấy danh sách phòng ban
app.get('/department',(req,res)=>{
    const data = readFile(departmentFile);
    res.json(data)
})

//Thêm phòng ban 
app.post('/department',(req,res)=>{
    const newDepartment  = req.body;
    const data =readFile(departmentFile);
    if(!newDepartment.name || !newDepartment.directorId || !newDepartment.departmentId){
        return res.status(400).json({message:"Name,departmentID và directorID là bắt. buộc"})
    }
    if(data.some(department => department.departmentId === newDepartment.departmentId))
    {
        return res.status(400).json({message:"irectorID đã tồn tại"})
    }
    else
    {
    data.push(newDepartment);
    writeFile(data,departmentFile);
    res.status(201).json(newDepartment);
    }
}
)

//sửa phòng ban
app.put('/department/:id',(req,res)=>{
    const {id} =req.body;
    const{name,des,directorId,departmentId} =req.body;
    data=readFile(departmentFile);
    const indexPut = data.findIndex(dep => dep.departmentId === id);

    data[indexPut] ={name,des,directorId,departmentId}
    writeFile(data,departmentFile)
    res.status(200).json({message : "Sửa thành công!"});
}
)

//xoá phòng ban
app.delete('/department/:id',(req,res)=>{
    const {id} = req.params;
    const data = readFile(departmentFile);
    const indexPut = data.findIndex(dep => dep.departmentId === id);
    
    data.splice(indexPut,1);
    writeFile(data,departmentFile);
    res.status(204).end();
})

//*******************         EMPLOYEE      **************************** 

//lấy danh sách nhân viên
app.get('/employee',(req,res) => {
    const employee =readFile(employeeFile)
    res.json(employee)
})

//thêm một nhân viên mới
app.post('/employee',(req,res)=>{
    const {employeeID,name,age,departmentId,phone,email,salary} = req.body;
    //thông tin bắt buộc
    if(!employeeID || !salary || !departmentId)
        return res.status(400).json({error :" Thiếu thông tin cần"})
    //kiểm tra xem tồn tại phòng ban không
    const department =readFile(departmentFile);
    const existDep = department.some(dep => dep.departmentId === departmentId)
    if(!existDep)
        return res.status(400).json({error: 'Phòng không tồn tại!'})
    //kiểm tra xem id nhân viên đã tồn tại chưa
    const data = readFile(employeeFile);
    const existDepID =data.some(emp => emp.employeeID === employeeID)
    if(existDepID)
        return res.status(400).json({message:"employeeID đã tồn tại"})
    //thêm nhân viên mới
    const newEmployee = {employeeID,name,age,departmentId,phone,email,salary}
    data.push(newEmployee);
    writeFile(data,employeeFile);
    res.status(201).json(newEmployee);
})

//sửa nhân viên
app.put('/employee/:id',(req,res)=>{
    const {id} = req.params;
    const updateEmployee = req.body;
    const data= readFile(employeeFile);
    const indexPut = data.findIndex(employee => employee.employeeID === id)
    data[indexPut] ={...data[indexPut], ...updateEmployee}
    writeFile(data);
    res.status(200).json(data[indexPut])

}) 

//xoá nhân viên
app.delete('/employee/:id',(req,res)=>{
    const {id} =req.params;
    const data= readFile(employeeFile);
    const indexPut = data.findIndex(emp => emp.employeeID === id);
    
    console.log(id);
    data.splice(indexPut,1);
    writeFile(data,employeeFile);
    res.status(204).end(); 
})


// **************** TÍNH LUƠNG TRUNG BÌNH CỦA PHÒNG BAN ******************
app.get('/department/avg/:id',(req,res) => {
    const { id } = req.params;
    const data= readFile(employeeFile);
    const departmentEmp = data.filter(emp => emp.departmentId === id)
    console.log(data);
    console.log(id)
    if(departmentEmp.length === 0)
        return res.status(400).json({message:"Không có nhân viên nào!"})
    let totalSalary = 0;
    for( const emp of departmentEmp ){
        totalSalary=+emp.salary;
    }
    const avgSalary = (totalSalary)/(departmentEmp.length);
    res.status(200).json({avgSalary})
})

app.get('/department/hight-avg',(req,res)=>{
    const department = readFile(departmentFile);
    const employee = readFile(employeeFile);

    //Tính lương trung bình của các phòng ban
    const depSlary =  department.map(dep=>{
        const depEmploy = employee.filter(emp=> emp.departmentId === dep.departmentId);
        if(depEmploy.length===0)
            return {departmentId:dep.departmentId , avgSalary : 0};
        let totalSalary = 0;
        for( const emp of depEmploy ){
            totalSalary=+emp.salary;
        }
        const avgSalary=totalSalary/depEmploy.length;
        return {departmentId:dep.departmentId , avgSalary};
    })
    //Tìm phòng ban có lương cao nhất
    let=highDepSalary;
    let maxSalary =depEmploy[0].avgSalary
    for(let i = 0 ; i<depSlary.length; i++){
        if(depSlary[i].avgSalary>maxSalary)
        {
            maxSalary=depSlary[i].avgSalary;
            highDepSalary=department.find(dep=>dep.departmentId===depSlary[i].departmentId)
        }
    }
    res.send({
        department :highDepSalary,
        avgSalary :maxSalary
    })
})
//******************* Nhân viên có mức lương cao nhất trong phòng ban *********************/
app.get('/empHighSalary/:departmentId',(req,res)=>{
    const {departmentId} =req.params;
    const employee =readFile(employeeFile);
    const listEmp = employee.filter(emp => emp.departmentId === departmentId);
    if(listEmp.length === 0)
        return res.status(404).json({message: 'Không có nhân viên nào!'})
    let maxSalary = 0;
    let idEmpHighSalary
    for(let i=0 ;i<listEmp.length;i++){
        if(maxSalary<listEmp[i].salary){
            maxSalary=listEmp[i].salary;
            idEmpHighSalary=listEmp[i].employeeID
        }
    }
    const data = employee.filter(emp =>emp.employeeID === idEmpHighSalary)
    res.json(data)
})

//**************** TRẢ VỀ DANH SÁCH TRƯỞNG PHÒND ******************* */
appp.get('/deparment-director',(req,res)=>{
    const deparment =readFile(departmentFile);
    const employee =readFile(employeeFile);

    //tạo ds trưởng phòng
    const listDirector = deparment.map(dep=>{
        const director = employee.find(emp => emp.employeeID === dep.directorId);
        return{
            deparmentId : dep.deparmentId,
            deparmentName: dep.name,
            director : director ? {
                id:director.employeeID,
                name:director.name,
                age:director.age,
                phone: director.phone,
                email: director.email,
                salary: director.salary
            } : null
        }
    }
    )
    res.json(listDirector);
})
app.listen(port,() =>{

})