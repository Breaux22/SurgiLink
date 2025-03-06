import * as React from 'react';
import { useCallback } from 'react';
import { useRoute } from "@react-navigation/native";
import { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, FlatList, SafeAreaView, View, ScrollView, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCalendar from '../../components/FullCalendar/FullCalendar';
import MonthlyViewObject_1 from '../../components/MonthlyViewObject/MonthlyViewObject_1';
import HeaderMenu from '../../components/HeaderMenu/HeaderMenu';
import EntypoIcon from "react-native-vector-icons/Entypo";
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const MonthlyViewPage = () => {
    const route = useRoute();
    const [masterData, setMasterData] = useState([]);
    const [monthlyCaseData, setMonthlyCaseData] = useState([]);
    const [currMonth, setCurrMonth] = useState(route.params?.month);
    const [currYear, setCurrYear] = useState(route.params?.year);
    const [selectedDate, setSelectedDate] = useState();
    const [calendarComp, setCalendarComp] = useState();
    const [casesComp, setCasesComp] = useState();
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const [casesStyle, setCasesStyle] = useState(styles.collapsed);
    const [menuUp, setMenuUp] = useState(false);
    const navigation = useNavigation(null);
    const [userList, setUserList] = useState(null);
    const [userListStyle, setUserListStyle] = useState(styles.collapsed);
    const [filterValue, setFilterValue] = useState(JSON.stringify({id: null, username: "Everyone"}));
    const [currUser, setCurrUser] = useState(null);

    /*async function storeData (key, value) => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Error saving data', e);
      }
    };

    async function getData (key) => {
      try {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } catch (e) {
        console.error('Error retrieving data', e);
      }
    };*/

    useEffect(() => {
        (async () => {
            try {
                const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
                const tempObj = {id: userInfo.id, username: 'Everyone'};
                setFilterValue(JSON.stringify(tempObj));
                setCurrUser(userInfo);
                const userArr = JSON.parse(userInfo.userList);
                console.log(userArr)
                setUserList(userArr);
            } catch (err) {
                console.log(err)
            }

        })();
        return;
    }, [])

    async function displayRepName(repId) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        if (repId == userInfo.id) {
            return userInfo.username;
        } else {
            const filterUser = userList.filter((item) => item.id == repId);
            return filterUser[0].username;
        }
    }

    async function sessionVerify () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
          username: userInfo.username,
          sessionString: userInfo.sessionString,
          userId: userInfo.id,
          org: userInfo.org,
        }
        const headers = {
          'method': 'POST',
          'headers': {
              'content-type': 'application/json'
          },
          'body': JSON.stringify(data)
        }
        const response = await fetch('https://SurgiLink.replit.app/verifySession', headers)
          .then(response => {
                if (!response.ok){
                    console.error("Error - verifySession()")
                }
                return response.json()
            })
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
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            username: userInfo.username,
            sessionString: userInfo.sessionString,
            userId: userInfo.id
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://SurgiLink.replit.app/logout';
        const response = await fetch(url, headers)
            .then(response => {
                    if (!response.ok){
                        console.error("Error - logout()")
                    }
                    return response.json()
                })
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

    function prevMonth () {
        setSelectedDate(null);
        if (currMonth == 0){
            setCurrMonth(prev => 11);
            setCurrYear(prev => currYear - 1);
        } else {
            setCurrMonth(prev => currMonth - 1);
        }
    }

    function nextMonth () {
        setSelectedDate(null);
        if (currMonth == 11) {
            setCurrMonth(prev => 0);
            setCurrYear(prev => currYear + 1);
        } else {
            setCurrMonth(prev => currMonth + 1);  
        }
    }

    function getMonthString (index) {
        const monthArr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return monthArr[index];
    }

    async function getCases (year, months) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            surgYear: year,
            months: months,
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getCases';
        const url = 'https://SurgiLink.replit.app/getCases';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getCases()")
                }
                return response.json()
            })
            .then(data => {return data})
        const tempArr = [...response];
        setMasterData(tempArr);
        tempArr.sort((a,b) => new Date(a.surgdate) - new Date(b.surgdate));
        if (filterValue) {
            const myObj = JSON.parse(filterValue);
            if (myObj.username == 'Everyone') {
                //console.log("Is Everyone")
                setMonthlyCaseData(tempArr);   
            } else {
                //console.log("Specific User")
                let newArr = tempArr.filter((value, index) => value.rep == myObj.id);
                setMonthlyCaseData(newArr);
            }
        } else {
            setMonthlyCaseData(prev => tempArr);
        }
    }

    function generateBlockList (myDate) {
        const caseList = monthlyCaseData.filter((item) => new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate() == myDate);
        return (
            <View style={{height: height * 0.093, overflow: "hidden"}}>
                {caseList.map((item, index) => (
                    <View key={item.id + "A"} style={{borderRadius: 2, overflow: "hidden", height: height * 0.015, width: width * 0.128, marginLeft: width * 0.005, marginBottom: height * 0.0025, backgroundColor: item.color, }}>
                        <Text allowFontScaling={false} style={{marginLeft: width * 0.005, fontSize: height * 0.0125}}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName.slice(0,10) : "Surgeon?"}</Text>
                    </View>
                ))}
            </View>
        )
    }

    function generateBlockListShort (myDate) {
        const caseList = monthlyCaseData.filter((item) => new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate() == myDate);
        if (caseList.length > 0) {
            return (
                <View style={{borderRadius: 15, width: height * 0.015, height: height * 0.015, alignSelf: "center", backgroundColor: "#a6f296"}}/>
            )
        }
    }

    async function filterMonthlyCaseData (myObj) {
        const parsedObj = JSON.parse(myObj);
        if (String(parsedObj.username) == 'Everyone') {
            setMonthlyCaseData(masterData);
        } else {
            let tempArr = [...masterData];
            let newArr = tempArr.filter((item, index) => String(item.rep) == String(parsedObj.id));
            setMonthlyCaseData(newArr)   
        }
    }

    function formatTo12HourTime(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error("Invalid date string");
        }
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const amPm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; 
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${formattedMinutes} ${amPm}`;
      }

    function fillMonthCasesComp () {
        if (monthlyCaseData.length > 0) {
            setCasesComp(prev =>
                monthlyCaseData.map((item, index) => (
                    <TouchableOpacity
                        key={item.surgdate + "Z" + index}
                        onPress={() => {
                            navigation.reset({
                                index: 0,
                                routes: [{name: 'Case Info', params: {caseProp: item, backTo: {name: 'Monthly View', params: {month: currMonth, year: currYear}}}}]
                            })
                        }}
                        >
                        <View key={item.id} style={{ borderRadius: 5, width: width * 0.9, minHeight: height * 0.125, marginLeft: width * 0.05, marginTop: height * 0.01, backgroundColor: item.color, }}>
                            <View style={[styles.row, { borderBottomWidth: height * 0.0015, width: width * 0.88, marginLeft: width * 0.01, }]}>
                                <Text allowFontScaling={false} style={{width: width * 0.43, fontSize: height * 0.025, }}>{new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getMonth() + 1}/{new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate()} {formatTo12HourTime(new Date(item.surgdate).getTime() + (1000*60*60*8))}</Text>
                                <Text allowFontScaling={false} style={{textAlign: "right", fontSize: height * 0.025, width: width * 0.45}}>{item.proctype.slice(0,15)}...</Text>
                            </View>
                            <Text allowFontScaling={false} style={{fontSize: height * 0.025, marginLeft: width * 0.01, fontWeight: "bold", }}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName: "Surgeon?"}</Text>
                            <Text allowFontScaling={false} style={{fontSize: height * 0.025, marginLeft: width * 0.01, }}>@ {item.facilityName}</Text>
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.01, }}>Rep: {displayRepName(item.rep)}</Text>
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.01, }}>Notes:</Text>
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.01, paddingBottom: width * 0.01, }}>{item.notes !== "" ? item.notes : "~"}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )
        } else {
            setCasesComp(prev => <Text allowFontScaling={false} style={{fontSize: height * 0.03, marginLeft: width * 0.03, color: "#fff", }}>No Cases.</Text>)
        }
    }
    
    function fillCasesComp (myDate) {
        const caseList = monthlyCaseData.filter((item) => new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate() == myDate)
        if (caseList.length > 0) {
            setCasesComp(prev =>
                caseList.map((item, index) => (
                    <TouchableOpacity
                        key={item.surgdate + "B" + index}
                        onPress={() => {
                            navigation.reset({
                                index: 0,
                                routes: [{name: 'Case Info', params: {caseProp: item, backTo: {name: 'Monthly View', params: {month: currMonth, year: currYear}}}}]
                            })
                        }}
                        >
                        <View key={item.id} style={{ borderRadius: 5, width: width * 0.9, minHeight: height * 0.125, marginLeft: width * 0.05, marginTop: height * 0.01, backgroundColor: item.color, }}>
                            <View style={[styles.row, { borderBottomWidth: height * 0.0015, width: width * 0.88, marginLeft: width * 0.01, }]}>
                                <Text allowFontScaling={false} style={{width: width * 0.43, fontSize: height * 0.025, }}>{new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getMonth() + 1}/{new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate()} {formatTo12HourTime(new Date(item.surgdate).getTime() + (1000*60*60*8))}</Text>
                                <Text allowFontScaling={false} style={{textAlign: "right", fontSize: height * 0.025, width: width * 0.45}}>{item.proctype.slice(0,15)}...</Text>
                            </View>
                            <Text allowFontScaling={false} style={{fontSize: height * 0.025, marginLeft: width * 0.01, fontWeight: "bold", }}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName : "Surgeon?"}</Text>
                            <Text allowFontScaling={false} style={{fontSize: height * 0.025, marginLeft: width * 0.01, }}>@ {item.facilityName}</Text>
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.01, }}>Rep: {displayRepName(item.rep)}</Text>
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.01, }}>Notes:</Text>
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.01, paddingBottom: width * 0.01, }}>{item.notes !== "" ? item.notes : "~"}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )
        } else {
            setCasesComp(prev => <Text allowFontScaling={false} style={{fontSize: height * 0.03, marginLeft: width * 0.03, color: "#fff", }}>No Cases.</Text>)
        }
    }

    function generateCalendarCompTall () {
        const prevLastDate = new Date(currYear, currMonth, 0).getDate();
        const firstDay = new Date(currYear, currMonth, 1).getDay();   
        const lastDate = new Date(currYear, currMonth + 1, 0).getDate();
        const nextFirstDay = new Date(currYear, currMonth + 1, 1).getDay();

        let headArr = [];
        for(let i=prevLastDate-firstDay; i<prevLastDate;i++){
            headArr= [...headArr, i];
        }
        let dateArr = [];
        for(let i=0;i<lastDate;i++){
            dateArr = [...dateArr, i];
        }
        let tailArr = [];
        for(let i=0; i<(7-nextFirstDay);i++){
            tailArr = [...tailArr, i];
        }
        setCalendarComp(prev => 
            <View style={{flexDirection: "row", flexWrap: "wrap", borderTopWidth: height * 0.0015, }}>
                {headArr.map((item, index) => (
                    <View key={"A" + item} style={{width: width * 0.1428, height: height * 0.115, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, backgroundColor: "#d6d6d7"}}>
                        <Text allowFontScaling={false}>{item + 1}</Text>
                    </View>
                ))}
                {dateArr.map((item, index) => {
                    let styleChoice = { width: width * 0.1428, height: height * 0.115, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, overflow: "hidden"};
                    const styleB = { backgroundColor: "#c7f4fc", width: width * 0.1428, height: height * 0.115, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, overflow: "hidden", };
                    const today = new Date();
                    if (today.getFullYear() == currYear && today.getMonth() == currMonth && today.getDate() == item+1){styleChoice = styleB}
                    return (
                       <TouchableOpacity 
                           key={"B" + item} style={styleChoice}
                           onPress={() => {
                               setSelectedDate(item + 1)
                               fillCasesComp(item + 1);
                               setCasesStyle(styles.showCasesUp);
                               setMenuUp(true);
                               generateCalendarCompShort();
                           }}
                           >
                           <Text allowFontScaling={false}>{item + 1}</Text>
                           {generateBlockList(item + 1)}
                       </TouchableOpacity>
                    )
                })}
                {tailArr.map((item, index) => (
                    <View key={"C" + item} style={{width: width * 0.1428, height: height * 0.115, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, backgroundColor: "#d6d6d7"}}>
                        <Text allowFontScaling={false}>{item + 1}</Text>
                    </View>
                ))}
            </View>
        )
    }

    async function getUser () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        return userInfo;
    } 

    function generateCalendarCompShort () {
        const prevLastDate = new Date(currYear, currMonth, 0).getDate();
        const firstDay = new Date(currYear, currMonth, 1).getDay();   
        const lastDate = new Date(currYear, currMonth + 1, 0).getDate();
        const nextFirstDay = new Date(currYear, currMonth + 1, 1).getDay();

        let headArr = [];
        for(let i=prevLastDate-firstDay; i<prevLastDate;i++){
            headArr= [...headArr, i];
        }
        let dateArr = [];
        for(let i=0;i<lastDate;i++){
            dateArr = [...dateArr, i];
        }
        let tailArr = [];
        for(let i=0; i<(7-nextFirstDay);i++){
            tailArr = [...tailArr, i];
        }
        setCalendarComp(prev => 
            <View style={{flexDirection: "row", flexWrap: "wrap", borderTopWidth: height * 0.0015, }}>
                {headArr.map((item, index) => (
                    <View key={"D" + item} style={{width: width * 0.1428, height: height * 0.05, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, backgroundColor: "#d6d6d7"}}>
                        <Text allowFontScaling={false}>{item + 1}</Text>
                    </View>
                ))}
                {dateArr.map((item, index) => {
                    let styleChoice = { width: width * 0.1428, height: height * 0.05, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, };
                    const styleB = { backgroundColor: "#c7f4fc", width: width * 0.1428, height: height * 0.05, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, };
                    const today = new Date();
                    if (today.getFullYear() == currYear && today.getMonth() == currMonth && today.getDate() == item+1){styleChoice = styleB}
                    return (
                        <TouchableOpacity 
                            key={"E" + item} style={styleChoice}
                            onPress={() => {
                                setSelectedDate(item + 1)
                                fillCasesComp(item + 1);
                                //setCasesStyle(styles.showCasesUp);
                            }}
                            >
                            <Text allowFontScaling={false}>{item + 1}</Text>
                            {generateBlockListShort(item + 1)}
                        </TouchableOpacity>
                    )
                })}
                {tailArr.map((item, index) => (
                    <View key={"F" + item} style={{width: width * 0.1428, height: height * 0.05, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, backgroundColor: "#d6d6d7"}}>
                        <Text allowFontScaling={false}>{item + 1}</Text>
                    </View>
                ))}
            </View>
        )
    }

    useEffect(() => {
        getCases(currYear, [currMonth + 1]);
    }, [currMonth])

    useEffect(() => {
        fillMonthCasesComp();
        if (menuUp == false) {
            generateCalendarCompTall();
        } else {
            generateCalendarCompShort();
        }
    }, [monthlyCaseData])
        
    return (
        <SafeAreaView style={{backgroundColor: "#fff"}}>
            <Image source={require('../../assets/icons/surgilink-logo.png')} resizeMode="contain" style={{position: "absolute", marginTop: useSafeAreaInsets().top, alignSelf: "center", height: height * 0.05,}}/>
            <View style={styles.row}>
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
                <TouchableOpacity
                    style={{position: "absolute", right: width * 0.01, marginTop: height * 0.005, zIndex: 1, }}
                    onPress={() => {
                        navigation.reset({
                            index: 0,
                            routes: [{name: 'Create New Case', params: {backTo: {name: 'Monthly View', params: {month: currMonth, year: currYear}}}}]
                        })
                    }}
                    >
                    <Image source={require('../../assets/icons/plus-symbol-button.png')} style={{width: height * 0.045, height: height * 0.045, }}/>
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <View style={menuStyle}>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        closeMenu();
                      }}
                      >
                        <Image source={require('../../assets/icons/30-days.png')} style={styles.icon3}/>
                        <Text allowFontScaling={false} style={styles.optionText}>Monthly View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Weekly View", params: { month: currMonth, year: currYear} }],
                        });
                      }}
                      >
                        <Image source={require('../../assets/icons/week-calendar.png')} style={styles.icon3}/>
                        <Text allowFontScaling={false} style={styles.optionText}>Weekly View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "List Cases", params: { month: currMonth, year: currYear } }],
                        });
                      }}
                      >
                        <Image source={require('../../assets/icons/clipboard.png')} style={styles.icon3}/>
                        <Text allowFontScaling={false} style={styles.optionText}>Case List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "List Trays", params: {month: currMonth, year: currYear} }],
                        });
                      }}
                      >
                        <Image source={require('../../assets/icons/baking-tray.png')} style={styles.icon3}/>
                        <Text allowFontScaling={false} style={styles.optionText}>Tray List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Settings", params: {month: currMonth, year: currYear} }],
                        });
                      }}
                      >
                        <Image source={require('../../assets/icons/settings.png')} style={styles.icon3}/>
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
                        <Image source={require('../../assets/icons/logout.png')} style={styles.icon3}/>
                        <Text allowFontScaling={false} style={styles.optionText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={backBlur} onPress={() => closeMenu()}/>
            </View>
            <View style={{height: height * 0.06, flexDirection: "row"}}>
                <TouchableOpacity
                    onPress={() => getCases(currYear, [currMonth + 1])}
                    >
                    <Image source={require('../../assets/icons/refresh.png')} style={{width: height * 0.045, height: height * 0.04, marginLeft: width * 0.02, marginTop: height * 0.01,}}/>
                </TouchableOpacity>
                <View style={{  position: "absolute", right: width * 0.01, top: height * 0.01, flexDirection: "row" }}>
                    {/*<TouchableOpacity
                        onPress={() => {
                            setCurrMonth(prev => new Date().getMonth());
                            setCurrYear(prev => new Date().getFullYear());
                        }}
                        >
                        <Image source={require('../../assets/icons/time.png')} style={{width: height * 0.045, height: height * 0.045,}}/>
                    </TouchableOpacity>*/}
                    <TouchableOpacity
                        onPress={() => {
                            if (JSON.stringify(userListStyle) == JSON.stringify(styles.collapsed)) {
                                setUserListStyle({width: width, height: height * 0.25,});
                            } else {
                                setUserListStyle(styles.collapsed);
                            }
                        }}
                        style={{height: height * 0.04, maxWidth: width * 0.36, borderRadius: 5, marginRight: height * 0.01, backgroundColor: "#d6d6d7", paddingLeft: height * 0.01, paddingRight: height * 0.01 }}
                        >
                        <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={{ textAlign: "center", marginTop: height * 0.009, }}>Calendar: {filterValue && JSON.parse(filterValue).username}</Text>
                    </TouchableOpacity>
                    
                    <View style={{backgroundColor: "#333436", borderRadius: 30, width: height * 0.23}}>                    
                        <View style={{alignSelf: "center", flexDirection: "row"}}>
                            <TouchableOpacity
                                //style={{alignSelf: "center",}}
                                onPress={() => prevMonth()}
                                >
                                <Text style={{color: "#fff", fontSize: height * 0.035, marginTop: - width * 0.005, }}>{"<"}</Text>
                            </TouchableOpacity>
                            <View style={[styles.row, {alignSelf: "center", }]}>
                                <Text style={{textAlign: "center", color: "#4fd697", fontWeight: "bold", fontSize: height * 0.035, }}>{getMonthString(currMonth)}</Text>
                                <Text style={{color: "#fff", textAlign: "center", fontSize: height * 0.035, }}>{currYear}</Text>
                            </View>
                            <TouchableOpacity
                                //style={{alignSelf: "center",}}
                                onPress={() => nextMonth()}>
                                <Text style={{color: "#fff", fontSize: height * 0.035, marginTop: - width * 0.005, }}>{">"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
            <Picker
                selectedValue={filterValue && filterValue}
                onValueChange={(itemValue) => {
                    setFilterValue(itemValue);
                    setUserListStyle(styles.collapsed);
                    filterMonthlyCaseData(itemValue);
                }}
                style={userListStyle}
            >        
                <Picker.Item label={'Everyone'} value={currUser && JSON.stringify({id: currUser.org, username: 'Everyone'})} />
                <Picker.Item label={currUser && currUser.username} value={currUser && JSON.stringify(currUser)} />
                {userList && userList.map((item, index) => (
                    <Picker.Item key={item.username + "A" + index} label={item.username} value={JSON.stringify(item)} />
                ))}
            </Picker>
            <View style={styles.row}>
                <Text allowFontScaling={false} style={{fontSize: height * 0.015, marginLeft: width * 0.053}}>Su</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.015, marginLeft: width * 0.105}}>Mo</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.015, marginLeft: width * 0.105}}>Tu</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.015, marginLeft: width * 0.105}}>We</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.015, marginLeft: width * 0.105}}>Th</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.015, marginLeft: width * 0.105}}>Fr</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.015, marginLeft: width * 0.105}}>Sa</Text>
            </View>
            {calendarComp}
            <View style={casesStyle}>
                <View style={styles.row}>
                    <Text allowFontScaling={false} 
                        style={{color: "#fff", fontSize: height * 0.04, fontStyle: 'italic', marginTop: height * 0.01, marginLeft: width * 0.035, width: width * 0.82}}
                        >
                        {getMonthString(currMonth)}, {selectedDate} {currYear}
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            setMenuUp(false);
                            setCasesStyle(styles.collapsed);
                            generateCalendarCompTall();
                        }}
                        >
                        <Image source={require('../../assets/icons/down-arrow-white.png')} 
                            style={{width: height * 0.065, height: height * 0.065, marginTop: height * 0.01, position: "absolute", bottom: - height * 0.01, right: - width * 0.11, }}
                            />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{width: width, height: height * 0.45, marginTop: height * 0.015,}}>
                    {casesComp}
                    <View style={{height: height * 0.2}}/>
                </ScrollView>
            </View>
            <View style={styles.showCasesDown}>
                <TouchableOpacity
                    onPress={() => {
                        setMenuUp(true);
                        setCasesStyle(styles.showCasesUp)
                        generateCalendarCompShort();
                        fillMonthCasesComp();
                        setSelectedDate(null);
                    }}
                >
                    <Image source={require('../../assets/icons/up-arrow-white.png')} style={{position: "absolute", bottom: - height * 0.07, right: width * 0.03, width: height * 0.065, height: height * 0.065, marginTop: height * 0.01, }}/>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
    light: {
        marginBottom: height * 0.01, 
        height: height * 0.04, 
        width: height * 0.23, 
        backgroundColor: "#ededed", 
        borderRadius: 5, 
        borderWidth: height * 0.00125, 
        textAlign: "center", 
        marginTop: height * 0.01,
    },
    dark: {
        marginBottom: height * 0.01, 
        height: height * 0.04, 
        width: height * 0.23, 
        backgroundColor: "#333436", 
        borderRadius: 5, 
        borderWidth: height * 0.00125, 
        textAlign: "center", 
        marginTop: height * 0.01,
        color: "#fff",
    },
    showCasesUp: {
        position: 'absolute', 
        width: width, 
        height: height * 0.5, 
        backgroundColor: "#333436", 
        marginTop: height * 0.5, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
        zIndex: 1,
    },    
    showCasesDown: {
        position: 'absolute', 
        width: width, 
        height: height * 0.1, 
        backgroundColor: "#333436", 
        marginTop: height * 0.9, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
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
    day: {
        fontWeight: 'medium-bold',
        fontSize: height * 0.05,
        marginTop: - height * 0.02,
        marginLeft: width * 0.035,
        marginRight: width * 0.035,
        color: "#363636"
    },
    loadingArrowStyle: {
        width: width * 0.11,
        height: height * 0.055,
        marginLeft: width * 0.075,
        marginTop: height * 0.01,
    },
    calendarBlock: {
        height: height * 0.14,
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        borderBottomWidth: height * 0.002,
        borderBottomColor: "#cfcfcf",
        backgroundColor: '#fff'
    },
    calendarTodayBlock: {
        height: height * 0.14,
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        borderBottomWidth: height * 0.002,
        borderBottomColor: "#cfcfcf",
        backgroundColor: 'rgba(0, 122, 255, 0.15)',
    },
    greyBlock: {
        height: height * 0.14,
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        backgroundColor: "#8a8a8a",
    },
    dot: {
        fontSize: height * 0.0625,
        marginTop: - height * 0.015,
        marginLeft: width * 0.001,
        color: "#0dd406"
    },
    arrow: {
        fontSize: height * 0.0625,
        color: "#fefefe",
    },
    month: {
        fontSize: height * 0.04,
        fontWeight: 'Bold',
        color: "#fefefe"
    },
    year: {
        fontWeight: "medium",
        fontSize: height * 0.035,
        color: "#fefefe"
    },
    noCases: {
        fontSize: height * 0.025,
        marginLeft: width * 0.16,
        marginTop: height * 0.03,
    },  
    new: {
        backgroundColor: '#8a8a8a',
        marginLeft: width * 0.015,
        width: width * 0.5,
        height: height * 0.085,
        marginTop: height * 0.015,
        borderRadius: 5
    },
    newText: {
        color: "#fefefe",
        fontSize: height * 0.115,
        marginTop: - height * 0.0325,
        marginLeft: width * 0.18
    },
    hiddenText: {
        display: 'none'
    },
    hiddenGreyDot: {        
        fontSize: height * 0.0625,
        marginTop: - height * 0.01,
        marginLeft: width * 0.001,
        color: "#8a8a8a"
    },
    hiddenBlueDot: {
        fontSize: height * 0.0625,
        marginTop: - height * 0.01,
        marginLeft: width * 0.001,
        color: "rgba(0, 122, 255, 0)"
    },
    hiddenWhiteDot: {
        fontSize: height * 0.0625,
        marginTop: - height * 0.01,
        marginLeft: width * 0.001,
        color: "#fff"
    },
    caseBox: {
        marginBottom: height * 0.05,
    },
    monthScroll: {
        backgroundColor: 'rgba(0, 122, 255, 0.8)',
        width: width * 0.45,
        marginLeft: width * 0.02,
        marginBottom: height * 0.015,
        marginTop: height * 0.015,
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
        height: height * 0.125,
        width: height * 0.125,
        marginLeft: width * 0.08,
        marginTop: height * 0.01,
    },
    todayText: {
        fontSize: height * 0.03,
        color: "#6f736f",
        marginLeft: width * 0.055,
        marginTop: height * 0.0075,
    },
    menuButtons: {
        borderBottomWidth: height * 0.00125,
        borderBottomColor: "#cfcfcf",
        height: height * 0.0625,
        width: width,
    },
    collapsed: {
        display: 'none',
    },
    icon3: {
        width: height * 0.05,
        height: height * 0.05,
        marginLeft: width * 0.02,
    },
    menu: {
        position: "absolute", 
        backgroundColor: "#fff", 
        height: height, 
        width: height * 0.35, 
        zIndex: 2,
        opacity: 0.98
    },
    backBlur: {
        backgroundColor: "rgba(0, 0, 0, 0.5)", 
        zIndex: 1, 
        height: height, 
        width: width, 
        position: "absolute",
    },
    option: {
        //backgroundColor: "rgba(0, 122, 255, 0.8)",
        width: width * 0.4,
        height: height * 0.045,
        marginLeft: height * 0.01,
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
        borderRadius: 5,
        flexDirection: "row",
    },
    optionText: {
        //color: "#fff",
        fontSize: height * 0.03,
        textAlign: "center",
        borderBottomWidth: height * 0.0015,
        marginLeft: width * 0.02,
    },
  });

export default MonthlyViewPage;
