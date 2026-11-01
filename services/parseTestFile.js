const ExcelJS = require("exceljs");
function toNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
function toDate(v) {
  if (v === null || v === undefined || v === "") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}
function toSeconds(v) {
  if (v === null || v === undefined || v === "") return null;

  let sec;
  if (typeof v === "string") {
    const p = v.split(":");
    sec = Number(p[0]) * 3600 + Number(p[1]) * 60 + Number(p[2]);
  } else if (v instanceof Date) {
    sec = v.getUTCHours() * 3600 + v.getUTCMinutes() * 60 + v.getUTCSeconds();
  } else if (typeof v === "number") {
    sec = Math.round(v * 86400);
  } else {
    return null;
  }

  return Number.isNaN(sec) ? null : sec;
}
function findByLabel(sheet, label) {
 
  for (const row of sheet.getRows(1, sheet.rowCount)) {
    for (const cell of row.values) {
      if (typeof cell === "string" && cell.trim() === label) {
        const colNumber = row.values.indexOf(cell);
        return row.getCell(colNumber + 2).value;
      }

      
    }
  }
  return null;
}
function parseMeta(workbook) {
  const unit = workbook.getWorksheet("unit");
  const test = workbook.getWorksheet("test");

  return {
    startedAt: toDate(findByLabel(unit, "Start time")),
    endedAt: toDate(findByLabel(unit, "End time")),
    voltageLimits: {
      upper: toNum(parseFloat(findByLabel(test, "Volt. upper"))),
      lower: toNum(parseFloat(findByLabel(test, "Volt. lower"))),
    },
    recordIntervalSec: toNum(parseFloat(findByLabel(test, "Record settings"))),
  };
}
function parseCycles(sheet) {
  const result = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    result.push({
      index: toNum(row.getCell(1).value),
      chgCapAh: toNum(row.getCell(2).value),
      dchgCapAh: toNum(row.getCell(3).value),
      efficiency: toNum(row.getCell(4).value),
      chgEnergyWh: toNum(row.getCell(5).value),
      dchgEnergyWh: toNum(row.getCell(6).value),
      chgTimeSec: toSeconds(row.getCell(7).value),
      dchgTimeSec: toSeconds(row.getCell(8).value),
      tempMaxChg: toNum(row.getCell(9).value),
      tempMinChg: toNum(row.getCell(10).value),
      tempMaxDchg: toNum(row.getCell(11).value),
      tempMinDchg: toNum(row.getCell(12).value),
    });
  });
  return result;
}
function parseSteps(sheet) {
  const result = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    result.push({
      cycleIndex: toNum(row.getCell(1).value),
      stepIndex: toNum(row.getCell(2).value),
      stepNumber: toNum(row.getCell(3).value),
      type: row.getCell(4).value,
      durationSec: toSeconds(row.getCell(5).value),
      onesetDate: toDate(row.getCell(6).value),
      endDate: toDate(row.getCell(7).value),
      capacityAh: toNum(row.getCell(8).value),
      energyWh: toNum(row.getCell(9).value),
      onesetVoltage: toNum(row.getCell(10).value),
      endVoltage: toNum(row.getCell(11).value),
      endCurrent: toNum(row.getCell(12).value),
      dcirMOhm: toNum(row.getCell(13).value),
      T1AuxTmax: toNum(row.getCell(14).value),
      T1AuxTmin: toNum(row.getCell(15).value),
    });
  });
  return result;
}
function parseRecords(sheet, steps) {
  const groups = [];
  let cur = null;
  let prevType = null;
  let prevTime = null;

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const type = row.getCell(2).value;
    const timeSec = toSeconds(row.getCell(3).value);

    if (cur === null || type !== prevType || timeSec < prevTime) {
      cur = {
        stepType: type,
        dataPoint: [],
        timeSec: [],
        totalTimeSec: [],
        current: [],
        voltage: [],
        capacityAh: [],
        energyWh: [],
        date: [],
        power: [],
        T1: [],
        Aux: [],
      };
      groups.push(cur);
    }
    cur.dataPoint.push(toNum(row.getCell(1).value));
    cur.timeSec.push(timeSec);
    cur.totalTimeSec.push(toSeconds(row.getCell(4).value));
    cur.current.push(toNum(row.getCell(5).value));
    cur.voltage.push(toNum(row.getCell(6).value));
    cur.capacityAh.push(toNum(row.getCell(7).value));
    cur.energyWh.push(toNum(row.getCell(8).value));
    cur.date.push(toDate(row.getCell(9).value));
    cur.power.push(toNum(row.getCell(10).value));
    cur.T1.push(toNum(row.getCell(11).value));
    cur.Aux.push(toNum(row.getCell(12).value));

    prevType = type;
    prevTime = timeSec;
  });

  if (groups.length !== steps.length) {
    throw new Error(
      `Mismatch between number of record groups (${groups.length}) and number of steps (${steps.length})`,
    );
  }

  for (let i = 0; i < groups.length; i++) {
    groups[i].cycleIndex = steps[i].cycleIndex;
    groups[i].stepNumber = steps[i].stepNumber;
  }
  return groups;
}
async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile("tempData/cycledata.xlsx");
  const cycleSheet = workbook.getWorksheet("cycle");
  const stepSheet = workbook.getWorksheet("step");
  const recordSheet = workbook.getWorksheet("record");
  console.log("Meta:", parseMeta(workbook));
}

if (require.main === module) {
  main();
}
module.exports = { parseCycles, parseSteps, parseRecords, parseMeta };
