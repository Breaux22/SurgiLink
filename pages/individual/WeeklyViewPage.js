import * as React from 'react';
import { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { useRoute } from "@react-navigation/native";
import { Image, StyleSheet, View, ScrollView, Text, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DailyViewCase from '../../components/DailyViewCase/DailyViewCase';
import { useFocusEffect } from '@react-navigation/native';
import { useMemory } from '../../MemoryContext';

const { width, height } = Dimensions.get('window');

const WeeklyViewPage = () => {
    const route = useRoute();
    const [year, setYear] = useState(route.params?.year || new Date().getFullYear());
    const [week, setWeek] = useState(getWeek(route.params?.year, route.params?.month, getFirstSunday(route.params?.year, route.params?.month + 1), 'next'));
    const [month, setMonth] = useState(route.params?.month || new Date().getMonth());
    const [cases, setCases] = useState([]); // replicate getCases() and make a new request pattern for this page
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const navigation = useNavigation();
    const { myMemory, setMyMemory } = useMemory();

    async function saveData (userInfo) {
        setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
    };

    async function sessionVerify () {
        const data = {
          username: myMemory.userInfo.username,
          sessionString: myMemory.userInfo.sessionString,
          userId: myMemory.userInfo.id,
        }
        const headers = {
          'method': 'POST',
          'headers': {
              'content-type': 'application/json'
          },
          'body': JSON.stringify(data)
        }
        const response = await fetch('https://surgiflow.replit.app/verifySession', headers)
          .then(response => response.json())
          .then(data => {return data})

        if (response.myMessage == 'Invalid Session.') {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login", params: {} }],
            });
        }
        return;
    }

    async function logout () {
        const data = {
            username: myMemory.userInfo.username,
            sessionString: myMemory.userInfo.sessionString,
            userId: myMemory.userInfo.id,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/logout';
        const response = await fetch(url, headers)
        return
    }

    async function openMenu() {
        setOpenStyle(styles.collapsed);
        setCloseStyle(styles.icon3);
        setMenuStyle(styles.menu);
        setBackBlur(styles.backBlur);
    }

    async function closeMenu() {
        setCloseStyle(styles.collapsed);
        setOpenStyle(styles.icon3);
        setMenuStyle(styles.collapsed);
        setBackBlur(styles.collapsed);
    }
    
    useFocusEffect(
        useCallback(() => {
          const runOnFocus = () => {
            refresh();
          };
          runOnFocus();
          return () => {
          };
        }, [])
    );

    async function getCases (year, months) {
        if (months[0] == -1) {
            months = [11, 0];
        } else if (months[1] == 12) {
            months = [11, 0]
        }
        const data = {
            surgYear: year, 
            months: months,
            userId: myMemory.userInfo.id,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const response = await fetch('https://surgiflow.replit.app/getCases', headers)
            .then(response => response.json())
            .then(data => {return data})
        return response;
    }

    function getFirstSunday(year, month) {
        const firstDayOfMonth = new Date(year, month - 1, 0);
        const firstSunday = new Date(year, month - 1, 0);
    
        // Find the first Saturday of the month
        while (firstSunday.getDay() !== 0) {
            firstSunday.setDate(firstSunday.getDate() + 1);
        }
    
        // Return the date number of the first Saturday
        return firstSunday.getDate() - 1;
    }

    function formatTo12HourTime(dateString) {
        const date = new Date(dateString);
        let hours = date.getHours(); // 0-23
        const minutes = date.getMinutes(); // 0-59
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // 0 becomes 12 in 12-hour format
        const formattedMinutes = minutes.toString().padStart(2, '0');
        return `${hours}:${formattedMinutes} ${ampm}`;
    }

    useEffect(() => {
        (async () => {
            const caseArray = await getCases(route.params?.year, [route.params?.month - 1, route.params?.month]);
            setCases(caseArray);
        })();
    
        return () => {
        };
    }, []);

    function convertMonthToString (month) {
        const monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthArr[month];
    }

    function getWeek(year, month, date, direction = 'next') {
        const daysInWeek = [];
        const currentDate = new Date(year, month, date);
        const startDate = direction === 'next' ? currentDate : new Date(currentDate.setDate(currentDate.getDate() - 8));
        for (let i = 1; i < 8; i++) {
            const tempDate = new Date(startDate);
            tempDate.setDate(startDate.getDate() + i);
            const dayObj = {
                year: tempDate.getFullYear(),
                month: tempDate.getMonth(),
                monthString: new Date(tempDate.getFullYear(), tempDate.getMonth(), 1).toLocaleString('default', { month: 'long' }),
                day: tempDate.getDate()
            };
            daysInWeek.push(dayObj);
        }
        return daysInWeek;
    }

    async function incWeek() {
        const newWeek = await getWeek(week[6].year, week[6].month, week[6].day, 'next');
        if (newWeek[6].month != month && newWeek[0].month == month) {
            const newCases = await getCases(newWeek[0].year, [newWeek[0].month]);
            const oldCases = await getCases(newWeek[6].year, [newWeek[6].month]);
            setCases(oldCases.concat(newCases));
            setMonth(newWeek[6].month);
        } else if (newWeek[6].month != month && newWeek[0].month != month) {
            const newCases = await getCases(newWeek[0].year, [newWeek[0].month]);
            setCases(newCases);
            setMonth(newWeek[6].month);
        } 
        setWeek(newWeek);
        setYear(week[0].year)
    }
    
    async function decWeek() {
        const newWeek = await getWeek(week[0].year, week[0].month, week[0].day, 'prev');
        if (newWeek[0].month != month && newWeek[6].month == month) {
            const newCases = await getCases(newWeek[0].year, [newWeek[0].month]);
            const oldCases = await getCases(newWeek[6].year, [newWeek[6].month]);
            setCases(oldCases.concat(newCases));
            setMonth(newWeek[0].month);
        } else if (newWeek[0].month != month && newWeek[6].month != month) {
            const newCases = await getCases(newWeek[0].year, [newWeek[0].month]);
            setCases(newCases);
            setMonth(newWeek[0].month);
        } 
        setWeek(newWeek);
        setYear(week[0].year)
    }
    
    async function refresh () {
        const caseArray = await getCases(route.params?.year, [route.params?.month - 1, route.params?.month]);
        setCases(caseArray);
        setWeek(getWeek(week[0].year, week[0].month, week[0].day - 1, 'next'));
        setYear(week[0].year);
    }

    function rearrangeDateString(dateString) {
      const regex = /^(\w+)\s(\d{1,2}),\s(\d{4})\s(\d{2}:\d{2}:\d{2})$/;
      const match = dateString.match(regex);
      if (!match) {
        throw new Error("Invalid date string format");
      }
      const monthName = match[1]; // "January"
      const day = match[2].padStart(2, '0'); // "5" -> "05"
      const year = match[3]; // "2025"
      const time = match[4]; // "12:00:00"
      const months = {
        January: '01',
        February: '02',
        March: '03',
        April: '04',
        May: '05',
        June: '06',
        July: '07',
        August: '08',
        September: '09',
        October: '10',
        November: '11',
        December: '12',
      };
      const month = months[monthName];
      if (!month) {
        throw new Error("Invalid month name in date string");
      }
      return `${year}-${month}-${day}T${time}Z`;
    }

    async function getDailyCases(month, day, year) {
        const newDate = await rearrangeDateString(`${month} ${day}, ${year} 12:00:00`);
        const caseList = [];
        cases.map((myCase) => {
            var adjustedDate = new Date(myCase.surgdate);
            adjustedDate.setTime(adjustedDate.getTime() - (8 * 60 * 60 * 1000));
            if (newDate.slice(0,10) == JSON.stringify(adjustedDate).slice(1,11)) {
                caseList.push(myCase);
            }
        })
        return caseList;
    }

    return (
        <SafeAreaView style={{backgroundColor: "#fff"}}>
            <TouchableOpacity
                style={{position: "absolute", marginLeft: width * 0.89, marginTop: width * 0.125, zIndex: 1, }}
                onPress={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'Create New Case', params: {backTo: {name: 'Weekly View', params: {month: month, year: year}}}}]
                    })
                }}
                >
                <Image source={require('../../assets/icons/plus-symbol-button.png')} style={{width: width * 0.09, height: width * 0.09, }}/>
            </TouchableOpacity>
            <View style={styles.menuButtons}>
                <TouchableOpacity 
                    style={{width: width * 0.2, }}
                    onPress={openMenu}
                    >
                    <Image source={require('../../assets/icons/menu.png')} style={openStyle}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: width * 0.2, }}
                    onPress={closeMenu}
                    >
                    <Image source={require('../../assets/icons/close.png')} style={closeStyle}/>
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <View style={menuStyle}>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Monthly View", params: { month: month, year: year } }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>Monthly View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "List Cases", params: { month: month, year: year } }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>Case List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "List Trays", params: {month: month, year: year} }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>Tray List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Settings", params: {month: month, year: year} }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        logout();
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Login", params: {} }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <View style={backBlur}></View>
            </View>
            <ScrollView style={styles.container}>
                <View style={styles.row}>
                    <TouchableOpacity onPress={() => refresh()}>
                        <Image source={require('../../assets/icons/refresh.png')} style={styles.refreshArrowStyle}/>
                    </TouchableOpacity>
                    <View>
                        <Text  allowFontScaling={false}  style={styles.year}>{year}</Text>
                    </View>
                    <TouchableOpacity style={styles.new} onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Create New Case", params: {backTo: {name: "Weekly View", params: {month: month, year: year}}}}],
                        });
                    }}>
                        <Text  allowFontScaling={false}  style={styles.newText}>+</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.weekSelect}>
                    <TouchableOpacity style={styles.prev} onPress={() => decWeek()}>
                        <Text  allowFontScaling={false}  style={styles.title}>{'<'} </Text>
                    </TouchableOpacity>
                    <View style={{flex: 1, alignItems: 'center', textAlign: 'center'}}>
                        <Text  allowFontScaling={false}  style={styles.title}>{week[0].monthString.slice(0,3)} {week[0].day} - {week[6].monthString.slice(0,3)} {week[6].day}</Text>
                    </View>
                    <TouchableOpacity style={styles.next} onPress={() => incWeek()}>
                        <Text  allowFontScaling={false}  style={styles.title}> {'>'}</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <DailyViewCase day={"Sunday"} backTo={{name: "Weekly View", params: {month: month, year: year}}} navigation={navigation} week={week[0]} cases={getDailyCases(week[0].monthString, week[0].day, week[0].year)}  />
                </View>
                <View>
                    <DailyViewCase day={"Monday"} backTo={{name: "Weekly View", params: {month: month, year: year}}} navigation={navigation} week={week[1]} cases={getDailyCases(week[1].monthString, week[1].day, week[1].year)}  />
                </View>
                <View>
                    <DailyViewCase day={"Tuesday"} backTo={{name: "Weekly View", params: {month: month, year: year}}} navigation={navigation} week={week[2]} cases={getDailyCases(week[2].monthString, week[2].day, week[2].year)}  />
                </View>
                <View>
                    <DailyViewCase day={"Wednesday"} backTo={{name: "Weekly View", params: {month: month, year: year}}} navigation={navigation} week={week[3]} cases={getDailyCases(week[3].monthString, week[3].day, week[3].year)}  />
                </View>
                <View>
                    <DailyViewCase day={"Thursday"} backTo={{name: "Weekly View", params: {month: month, year: year}}} navigation={navigation} week={week[4]} cases={getDailyCases(week[4].monthString, week[4].day, week[4].year)}  />
                </View>
                <View>
                    <DailyViewCase day={"Friday"} backTo={{name: "Weekly View", params: {month: month, year: year}}} navigation={navigation} week={week[5]} cases={getDailyCases(week[5].monthString, week[5].day, week[5].year)}  />
                </View>
                <View>
                    <DailyViewCase day={"Saturday"} backTo={{name: "Weekly View", params: {month: month, year: year}}} navigation={navigation} week={week[6]} cases={getDailyCases(week[6].monthString, week[6].day, week[6].year)}  />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginBottom: 40,
    },
    row: {
        flexDirection: 'row'
    },
    year: {
        fontSize: width * 0.1,
        marginLeft: width * 0.18,
        fontWeight: "bold",
        opacity: "0.5"
    },
    weekSelect: {
        flexDirection: 'row',
        marginBottom: 15,
        width: width * 0.97,
        textAlign: 'center' 
    },
    title: {
        fontSize: width * 0.06,
        marginTop: 5,
        textAlign: 'center',
    },
    refreshArrowStyle: {
        height: width * 0.12,
        width: width * 0.12,
        marginLeft: width * 0.08,
    },
    new: {
        backgroundColor: "#8a8a8a",
        width: width * 0.12,
        height: width * 0.12,
        marginLeft: width * 0.219,
        borderRadius: 5,
        marginBottom: 10
    },
    newText: {
        color: "#fefefe",
        fontSize: width * 0.18,
        marginTop: -23,
        marginLeft: width * 0.007
    },
    next: {
        backgroundColor: "#cfcfcf",
        width: width * 0.25,
        height: 40,
        borderRadius: 5
    },
    prev: {
        backgroundColor: "#cfcfcf",
        marginLeft: 15,
        width: width * 0.25,
        height: 40,
        borderRadius: 5
    },
    menuButtons: {
        borderBottomWidth: width * 0.002,
        borderBottomColor: "#cfcfcf",
        height: width * 0.124
    },
    collapsed: {
        display: 'none',
    },
    icon3: {
        width: width * 0.1,
        height: width * 0.1,
        marginLeft: width * 0.02,
    },
    menu: {
        position: "absolute", 
        backgroundColor: "#fff", 
        height: height, 
        width: width * 0.7, 
        zIndex: 1, 
        opacity: 0.98
    },
    backBlur: {
        backgroundColor: "rgba(211, 211, 211, 0.5)", 
        zIndex: 1, 
        height: height, 
        width: width * 0.3, 
        position: "absolute", 
        marginLeft: width * 0.7
    },
    option: {
        //backgroundColor: "rgba(0, 122, 255, 0.8)",
        width: width * 0.4,
        height: width * 0.09,
        marginLeft: width * 0.02,
        marginTop: width * 0.04,
        marginBottom: width * 0.02,
        borderBottomWidth: 1,
        borderRadius: 5
    },
    optionText: {
        //color: "#fff",
        fontSize: width * 0.06,
        marginTop: width * 0.0075,
        textAlign: "center"
    },
});

export default WeeklyViewPage;
