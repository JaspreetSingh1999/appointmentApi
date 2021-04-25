const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");

// Models
const Patient = require("../../models/Users/Patient");
const Doctor = require("../../models/Users/Doctor");
// ===============
const bcrypt = require("bcryptjs");

// @route		GET api/auth
// @desc		Test Route
// @access		Public
router.get("/", (req, res) => {
  res.send("Auth");
});

// @route   POST api/auth/signUp
// @desc    SignUp users according to their role
// @access  Public
router.post(
  "/signUp",
  [
    check("email", "Email is required")
      .not()
      .isEmpty(),
    check("password", "Password is required")
      .not()
      .isEmpty(),
    check("role", "Role is required")
      .not()
      .isEmpty(),
    check("dob", "DOB is required")
      .not()
      .isEmpty(),
    check("mobNumber", "Mobile Number is required")
    .not()
    .isEmpty(),     
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      role,
      fatherName,
      address,
      dob,
      mobNumber,
      email,
      password
    } = req.body;

    try {
      // See if User already Exists
      var user;
      const salt = await bcrypt.genSalt(10);
      if(role.toLowerCase() =="patient"){
      	user = await Patient.findOne({ email: email });
      }
      else if(role.toLowerCase()=="doctor"){
	      user = await Doctor.findOne({ email: email });
      }

      if(user){
      	 return res
          .status(400)
          .json({ errors: [{ msg: "User already exists. Please login" }] });
      }

      try {
          const hashedPassword = await bcrypt.hash(password, 10);
          
          if(role.toLowerCase()=="patient"){
            patient = new Patient({
              name,
              fatherName,
              address,
              dob,
              mobNumber,
              email,
              password: hashedPassword
            });
            await patient.save();
            // return res.send("Patient added successfully");
          }
          else if(role.toLowerCase()=="doctor"){
            doctor = new Doctor({
              name,
              fatherName,
              address,
              dob,
              mobNumber,
              email,
              password: hashedPassword
            });
            await doctor.save();
            // return res.send("Doctor added successfully");
          }

          // Return jsonwebtoken
          const payload = {
            user: {
              email: email,	
              role: role
            }
          };
          jwt.sign(
            payload,
            config.get("jwtSecret"),
            { expiresIn: 3600 },
            (err, token) => {
              if (err) throw err;
              return res.json(
                { 
                  token: token,
                  payload: payload,
                  msg: "User logged in"
                 });
            }
          );
      } catch (err) {
        console.error(err.message);
        return res
          .status(400)
          .json({ errors: [{ msg: err.message }] });
      }


      
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);  

// @route   POST api/auth/login
// @desc    Login users according to their role
// @access  Public
router.post(
  "/login",
  [
    check("credential", "Email is required")
      .not()
      .isEmpty(),
    check("password", "Password is required")
      .not()
      .isEmpty(),
    check("role", "Type is required")
      .not()
      .isEmpty(),     
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      credential,
      password,
      role
    } = req.body;

    try {
      // See if User Exists
      var user;
      const salt = await bcrypt.genSalt(10);
      if(role.toLowerCase() =="patient"){
      	user = await Patient.findOne({ email: credential });
      }
      else if(role.toLowerCase()=="doctor"){
	      user = await Doctor.findOne({ email: credential });
      }

      if(!user){
      	 return res
          .status(400)
          .json({ errors: [{ msg: "User doesn't exist" }] });
      }

      pass = await bcrypt.compare(password,user.password);
      if(!pass){
      	 return res
          .status(400)
          .json({ errors: [{ msg: "Wrong Password" }] });
      }


      // Return jsonwebtoken
      const payload = {
        user: {
          credential: credential,	
          role: role
        }
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;

          return res.json(
            { 
              token: token,
              payload: payload,
              msg: "User logged in"
             });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);  

module.exports = router;