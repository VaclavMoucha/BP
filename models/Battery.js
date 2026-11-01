const mongoose = require('mongoose');
const { Schema } = mongoose;

const batterySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const cycleSchema = new Schema({
  index: Number,
  chgCapAh: Number,
  dchgCapAh: Number,
  efficiency: Number,
  chgEnergyWh: Number,
  dchgEnergyWh: Number,
  chgTimeSec: Number,
  dchgTimeSec: Number,
  tempMaxChg: Number,
  tempMinChg: Number,
  tempMaxDchg: Number,
  tempMinDchg: Number,
}, { _id: false });

const stepSchema = new Schema({
  cycleIndex: Number,
  stepIndex: Number,
  stepNumber: Number,
  type: { type: String, enum: ['CCCV Chg', 'CC DChg', 'Rest'] },
  durationSec: Number,
  onesetDate: Date,
  endDate: Date,
  capacityAh: Number,
  energyWh: Number,
  onesetVoltage: Number,
  endVoltage: Number,
  endCurrent: Number,
  dcirMOhm: Number,
  T1AuxTmax: Number,
  T1AuxTmin: Number,
}, { _id: false });

const testSchema = new Schema({
  battery: { type: Schema.Types.ObjectId, ref: 'Battery', required: true, index: true },
  type: { type: String, enum: ['capacity_dcir', 'cycle_life'], required: true },
  startedAt: Date,
  endedAt: Date,
  voltageLimits: { upper: Number, lower: Number },
  recordIntervalSec: { type: Number, enum: [1, 10] },
  sourceFileName: String,
  uploadedAt: { type: Date, default: Date.now },
  cycles: [cycleSchema],
  steps: [stepSchema],
});


const recordSchema = new Schema({
  test: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  cycleIndex: Number,
  stepNumber: Number,
  stepType: { type: String, enum: ['CCCV Chg', 'CC DChg', 'Rest'] },

  dataPoint: [Number],
  timeSec: [Number],
  totalTimeSec: [Number],
  current: [Number],
  voltage: [Number],
  capacityAh: [Number],
  energyWh: [Number],
  date: [Date],
  power: [Number],
  T1: [Number],
  Aux: [Number],
});
recordSchema.index({ test: 1, cycleIndex: 1, stepNumber: 1 });

module.exports = {
  Battery: mongoose.model('Battery', batterySchema),
  Test: mongoose.model('Test', testSchema),
  Record: mongoose.model('Record', recordSchema),
};