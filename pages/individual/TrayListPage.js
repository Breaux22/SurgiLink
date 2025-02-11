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
import { useMemory } from '../../MemoryContext';

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
    const { myMemory, setMyMemory } = useMemory();
    const [currTrayObj, setCurrTrayObj] = useState();
    const [currTray, setCurrTray] = useState('');
    const [location, setLocation] = useState('');
    const [prevStyle, setPrevStyle] = useState(styles.collapsed);
    const [nameStyle, setNameStyle] = useState(styles.nameEdit);
    const [nameEditStyle, setNameEditStyle] = useState(styles.collapsed);
    const [locationStyle, setLocationStyle] = useState(styles.nameEdit);
    const [locationEditStyle, setLocationEditStyle] = useState(styles.collapsed);
    const [styleA, setStyleA] = useState(styles.prevG);
    const [styleB, setStyleB] = useState(styles.prevY);
    const [styleC, setStyleC] = useState(styles.prevR);
    
    async function saveData (userInfo) {
        setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
    };

    async function makeStyleList (list) {
        var tempArr = list.map((item) => (styles.collapsed))
        setStyleList(tempArr);
    }

    async function sessionVerify () {
        const data = {
          username: myMemory.userInfo.username,
          sessionString: myMemory.userInfo.sessionString,
          userId: myMemory.userId.id,
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
        setCloseStyle(styles.closeIcon);
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

    async function getTrays () {
        const data = {
            userId: myMemory.userInfo.id,
            sessionString: myMemory.userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/getTrays';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {
                setTrays(prev => data);
                return;
            })
        return;
    }

    async function getTrayUses () {
        const data = {
            userId: myMemory.userInfo.id,
            sessionString: myMemory.userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/getTrayUses';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        const tempArr = [...response];
        tempArr.sort((a,b) => new Date(a.surgdate) - new Date(b.surgdate));
        setFutureUses(tempArr);
        return;
    }

    async function updateTrayLocation (index) {
        const data = {
            trayId: currTrayObj.id,
            userId: myMemory.userInfo.id,
            sessionString: myMemory.userInfo.sessionString,
            location: location
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/updateTrayLocation';
        const response = await fetch(url, headers);
        getTrays();
        getTrayUses();
        return;
    }

    async function updateTrayName () {
        const data = {
            trayId: currTrayObj.id,
            newName: currTray,
            userId: myMemory.userInfo.id,
            sessionString: myMemory.userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/updateTrayName';
        const response = await fetch(url, headers)
        getTrays();
        getTrayUses();
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
        console.log("HTE: ", hoursToEnd);
        const hoursFuture = (formatted.getTime() - today.getTime())/(1000*60*60);
        console.log("HTF: ", hoursFuture);
        const daysFuture = Math.round((hoursFuture + today.getHours())/24);
        console.log("DF Rounded: ", daysFuture)
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
                new Date().getFullYear() <= new Date(new Date(item.surgdate).getTime()+(1000*60*60*8)).getFullYear()
                && new Date().getMonth() <= new Date(new Date(item.surgdate).getTime()+(1000*60*60*8)).getMonth()
                && new Date().getDate() <= new Date(new Date(item.surgdate).getTime()+(1000*60*60*8)).getDate()
                && item.trayId == myTray.id);
            setCurrTray(prev => myTray.trayName);
            setCurrTrayObj(myTray);
            setLocation(prev => myTray.location);
            if (usesArr.length > 0) {
                setUsesComp(prev => 
                    <View>
                        <ScrollView style={{height: height * 0.465}}>
                            {usesArr.map((item, index) => (
                                <TouchableOpacity
                                    key={item + index}
                                    style={{backgroundColor: item.color, width: width * 0.85, minHeight: width * 0.3, borderRadius: 5, borderWidth: width * 0.002, marginBottom: width * 0.02, paddingLeft: width * 0.02, paddingBottom: width * 0.01, }}
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
                                    <Text allowFontScaling={false} style={{fontSize: width * 0.04, width: width * 0.8,  borderBottomWidth: width * 0.002,}}>{daysFormat(new Date(item.surgdate))} @ {formatTo12HourTime(new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)))}</Text>
                                    <Text allowFontScaling={false} style={{fontWeight: "bold", fontSize: width * 0.05,}}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName : "Surgeon?"}</Text>
                                    <Text allowFontScaling={false} style={{fontSize: width * 0.04, width: width * 0.8,}}>{item.proctype !== '' ? item.proctype : "~"}</Text>
                                    <Text allowFontScaling={false} style={{fontWeight: "bold", fontStyle: "italic"}}>Notes:</Text>
                                    <Text allowFontScaling={false} style={{fontSize: width * 0.04, width: width * 0.8,}}>{item.notes !== '' ? item.notes : "~"}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )
            } else {
                setUsesComp(prev => 
                    <View>
                        <Text allowFontScaling={false} style={{fontSize: width * 0.05, fontStyle: "italic", marginLeft: width * 0.02, }}>None.</Text>
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
                        style={{width: width * 0.955, height: width * 0.1, borderBottomWidth: width * 0.002, borderRightWidth: width * 0.002, marginLeft: width * 0.025, flexDirection: "row", backgroundColor: cellColor(index)}}
                        >
                        <Text allowFontScaling={false} style={{borderLeftWidth: width * 0.002, width: width * 0.477, fontWeight: "bold", fontSize: width * 0.04, paddingLeft: width * 0.015, }}>{item.trayName}</Text>
                        <Text allowFontScaling={false} style={{borderLeftWidth: width * 0.002, width: width * 0.477, fontWeight: "bold", fontSize: width * 0.04, paddingLeft: width * 0.015, }}>{item.location}</Text>
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
            <TouchableOpacity
                style={{position: "absolute", marginLeft: width * 0.89, marginTop: width * 0.125, zIndex: 1, }}
                onPress={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'Create New Case', params: {backTo: {name: 'List Trays', params: {month: month, year: year}}}}]
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
                          routes: [{ name: "Weekly View", params: { month: month, year: year } }],
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
                          routes: [{ name: "List Cases", params: { month: month, year: year } }],
                        });
                      }}
                      >
                        <Text allowFontScaling={false} style={styles.optionText}>Case List</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        closeMenu();
                      }}
                      >
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
                <TouchableOpacity 
                    style={backBlur}
                    onPress={() => closeMenu()}
                    ></TouchableOpacity>
            </View>
            <Text allowFontScaling={false} style={{opacity: 0.4, marginLeft: width * 0.02}}>*Green=Sterile, Red=Dirty, Yellow=Unknown</Text>
            <View style={styles.row}>
                <Image source={require('../../assets/icons/star.png')} style={styles.icon1}/>
                <Text allowFontScaling={false} style={{opacity: 0.4}}>=Needed Within 3 Days</Text>
            </View>
            <View style={styles.columns}>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Tray</Text>
                </View>
                <View style={[styles.cell, {borderLeftWidth: width * 0.003, borderColor: "#d6d6d6", }]}>
                    <Text allowFontScaling={false} style={styles.columnText}>Current Location</Text>
                </View>
            </View>
            <ScrollView style={{maxHeight: height * 0.74, }}>
                {traysComp}
            </ScrollView>
            
            {/* #### BEGIN PREVIEW SECTION #### */}
            
            <View style={prevStyle}>
                <View style={{backgroundColor: "#fff", width: width * 0.9, height: height * 0.8, marginLeft: width * 0.05, marginTop: width * 0.07, padding: width * 0.02, }}>
                    <TouchableOpacity
                        onPress={() => {
                            setPrevStyle(styles.collapsed);
                            setUsesComp(null);
                        }}
                        >
                        <Image source={require('../../assets/icons/close.png')} style={{width: width * 0.1, height: width * 0.1, }}/>
                    </TouchableOpacity>
                    
                    <View style={styles.row}>
                        <Text allowFontScaling={false} style={{fontSize: width * 0.05, marginTop: width * 0.02, }}>Tray Name:</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setNameStyle(styles.collapsed);
                                setNameEditStyle(styles.row);
                            }}
                            >
                            <Text allowFontScaling={false} style={{fontSize: width * 0.05, color: "rgba(0, 122, 255, 0.8)", marginTop: width * 0.021, }}> - Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={nameEditStyle}>
                        <TextInput 
                            style={{width: width * 0.64, height: width * 0.08, padding: width * 0.01, borderRadius: 5, backgroundColor: "#ededed"}}
                            placeholder={"Enter New Tray Name..."}
                            value={currTray}
                            onChangeText={(input) => setCurrTray(prev => input)}
                            />
                        <TouchableOpacity
                            style={{width: width * 0.2, height: width * 0.08, marginLeft: width * 0.01, backgroundColor: "#d6d6d7", borderRadius: 5, }}
                            onPress={() => {
                                setNameStyle(styles.nameEdit);
                                setNameEditStyle(styles.collapsed);
                                updateTrayName();
                            }}
                            >
                            <Text allowFontScaling={false} style={{fontSize: width * 0.06, marginLeft: width * 0.04, }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                    <Text allowFontScaling={false} style={nameStyle}>{currTray}</Text>
                    <View style={styles.row}>
                        <Text allowFontScaling={false} style={{fontSize: width * 0.05, marginTop: width * 0.02, }}>Tray Location:</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setLocationStyle(styles.collapsed);
                                setLocationEditStyle(styles.row);
                            }}
                            >
                            <Text allowFontScaling={false} style={{fontSize: width * 0.05, color: "rgba(0, 122, 255, 0.8)", marginTop: width * 0.021, }}> - Edit</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={locationEditStyle}>
                        <TextInput 
                            style={{width: width * 0.64, height: width * 0.08, padding: width * 0.01, borderRadius: 5, backgroundColor: "#ededed"}}
                            placeholder={"Update Location..."}
                            value={location}
                            onChangeText={(input) => setLocation(prev => input)}
                            />
                        <TouchableOpacity
                            style={{width: width * 0.2, height: width * 0.08, marginLeft: width * 0.01, backgroundColor: "#d6d6d7", borderRadius: 5, }}
                            onPress={() => {
                                setLocationStyle(styles.nameEdit);
                                setLocationEditStyle(styles.collapsed);
                                updateTrayLocation();
                            }}
                            >
                            <Text allowFontScaling={false} style={{fontSize: width * 0.06, marginLeft: width * 0.04, }}>Save</Text>
                        </TouchableOpacity>
                    </View>
                    <Text allowFontScaling={false} style={locationStyle}>{location}</Text>
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05, marginTop: width * 0.02, marginBottom: width * 0.02, }}>Upcoming Cases:</Text>
                    {usesComp}
                </View>
            </View>
        </SafeAreaView>
    );
  };

  const styles = StyleSheet.create({
    nameEdit: {
        fontWeight: "bold",
        fontSize: width * 0.06,
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
        height: width * 0.17,
        marginLeft: width * 0.36,
        marginTop: - width * 0.045,
        borderRadius: 5,
    },
    newText: {
        color: "#fefefe",
        fontSize: width * 0.18,
        marginTop: - width * 0.035,
        marginLeft: width * 0.035
    },
    monthYear: {
        fontSize: width * 0.06,
        width: width * 0.56,
        marginLeft: width * 0.02,
        marginTop: width * 0.01,
    },
    arrow: {
        backgroundColor: "rgba(0, 122, 255, 0.8)",
        width: width * 0.2,
        height: width * 0.1,
        borderRadius: 5,
        margin: width * 0.025,
    },
    arrow2: {
        backgroundColor: "rgba(0, 122, 255, 0.8)",
        width: width * 0.2,
        height: width * 0.1,
        borderRadius: 5,
        marginTop: width * 0.025,
    },
    arrowIcon: {
        width: width * 0.06,
        height: width * 0.06,
        marginLeft: width * 0.06,
        marginTop: width * 0.02
    },      
    arrowIcon2: {
          width: width * 0.06,
          height: width * 0.06,
          marginLeft: width * 0.075,
          marginTop: width * 0.02
    },
    statBox: {
        width: width * 0.984,
        minHeight: width * 0.15,
        maxHeight: width * 0.4,
        paddingTop: width * 0.02,
        borderWidth: width * 0.002,
        marginTop: - width * 0.002
    },
    grid: {
        width: width * 0.985,
        height: height * 0.79,
    },
    columns: {
        flexDirection: 'row',
        marginLeft: width * 0.025,
        backgroundColor: "#333436",
        width: width * 0.955,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
    },
    columnText: {
        color: "#ffffff",
        fontSize: width * 0.04
    },
    cell: {
        flexDirection: "row",
        width: width * 0.477,
        minHeight: width * 0.11,
        padding: width * 0.01,
    },
    prevG: {
        backgroundColor: "#32a852",
        width: width * 0.27,
        height: width * 0.09,
        borderRadius: 5,
        marginTop: width * 0.01,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.065,
        paddingTop: width * 0.013,
    },
    prevGB: {
        backgroundColor: "#32a852",
        borderWidth: width * 0.005,
        width: width * 0.27,
        height: width * 0.09,
        borderRadius: 5,
        marginTop: width * 0.01,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.06,
        paddingTop: width * 0.008,
    },
    prevY: {
        backgroundColor: "#d1cc6f",
        width: width * 0.27,
        height: width * 0.09,
        borderRadius: 5,
        marginTop: width * 0.01,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.12,
        paddingTop: width * 0.013
    },
    prevYB: {
        backgroundColor: "#d1cc6f",
        borderWidth: width * 0.005,
        width: width * 0.27,
        height: width * 0.09,
        borderRadius: 5,
        marginTop: width * 0.01,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.115,
        paddingTop: width * 0.008
    },
    prevR: {
        backgroundColor: "#d16f6f",
        width: width * 0.27,
        height: width * 0.09,
        borderRadius: 5,
        marginTop: width * 0.01,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.085,
        paddingTop: width * 0.013,
    },
    prevRB: {
        backgroundColor: "#d16f6f",
        borderWidth: width * 0.005,
        width: width * 0.27,
        height: width * 0.09,
        borderRadius: 5,
        marginTop: width * 0.01,
        marginLeft: width * 0.01,
        paddingLeft: width * 0.08,
        paddingTop: width * 0.008
    },
    cellGreen: {
          backgroundColor: "#32a852",
          borderLeftWidth: width * 0.002,
          borderBottomWidth: width * 0.002,
          height: width * 0.11,
          padding: width * 0.01,
    },
    cellYellow: {
          backgroundColor: "#d1cc6f",
          borderLeftWidth: width * 0.002,
          borderBottomWidth: width * 0.002,
          height: width * 0.11,
          padding: width * 0.01,
    },
    cellRed: {
          backgroundColor: "#d16f6f",
          borderLeftWidth: width * 0.002,
          borderBottomWidth: width * 0.002,
          height: width * 0.11,
          padding: width * 0.01,
    },
    cellDark: {
        flexDirection: "row",
        borderLeftWidth: width * 0.002,
        borderBottomWidth: width * 0.002,
        width: width * 0.44,
        height: width * 0.11,
        padding: width * 0.01,
        backgroundColor: "#d4d6d6",
    },
    cellText: {
        fontSize: width * 0.035,
    },
    tzPicker: {
      fontSize: width * 0.01  
    },
    title: {
        color: "#292c3b",
        marginLeft: width * 0.02,
        marginTop: 8,
    },
    body: {
        color: "#292c3b",
        marginLeft: width * 0.02,
        marginTop: 8,
        fontSize: width * 0.03
    },
    textInput: {
        color: "#39404d"
    },
    expandingTextInput: {
        width: width * 0.98,
        marginLeft: width * 0.02,
        marginTop: 5,
        padding: 8,
        borderRadius: 4,
        backgroundColor: '#ededed'
    },
    textBox: {
        width: width * 0.96,
        height: 32,
        marginLeft: width * 0.02,
        marginTop: 5,
        padding: 8,
        borderRadius: 4,
        backgroundColor: '#ededed'
    },
    bigTextBox: {
        width: width * 0.96,
        height: 100,
        marginLeft: width * 0.02,
        marginTop: 5,
        padding: 14,
        borderRadius: 4,
        backgroundColor: '#ededed'
    },
    bottom: {
        marginBottom: 350
    },
    previewBox: {
        position: 'absolute',
        zIndex: 1,
        width: width,
        height: height * 0.9,
        marginTop: height * 0.1,
        backgroundColor: "rgba(10,10,10,0.65)",
    },
    preview: {
        zIndex: 1,
        position: "absolute",
        width: width,
        height: height * 0.89,
        marginTop: width * 0.245,
        backgroundColor: "rgba(51,52,54, 0.6)",
        opacity: 1,
    },
    largeButton: {
        backgroundColor: '#ededed',
        width: width * 0.4,
        height: 35,
        borderRadius: 5,
        marginLeft: width * 0.025,
        marginTop: 15
    },
    button: {
        backgroundColor: '#ededed',
        width: width * 0.45,
        height: 50,
        borderRadius: 5,
        marginTop: 35,
        marginLeft: width * 0.02
    },
    smallButton: {
        backgroundColor: '#e3dede',
        width: width * 0.235,
        height: width * 0.08,
        borderRadius: 5,
        marginTop: width * 0.01,
        marginLeft: width * 0.01,
    },
    smallCancel: {
        backgroundColor: '#eb4034',
        width: width * 0.2,
        height: 25,
        borderRadius: 5,
        marginTop: 8,
        marginLeft: width * 0.455
    },
    smallButtonText: {
        color: "#ffffff",
        fontSize: width * 0.04,
        marginLeft: width * 0.03,
        marginTop: 3
    },
    buttonText: {
        fontSize: width * 0.08,
        marginLeft: width * 0.03,
        marginTop: 5
    },
    calendar: {
        marginTop: 5,
        position: "absolute",
        marginLeft: width * 0.001
    },
    time: {
        marginTop: 5
    },
    timezone: {
        marginTop: 5,
        marginLeft: width * 0.756,
        width: width * 0.22,
        height: 30,
        borderRadius: 7,
        backgroundColor: "#ededed",
        flexDirection: 'row'
    },
    collapsed: {
        display: 'none'
    },
    close: {
        color: "#ffffff",
        backgroundColor: '#39404d',
        textAlign: 'center',
        paddingBottom: 15,
        fontSize: 30
    },
    picture: {
        backgroundColor: '#007AFF',
        width: width * 0.45,
        height: 50,
        borderRadius: 5,
        marginTop: 35,
        marginLeft: width * 0.02
    },
    pictureText: {
        color: "#ffffff",
        fontSize: width * 0.08,
        marginLeft: width * 0.05,
        marginTop: 5
    },
    icon: {
        height: width * 0.065,
        width: width * 0.065,
        marginTop: 5,
        marginLeft: width * 0.015
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
    },
    collapsed: {
          display: 'none',
    },
    icon1: {
        width: width * 0.05,
        height: width * 0.05,
        marginLeft: width * 0.02,
        marginBottom: width * 0.01,
        opacity: 0.4
    },
    icon2: {
          position: "absolute",
          width: width * 0.05,
          height: width * 0.05,
          marginLeft: width * 0.38,
          marginTop: width * 0.01,
    },
    icon3: {
        width: width * 0.1,
        height: width * 0.1,
        marginLeft: width * 0.02,
    },
    closeIcon: {
        width: width * 0.1,
        height: width * 0.1,
        marginLeft: - width * 0.18,
    },
    option: {
          width: width * 0.4,
          height: width * 0.09,
          marginLeft: width * 0.02,
          marginTop: width * 0.04,
          marginBottom: width * 0.02,
          borderBottomWidth: width * 0.002,
          borderRadius: 5
    },
    optionText: {
          fontSize: width * 0.06,
          marginTop: width * 0.0075,
          textAlign: "center"
    },
});

export default ListPage;