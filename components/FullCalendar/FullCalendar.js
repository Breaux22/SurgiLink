import React, { useState, Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import EntypoIcon from "react-native-vector-icons/Entypo";

function Index(props) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [date, setDate] = useState({month: months[new Date().getMonth()], year: new Date().getFullYear()})
  const [calendar, setCalendar] = useState(fillDateValues());
  async function  incMonth () {
    if (months.indexOf(date.month) < 11) {
      setCalendar(fillDateValues(months[months.indexOf(date.month) + 1]));
      setDate({month: months[months.indexOf(date.month) + 1], year: date.year})
    } else {
      setCalendar(fillDateValues(months[0]));
      setDate({month: months[0], year: date.year + 1})
    }
  };
  async function decMonth () {
    if (months.indexOf(date.month) > 0) {
      setCalendar(fillDateValues(months[months.indexOf(date.month) - 1]));
      setDate({month: months[months.indexOf(date.month) - 1], year: date.year})

    } else {
      setCalendar(fillDateValues(months[11]));
      setDate({month: months[11], year: date.year - 1})

    }
  }
  function fillDateValues(monthName = null) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let monthIndex;
    if (monthName !== null) {
        monthIndex = getMonthIndex(monthName);
        if (monthIndex === -1) {
            console.error("Invalid month name provided.");
            return [];
        }
    } else {
        monthIndex = currentMonth;
    }

    // Array to store date objects
    const dateObjects = [];

    // Calculate the first day of the specified month
    const firstDayOfMonth = new Date(currentYear, monthIndex, 1);
    // Calculate the last day of the specified month
    const lastDayOfMonth = new Date(currentYear, monthIndex + 1, 0);

    // Calculate the previous month and its last day
    const previousMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const previousYear = monthIndex === 0 ? currentYear - 1 : currentYear;
    const lastDayOfPreviousMonth = new Date(currentYear, monthIndex, 0);

    // Calculate the next month and its first day
    const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? currentYear + 1 : currentYear;

    // Fill the overlapping dates of the previous month
    let prevMonthOverlapIndex = firstDayOfMonth.getDay();
    for (let i = prevMonthOverlapIndex - 1; i >= 0; i--) {
        dateObjects.push({
            month: getMonthName(previousMonth),
            date: lastDayOfPreviousMonth.getDate() - i
        });
    }

    // Fill the specified month dates
    for (let i = 0; i < lastDayOfMonth.getDate(); i++) {
        dateObjects.push({
            month: getMonthName(monthIndex),
            date: i + 1
        });
    }

    // Fill the overlapping dates of the next month
    let nextMonthOverlapIndex = dateObjects.length;
    for (let i = 0; i < 35 - nextMonthOverlapIndex; i++) {
        dateObjects.push({
            month: getMonthName(nextMonth),
            date: i + 1
        });
    }

    return dateObjects;
  }
  function getMonthIndex(monthName) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return months.findIndex(month => month.toLowerCase() === monthName.toLowerCase());
  }
  function getMonthName(monthIndex) {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return months[monthIndex];
  }

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <View style={styles.rectStack}>
          <View style={styles.rect}>
            <View style={styles.icon36Row}>
              <TouchableOpacity onPress={decMonth}>
                <EntypoIcon
                  name="arrow-long-left"
                  style={styles.icon36}
                ></EntypoIcon>
              </TouchableOpacity>
              <View style={styles.december2Column}>
                <Text  allowFontScaling={false} style={styles.december2}>{date.year}</Text>
                <Text  allowFontScaling={false} style={styles.december4}>{date.month}</Text>
              </View>
              <TouchableOpacity onPress={incMonth}>
                <EntypoIcon
                  name="arrow-long-right"
                  style={styles.icon37}
                ></EntypoIcon>
              </TouchableOpacity>
            </View>
            <Text  allowFontScaling={false} style={styles.sMTWTFS}>S    M    T   W   T    F    S</Text>
            <View style={styles.rect2StackStackStack}>
              <View style={styles.rect2StackStack}>
                <View style={styles.rect2Stack}>
                  <View style={styles.rect2}></View>
                  <Text  allowFontScaling={false} style={styles.text8}>{calendar[3].date}</Text>
                  <Text  allowFontScaling={false} style={styles.text10}>{calendar[5].date}</Text>
                  <EntypoIcon
                    name="dot-single"
                    style={styles.icon8}
                  ></EntypoIcon>
                  <EntypoIcon
                    name="dot-single"
                    style={styles.icon10}
                  ></EntypoIcon>
                </View>
                <View style={styles.rect4Stack}>
                  <View style={styles.rect4}></View>
                  <EntypoIcon
                    name="dot-single"
                    style={styles.icon}
                  ></EntypoIcon>
                  <EntypoIcon
                    name="dot-single"
                    style={styles.icon6}
                  ></EntypoIcon>
                  <EntypoIcon
                    name="dot-single"
                    style={styles.icon7}
                  ></EntypoIcon>
                  <EntypoIcon
                    name="dot-single"
                    style={styles.icon9}
                  ></EntypoIcon>
                  <EntypoIcon
                    name="dot-single"
                    style={styles.icon11}
                  ></EntypoIcon>
                </View>
                <Text  allowFontScaling={false} style={styles.text}>{calendar[0].date}</Text>
                <Text  allowFontScaling={false} style={styles.text2}>{calendar[7].date}</Text>
                <Text  allowFontScaling={false} style={styles.text6}>{calendar[1].date}</Text>
                <Text  allowFontScaling={false} style={styles.text7}>{calendar[2].date}</Text>
                <Text  allowFontScaling={false} style={styles.text9}>{calendar[4].date}</Text>
                <Text  allowFontScaling={false} style={styles.text11}>{calendar[6].date}</Text>
                <Text  allowFontScaling={false} style={styles.text12}>{calendar[8].date}</Text>
                <Text  allowFontScaling={false} style={styles.text13}>{calendar[9].date}</Text>
                <Text  allowFontScaling={false} style={styles.text14}>{calendar[10].date}</Text>
                <View style={styles.text15Stack}>
                  <Text  allowFontScaling={false} style={styles.text15}>{calendar[11].date}</Text>
                  <Text  allowFontScaling={false} style={styles.text16}>{calendar[12].date}</Text>
                </View>
                <Text  allowFontScaling={false} style={styles.text17}>{calendar[13].date}</Text>
              </View>
              <View style={styles.rect3Stack}>
                <View style={styles.rect3}></View>
                <EntypoIcon name="dot-single" style={styles.icon2}></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon12}
                ></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon13}
                ></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon14}
                ></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon15}
                ></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon16}
                ></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon17}
                ></EntypoIcon>
              </View>
            </View>
            <View style={styles.text3StackRow}>
              <View style={styles.text3Stack}>
                <Text  allowFontScaling={false} style={styles.text3}>15</Text>
                <EntypoIcon name="dot-single" style={styles.icon3}></EntypoIcon>
              </View>
              <View style={styles.text18Stack}>
                <Text  allowFontScaling={false} style={styles.text18}>{calendar[15].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon18}
                ></EntypoIcon>
              </View>
              <View style={styles.text19Stack}>
                <Text  allowFontScaling={false} style={styles.text19}>17</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon19}
                ></EntypoIcon>
              </View>
              <View style={styles.text20Stack}>
                <Text  allowFontScaling={false} style={styles.text20}>{calendar[17].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon20}
                ></EntypoIcon>
              </View>
              <View style={styles.text21Stack}>
                <Text  allowFontScaling={false} style={styles.text21}>{calendar[18].date}</Text>
                <Text  allowFontScaling={false} style={styles.text22}>{calendar[19].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon21}
                ></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon22}
                ></EntypoIcon>
              </View>
              <View style={styles.text23Stack}>
                <Text  allowFontScaling={false} style={styles.text23}>{calendar[20].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon23}
                ></EntypoIcon>
              </View>
            </View>
            <View style={styles.rect5StackStack}>
              <View style={styles.rect5Stack}>
                <View style={styles.rect5}></View>
                <Text  allowFontScaling={false} style={styles.text27}>{calendar[24].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon26}
                ></EntypoIcon>
              </View>
              <View style={styles.text4Stack}>
                <Text  allowFontScaling={false} style={styles.text4}>{calendar[21].date}</Text>
                <EntypoIcon name="dot-single" style={styles.icon4}></EntypoIcon>
              </View>
              <View style={styles.text24Stack}>
                <Text  allowFontScaling={false} style={styles.text24}>{calendar[22].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon24}
                ></EntypoIcon>
              </View>
              <View style={styles.text26Stack}>
                <Text  allowFontScaling={false} style={styles.text26}>{calendar[23].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon25}
                ></EntypoIcon>
              </View>
              <View style={styles.text28Stack}>
                <Text  allowFontScaling={false} style={styles.text28}>{calendar[25].date}</Text>
                <Text  allowFontScaling={false} style={styles.text29}>{calendar[26].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon27}
                ></EntypoIcon>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon28}
                ></EntypoIcon>
              </View>
              <View style={styles.text30Stack}>
                <Text  allowFontScaling={false} style={styles.text30}>{calendar[27].date}</Text>
                <EntypoIcon
                  name="dot-single"
                  style={styles.icon29}
                ></EntypoIcon>
              </View>
            </View>
            <View style={styles.rect6StackStack}>
              <View style={styles.rect6Stack}>
                <View style={styles.rect6}></View>
                <Text  allowFontScaling={false} style={styles.text5}>{calendar[28].date}</Text>
                <Text  allowFontScaling={false} style={styles.text32}>{calendar[31].date}</Text>
                <Text  allowFontScaling={false} style={styles.text33}>{calendar[32].date}</Text>
                <Text  allowFontScaling={false} style={styles.text34}>{calendar[33].date}</Text>
                <Text  allowFontScaling={false} style={styles.text35}>{calendar[34].date}</Text>
              </View>
              <Text  allowFontScaling={false} style={styles.text25}>{calendar[29].date}</Text>
              <Text  allowFontScaling={false} style={styles.text31}>{calendar[30].date}</Text>
            </View>
          </View>
          <EntypoIcon name="dot-single" style={styles.icon5}></EntypoIcon>
          <EntypoIcon name="dot-single" style={styles.icon30}></EntypoIcon>
          <EntypoIcon name="dot-single" style={styles.icon31}></EntypoIcon>
          <EntypoIcon name="dot-single" style={styles.icon32}></EntypoIcon>
          <EntypoIcon name="dot-single" style={styles.icon33}></EntypoIcon>
          <EntypoIcon name="dot-single" style={styles.icon34}></EntypoIcon>
          <EntypoIcon name="dot-single" style={styles.icon35}></EntypoIcon>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 375,
    height: 424
  },
  group: {
    width: 375,
    height: 424
  },
  rect: {
    top: 0,
    left: 0,
    width: 375,
    height: 423,
    position: "absolute",
    backgroundColor: "rgba(210,235,247,0.35)"
  },
  icon36: {
    color: "rgba(3,5,63,1)",
    fontSize: 40,
    height: 44,
    width: 40,
    marginTop: 15
  },
  december2: {
    fontFamily: "roboto-700",
    color: "#121212",
    height: 25,
    width: 137,
    fontSize: 20,
    textAlign: "center"
  },
  december4: {
    fontFamily: "roboto-700",
    color: "#121212",
    height: 35,
    width: 137,
    fontSize: 25,
    textAlign: "center"
  },
  december2Column: {
    height: 60,
    width: 137,
  },
  icon37: {
    color: "rgba(3,5,63,1)",
    fontSize: 40,
    height: 44,
    width: 40,
    marginTop: 15
  },
  icon36Row: {
    height: 60,
    flexDirection: "row",
    marginTop: 8,
    marginLeft: 79,
    marginRight: 79
  },
  sMTWTFS: {
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 353,
    fontSize: 35,
    opacity: 0.8,
    textAlign: "center",
    marginTop: 4,
    marginLeft: 11
  },
  rect2: {
    top: 0,
    left: 0,
    width: 375,
    height: 1,
    position: "absolute",
    backgroundColor: "rgba(17,25,60,0.5)"
  },
  text8: {
    top: 0,
    left: 169,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text10: {
    top: 0,
    left: 265,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon8: {
    top: 20,
    left: 173,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon10: {
    top: 20,
    left: 269,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  rect2Stack: {
    top: 0,
    left: 0,
    width: 375,
    height: 64,
    position: "absolute"
  },
  rect4: {
    top: 40,
    left: 0,
    width: 375,
    height: 1,
    position: "absolute",
    backgroundColor: "rgba(17,25,60,0.5)"
  },
  icon: {
    top: 0,
    left: 20,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon6: {
    top: 0,
    left: 72,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon7: {
    top: 0,
    left: 122,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon9: {
    top: 0,
    left: 223,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon11: {
    top: 0,
    left: 316,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  rect4Stack: {
    top: 20,
    left: 0,
    width: 375,
    height: 44,
    position: "absolute"
  },
  text: {
    top: 1,
    left: 16,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text2: {
    top: 61,
    left: 16,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text6: {
    top: 1,
    left: 67,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text7: {
    top: 1,
    left: 118,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text9: {
    top: 1,
    left: 220,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text11: {
    top: 1,
    left: 312,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text12: {
    top: 61,
    left: 67,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text13: {
    top: 61,
    left: 117,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text14: {
    top: 61,
    left: 169,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text15: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text16: {
    top: 0,
    left: 45,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text15Stack: {
    top: 61,
    left: 220,
    width: 92,
    height: 38,
    position: "absolute"
  },
  text17: {
    top: 61,
    left: 312,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  rect2StackStack: {
    top: 0,
    left: 0,
    width: 375,
    height: 99,
    position: "absolute"
  },
  rect3: {
    top: 43,
    left: 0,
    width: 375,
    height: 1,
    position: "absolute",
    backgroundColor: "rgba(17,25,60,0.5)"
  },
  icon2: {
    top: 0,
    left: 21,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon12: {
    top: 0,
    left: 72,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon13: {
    top: 0,
    left: 122,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon14: {
    top: 0,
    left: 173,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon15: {
    top: 0,
    left: 223,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon16: {
    top: 0,
    left: 269,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon17: {
    top: 0,
    left: 316,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  rect3Stack: {
    top: 77,
    left: 0,
    width: 375,
    height: 44,
    position: "absolute"
  },
  rect2StackStackStack: {
    width: 375,
    height: 121,
    marginTop: 11
  },
  text3: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon3: {
    top: 15,
    left: 5,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text3Stack: {
    width: 47,
    height: 59
  },
  text18: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon18: {
    top: 15,
    left: 5,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text18Stack: {
    width: 47,
    height: 59,
    marginLeft: 4
  },
  text19: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon19: {
    top: 15,
    left: 4,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text19Stack: {
    width: 47,
    height: 59,
    marginLeft: 4
  },
  text20: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon20: {
    top: 15,
    left: 3,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text20Stack: {
    width: 47,
    height: 59,
    marginLeft: 4
  },
  text21: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text22: {
    top: 0,
    left: 45,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon21: {
    top: 15,
    left: 4,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon22: {
    top: 15,
    left: 49,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text21Stack: {
    width: 92,
    height: 59,
    marginLeft: 4
  },
  text23: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon23: {
    top: 15,
    left: 3,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text23Stack: {
    width: 47,
    height: 59
  },
  text3StackRow: {
    height: 59,
    flexDirection: "row",
    marginLeft: 16,
    marginRight: 16
  },
  rect5: {
    top: 0,
    left: 0,
    width: 375,
    height: 1,
    position: "absolute",
    backgroundColor: "rgba(17,25,60,0.5)"
  },
  text27: {
    top: 0,
    left: 169,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon26: {
    top: 16,
    left: 173,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  rect5Stack: {
    top: 0,
    left: 0,
    width: 375,
    height: 60,
    position: "absolute"
  },
  text4: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon4: {
    top: 15,
    left: 6,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text4Stack: {
    top: 1,
    left: 16,
    width: 47,
    height: 59,
    position: "absolute"
  },
  text24: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon24: {
    top: 15,
    left: 5,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text24Stack: {
    top: 1,
    left: 67,
    width: 47,
    height: 59,
    position: "absolute"
  },
  text26: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon25: {
    top: 15,
    left: 4,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text26Stack: {
    top: 1,
    left: 118,
    width: 47,
    height: 59,
    position: "absolute"
  },
  text28: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text29: {
    top: 0,
    left: 45,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon27: {
    top: 15,
    left: 5,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  icon28: {
    top: 15,
    left: 49,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text28Stack: {
    top: 1,
    left: 220,
    width: 92,
    height: 59,
    position: "absolute"
  },
  text30: {
    top: 0,
    left: 0,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  icon29: {
    top: 15,
    left: 3,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40,
    height: 44,
    width: 40
  },
  text30Stack: {
    top: 1,
    left: 312,
    width: 47,
    height: 59,
    position: "absolute"
  },
  rect5StackStack: {
    width: 375,
    height: 60
  },
  rect6: {
    top: 0,
    left: 0,
    width: 375,
    height: 1,
    position: "absolute",
    backgroundColor: "rgba(17,25,60,0.5)"
  },
  text5: {
    top: 0,
    left: 16,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text32: {
    top: 0,
    left: 169,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text33: {
    top: 0,
    left: 220,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text34: {
    top: 0,
    left: 265,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text35: {
    top: 0,
    left: 312,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  rect6Stack: {
    top: 0,
    left: 0,
    width: 375,
    height: 38,
    position: "absolute"
  },
  text25: {
    top: 1,
    left: 67,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  text31: {
    top: 1,
    left: 118,
    position: "absolute",
    fontFamily: "roboto-regular",
    color: "#121212",
    height: 38,
    width: 47,
    fontSize: 25,
    opacity: 0.8,
    textAlign: "center"
  },
  rect6StackStack: {
    width: 375,
    height: 39
  },
  icon5: {
    top: 380,
    left: 22,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40
  },
  icon30: {
    top: 380,
    left: 72,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40
  },
  icon31: {
    top: 380,
    left: 122,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40
  },
  icon32: {
    top: 380,
    left: 173,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40
  },
  icon33: {
    top: 380,
    left: 225,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40
  },
  icon34: {
    top: 380,
    left: 270,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40
  },
  icon35: {
    top: 380,
    left: 316,
    position: "absolute",
    color: "rgba(128,128,128,1)",
    fontSize: 40
  },
  rectStack: {
    width: 375,
    height: 424
  }
});

export default Index;
