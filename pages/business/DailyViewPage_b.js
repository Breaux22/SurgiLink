import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Button, ScrollView, SafeAreaView, View, Image, Text, TouchableOpacity, StyleSheet, FlatList, TouchableHighlight, Dimensions } from 'react-native';
import { useRoute } from "@react-navigation/native"
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DailyViewDate from '../../components/DailyViewDate/DailyViewDate';
import MonthlyViewObject from '../../components/MonthlyViewObject/MonthlyViewObject';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const DailyViewPage = ({ navigation }) => {
    const route = useRoute();
    const dayString = route.params?.dayString;
    const [cases, setCases] = useState(route.params?.cases);
    const [day, setDay] = useState(route.params?.week.day);
    const [monthString, setMonthstring] = useState(route.params?.week.monthString);
    const [month, setMonth] = useState(route.params?.week.month)
    const [year, setYear] = useState(route.params?.week.year);
    const [caseList, setCaseList] = useState([]);
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);

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

    async function generateCaseList (newCases=cases, calledBy='init', date=day) {
        var dayVar = String(date);
        if (date < 10) {
            dayVar = "0" + dayVar;
        }
        if (calledBy == 'init') {
            const caseArr = [];
            newCases.map((myCase, index) => {
                var adjustedDate = new Date(myCase.surgdate);
                adjustedDate.setTime(adjustedDate.getTime() - (8 * 60 * 60 * 1000));
                if (JSON.stringify(adjustedDate).slice(9,11) == dayVar) {
                    caseArr.push(myCase);
                }
            })
            caseArr.sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
            setCaseList(caseArr);
            return
        }
        if (calledBy == 'dec') {
            const caseArr = [];
            newCases.map((myCase, index) => {
                var adjustedDate = new Date(myCase.surgdate);
                adjustedDate.setTime(adjustedDate.getTime() - (8 * 60 * 60 * 1000));
                if (JSON.stringify(adjustedDate).slice(9,11) == dayVar) {
                    caseArr.push(myCase);
                }
            })
            caseArr.sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
            return caseArr;
        } else if (calledBy == 'inc') {
            /*const output = await newCases.filter(myCase => Number(myCase.surgdate.slice(8,10)) - 1 == date);
            return output;*/
            const caseArr = [];
            newCases.map((myCase, index) => {
                var adjustedDate = new Date(myCase.surgdate);
                adjustedDate.setTime(adjustedDate.getTime() - (8 * 60 * 60 * 1000));
                if (JSON.stringify(adjustedDate).slice(9,11) == dayVar) {
                    caseArr.push(myCase);
                }
            })
            caseArr.sort((a, b) => new Date(a.dateString) - new Date(b.dateString));
            return caseArr;
        }
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

    async function refresh() {
        const newCases = await getDayCases(year, month);
        await generateCaseList(newCases);
    }
 
      useEffect(() => {
        if (cases) {
          generateCaseList();
        }
      }, [cases]);

    async function getDayCases(year, month, day) {
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify({surgYear: year, months: [month] })
        }
        const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getCases', headers)
            .then(response => response.json())
            .then(data => {
                return data;
            })
        return response;
    }

    async function generateMonthString(myMonth) {
        const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthArr[myMonth];
    }

    async function getAdjacentDate(year, month, day, direction) {
        // Create a date object from the provided year, month, and day
        let date = new Date(year, month, day);
        // Adjust the date based on the direction parameter
        if (direction === 'before') {
            date.setDate(date.getDate() - 1);
        } else if (direction === 'after') {
            date.setDate(date.getDate() + 1);
        } else {
            throw new Error("Invalid direction. Use 'before' or 'after'.");
        }
        
        // Extract the new year, month, and day from the adjusted date object
        let newYear = date.getFullYear();
        let newMonth = date.getMonth(); // Months are zero-based
        let newDay = date.getDate();
        
        return { year: newYear, month: newMonth, day: newDay };
    }

    async function incDay() {
       const newDate = await getAdjacentDate(year, month, day, 'after');
       const newCases = await getDayCases(newDate.year, newDate.month, newDate.day);
       setDay(newDate.day);
       setMonth(newDate.month);
       setYear(newDate.year);
       const caseList = await generateCaseList(newCases, 'inc', newDate.day);
       setCaseList(caseList);
    }

    async function decDay() {
        const newDate = await getAdjacentDate(year, month, day, 'before');
        const newCases = await getDayCases(newDate.year, newDate.month, newDate.day);
        setDay(newDate.day);
        setMonth(newDate.month);
        setYear(newDate.year);
        const caseList = await generateCaseList(newCases, 'dec', newDate.day);
        setCaseList(caseList);
    }

    return (
        <SafeAreaView>
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
                          routes: [{ name: "Business Weekly View", params: { month: month, year: year} }],
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
                          routes: [{ name: "List Cases", params: {month: month, year: year} }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>List View</Text>
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
            <ScrollView>
                <View style={styles.roundBox}>
                    <View style={styles.dateStrings}>
                        <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.text}>{year}</Text>
                        <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.text}>{monthString}, {day}</Text>
                        <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.text}>{dayString}</Text>
                    </View>
                    <View>
                        <TouchableOpacity style={styles.addBox} onPress={() => navigation.navigate('Create New Case')}>
                            <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.addText}>+</Text>
                        </TouchableOpacity>
                        <View style={styles.row}>                    
                            <TouchableOpacity style={styles.left} onPress={() => decDay()}>
                                <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.leftText}>{'<'} </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.right} onPress={() => incDay()}>
                                <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.rightText}> {'>'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.timeContainer}>
                    <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false}   allowFontScaling={false} >12 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T00:00:00Z") <= adjusted && adjusted < new Date(snip + "T01:00:00Z")) {
                                return (<TouchableOpacity key={index + "a"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false}   allowFontScaling={false} >1 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T01:00:00Z") <= adjusted && adjusted < new Date(snip + "T02:00:00Z")) {
                                return (<TouchableOpacity key={index + "b"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false}   allowFontScaling={false} >2 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T02:00:00Z") <= adjusted && adjusted < new Date(snip + "T03:00:00Z")) {
                                return (<TouchableOpacity key={index + "c"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}   allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false}   allowFontScaling={false} >3 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T03:00:00Z") <= adjusted && adjusted < new Date(snip + "T04:00:00Z")) {
                                return (<TouchableOpacity key={index + "d"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >4 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T04:00:00Z") <= adjusted && adjusted < new Date(snip + "T05:00:00Z")) {
                                return (<TouchableOpacity key={index + "e"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >5 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T05:00:00Z") <= adjusted && adjusted < new Date(snip + "T06:00:00Z")) {
                                return (<TouchableOpacity key={index + "f"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >6 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T06:00:00Z") <= adjusted && adjusted < new Date(snip + "T07:00:00Z")) {
                                return (<TouchableOpacity key={index + "g"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >7 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T07:00:00Z") <= adjusted && adjusted < new Date(snip + "T08:00:00Z")) {
                                return (<TouchableOpacity key={index + "h"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >8 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T08:00:00Z") <= adjusted && adjusted < new Date(snip + "T09:00:00Z")) {
                                return (<TouchableOpacity key={index + "i"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >9 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T09:00:00Z") <= adjusted && adjusted < new Date(snip + "T10:00:00Z")) {
                                return (<TouchableOpacity key={index + "j"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >10 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T10:00:00Z") <= adjusted && adjusted < new Date(snip + "T11:00:00Z")) {
                                return (<TouchableOpacity key={index + "k"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >11 AM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T11:00:00Z") <= adjusted && adjusted < new Date(snip + "T12:00:00Z")) {
                                return (<TouchableOpacity key={index + "l"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >12 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T12:00:00Z") <= adjusted && adjusted < new Date(snip + "T13:00:00Z")) {
                                return (<TouchableOpacity key={index + "m"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >1 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T13:00:00Z") <= adjusted && adjusted < new Date(snip + "T14:00:00Z")) {
                                return (<TouchableOpacity key={index + "n"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >2 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T14:00:00Z") <= adjusted && adjusted < new Date(snip + "T15:00:00Z")) {
                                return (<TouchableOpacity key={index + "o"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >3 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T15:00:00Z") <= adjusted && adjusted < new Date(snip + "T16:00:00Z")) {
                                return (<TouchableOpacity key={index + "p"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >4 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T16:00:00Z") <= adjusted && adjusted < new Date(snip + "T17:00:00Z")) {
                                return (<TouchableOpacity key={index + "q"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >5 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T17:00:00Z") <= adjusted && adjusted < new Date(snip + "T18:00:00Z")) {
                                return (<TouchableOpacity key={index + "r"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >6 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T18:00:00Z") <= adjusted && adjusted < new Date(snip + "T19:00:00Z")) {
                                return (<TouchableOpacity key={index + "s"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >7 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T19:00:00Z") <= adjusted && adjusted < new Date(snip + "T20:00:00Z")) {
                                return (<TouchableOpacity key={index + "t"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >8 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T20:00:00Z") <= adjusted && adjusted < new Date(snip + "T21:00:00Z")) {
                                return (<TouchableOpacity key={index + "u"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >9 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T21:00:00Z") <= adjusted && adjusted < new Date(snip + "T22:00:00Z")) {
                                return (<TouchableOpacity key={index + "v"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >10 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T22:00:00Z") <= adjusted && adjusted < new Date(snip + "T23:00:00Z")) {
                                return (<TouchableOpacity key={index + "w"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                    <Text  allowFontScaling={false}  style={styles.dashLine}> - - - - - - - - - - - - - - - - - - - - - - - - - - - - </Text>
                    <View style={styles.timeLine}>
                        <Text  allowFontScaling={false} >11 PM</Text>
                        <View>{caseList.map((myCase, index) => {
                            var adjusted = new Date(myCase.surgdate);
                            adjusted.setTime(adjusted.getTime() - (8 * 60 * 60 * 1000));
                            const snip = JSON.stringify(adjusted).slice(1,11);
                            if (new Date(snip + "T23:00:00Z") <= adjusted) {
                                return (<TouchableOpacity key={index + "x"} onPress={() => navigation.navigate('Case Info', {caseProp: myCase})}>
                                    <MonthlyViewObject caseProp={myCase}/>
                                </TouchableOpacity>)
                            }
                        })}</View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
    roundBox: {
        backgroundColor: '#c2d9fc',
        flexDirection: 'row',
        padding: width * 0.02
    },  
    text: {
        fontSize: width * 0.09,
        color: "#011b42",
    },
    row: {
        flexDirection: 'row'
    },
    timeContainer: {
        marginBottom: 60  
    },
    dashLine: {
      fontSize: width * 0.05,
      opacity: 0.15
    },
    timeLine: {
        flexDirection: "row",
        marginLeft: width * 0.01,
        opacity: 1
    },
    addBox: {  
        backgroundColor: '#ffffff',
        width: width * .4,
        marginLeft: -(width * 0.11),
        borderRadius: 5
    },
    addText: {
        fontSize: width * 0.13,
        marginLeft: width * 0.165,
        marginTop: -3
    },
    left: {
        backgroundColor: '#ffffff',
        borderRadius: 5,
        height: 60,
        width: width * 0.19,
        marginTop: 7,
        marginLeft: -(width * 0.11)
    },
    leftText: {
        fontSize: width * 0.16,
        marginLeft: width * 0.045,
        marginTop: -10,
    },
    right: {
        backgroundColor: '#ffffff',
        borderRadius: 5,
        height: 60,
        width: width * 0.19,
        marginTop: 7,
        marginLeft: width * 0.019
    },
    rightText: {
        fontSize: width * 0.16,
        marginLeft: width * 0.02,
        marginTop: -10,
    },
    dateStrings: {
        width: width * 0.66
    },
    menu: {
        backgroundColor: "#EFEFEF4",
        marginTop: width * 0.05,
        marginLeft: width * 0.02,
    },
    option: {
        backgroundColor: "rgba(0, 122, 255, 0.8)",
        width: width * 0.4,
        height: width * 0.09,
        marginBottom: width * 0.02,
        borderRadius: 5
    },
    optionText: {
        color: "#fff",
        fontSize: width * 0.06,
        marginTop: width * 0.0075,
        textAlign: "center"
    },
    menuButtons: {
      borderBottomWidth: width * 0.002,
      borderBottomColor: "#cfcfcf",
      height: width * 0.124,
      flexDirection: "row",
      marginBottom: width * 0.02
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
        backgroundColor: "#d6d7d8", 
        height: height, 
        width: width * 0.5, 
        zIndex: 1, 
        marginTop: width * 0.24, 
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

export default DailyViewPage;