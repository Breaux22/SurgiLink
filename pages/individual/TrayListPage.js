import * as React from 'react';
import { useState, useEffect } from 'react';
import { Image, Button, ScrollView, SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCaseData from '../../components/FullCaseData/FullCaseData';
import ConsignmentSet from '../../components/ConsignmentSet/ConsignmentSet';
import { useRoute } from "@react-navigation/native";
import { utcToZonedTime, format } from 'date-fns-tz';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const ListPage = () => {
    const route = useRoute();
    const month = route.params?.month;
    const year = route.params?.year;
    const navigation = useNavigation();
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [trays, setTrays] = useState(null);
    const [traysComp, setTraysComp] = useState(null);
    const [futureUses, setFutureUses] = useState([]);
    const [usesComp, setUsesComp] = useState(null);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const [styleList, setStyleList] = useState([]);
    const [currTrayObj, setCurrTrayObj] = useState();
    const [currTray, setCurrTray] = useState('');
    const [prevTray, setPrevTray] = useState('');
    const [location, setLocation] = useState('');
    const [prevLocation, setPrevLocation] = useState('')
    const [prevStyle, setPrevStyle] = useState(styles.collapsed);
    const [nameStyle, setNameStyle] = useState(false);
    const [nameEditStyle, setNameEditStyle] = useState(styles.collapsed);
    const [locationStyle, setLocationStyle] = useState(false);
    const [locationEditStyle, setLocationEditStyle] = useState(styles.collapsed);
    const [styleA, setStyleA] = useState(styles.prevG);
    const [styleB, setStyleB] = useState(styles.prevY);
    const [styleC, setStyleC] = useState(styles.prevR);
    const [newTray, setNewTray] = useState(false);
    const [newTrayText, setNewTrayText] = useState('');
    const [trayNotes, setTrayNotes] = useState('');
    const [prevNotes, setPrevNotes] = useState('');
    const [notesEdit, setNotesEdit] = useState(false);

    async function makeStyleList (list) {
        var tempArr = list.map((item) => (styles.collapsed))
        setStyleList(tempArr);
    }

    async function sessionVerify () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
          username: userInfo.username,
          sessionString: userInfo.sessionString,
          userId: userId.id,
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
        return;
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

    async function prevMonth () {
        if (month === 0) {
            getCases(year - 1, [11]);
            setMonth(11);
            setYear((prevYear) => prevYear - 1);
        } else {
            getCases(year, [month - 1]);
            setMonth((prevMonth) => prevMonth - 1);
        }
    }

    async function nextMonth () {
        if (month === 11) {
            getCases(year + 1, [0]);
            setMonth(0);
            setYear((prevYear) => prevYear + 1);
        } else {
            getCases(year, [month + 1]);
            setMonth((prevMonth) => prevMonth + 1);
        }
    }

    async function convertMonthToString (myMonth) {
        const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthArr[myMonth];
    }

    async function addTray () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
            trayName: newTrayText,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://SurgiLink.replit.app/addTray';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - addTray()")
                } else {
                    getTrays();
                    getTrayUses();
                    return;
                }
            })
    }

    async function getTrays () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
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
        const url = 'https://SurgiLink.replit.app/getTrays';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getTrays()")
                }
                return response.json()
            })
            .then(data => {
                setTrays(prev => data);
                return;
            })
        return;
    }

    async function getTrayUses () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
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
        const url = 'https://SurgiLink.replit.app/getTrayUses';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getTrayUses()")
                }
                return response.json()
            })
            .then(data => {return data})
        const tempArr = [...response];
        tempArr.sort((a,b) => new Date(a.surgdate) - new Date(b.surgdate));
        setFutureUses(tempArr);
        return;
    }

    async function updateTrayLocation (index) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            trayId: currTrayObj.id,
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
            location: location
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://SurgiLink.replit.app/updateTrayLocation';
        const response = await fetch(url, headers)
            .then(response => {
                    if (!response.ok){
                        console.error("Error - updateTrayLocation()")
                    }
                    getTrays();
                    getTrayUses();
                    return response.json()
                })
        return;
    }

    async function updateTrayNotes () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            trayId: currTrayObj.id,
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
            trayNotes: trayNotes
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://SurgiLink.replit.app/updateTrayNotes';
        const response = await fetch(url, headers)
            .then(response => {
                    if (!response.ok){
                        console.error("Error - updateTrayNotes()")
                    }
                    getTrays();
                    getTrayUses();
                    return response.json()
                })
        return;
    }

    async function updateTrayName () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            trayId: currTrayObj.id,
            newName: currTray,
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
        const url = 'https://SurgiLink.replit.app/updateTrayName';
        const response = await fetch(url, headers)
            .then(response => {
                    if (!response.ok){
                        console.error("Error - getFacilities()")
                    }
                    getTrays();
                    getTrayUses();
                    return response.json()
                })
        return;
    }

    function formatDate(dateInput) {
      const date = new Date(dateInput);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits
      const year = date.getFullYear();
      return `${month}, ${day} ${year}`;
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

    function ifStar (index) {
        if (futureUses[index].length == 0) {
            return styles.collapsed;
        } else {
            let positive = 0;
            for (const use of futureUses[index]) {
                if (0 < Math.round((((new Date(use.surgdate))-(new Date())))/(1000*60*60*24)) && Math.round((((new Date(use.surgdate))-(new Date())))/(1000*60*60*24)) < 4) {
                    positive = 1;
                }
            }
            if (positive == 1) {
                return styles.icon2;
            } else {
                return styles.collapsed;
            }
        }
        return;
    }

    function daysFormat (surgdate) {
        const formatted = new Date(surgdate.getTime() + (1000*60*60*8));
        const today = new Date();
        const hoursToEnd = 24 - today.getHours();
        const hoursFuture = (formatted.getTime() - today.getTime())/(1000*60*60);
        const daysFuture = Math.round((hoursFuture + today.getHours())/24);
        if (daysFuture == 0) {
            if (hoursFuture >= 0) {
                return `TODAY, In ${Math.round(hoursFuture)} Hours`;   
            } else {
                return `STARTED ${Math.round(-hoursFuture)} Hours Ago`;
            }
        } else {
            if (daysFuture > 365) {
                    return `In ${Math.round(daysFuture/365)} Year/s`; 
            } else if (daysFuture > 31) {
                return `In ${Math.round(daysFuture/31)} Month/s`;
            } else {
                return `In ${daysFuture} Day/s`;
            }
        }
        
    }

    function cellColor (index) {
        if (index % 2 == 1) {
            return "#d6d6d7";
        } else {
            return "#fff";
        }
        return;
    }

    function fillUsesComp (myTray, myIndex) {
        setFutureUses(prevFutureUses => {
            const usesArr = prevFutureUses.filter((item) => 
                new Date().getTime() <= new Date(item.surgdate).getTime()
                && String(item.trayId) == String(myTray.id));
            setCurrTray(prev => myTray.trayName);
            setPrevTray(myTray.trayName);
            setCurrTrayObj(myTray);
            setLocation(prev => myTray.location);
            setPrevLocation(myTray.location);
            setTrayNotes(prev => myTray.trayNotes);
            setPrevNotes(myTray.trayNotes);
            if (usesArr.length > 0) {
                setUsesComp(prev => 
                    <View>
                        <View style={{height: height * 0.4}}>
                            {usesArr.map((item, index) => (
                                <TouchableOpacity
                                    key={item + index}
                                    style={{backgroundColor: item.color, width: width * 0.85, minHeight: height * 0.15, borderRadius: 5, borderWidth: height * 0.001, marginBottom: height * 0.01, padding: width * 0.01, }}
                                    onPress={() => {
                                        navigation.reset({
                                            index: 0,
                                            routes: [{
                                                name: "Case Info",
                                                params: {
                                                    caseProp: item,
                                                    backTo: {
                                                        name: "List Trays",
                                                        params: {month: month, year: year}
                                                    }
                                                }
                                            }]
                                        })
                                    }}
                                    >
                                    <Text allowFontScaling={false} style={{fontSize: height * 0.02, width: width * 0.82,  borderBottomWidth: height * 0.001,}}>{daysFormat(new Date(item.surgdate))} @ {formatTo12HourTime(new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)))}</Text>
                                    <Text allowFontScaling={false} style={{fontWeight: "bold", fontSize: height * 0.025,}}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName : "Surgeon?"}</Text>
                                    <Text allowFontScaling={false} style={{fontSize: height * 0.02, width: width * 0.8,}}>{item.proctype !== '' ? item.proctype : "~"}</Text>
                                    <Text allowFontScaling={false} style={{fontWeight: "bold", fontStyle: "italic"}}>Notes:</Text>
                                    <Text allowFontScaling={false} style={{fontSize: height * 0.02, width: width * 0.8,}}>{item.notes !== '' ? item.notes : "~"}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )
            } else {
                setUsesComp(prev => 
                    <View>
                        <Text allowFontScaling={false} style={{fontSize: height * 0.025, fontStyle: "italic", marginLeft: width * 0.02, }}>None.</Text>
                    </View>
                )   
            }
            setPrevStyle(styles.preview);
            
            // keep state of future uses
            return prevFutureUses;
        })
    }

    function fillTraysComp () {
        setTraysComp(prev => 
            trays.map((item, index) => (
                    <TouchableOpacity
                        key={item + index}
                        onPress={() => fillUsesComp(item, index)}
                        style={{width: width * 0.96, height: height * 0.05, borderBottomWidth: height * 0.001, borderRightWidth: height * 0.001, marginLeft: width * 0.02, flexDirection: "row", backgroundColor: cellColor(index),}}
                        >
                        <Text allowFontScaling={false} style={{borderLeftWidth: height * 0.001, width: width * 0.477, fontWeight: "bold", fontSize: height * 0.02, paddingLeft: width * 0.015, paddingTop: height * 0.01,}}>{item.trayName}</Text>
                        <Text allowFontScaling={false} style={{borderLeftWidth: height * 0.001, width: width * 0.477, fontWeight: "bold", fontSize: height * 0.02, paddingLeft: width * 0.015,  paddingTop: height * 0.01,}}>{item.location}</Text>
                    </TouchableOpacity>
            ))
        )
        return;
    }

    useEffect(() => {
        getTrays();
        getTrayUses();
    }, [])

    useEffect(() => {
        if (trays !== null) {
            fillTraysComp();
        }
    }, [trays])

    return (
        <SafeAreaView style={styles.container}>
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
                            routes: [{name: 'Create New Case', params: {backTo: {name: 'Monthly View', params: {month: month, year: year}}}}]
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
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Monthly View", params: { month: month, year: year } }],
                        });
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
                          routes: [{ name: "Weekly View", params: { month: month, year: year } }],
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
                          routes: [{ name: "List Cases", params: { month: month, year: year } }],
                        });
                      }}
                      >
                        <Image source={require('../../assets/icons/clipboard.png')} style={styles.icon3}/>
                        <Text allowFontScaling={false} style={styles.optionText}>Case List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        closeMenu();
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
                          routes: [{ name: "Settings", params: { month: month, year: year } }],
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
            <Text allowFontScaling={false} style={{opacity: 0.4, marginLeft: width * 0.02, marginTop: height * 0.01,}}>*you can also edit trays in Settings</Text>
            {!newTray && <TouchableOpacity
                onPress={() => setNewTray(true)}
                >
                <Text allowFontScaling={false} style={{
                    height: height * 0.05,
                    width: width * 0.96,
                    backgroundColor: "#ededed",
                    borderRadius: 5,
                    borderWidth: height * 0.001,
                    marginLeft: width * 0.02,
                    marginTop: height * 0.01,
                    marginBottom: height * 0.01,
                    textAlign: "center",
                    fontSize: height * 0.03,
                    paddingTop: height * 0.005,
                }}>Add New Tray +</Text>
            </TouchableOpacity>}
            {newTray && <View style={styles.row}>
                <TextInput 
                    allowFontScaling={false}
                    value={newTrayText}
                    onChangeText={(input) => setNewTrayText(input)}
                    placeholder={"Enter New Tray Name"}
                    style={{
                        height: height * 0.05,
                        width: width * 0.8,
                        backgroundColor: "#ededed",
                        borderRadius: 5,
                        borderWidth: height * 0.001,
                        marginLeft: width * 0.02,
                        marginTop: height * 0.01,
                        marginBottom: height * 0.01,
                        padding: height * 0.005,
                    }}
                    />
                <TouchableOpacity
                    onPress={() => {
                        addTray();
                        setNewTrayText('');
                        setNewTray(false)
                    }}
                    >
                    <Text allowFontScaling={false} style={{
                        height: height * 0.05,
                        width: width * 0.15,
                        backgroundColor: "#d6d6d7",
                        textAlign: "center",
                        marginTop: height * 0.01,
                        marginLeft: width * 0.01,
                        marginBottom: height * 0.01,
                        borderRadius: 5,
                        fontSize: height * 0.025,
                        paddingTop: height * 0.01,
                    }}>Save</Text>
                </TouchableOpacity>
            </View>}
            <View style={styles.columns}>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Tray</Text>
                </View>
                <View style={[styles.cell, {borderLeftWidth: height * 0.0015, borderColor: "#d6d6d6", }]}>
                    <Text allowFontScaling={false} style={styles.columnText}>Current Location</Text>
                </View>
            </View>
            <ScrollView style={{minHeight: height * 0.74, maxHeight: height * 0.74, }}>
                {traysComp}
            </ScrollView>
            
            {/* #### BEGIN PREVIEW SECTION #### */}
            
            <View style={prevStyle}>
                <ScrollView style={{backgroundColor: "#fff", width: width * 0.9, minHeight: height * 0.8, maxHeight: height * 0.8, marginLeft: width * 0.05, marginTop: height * 0.035, padding: width * 0.023,}}>
                    <TouchableOpacity
                        onPress={() => {
                            setPrevStyle(styles.collapsed);
                            setUsesComp(null);
                        }}
                        >
                        <Image source={require('../../assets/icons/close.png')} style={{width: height * 0.05, height: height * 0.05, }}/>
                    </TouchableOpacity>
                    
                    <View style={[styles.row, {marginTop: height * 0.01,}]}>
                        <Text allowFontScaling={false} style={{marginBottom: height * 0.005, fontSize: height * 0.02,}}>Tray Name:</Text>
                        {!nameStyle && <TouchableOpacity
                            onPress={() => {
                                setNameStyle(true);
                            }}
                            style={{position: "absolute", right: height * 0.01,}}
                            >
                            <Text allowFontScaling={false} style={{color: "rgba(0, 122, 255, 0.8)", fontSize: height * 0.02,}}>- Edit</Text>
                        </TouchableOpacity>}
                        {nameStyle && <View style={[styles.row, {position: "absolute", right: width * 0.006}]}>
                                <TouchableOpacity
                                onPress={() => {
                                    setNameStyle(false);
                                    setCurrTray(prevTray);
                                }}
                                style={{ width: width * 0.2, paddingLeft: width * 0.01, paddingRight: width * 0.01, borderRadius: 5, borderWidth: height * 0.00125,}}
                                >
                                <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={() => {
                                    setNameStyle(false);
                                    updateTrayName();
                                    setPrevTray(currTray);
                                }}
                                style={{ width: width * 0.2, paddingLeft: width * 0.01, paddingRight: width * 0.01, borderRadius: 5, borderWidth: height * 0.00125,}}
                                >
                                <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", }}>Save</Text>
                                </TouchableOpacity>
                            </View>}
                    </View>
                    {!nameStyle && <Text allowFontScaling={false} style={{fontSize: height * 0.02, fontWeight: "bold", marginBottom: height * 0.015,}}>{currTray}</Text>}
                    {nameStyle && <TextInput
                        value={currTray}
                        placeholder="Enter Unique Name of Tray"
                        style={{padding: height * 0.005, width: width * 0.85, height: height * 0.03, backgroundColor: "#ededed", borderRadius: 5, borderWidth: height * 0.00125, marginBottom: height * 0.01,}}
                        onChangeText={(input) => setCurrTray(input)}
                        />}
                    <View style={styles.row}>
                        <Text allowFontScaling={false} style={{marginBottom: height * 0.005, fontSize: height * 0.02,}}>Tray Location:</Text>
                        {!locationStyle && <TouchableOpacity
                            onPress={() => {
                                setLocationStyle(true);
                            }}
                            style={{position: "absolute", right: height * 0.01,}}
                            >
                            <Text allowFontScaling={false} style={{color: "rgba(0, 122, 255, 0.8)", fontSize: height * 0.02,}}>- Edit</Text>
                        </TouchableOpacity>}
                        {locationStyle && <View style={[styles.row, {position: "absolute", right: width * 0.006}]}>
                                <TouchableOpacity
                                onPress={() => {
                                    setLocationStyle(false);
                                    setLocation(prevLocation);
                                }}
                                style={{ width: width * 0.2, paddingLeft: width * 0.01, paddingRight: width * 0.01, borderRadius: 5, borderWidth: height * 0.00125,}}
                                >
                                <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={() => {
                                    setLocationStyle(false);
                                    updateTrayLocation();
                                    setPrevLocation(location);
                                }}
                                style={{ width: width * 0.2, paddingLeft: width * 0.01, paddingRight: width * 0.01, borderRadius: 5, borderWidth: height * 0.00125,}}
                                >
                                <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", }}>Save</Text>
                                </TouchableOpacity>
                            </View>}
                    </View>
                    {!locationStyle && <Text allowFontScaling={false}  style={{fontSize: height * 0.02, fontWeight: "bold", marginBottom: height * 0.015,}}>{location}</Text>}
                    {locationStyle && <TextInput 
                        value={location}
                        placeholder="Enter Tray Current Location"
                        style={{padding: height * 0.005, width: width * 0.85, height: height * 0.03, backgroundColor: "#ededed", borderRadius: 5, borderWidth: height * 0.00125, marginBottom: height * 0.01,}}
                        onChangeText={(input) => setLocation(input)}
                        />}
                    <View style={styles.row}>
                        <Text allowFontScaling={false} style={{marginBottom: height * 0.005, fontSize: height * 0.02,}}>Tray Notes:</Text>
                        {!notesEdit && <TouchableOpacity
                            onPress={() => {
                                setNotesEdit(true);
                            }}
                            style={{position: "absolute", right: height * 0.01,}}
                            >
                            <Text allowFontScaling={false} style={{color: "rgba(0, 122, 255, 0.8)", fontSize: height * 0.02,}}>- Edit</Text>
                        </TouchableOpacity>}
                        {notesEdit && 
                            <View style={[styles.row, {position: "absolute", right: width * 0.006}]}>
                                <TouchableOpacity
                                onPress={() => {
                                    setNotesEdit(false);
                                    setTrayNotes(prevNotes);
                                }}
                                style={{ width: width * 0.2, paddingLeft: width * 0.01, paddingRight: width * 0.01, borderRadius: 5, borderWidth: height * 0.00125,}}
                                >
                                <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                onPress={() => {
                                    setNotesEdit(false);
                                    updateTrayNotes();
                                    setPrevNotes(trayNotes);
                                }}
                                style={{ width: width * 0.2, paddingLeft: width * 0.01, paddingRight: width * 0.01, borderRadius: 5, borderWidth: height * 0.00125,}}
                                >
                                <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", }}>Save</Text>
                                </TouchableOpacity>
                            </View>}
                    </View>
                    {!notesEdit && <Text allowFontScaling={false} e style={{fontSize: height * 0.02, marginBottom: height * 0.02, textAlign: "justify", width: width * 0.85,}}>{trayNotes}</Text>}
                    {notesEdit && <TextInput 
                        multiline={true}
                        scrollable={true}
                        value={trayNotes}
                        placeholder="Missing Instruments, etc..."
                        style={{padding: height * 0.01, width: width * 0.85, height: height * 0.1, backgroundColor: "#ededed", borderRadius: 5, borderWidth: height * 0.00125,}}
                        onChangeText={(input) => setTrayNotes(input)}
                        />}
                    <Text allowFontScaling={false} style={{fontSize: height * 0.025, marginBottom: height * 0.01, }}>Upcoming Cases:</Text>
                    {usesComp}
                    <View style={{height: height * 0.1}}/>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    nameEdit: {
        fontWeight: "bold",
        fontSize: height * 0.02,
        flexDirection: "row",
    },
    container: {
        backgroundColor: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
    },
    nav: {
        flexDirection: "row",
        marginLeft: width * 0.025,
    },
    new: {
        backgroundColor: "#8a8a8a",
        width: width * 0.17,
        height: height * 0.057,
        marginLeft: width * 0.36,
        marginTop: - height * 0.0225,
        borderRadius: 5,
    },
    newText: {
        color: "#fefefe",
        fontSize: height * 0.09,
        marginTop: - height * 0.0175,
        marginLeft: width * 0.035
    },
    monthYear: {
        fontSize: height * 0.03,
        width: width * 0.56,
        marginLeft: width * 0.02,
        marginTop: height * 0.005,
    },
    arrow: {
        backgroundColor: "rgba(0, 122, 255, 0.8)",
        width: width * 0.2,
        height: height * 0.05,
        borderRadius: 5,
        margin: width * 0.025,
    },
    arrow2: {
        backgroundColor: "rgba(0, 122, 255, 0.8)",
        width: width * 0.2,
        height: height * 0.05,
        borderRadius: 5,
        marginTop: height * 0.015,
    },
    arrowIcon: {
        width: height * 0.03,
        height: height * 0.03,
        marginLeft: width * 0.06,
        marginTop: height * 0.01
    },      
    arrowIcon2: {
          width: height * 0.03,
          height: height * 0.03,
          marginLeft: width * 0.075,
          marginTop: height * 0.01
    },
    statBox: {
        width: width * 0.984,
        minheight: height * 0.055,
        maxHeight: height * 0.2,
        paddingTop: height * 0.01,
        borderWidth: height * 0.001,
        marginTop: - height * 0.001
    },
    grid: {
        width: width * 0.985,
        height: height * 0.79,
    },
    columns: {
        flexDirection: 'row',
        marginLeft: width * 0.02,
        backgroundColor: "#333436",
        width: width * 0.96,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    columnText: {
        color: "#ffffff",
        fontSize: height * 0.02
    },
    cell: {
        flexDirection: "row",
        width: width * 0.477,
        minheight: height * 0.051,
        padding: height * 0.005,
    },
    prevG: {
        backgroundColor: "#32a852",
        width: width * 0.27,
        height: height * 0.045,
        borderRadius: 5,
        marginTop: height * 0.005,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.065,
        paddingTop: height * 0.0065,
    },
    prevGB: {
        backgroundColor: "#32a852",
        borderWidth: height * 0.0025,
        width: width * 0.27,
        height: height * 0.045,
        borderRadius: 5,
        marginTop: height * 0.005,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.06,
        paddingTop: height * 0.004,
    },
    prevY: {
        backgroundColor: "#d1cc6f",
        width: width * 0.27,
        height: height * 0.045,
        borderRadius: 5,
        marginTop: height * 0.005,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.12,
        paddingTop: height * 0.0065
    },
    prevYB: {
        backgroundColor: "#d1cc6f",
        borderWidth: height * 0.0025,
        width: width * 0.27,
        height: height * 0.045,
        borderRadius: 5,
        marginTop: height * 0.005,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.115,
        paddingTop: height * 0.004
    },
    prevR: {
        backgroundColor: "#d16f6f",
        width: width * 0.27,
        height: height * 0.045,
        borderRadius: 5,
        marginTop: height * 0.005,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.085,
        paddingTop: height * 0.0065,
    },
    prevRB: {
        backgroundColor: "#d16f6f",
        borderWidth: height * 0.0025,
        width: width * 0.27,
        height: height * 0.045,
        borderRadius: 5,
        marginTop: height * 0.005,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.08,
        paddingTop: height * 0.004
    },
    cellGreen: {
          backgroundColor: "#32a852",
          borderLeftWidth: height * 0.001,
          borderBottomWidth: height * 0.001,
          height: height * 0.051,
          padding: height * 0.005,
    },
    cellYellow: {
          backgroundColor: "#d1cc6f",
          borderLeftWidth: height * 0.001,
          borderBottomWidth: height * 0.001,
          height: height * 0.051,
          padding: height * 0.005,
    },
    cellRed: {
          backgroundColor: "#d16f6f",
          borderLeftWidth: height * 0.001,
          borderBottomWidth: height * 0.001,
          height: height * 0.051,
          padding: height * 0.005,
    },
    cellDark: {
        flexDirection: "row",
        borderLeftWidth: height * 0.001,
        borderBottomWidth: height * 0.001,
        width: width * 0.44,
        height: height * 0.051,
        padding: height * 0.005,
        backgroundColor: "#d4d6d6",
    },
    cellText: {
        fontSize: height * 0.0175,
    },
    preview: {
        zIndex: 1,
        position: "absolute",
        width: width,
        minHeight: height * 0.89,
        overflow: "hidden",
        marginTop: height * 0.1225,
        backgroundColor: "rgba(51,52,54, 0.6)",
        opacity: 1,
    },
    smallButton: {
        backgroundColor: '#e3dede',
        width: width * 0.235,
        height: height * 0.04,
        borderRadius: 5,
        marginTop: height * 0.005,
        marginLeft: width * 0.01,
    },
    collapsed: {
        display: 'none'
    },
    menu: {
        position: "absolute", 
        backgroundColor: "#fff", 
        height: height, 
        width: height * 0.35, 
        zIndex: 3,
        opacity: 0.98
    },
    backBlur: {
        backgroundColor: "rgba(0, 0, 0, 0.5)", 
        zIndex: 2, 
        height: height, 
        width: width, 
        position: "absolute",
    },
    option: {
        width: width * 0.4,
        height: height * 0.045,
        marginLeft: height * 0.01,
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
        borderRadius: 5,
        flexDirection: "row",
    },
    optionText: {
        fontSize: height * 0.03,
        marginTop: height * 0.00375,
        textAlign: "center",
        borderBottomWidth: height * 0.001,
        marginLeft: width * 0.02,
    },
    menuButtons: {
          borderBottomWidth: height * 0.00125,
          borderBottomColor: "#cfcfcf",
          height: height * 0.0625,
          width: width,
    },
    icon1: {
        width: height * 0.025,
        height: height * 0.025,
        marginLeft: width * 0.02,
        marginBottom: height * 0.005,
        opacity: 0.4
    },
    icon2: {
          position: "absolute",
          width: height * 0.025,
          height: height * 0.025,
          marginLeft: width * 0.38,
          marginTop: height * 0.005,
    },
    icon3: {
          width: height * 0.05,
          height: height * 0.05,
          marginLeft: width * 0.02,
    },
    closeIcon: {
        width: height * 0.05,
        height: height * 0.05,
        marginLeft: - width * 0.18,
    },
});

export default ListPage;