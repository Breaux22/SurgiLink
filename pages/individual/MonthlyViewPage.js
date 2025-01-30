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
    const [monthlyCaseData, setMonthlyCaseData] = useState([]);
    const [currMonth, setCurrMonth] = useState(route.params?.month || new Date().getMonth());
    const [currYear, setCurrYear] = useState(route.params?.year || new Date().getFullYear());
    const [calendarComp, setCalendarComp] = useState();
    const [casesComp, setCasesComp] = useState();
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const [casesStyle, setCasesStyle] = useState(styles.collapsed);
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
            userId: myMemory.userInfo.id
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

    /*useFocusEffect(
        useCallback(() => {
          const runOnFocus = () => {
            refresh();
          };
          runOnFocus();
          return () => {
          };
        }, [])
      );*/

    function prevMonth () {
        if (currMonth == 0){
            setCurrMonth(prev => 11);
            setCurrYear(prev => currYear - 1);
        } else {
            setCurrMonth(prev => currMonth - 1);
        }
    }

    function nextMonth () {
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
        const url = 'https://surgiflow.replit.app/getCases';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setMonthlyCaseData(prev => response);
    }

    function generateBlockList (myDate) {
        const caseList = monthlyCaseData.filter((item) => new Date(item.surgdate).getDate() == myDate);
        return (
            caseList.map((item, index) => (
                <View key={item.id} style={{borderRadius: 2, width: width * 0.128, marginLeft: width * 0.005, marginBottom: width * 0.005, backgroundColor: "#a6f296"}}>
                    <Text allowFontScaling={false} style={{fontSize: width * 0.025}}>{item.hosp.slice(0,9)}</Text>
                </View>
            ))
        )
    }

    function fillCasesComp (myDate) {
        const caseList = monthlyCaseData.filter((item) => new Date(item.surgdate).getDate() == myDate);
        setCasesComp(prev =>
            caseList.map((item, index) => (
                <View key={item.id} style={{borderRadius: 5, width: width * 0.9, marginLeft: width * 0.05, marginBottom: width * 0.02, backgroundColor: "#dae9f7"}}>
                    <Text allowFontScaling={false} style={{fontSize: width * 0.025}}>{item.hosp.slice(0,9)}</Text>
                </View>
            ))
        )
    }

    function generateCalendarComp () {
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
            <View style={{flexDirection: "row", flexWrap: "wrap", borderTopWidth: width * 0.003, }}>
                {headArr.map((item, index) => (
                    <View key={"A" + item} style={{width: width * 0.1428, height: width * 0.28, borderBottomWidth: width * 0.003, borderRightWidth: width * 0.003, backgroundColor: "#d6d6d7"}}>
                        <Text allowFontScaling={false}>{item + 1}</Text>
                    </View>
                ))}
                {dateArr.map((item, index) => (
                    <TouchableOpacity 
                        key={"B" + item} style={{width: width * 0.1428, height: width * 0.28, borderBottomWidth: width * 0.003, borderRightWidth: width * 0.003, }}
                        onPress={() => {
                            fillCasesComp(item);
                            setCasesStyle(styles.showCases);
                        }}
                        >
                        <Text allowFontScaling={false}>{item + 1}</Text>
                        {generateBlockList(item)}
                    </TouchableOpacity>
                ))}
                {tailArr.map((item, index) => (
                    <View key={"C" + item} style={{width: width * 0.1428, height: width * 0.28, borderBottomWidth: width * 0.003, borderRightWidth: width * 0.003, backgroundColor: "#d6d6d7"}}>
                        <Text allowFontScaling={false}>{item + 1}</Text>
                    </View>
                ))}
            </View>
        )
    }

    useEffect(() => {
        getCases(currYear, [currMonth]);
    }, [currMonth])

    useEffect(() => {
        generateCalendarComp ();
    }, [monthlyCaseData])
        
    return (
        <SafeAreaView style={{backgroundColor: "#fff"}}>
            <TouchableOpacity
                style={{position: "absolute", marginLeft: width * 0.89, marginTop: width * 0.125, }}
                onPress={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'New Case', params: {backTo: {name: 'Monthly View', params: {month: currMonth, year: currYear}}}}]
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
                          routes: [{ name: "Weekly View", params: { month: currMonth, year: currYear} }],
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
                          routes: [{ name: "List Cases", params: { month: currMonth, year: currYear } }],
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
                          routes: [{ name: "List Trays", params: {month: currMonth, year: currYear} }],
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
                          routes: [{ name: "Settings", params: {month: currMonth, year: currYear} }],
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
            <View style={{padding: width * 0.021, flexDirection: "row"}}>
                <TouchableOpacity
                    onPress={() => getCases(currYear, currMonth)}
                    >
                    <Image source={require('../../assets/icons/refresh.png')} style={{width: width * 0.09, height: width * 0.09}}/>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginLeft: width * 0.29}}
                    onPress={() => {
                        setCurrMonth(prev => new Date().getMonth());
                        setCurrYear(prev => new Date().getFullYear());
                    }}
                    >
                    <Image source={require('../../assets/icons/time.png')} style={{width: width * 0.09, height: width * 0.09}}/>
                </TouchableOpacity>
                <View style={{backgroundColor: "#333436", width: width * 0.48, marginLeft: width * 0.01, borderRadius: 30, flexDirection: "row"}}>
                    <TouchableOpacity
                        onPress={() => prevMonth()}
                        >
                        <Text style={{color: "#fff", fontSize: width * 0.07, marginLeft: width * 0.02, marginTop: - width * 0.005, }}>{"<"}</Text>
                    </TouchableOpacity>
                    <View style={styles.row}>
                        <Text style={{color: "#4fd697", fontWeight: "bold", fontSize: width * 0.07, marginLeft: width * 0.01, width: width * 0.16, }}>{getMonthString(currMonth)}</Text>
                        <Text style={{color: "#fff", fontSize: width * 0.07, width: width * 0.18, }}>{currYear}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => nextMonth()}>
                        <Text style={{color: "#fff", fontSize: width * 0.07, marginTop: - width * 0.005, }}>{">"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {calendarComp}
            <View style={casesStyle}>
                <TouchableOpacity
                    onPress={() => setCasesStyle(styles.collapsed)}
                    >
                    <Image source={require('../../assets/icons/close-white.png')} style={{width: width * 0.07, height: width * 0.07, marginLeft: width * 0.89, marginTop: width * 0.04, }}/>
                </TouchableOpacity>
                <ScrollView style={{width: width, height: width * 0.9}}>
                    {casesComp}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
    showCases: {
        position: 'absolute', 
        width: width, 
        height: height * 0.5, 
        backgroundColor: "#333436", 
        marginTop: height * 0.5, 
        borderTopLeftRadius: 30, 
        borderTopRightRadius: 30, 
    },
    rect5: {
        width: width * 0.8,
        height: width * 0.08,
        backgroundColor: "rgba(255,255,255,1)",
        borderRadius: 5,
        marginTop: width * 0.03,
        marginLeft: width * 0.11,
        marginBottom: width * 0.03,
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
        marginTop: width * 0.02,
    },
    day: {
        fontWeight: 'medium-bold',
        fontSize: width * 0.105,
        marginTop: - width * 0.04,
        marginLeft: width * 0.035,
        marginRight: width * 0.035,
        color: "#363636"
    },
    loadingArrowStyle: {
        width: width * 0.11,
        height: width * 0.11,
        marginLeft: width * 0.075,
        marginTop: width * 0.02,
    },
    calendarBlock: {
        height: width * 0.28,
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        borderBottomWidth: width * 0.004,
        borderBottomColor: "#cfcfcf",
        backgroundColor: '#fff'
    },
    calendarTodayBlock: {
        height: width * 0.28,
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        borderBottomWidth: width * 0.004,
        borderBottomColor: "#cfcfcf",
        backgroundColor: 'rgba(0, 122, 255, 0.15)',
    },
    greyBlock: {
        height: width * 0.28,
        paddingLeft: width * 0.006,
        paddingRight: width * 0.008,
        borderLeftColor: "#cfcfcf",
        borderLeftWidth: width * 0.0025,
        backgroundColor: "#8a8a8a",
    },
    dot: {
        fontSize: width * 0.125,
        marginTop: - width * 0.03,
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
        marginTop: width * 0.06
    },  
    new: {
        backgroundColor: '#8a8a8a',
        marginLeft: width * 0.015,
        width: width * 0.5,
        height: width * 0.17,
        marginTop: width * 0.03,
        borderRadius: 5
    },
    newText: {
        color: "#fefefe",
        fontSize: width * 0.23,
        marginTop: - width * 0.065,
        marginLeft: width * 0.18
    },
    hiddenText: {
        display: 'none'
    },
    hiddenGreyDot: {        
        fontSize: width * 0.125,
        marginTop: - width * 0.02,
        marginLeft: width * 0.001,
        color: "#8a8a8a"
    },
    hiddenBlueDot: {
        fontSize: width * 0.125,
        marginTop: - width * 0.02,
        marginLeft: width * 0.001,
        color: "rgba(0, 122, 255, 0)"
    },
    hiddenWhiteDot: {
        fontSize: width * 0.125,
        marginTop: - width * 0.02,
        marginLeft: width * 0.001,
        color: "#fff"
    },
    caseBox: {
        marginBottom: width * 0.1,
    },
    monthScroll: {
        backgroundColor: 'rgba(0, 122, 255, 0.8)',
        width: width * 0.45,
        marginLeft: width * 0.02,
        marginBottom: width * 0.03,
        marginTop: width * 0.03,
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
        height: width * 0.11,
        width: width * 0.25,
        marginLeft: width * 0.08,
        marginTop: width * 0.02,
    },
    todayText: {
        fontSize: width * 0.06,
        color: "#6f736f",
        marginLeft: width * 0.055,
        marginTop: width * 0.015,
    },
    menuButtons: {
        borderBottomWidth: width * 0.0025,
        borderBottomColor: "#cfcfcf",
        height: width * 0.124,
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
        borderBottomWidth: width * 0.003,
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
