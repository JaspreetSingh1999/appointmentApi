const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    datetime: { type: Date, required: true },
    desc: {
      type: String
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    }
  }
);

module.exports = Appointment = mongoose.model("Appointment", appointmentSchema);