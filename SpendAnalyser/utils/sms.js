export const getMatchingBankName = (allNames, name) => {
  return allNames.filter((word) => {
    const matcher = new RegExp(`${word}`, "gi");
    return name.match(matcher);
  });
};

const convertStrToNum = (str) => {
  const numberRegex = /\b[0-9,]*\b/g;
  // first number is the debited number second number could be available balance
  const matchingNumString = str
    .match(numberRegex)
    .filter((each) => each.length > 0);
  if (matchingNumString.length > 0) {
    // using replace to convert strings with ',' in it eg: 25,234 to 25234
    const num = parseInt(matchingNumString[0].replace(/,/g, ""), 10);
    return num;
  } else {
    // no number found
    return 0;
  }
};

export const getNumbersFromMsg = (str) => {
  let result;
  const withRs = str.match(/\bRs.[0-9,]*\b/g);
  const withINR = str.match(/\INR.[0-9,]*\b/g);
  if (withRs) {
    const num = convertStrToNum(withRs[0]);
    result = num;
  } else if (withINR) {
    const num = convertStrToNum(withINR[0]);
    result = num;
  }
  return result;
};

export const getDebitedDateAndAmount = (records) => {
  const allDebits = {};
  records.forEach((each) => {
    if (each.amount) {
      const date = new Date(each.date).toDateString();
      if (allDebits[date]) {
        allDebits[date] += allDebits[date] + each.amount;
      } else {
        allDebits[date] = each.amount;
      }
    } else {
      // amount is not present
    }
  });
  return allDebits;
};

export const getYearlyChartData = (records) => {
  const data = [];
  Object.keys(records).forEach((dateString) => {
    const year = new Date(dateString).getFullYear();
    let dataObj = {};
    const labelIndex = data.findIndex((each) => each.label === year);
    if (labelIndex >= 0) {
      const value = data[labelIndex].value;
      dataObj = data[labelIndex];
      dataObj.value = value + records[dateString];
      data[labelIndex] = dataObj;
    } else {
      dataObj.label = year;
      dataObj.text = year;
      dataObj.value = records[dateString];
      data.push(dataObj);
    }
  });
  const sorted = data.sort((a, b) => a.label - b.label)
  return sorted;
};

// export const getYearsToFilter = (records) => {
//   const data = [];
//   Object.keys(records).forEach((dateString) => {
//     const year = new Date(dateString).getFullYear();
//     const itemIndex = data.findIndex((each) => each === year);
//     if (itemIndex >= 0) {
//       // year already exists
//     } else {
//       data.push(year);
//     }
//   });
//   const sorted = data.sort((a, b) => a - b)
//   return sorted;
// };
