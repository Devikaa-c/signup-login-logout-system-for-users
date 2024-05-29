const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const flash = require("express-flash");

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

const loadRegister = async (req, res) => {
    try {
        if (req.session.user_id) {
            res.redirect("/home");
        } else {
            const existingError = req.flash("usernameExists");
            const signupError = req.flash("registration error");
            const nameError = req.flash("nameError");

            res.render("registration", { existError: existingError, signuperror: signupError, nameerror: nameError });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const insertUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

        if (existingUser) {
            req.flash("usernameExists", "Username or email already exists");
            res.redirect("/register");
        } else {
            const firstName = req.body.first_name.trim();
            const lastName = req.body.last_name.trim();
            const userName = req.body.username.trim();

            const regex = /^[a-zA-Z]+$/;

            if (
                !firstName ||
                !lastName ||
                !userName ||
                !regex.test(userName) ||
                !regex.test(firstName) ||
                !regex.test(lastName)
            ) {
                req.flash("nameError", "Enter valid inputs");
                res.redirect("/register");
                return;
            }

            if (/\s/.test(firstName.trim()) || /\s/.test(lastName.trim()) || /\s/.test(userName.trim())) {
                req.flash("nameError", "Enter valid inputs");
                res.redirect("/register");
                return;
            }

            const spassword = await securePassword(req.body.password);
            const user = new User({
                first_name: firstName,
                last_name: lastName,
                username: userName,
                email: req.body.email,
                password: spassword,
                is_admin: 0,
            });

            const userData = await user.save();

            if (userData) {
                req.flash("registration success", "Your registration was successful");
                res.redirect("/login");
            } else {
                req.flash("registration error", "Failed to register user");
                res.redirect("/register");
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

const loginLoad = async (req, res) => {
    try {
        if (req.session.user_id) {
            res.redirect("/home");
        } else {
            const signupSuccess = req.flash("registration success");
            const passwordError = req.flash("passwordError");
            const nameError = req.flash("loginError");

            res.render("login", {
                signupsuccess: signupSuccess,
                passworderror: passwordError,
                usernameError: nameError,
            });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const verifyLogin = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const userData = await User.findOne({ username: username, is_admin: 0 });

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                req.session.user_id = userData._id;
                res.redirect("/home");
            } else {
                req.flash("passwordError", "Password is incorrect");
                res.redirect("/login");
            }
        } else {
            req.flash("loginError", "Username is incorrect");
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
    }
};

// const loadHome = async (req, res) => {
//     try {
//         if (req.session.user_id) {
//             if (req.session.user_id = null) {
//                 res.redirect("/login");
//             } else {
//                 res.render("home");
//             }
//         } else if ((req.session.user_id = null)) {
//             res.redirect("/login");
//         } else {
//             res.redirect("/login");
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// };


const loadHome = async(req,res)=>{
    try {
        const userData = await User.findById(req.session.user_id)
        if(userData){
            res.render('home')
        }else{
            res.redirect('/logout')
        }
    } catch (error) {
        console.log(error.message)
}
}

// const logoutUser = async (req, res) => {
//     try {
//         const deletedUserId = req.query.id;

//         if (deletedUserId === req.session.user_id) {
//             req.session.destroy();

//             res.redirect("/");
//         } else if ((req.session.user_id = null)) {
//             req.session.destroy();

//             res.redirect("/");
//         } else {
//             req.session.destroy();

//             res.redirect("/");
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// };

const logoutUser = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    logoutUser,
};
