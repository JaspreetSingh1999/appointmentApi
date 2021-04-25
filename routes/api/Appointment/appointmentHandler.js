const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const config = require("config");
const jwt = require("jsonwebtoken");
const Appointment = require("../../../models/Appointment/Appointment");
const Patient = require("../../../models/Users/Patient");
const Doctor = require("../../../models/Users/Doctor");

// Auth
const authPatient = require("../../../middleware/authPatient");      
const authDoctor = require("../../../middleware/authDoctor");
// =======================

// @route   POST api/appointment/requestAppointment/:id
// @desc    Requests Appointment for given date and time 
// @access  Only for patients
router.post("/requestAppointment/:id",
 [
    check("datetime", "Include Date and Time")
      .not()
      .isEmpty(),
    check("credential", "Include Patient credentials")
      .not()
      .isEmpty()  
  ],
  authPatient,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {  
      credential,
      datetime,
      desc
     }=req.body;

    const doctor = req.params.id;
     
    try {

    patient = await Patient.findOne({ email: credential });

    
    // See if appointment already exist
    let appointment = await Appointment.find({ patient: patient._id, doctor: doctor, datetime });
    if (appointment.length) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Appointment for given details already exists" }] });
    }
    appointment = new Appointment({ 
      patient: patient._id,
      doctor,
      datetime,
      desc
    });
    await appointment.save();
    return res.send("appointment requested successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/appointment/acceptAppointment/:id
// @desc    Accept an appointment for a given id
// @access  Only for Doctors
router.post("/acceptAppointment/:id",
  authDoctor,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
  try {
    let appointment = await Appointment.findByIdAndUpdate({ _id: req.params.id }, { status: 'Accepted' });
    if (appointment) {
      return res.send("appointment accepted successfully");
    } else {
      return res.send("No appointment to be accepted for given id");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/appointment/myAppointments
// @desc    Read Accepted Appointment
// @access  Public
router.get("/myAppointments", async (req, res) => {
  try {
    //Only allow selected query params
    // let qdata = req.query;

    const {
      credential,
      role
    } = req.body;

    let appointments = '';
    if(role.toLowerCase() =="patient"){
      user = await Patient.findOne({ email: credential });
      appointments = await Appointment.find({patient: user._id, status: 'Accepted'});
    }
    else if(role.toLowerCase()=="doctor"){
      user = await Doctor.findOne({ email: credential });
      appointments = await Appointment.find({doctor: user._id, status: 'Accepted'});
    }

    if(!user){
        return res
        .status(400)
        .json({ errors: [{ msg: "User doesn't exist" }] });
    }

    
    if (appointments || appointments.length) {
      return res.send(appointments);
    } else {
      return res.send("No appointments to be shown");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   GET api/requestedAppointments
// @desc    Read Pending Appointments
// @access  Public

router.get("/requestedAppointments", async (req, res) => {
  try {
    //Only allow selected query params
    // let qdata = req.query;

    const {
      credential,
      role
    } = req.body;

    let appointments = '';
    if(role.toLowerCase() =="patient"){
      user = await Patient.findOne({ email: credential });
      appointments = await Appointment.find({patient: user._id, status: 'Pending'});
    }
    else if(role.toLowerCase()=="doctor"){
      user = await Doctor.findOne({ email: credential });
      appointments = await Appointment.find({doctor: user._id, status: 'Pending'});
    }

    if(!user){
        return res
        .status(400)
        .json({ errors: [{ msg: "User doesn't exist" }] });
    }

    if (appointments || appointments.length) {
      return res.send(appointments);
    } else {
      return res.send("No appointments to be shown");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
