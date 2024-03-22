/**
 * Copyright (c) 2017
 *
 * Script for:
 * - get namelist from google sheet (publish script)
 * - select name
 * - make signature
 * - save signature in google sheet
 *
 * @summary make signature and save in google sheet
 * @author Yana Shick, Naum Shick
 *
 * Created at     : 2024-03-14
 * Last modified  : 2024-03-19
 */




// make fetch url from command line
const paramsString = window.location.href;
const url = new URL(paramsString);
const params = url.searchParams.get("q");
const fetch_URL = `https://script.google.com/macros/s/${params}/exec`;
const imageUrl = "https://drive.google.com/thumbnail?id=#&sz=w1000";

let nameImages;

async function saveSignature(shift) {

  var signDate = $("#datepicker")
    .datepicker("getDate")
    .toISOString()
    .split("T")[0]; //format yyyy-mm-dd

  const d =  $("#datepicker")
    .datepicker("getDate");
	
  var dd = new Date(d.getTime() - (d.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
	
	
    console.log(dd);
  
}

  //datepicker
  $(function () {
    $("#datepicker")
      .datepicker({
        minDate: "-1m",
        maxDate: "1d",
      })
      .datepicker("setDate", "0d"); // today
  });


