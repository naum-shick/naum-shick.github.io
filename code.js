// Original code from https://github.com/jamiewilson/form-to-google-sheets
// Updated for 2021 and ES6 standards

const sheetNamePrefix = 'Sign '
const scriptProp = PropertiesService.getScriptProperties()

function test() {
  const obj = {};
  obj.parameter = ["getList"];
  const res = doPost(obj);
  console.log(res);
}

// save current table in property
function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}



function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  try {
    //Logger.log(e.parameter)

    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'));


    let resToSend = "";

    if (e.parameter["getList"]) {

      const ssName = SpreadsheetApp.openById("1xDqGouT9ySKS_4JDz8eq4LbHsJ6udrlgrPLcDWCx2Ag"); // open shared name list, sign in
      const sheetList = ssName.getSheetByName('sign in');

      const listEmployees = sheetList.getRange(2, 1, sheetList.getLastRow() - 1, 1).getValues();
      const listEmployees2 = listEmployees.map((val) => {
        return val.toString();
      });
      // const listToSend = JSON.stringify(listEmployees2);

      resToSend = listEmployees2;


    } else {
      const sheetName = sheetNamePrefix + (new Date()).toISOString().split('T')[0];
      var sheet = doc.getSheetByName(sheetName);
      if (!sheet) {
        sheet = doc.insertSheet( sheetName);
        sheet.appendRow(["Date", "Employee", "Signature"]);
      }


      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      const nextRow = sheet.getLastRow() + 1

      const newRow = headers.map(function (header) {
        // return header === 'Date' ? new Date() : e.parameter[header]
        if (header === "Date") return new Date();
        if (header === "Employee") return e.parameter["Employee"];
        if (header === "Signature") return SpreadsheetApp.newCellImage().setSourceUrl(e.parameter["Signature"]).build();
      })

      sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

      resToSend = newRow;

    }
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': resToSend }))
      .setMimeType(ContentService.MimeType.JSON)
  }


  catch (e) {
    console.log(e);
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}

