const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const flash = require('express-flash');

const securePassword = async (password) => {

    try {
      
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;

    } catch (error) {

      console.log(error.message);

    }

};

const loadLogin = async (req, res) => {

    try {

        if (req.session.admin_id) {

          res.redirect("/admin/dashboard");

        } else {

          const password_error = req.flash("Password error")
          const unauthorized_error = req.flash("Unauthorized error")
          const logoutMsg = req.flash("logout")
          res.render("login",{passwordError:password_error , unauthError:unauthorized_error , logoutmsg : logoutMsg});

        }

    } catch (error) {

      console.log(error.message);

    }

};

const verifyLogin = async (req, res) => {

    try {
        const userName = req.body.username;
        const password = req.body.password;

        const adminData = await User.findOne({ username: userName, is_admin: 1 });

        if (adminData) {
            
            const passwordMatch = await bcrypt.compare(password, adminData.password);

            if (passwordMatch) {

                if (adminData.is_admin == 1) {

                    req.session.admin_id = adminData._id;
                    res.redirect("/admin/dashboard");

                } 
                
            } else {
                req.flash('Password error',"Invalid Password error!!")
                res.redirect("/admin/login");
            }
        } else {
            req.flash("Unauthorized error","Unauthorized user error!!")
            res.redirect("/admin/login");
        }


    } catch (error) {

        console.log(error.message);
        
    }
};

const logout = async (req, res) => {

    try {

        req.session.destroy();
        res.redirect("/admin");

    } catch (error) {

        console.log(error.message);

    }

};

const adminDashboard = async (req, res) => {

    try {

        if (req.session.admin_id) {

            const usersData = await User.find({ is_admin: 0 });

            const updateSuccess = req.flash("updateSuccess")
            const addUserSuccess = req.flash("addUserSuccess")
            
            res.render("dashboard", { users: usersData , addSuccess:addUserSuccess ,updatesuccess:updateSuccess});

        } else {

            res.redirect("/admin/login");

        }

    } catch (error) {

        console.log(error.message);

    }

};

const newUserLoad = async (req, res) => {

    try {
  
        if(req.session.admin_id){

            const nameAndEmailError = req.flash("name and email error")
            const addUserFail = req.flash("addUserError")
    
            res.render("addUser" , {totalError:nameAndEmailError , addFail:addUserFail});    

        }else{
            res.redirect('/admin/login')
        }
        
    } catch (error) {

        console.log(error.message);

    }

};

const addUser = async (req, res) => {

    try {
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const is_admin = 0;

        const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });

        if (existingUser) {
            
            req.flash("name and email error ","username or email already exists")
            res.redirect("/admin/addUser");
        }

        const spassword = await securePassword(password);

        const user = new User({
            first_name: first_name,
            last_name: last_name,
            username: username,
            email: email,
            password: spassword,
            is_admin: is_admin,
        });

        const userData = await user.save();

        if (userData) {
           
            req.flash("addUserSuccess","Add User Success")
            res.redirect("/admin/dashboard");

        } else {

            req.flash("addUserError","Add user failed")
            res.redirect("/admin/addUser")
        }

    } catch (error) {

        console.log(error.message);
    }
};

const editUserLoad = async (req, res) => {

    try {

      if(req.session.admin_id){

        const id = req.query.id;
        const userData = await User.findById(id);

        const updateFail = req.flash("updateFail")

        if (userData) {

            res.render("editUser", { user: userData ,updateFailed:updateFail });

        } else {

            res.redirect("/admin/dashboard");

        }

      } else {

        res.redirect('/admin/login')

      }

    } catch (error) {

        console.log(error.message);

    }

};

const updateUsers = async (req, res) => {

    try {

        const { id, firstname, lastname, email, username, password } = req.body;

        const userData = await User.findByIdAndUpdate(
            id,
            {
                first_name: firstname,
                last_name: lastname,
                email: email,
                username: username,
                password: await securePassword(password),
            },
            { new: true }
        );

        if (userData) {

            req.flash("updateSuccess","User details updated Successfully")
            res.redirect("/admin/dashboard");

        } else {

            req.flash("updateFail","Failed to update User details")
            res.redirect("/admin/editUser");

        }

    } catch (error) {

        console.log(error.message);
    }

};


const deleteUser = async (req, res) => {
    try {
        const deletedUserId = req.query.id;
        await User.deleteOne({ _id: deletedUserId });

        if (deletedUserId === req.session.user_id ) {
            req.session.user_id=null
            res.redirect('/login'); 
        } else {
            res.redirect("/admin/dashboard");
        }
    } catch (error) {
        console.log(error.message);
    }
};


const searchUser = async (req, res) => {
    try {
        const query = req.query.search;
        const usersData = await User.find({
            $or: [{ email: { $regex: query, $options: "i" } }, { username: { $regex: query, $options: "i" } }],
        });
        res.render("dashboard", { users: usersData , searchQuery :query});
    } catch (error) {
        console.log(error.message);
        res.redirect("/admin/dashboard");
    }  
};

module.exports = {
    loadLogin,
    verifyLogin,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser,
    searchUser,
};
