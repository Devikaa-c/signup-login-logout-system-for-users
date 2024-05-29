const express =  require('express')
const admin_route = express()

const adminController =  require('../controllers/adminController')

admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')


admin_route.get('/',adminController.loadLogin)

admin_route.post('/',adminController.verifyLogin) 

admin_route.get('/logout',adminController.logout)

admin_route.get('/dashboard',adminController.adminDashboard)

admin_route.get('/addUser',adminController.newUserLoad)

admin_route.post('/addUser',adminController.addUser)

admin_route.get('/editUser',adminController.editUserLoad)

admin_route.post('/editUser',adminController.updateUsers)

admin_route.get('/deleteUser',adminController.deleteUser)

admin_route.get('/search',adminController.searchUser)

admin_route.get('*',function(req,res){

  res.redirect('/admin')

})

module.exports = admin_route