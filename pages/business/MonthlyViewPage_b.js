import * as React from 'react';
import { useCallback } from 'react';
import { useRoute } from "@react-navigation/native";
import { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, FlatList, SafeAreaView, View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCalendar from '../../components/FullCalendar/FullCalendar';
import MonthlyViewObject_1 from '../../components/MonthlyViewObject/MonthlyViewObject_1';
import HeaderMenu from '../../components/HeaderMenu/HeaderMenu';
import EntypoIcon from "react-native-vector-icons/Entypo";
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import { useFocusEffect } from '@react-navigation/native';
import { useMemory } from '../../MemoryContext';

const { width, height } = Dimensions.get('window');

const MonthlyViewPage = () => {
    const route = useRoute();
    const [calendar, setCalendar] = useState([]);
    const [monthlyCaseData, setMonthlyCaseData] = useState([]);
    const [dailyCaseData, setDailyCaseData] = useState([]);
    const [currMonth, setCurrMonth] = useState(route.params?.month || new Date().getMonth());
    const [currYear, setCurrYear] = useState(route.params?.year || new Date().getFullYear());
    const [noCases, setNoCases] = useState(styles.noCases);
    const [calSlice1, setCalSlice1] = useState([]);
    const [calSlice2, setCalSlice2] = useState([]);
    const [calSlice3, setCalSlice3] = useState([]);
    const [calSlice4, setCalSlice4] = useState([]);
    const [calSlice5, setCalSlice5] = useState([]);
    const [calSlice6, setCalSlice6] = useState([]);
    const [calStyle, setCalStyle] = useState(styles.show);
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
        }
        const headers = {
          'method': 'POST',
          'headers': {
              'content-type': 'application/json'
          },
          'body': JSON.stringify(data)
        }
        const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/verifySession', headers)
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
            sessionString: myMemory.userInfo.sessionString
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/logout';
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
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify({'surgYear': year, 'months': months}    )
        }
        const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getCases';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        return response;
    }

    async function getDailyCaseData (date, month) {
        var formattedDate = String(date);
        if (date<10) {
            formattedDate = "0" + formattedDate;
        }
        var cases = [];
        monthlyCaseData.map((item) => {
            const adjustedDate = new Date(item.surgdate);
            adjustedDate.setTime(adjustedDate.getTime() - (8 * 60 * 60 * 1000));
            if (JSON.stringify(adjustedDate).slice(9,11) == formattedDate) {
                cases.push(item);
            }
        });
        if (cases.length != 0) {
            const tempArr = cases.sort((a,b) => new Date(a.dateString) - new Date(b.dateString))
            setDailyCaseData(tempArr);
            setNoCases(styles.hiddenText);
        } else {
            setDailyCaseData([]);
            setNoCases(styles.noCases);
        }
    }

    async function generateCalendar(year, month) {
        const caseData = await getCases(year, [month]);
        setMonthlyCaseData(caseData);
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const daysInMonth = endDate.getDate();
        const calendar = [];
        let currentDate = new Date(startDate);
        // Fill in previous month's days if needed
        const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        if (startDayOfWeek > 0) {
            const lastDayOfPreviousMonth = new Date(year, month, 0).getDate();
            const previousMonth = month === 0 ? 11 : month - 1;
            const previousMonthYear = month === 0 ? year - 1 : year;
            for (let i = startDayOfWeek - 1; i >= 0; i--) {
                calendar.push({ 
                    'date': lastDayOfPreviousMonth - i,
                    'month': previousMonth,
                    'dotStyle': styles.hiddenGreyDot,
                    'blockStyle': styles.greyBlock
                });
            }
        }
        // Fill in current month's days
        const today = String(new Date()).slice(0,10);
        for (let i = 1; i <= daysInMonth; i++) {
            var Ivar = String(i);
            if (i<10) {
              Ivar = "0" + Ivar;
            } 
            var positiveCase = [];
            caseData.map((item) => {
                //myDate.setTime(myDate.getTime() - (8 * 60 * 60 * 1000));
                const adjustedDate = new Date(item.surgdate);
                adjustedDate.setTime(adjustedDate.getTime() - (8 * 60 * 60 * 1000));
                if (JSON.stringify(adjustedDate).slice(9,11) == Ivar) {
                    positiveCase.push(item);
                }
            });
            const checkDate = String(new Date(year, month, i)).slice(0,10);
            if (positiveCase.length > 0 && checkDate == today) {
                // case, today
                calendar.push({ 
                    'date': i,
                    'month': month,
                    'dotStyle': styles.dot,
                    'blockStyle': styles.calendarTodayBlock
                });
            }
            if (positiveCase.length > 0 && checkDate != today) {
                // case, not today
                calendar.push({ 
                    'date': i,
                    'month': month,
                    'dotStyle': styles.dot,
                    'blockStyle': styles.calendarBlock
                });
            } 
            if (positiveCase.length == 0 && checkDate == today) {
                // no case, today
                calendar.push({ 
                    'date': i,
                    'month': month,
                    'dotStyle': styles.hiddenBlueDot,
                    'blockStyle': styles.calendarTodayBlock
                });
            } else if (positiveCase.length == 0 && checkDate != today) {
                // no case, not today
                calendar.push({ 
                    'date': i,
                    'month': month,
                    'dotStyle': styles.hiddenWhiteDot,
                    'blockStyle': styles.calendarBlock
                });
            }
        }
        // Fill in next month's days if needed
        const endDayOfWeek = endDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        if (endDayOfWeek < 6) {
            const remainingDays = 6 - endDayOfWeek;
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextMonthYear = month === 11 ? year + 1 : year;
            for (let i = 1; i <= remainingDays; i++) {
                calendar.push({ 
                    'date': i,
                    'month': nextMonth,
                    'dotStyle': styles.hiddenGreyDot,
                    'blockStyle': styles.greyBlock
                });
            }
        }
        return calendar;
    }
    
    function convertMonthToString () {
        const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthArr[currMonth];
    }

    async function incMonth () {
        if (currMonth < 11) {
            const cal = await generateCalendar(currYear, currMonth + 1);
            setCurrMonth(prevMonth => prevMonth + 1);
            setCalendar(cal);
            setDailyCaseData([]);
            setCalSlice1(cal.slice(0,7));
            setCalSlice2(cal.slice(7,14));
            setCalSlice3(cal.slice(14,21));
            setCalSlice4(cal.slice(21,28));
            setCalSlice5(cal.slice(28,35));
            setCalSlice6(cal.slice(35,42));
        } else {
            const cal = await generateCalendar(currYear + 1, 0);
            setCurrMonth(0);
            setCurrYear(prevYear => prevYear + 1);
            setCalendar(cal);
            setDailyCaseData([]);
            setCalSlice1(cal.slice(0,7));
            setCalSlice2(cal.slice(7,14));
            setCalSlice3(cal.slice(14,21));
            setCalSlice4(cal.slice(21,28));
            setCalSlice5(cal.slice(28,35));
            setCalSlice6(cal.slice(35,42));
        }
    }
    async function decMonth () {
        if (currMonth > 0) {
            const cal = await generateCalendar(currYear, currMonth - 1);
            setCurrMonth(prevMonth => prevMonth - 1);
            setCalendar(cal);
            setDailyCaseData([]);
            setCalSlice1(cal.slice(0,7));
            setCalSlice2(cal.slice(7,14));
            setCalSlice3(cal.slice(14,21));
            setCalSlice4(cal.slice(21,28));
            setCalSlice5(cal.slice(28,35));
            setCalSlice6(cal.slice(35,42));
        } else {
            const cal = await generateCalendar(currYear - 1, 11);
            setCurrMonth(11);
            setCurrYear(prevYear => prevYear - 1);
            setCalendar(cal);
            setDailyCaseData([]);
            setCalSlice1(cal.slice(0,7));
            setCalSlice2(cal.slice(7,14));
            setCalSlice3(cal.slice(14,21));
            setCalSlice4(cal.slice(21,28));
            setCalSlice5(cal.slice(28,35));
            setCalSlice6(cal.slice(35,42));
        }
    }

    const fetchCalendarData = async (year, month) => {
        try {
            const data = await generateCalendar(year, month);
            setCalendar(data);
            return data
        } catch (error) {
            console.error('Error fetching calendar data:', error);
        }
    };

    useEffect(() => {
        (async () => {
            await sessionVerify();
            const cal = await fetchCalendarData(currYear || new Date().getFullYear(), currMonth || new Date().getMonth());
            setCalSlice1(cal.slice(0,7));
            setCalSlice2(cal.slice(7,14));
            setCalSlice3(cal.slice(14,21));
            setCalSlice4(cal.slice(21,28));
            setCalSlice5(cal.slice(28,35));
            setCalSlice6(cal.slice(35,42));
            console.log("Monthly View - myMemory: ", myMemory);
        })();    
        
        return () => {};
    }, [])

    const intervalRef = useRef(null);

    async function refresh() {
        const cal = await generateCalendar(currYear, currMonth);
        setCalendar(cal);
        setDailyCaseData([]);
        setCalSlice1(cal.slice(0,7));
        setCalSlice2(cal.slice(7,14));
        setCalSlice3(cal.slice(14,21));
        setCalSlice4(cal.slice(21,28));
        setCalSlice5(cal.slice(28,35));
        setCalSlice6(cal.slice(35,42));
    }

    async function today() {
        const cal = await generateCalendar(new Date().getFullYear(), new Date().getMonth());
        setCurrMonth(new Date().getMonth());
        setCurrYear(new Date().getFullYear());
        setCalendar(cal);
        setDailyCaseData([]);
        setCalSlice1(cal.slice(0,7));
        setCalSlice2(cal.slice(7,14));
        setCalSlice3(cal.slice(14,21));
        setCalSlice4(cal.slice(21,28));
        setCalSlice5(cal.slice(28,35));
        setCalSlice6(cal.slice(35,42));
    }
    
    return (
        <SafeAreaView style={{backgroundColor: "#fff"}}>
            <View style={styles.menuButtons}>
                <TouchableOpacity onPress={openMenu}>
                    <Image source={require('../../assets/icons/menu.png')} style={openStyle}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeMenu}>
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
                          routes: [{ name: "Business Weekly View", params: { month: currMonth, year: currYear} }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>Weekly View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Business List Cases", params: { month: currMonth, year: currYear } }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>List View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Business Settings", params: {month: currMonth, year: currYear} }],
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
            <Text>BUSINESS PAGE</Text>
            <ScrollView style={styles.container}>
                <View style={styles.row}>
                    <View style={styles.monthScroll}>
                        <Text allowFontScaling={false} style={styles.year}>{currYear}</Text>
                        <Text allowFontScaling={false} style={styles.month}>{convertMonthToString()}</Text>
                        <View style={styles.scroll}>
                            <TouchableOpacity onPress={() => decMonth()}>
                                <EntypoIcon 
                                    name="arrow-left" 
                                    style={styles.arrow}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={incMonth}>
                                <EntypoIcon 
                                    name="arrow-right"
                                    style={styles.arrow}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.new} onPress={() => {
                            navigation.reset({
                              index: 0,
                              routes: [{ name: "Business Create New Case", params: { backTo: {name: 'Business Monthly View', params: { month: currMonth, year: currYear }}}}],
                            });
                        }}>
                            <Text allowFontScaling={false} style={styles.newText}>+</Text>
                        </TouchableOpacity>
                        <View style={styles.btnRow}>
                            <TouchableOpacity onPress={() => refresh()}>
                                <Image source={require('../../assets/icons/refresh.png')} style={styles.loadingArrowStyle}/>
                            </TouchableOpacity>                        
                            <TouchableOpacity style={styles.today} onPress={() => today()}>
                                <Text allowFontScaling={false} style={styles.todayText}>Today</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.row}>
                    <Text allowFontScaling={false} style={styles.day}>S</Text>
                    <Text allowFontScaling={false} style={styles.day}>M</Text>
                    <Text allowFontScaling={false} style={styles.day}>T</Text>
                    <Text allowFontScaling={false} style={styles.day}>W</Text>
                    <Text allowFontScaling={false} style={styles.day}>T</Text>
                    <Text allowFontScaling={false} style={styles.day}>F</Text>
                    <Text allowFontScaling={false} style={styles.day}>S</Text>
                </View>
                <View>
                    <View style={styles.calRow}>
                        {calSlice1.map((item, index) => (
                            <TouchableOpacity 
                                key={index + "0"} 
                                style={item.blockStyle}
                                onPress={() => getDailyCaseData(item.date, currMonth)}
                            >
                                <Text allowFontScaling={false}>{item.date}</Text>
                                <EntypoIcon
                                    name="dot-single"
                                    style={item.dotStyle}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.calRow}>
                        {calSlice2.map((item, index) => (
                            <TouchableOpacity 
                                key={index + "1"} 
                                style={item.blockStyle}
                                onPress={() => getDailyCaseData(item.date, currMonth)}
                            >
                                <Text allowFontScaling={false}>{item.date}</Text>
                                <EntypoIcon
                                    name="dot-single"
                                    style={item.dotStyle}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.calRow}>
                        {calSlice3.map((item, index) => (
                            <TouchableOpacity 
                                key={index + "2"} 
                                style={item.blockStyle}
                                onPress={() => getDailyCaseData(item.date, currMonth)}
                            >
                                <Text allowFontScaling={false}>{item.date}</Text>
                                <EntypoIcon
                                    name="dot-single"
                                    style={item.dotStyle}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.calRow}>
                        {calSlice4.map((item, index) => (
                            <TouchableOpacity 
                                key={index + "3"} 
                                style={item.blockStyle}
                                onPress={() => getDailyCaseData(item.date, currMonth)}
                            >
                                <Text allowFontScaling={false}>{item.date}</Text>
                                <EntypoIcon
                                    name="dot-single"
                                    style={item.dotStyle}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.calRow}>
                        {calSlice5.map((item, index) => (
                            <TouchableOpacity 
                                key={index + "4"} 
                                style={item.blockStyle}
                                onPress={() => getDailyCaseData(item.date, currMonth)}
                            >
                                <Text allowFontScaling={false}>{item.date}</Text>
                                <EntypoIcon
                                    name="dot-single"
                                    style={item.dotStyle}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.calRow}>
                        {calSlice6.map((item, index) => (
                            <TouchableOpacity 
                                key={index + "5"}
                                style={item.blockStyle}
                                onPress={() => getDailyCaseData(item.date, currMonth)}
                            >
                                <Text allowFontScaling={false}>{item.date}</Text>
                                <EntypoIcon
                                    name="dot-single"
                                    style={item.dotStyle}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View>
                    <Text allowFontScaling={false} style={noCases}>No Cases or No Date Selected</Text>
                </View>
                <View style={styles.caseBox}>
                    {dailyCaseData.map((item, index) => (
                        <TouchableOpacity key={index} onPress={() => {
                            navigation.reset({
                              index: 0,
                              routes: [{ name: "Business Case Info", params: { backTo: {name: 'Business Monthly View', params: { month: currMonth, year: currYear }}, caseProp: item} }],
                            });
                        }}>
                            <MonthlyViewObject_1 caseProp={item} backTo={"I'm backto"}/>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
    rect5: {
        width: width * 0.8,
        height: 39,
        backgroundColor: "rgba(255,255,255,1)",
        borderRadius: 5,
        marginTop: 16,
        marginLeft: width * 0.11,
        marginBottom: 16
    },
    container: {
        height: height * 0.9,
    },
    row: {
        flexDirection: 'row',
    },
    calRow: {
        flexDirection: 'row',
    },
    btnRow: {
        flexDirection: 'row',
    },
    centered: {
        marginLeft: width * 0.285,
        marginTop: 12
    },
    day: {
        fontWeight: 'medium-bold',
        fontSize: width * 0.105,
        marginLeft: width * 0.035,
        marginRight: width * 0.035,
        color: "#363636"
    },
    loadingArrowStyle: {
        width: width * 0.11,
        height: width * 0.11,
        marginLeft: width * 0.075,
        marginTop: 10,
    },
    calendarBlock: {
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        borderBottomWidth: 1,
        borderBottomColor: "#cfcfcf",
        backgroundColor: '#fff'
    },
    calendarTodayBlock: {
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        borderBottomWidth: 1,
        borderBottomColor: "#cfcfcf",
        backgroundColor: 'rgba(0, 122, 255, 0.15)',
    },
    greyBlock: {
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        backgroundColor: "#8a8a8a",
    },
    dot: {
        fontSize: width * 0.125,
        marginTop: -14,
        marginLeft: width * 0.001,
        color: "#0dd406"
    },
    arrow: {
        fontSize: width * 0.125,
        color: "#fefefe",
    },
    month: {
        fontSize: width * 0.08,
        fontWeight: 'Bold',
        color: "#fefefe"
    },
    year: {
        fontWeight: "medium",
        fontSize: width * 0.07,
        color: "#fefefe"
    },
    noCases: {
        fontSize: width * 0.05,
        marginLeft: width * 0.16,
        marginTop: 25
    },  
    new: {
        backgroundColor: '#8a8a8a',
        marginLeft: width * 0.015,
        width: width * 0.5,
        height: 65,
        marginTop: 15,
        borderRadius: 5
    },
    newText: {
        color: "#fefefe",
        fontSize: width * 0.23,
        marginTop: -27,
        marginLeft: width * 0.18
    },
    hiddenText: {
        display: 'none'
    },
    hiddenGreyDot: {        
        fontSize: width * 0.125,
        marginTop: -12,
        marginLeft: width * 0.001,
        color: "#8a8a8a"
    },
    hiddenBlueDot: {
        fontSize: width * 0.125,
        marginTop: -12,
        marginLeft: width * 0.001,
        color: "rgba(0, 122, 255, 0)"
    },
    hiddenWhiteDot: {
        fontSize: width * 0.125,
        marginTop: -12,
        marginLeft: width * 0.001,
        color: "#fff"
    },
    caseBox: {
        marginBottom: 50
    },
    monthScroll: {
        backgroundColor: 'rgba(0, 122, 255, 0.8)',
        width: width * 0.45,
        marginLeft: width * 0.02,
        marginBottom: 15,
        marginTop: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    scroll: {
        flexDirection: 'row',     
    },
    show: {
        display:'flex'
    },
    today: {
        backgroundColor: "#cfd4cf",
        borderRadius: 5,
        height: 40,
        width: width * 0.25,
        marginLeft: width * 0.08,
        marginTop: 10
    },
    todayText: {
        fontSize: width * 0.06,
        color: "#6f736f",
        marginLeft: width * 0.055,
        marginTop: 7
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

export default MonthlyViewPage;
