import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import SmsListener from "react-native-android-sms-listener";
import SmsAndroid from "react-native-get-sms-android";

import { PieChart } from "react-native-gifted-charts";

import {
  getDebitedDateAndAmount,
  getMatchingBankName,
  getNumbersFromMsg,
  getYearlyChartData,
} from "./utils/sms";
import Section from "./components/section";

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
  // minDate: 1554636310165, // timestamp (in milliseconds since UNIX epoch)
  // maxDate: 1556277910456, // timestamp (in milliseconds since UNIX epoch)
  // bodyRegex: "(.*)How are you(.*)", // content regex to match

  /** the next 5 filters should NOT be used together, they are OR-ed so pick one **/
  // read: 0, // 0 for unread SMS, 1 for SMS already read
  // _id: 1234, // specify the msg id
  // thread_id: 12, // specify the conversation thread_id
  // address: "+1888------", // sender's phone number
  // body: "How are you", // content to match
  /** the next 2 filters can be used for pagination **/
  indexFrom: 0, // start from index 0
  // maxCount: 10, // count of SMS to return each time
};

export default function SMS() {
  const [debited, setDebited] = useState({});
  async function listSMS() {
    const smsDetails = {
      totalSMS: 0,
      totalRead: 0,
      totalUnread: 0,
      allSMS: [],
      debited: [],
    };
    const bankAddresses = ["HDFC", "AXIS", "SBI"];
    const list = await new Promise((resolve, reject) => {
      SmsAndroid.list(
        JSON.stringify(filter),
        (fail) => {
          console.log("Failed with this error: " + fail);
          reject(fail);
        },
        (count, smsList) => {
          var arr = JSON.parse(smsList);
          smsDetails.totalSMS = count;
          smsDetails.totalRead = arr.filter((each) => each.read === 1).length;
          smsDetails.totalUnread = arr.filter((each) => each.read === 0).length;
          // smsDetails.allSMS = arr

          arr.forEach((each) => {
            // check if the message contains sent or debit
            if (
              each.body.toLowerCase().includes("sent") ||
              each.body.toLowerCase().includes("debit")
            ) {
              // check if the sender is a bank
              const matchingBanks = getMatchingBankName(
                bankAddresses,
                each.address
              );
              if (matchingBanks.length > 0) {
                // sender is bank
                const numbersInMsg = getNumbersFromMsg(each.body);
                const debited = {
                  amount: numbersInMsg,
                  date: each.date,
                  body: each.body,
                  address: each.address,
                };
                smsDetails.debited.push(debited);
              } else {
                // sender is not a bank
              }
            }
          });
          resolve(arr);
        }
      );
    });
    const debitedDateAndAmount = getDebitedDateAndAmount(smsDetails.debited);
    setDebited(debitedDateAndAmount);
  }

  useEffect(() => {
    listSMS();
  }, []);
  useEffect(() => {
    const subscription = SmsListener.addListener((message) => {
      console.info("in listening message", message);
    });
    return () => subscription.remove();
  }, []);

  return (
    <View>
      <Text>
        Spend analysis - stats are produced after reading SMS on the device
      </Text>
      <View>
        <Section title="Amount spent per year">
          <PieChart
            showText
            textColor="black"
            radius={150}
            textSize={20}
            showTextBackground
            textBackgroundRadius={26}
            data={getYearlyChartData(debited)}
          />
          <View>
            {getYearlyChartData(debited).map((each, index) => {
              return (
                <Text key={index}>
                  Year: {each.label} - Spent: {each.value}
                </Text>
              );
            })}
          </View>
        </Section>
      </View>
    </View>
  );
}
