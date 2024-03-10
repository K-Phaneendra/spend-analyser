import SmsAndroid from "react-native-get-sms-android";

/* List SMS messages matching the filter */
var filter = {
  box: "inbox", // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all

  /**
   *  the next 3 filters can work together, they are AND-ed
   *
   *  minDate, maxDate filters work like this:
   *    - If and only if you set a maxDate, it's like executing this SQL query:
   *    "SELECT * from messages WHERE (other filters) AND date <= maxDate"
   *    - Same for minDate but with "date >= minDate"
   */
  minDate: 1554636310165, // timestamp (in milliseconds since UNIX epoch)
  maxDate: 1556277910456, // timestamp (in milliseconds since UNIX epoch)
  bodyRegex: "(.*)How are you(.*)", // content regex to match

  /** the next 5 filters should NOT be used together, they are OR-ed so pick one **/
  read: 0, // 0 for unread SMS, 1 for SMS already read
  _id: 1234, // specify the msg id
  thread_id: 12, // specify the conversation thread_id
  address: "+1888------", // sender's phone number
  body: "How are you", // content to match
  /** the next 2 filters can be used for pagination **/
  indexFrom: 0, // start from index 0
  maxCount: 10, // count of SMS to return each time
};

export default async function listSMS() {
  const list = await new Promise((resolve, reject) => {
    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.log("Failed with this error: " + fail);
        reject(fail);
      },
      (count, smsList) => {
        console.log("Count: ", count);
        console.log("List: ", smsList);
        var arr = JSON.parse(smsList);

        resolve(arr);

        arr.forEach(function (object) {
          console.log("Object: " + object);
          console.log("-->" + object.date);
          console.log("-->" + object.body);
        });
      }
    );
  });
  return list;
}

/*
Each sms will be represents by a JSON object represented below
 
{
  "_id": 1234,
  "thread_id": 3,
  "address": "2900",
  "person": -1,
  "date": 1365053816196,
  "date_sent": 0,
  "protocol": 0,
  "read": 1,
  "status": -1,
  "type": 1,
  "body": "Hello There, I am an SMS",
  "service_center": "+60162999922",
  "locked": 0,
  "error_code": -1,
  "sub_id": -1,
  "seen": 1,
  "deletable": 0,
  "sim_slot": 0,
  "hidden": 0,
  "app_id": 0,
  "msg_id": 0,
  "reserved": 0,
  "pri": 0,
  "teleservice_id": 0,
  "svc_cmd": 0,
  "roam_pending": 0,
  "spam_report": 0,
  "secret_mode": 0,
  "safe_message": 0,
  "favorite": 0
}
 
*/
