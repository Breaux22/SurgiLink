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
    const [trays, setTrays] = useState([]);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const [futureUses, setFutureUses] = useState([[]]);
    const [styleList, setStyleList] = useState([]);
    const { myMemory, setMyMemory } = useMemory();
    const [location, setLocation] = useState('');
    const [previewStyle, setPreviewStyle] = useState(styles.collapsed);
    const [colorA, setColorA] = useState('#d6d6d7');
    const [colorB, setColorB] = useState('#d6d6d7');
    const [colorC, setColorC] = useState('#d6d6d7');
    const [prevTray, setPrevTray] = useState([]);
    const [prevName, setPrevName] = useState('');
    const [prevIndex, setPrevIndex] = useState(0);
    const [prevLocation, setPrevLocation] = useState('');
    const [prevComponent, setPrevComponent] = useState();
    const [styleA, setStyleA] = useState(styles.prevG);
    const [styleB, setStyleB] = useState(styles.prevY);
    const [styleC, setStyleC] = useState(styles.prevR);
    const [first, setFirst] = useState(true);

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

    async function getTrays (fuArray) {
        const data = {
            userId: myMemory.userInfo.id,
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
                makeFutureUsesArray(data, fuArray);
                makeStyleList(data);
            })
        return response;
    }

    async function getTrayUses () {
        const data = {
            userId: myMemory.userInfo.id,
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
            .then(data => {
                getTrays(data);
            })
        return response;
    }

    async function makeFutureUsesArray (myTrays, uses) {
        const tempArr = myTrays.map((tray, index) => (
             uses.filter((use) => use.trayName == tray.trayName).sort((a,b) => new Date(a.surgdate) < new Date(b.surgdate))   
        ))
        console.log(tempArr)
        setFutureUses(prev => tempArr);
        return;
    }

    async function saveTrayLocation (index) {
        const data = {
            trayId: trays[index].id,
            userId: myMemory.userInfo.id,
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
        const response = await fetch(url, headers)
        setLocation('');
        getTrays();
        return;
    }

    async function updateTrayStatus (trayName, trayStatus) {
        const data = {
            trayName: trayName,
            userId: myMemory.userInfo.id,
            trayStatus: trayStatus
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/updateTrayStatus';
        const response = await fetch(url, headers)
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

    function cellColor(index) {
        if (trays[index].trayStatus === "Dirty") {
            return styles.cellRed;
        } else if (trays[index].trayStatus === "Sterile") {
            return styles.cellGreen;
        } else if (trays[index].trayStatus === "?") {
            return styles.cellYellow;
        }
    }

    function cellColor2(index) {
        if (index % 2 == 1) {
            return styles.cellDark;
        } else {
            return styles.cell;
        }
    }

    function cellColor3 (index) {
        if (trays[index].trayStatus == "Sterile") {
            setStyleA(styles.prevGB);
            setStyleB(styles.prevY);
            setStyleC(styles.prevR);
        } else if (trays[index].trayStatus == "?") {
            setStyleA(styles.prevG);
            setStyleB(styles.prevYB);
            setStyleC(styles.prevR);
        } else if (trays[index].trayStatus == "Dirty") {
            setStyleA(styles.prevG);
            setStyleB(styles.prevY);
            setStyleC(styles.prevRB);
        }
        return;
    }

    function buttonColor (item, slot) {
        if (item.trayStatus == "Sterile" && slot == "a") {
            return {width: width * 0.318, height: width * 0.1, marginTop: - width * 0.02, borderRightWidth: width * 0.002, borderBottomWidth: width * 0.002, backgroundColor: "#d6d6d7"}
        } else if (item.trayStatus == "?" && slot == "b") {
            return {width: width * 0.318, height: width * 0.1, marginTop: - width * 0.02, borderRightWidth: width * 0.002, borderBottomWidth: width * 0.002, backgroundColor: "#d6d6d7"}
        } else if (item.trayStatus == "Dirty" && slot == "c") {
            return {width: width * 0.318, height: width * 0.1, marginTop: - width * 0.02, borderRightWidth: width * 0.002, borderBottomWidth: width * 0.002, backgroundColor: "#d6d6d7"}
        } else {
            return {width: width * 0.318, height: width * 0.1, marginTop: - width * 0.02, borderRightWidth: width * 0.002, borderBottomWidth: width * 0.002,}
        }
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
    }

    function daysFormat (surgdate) {
        let numDays = Math.round(((new Date(surgdate).getTime())-(new Date().getTime()))/(1000*60*60*24))
        return numDays;
    }

    function futureUsesComponent () {
        setPrevComponent (
            futureUses[prevIndex].map((item, index) => {
                let numDays = daysFormat(item.surgdate);
                if (numDays >= 0) {
                    return (
                            <TouchableOpacity
                                key={item.surgdate}
                                style={{width: width * 0.8, backgroundColor: "#dae9f7", marginLeft: width * 0.05, marginBottom: width * 0.02, borderRadius: 5, padding: width * 0.01, }}
                                onPress={() => {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{name: 'Case Info', params: {caseProp: item, backTo: {name: 'List Trays', params: {month: month, year: year}}}}]
                                    })
                                }}
                                >
                                <View style={[styles.row, {borderBottomWidth: width * 0.003, paddingBottom: width * 0.01,}]}>
                                    <Text allowFontScaling={false} style={{fontSize: width * 0.045, }}>{formatDate(item.surgdate)} - {formatTo12HourTime(item.surgdate)} - ({numDays} days)</Text>
                                </View>
                                <Text allowFontScaling={false} style={{fontSize: width * 0.045, }}>{item.proctype}</Text>
                                <Text allowFontScaling={false} style={{fontSize: width * 0.045, }}>@ {item.hosp}</Text>
                                <Text allowFontScaling={false} style={{fontSize: width * 0.045, }}>{item.dr}</Text>
                            </TouchableOpacity>
                    )
                }
            })
        )
    }

    useEffect(() => {
        if (futureUses[prevIndex].length > 0) {
            futureUsesComponent();
        }
    }, [prevIndex])

    useEffect(() => {
        if (futureUses[prevIndex].length > 0) {
            futureUsesComponent();
        }
    }, [first])


    useEffect(() => {
        (async () => {
            await getTrayUses()
        })();

        return () => {
        };
    }, []);

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
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Current Location & Status</Text>
                </View>
            </View>
            <View style={{backgroundColor: "#d6d6d7", position: "absolute", width: width, height: width * 0.15, marginTop: height * 0.935, zIndex: 1, opacity: 0.85}}></View>
            <ScrollView style={styles.grid}>
                <View style={{width: width * 0.955, marginLeft: width * 0.025, borderRightWidth: width * 0.002, borderTopWidth: width * 0.002,}}>
                    {trays.map((myTray, index) => (
                        <View key={myTray.trayName + index}>
                            <View style={styles.row}>
                                <TouchableOpacity 
                                    onPress={async () => {
                                        setPrevName(prev => myTray.trayName);
                                        setPrevLocation(prev => myTray.location);
                                        cellColor3(index);
                                        if (first == true) {
                                            setFirst(false);
                                        }
                                        setPrevIndex(index);
                                        setPreviewStyle(styles.previewBox);
                                    }}
                                >
                                    <View style={cellColor2(index)}>
                                        <Text allowFontScaling={false} style={styles.cellText}>{myTray.trayName}</Text>
                                        <Image source={require('../../assets/icons/star.png')} style={ifStar(index)}/>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={cellColor2(index)}
                                    onPress={async () => {
                                        setPrevTray([myTray, index]);
                                    }}
                                >
                                    <Text allowFontScaling={false} style={styles.cellText}>{myTray.location}</Text>
                                </TouchableOpacity>
                                <View style={[cellColor(index), {width: width * 0.075,}]}/>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={{height: height * 0.07}}></View>
            </ScrollView>
            <View style={previewStyle}>
                <View style={styles.preview}>
                    <TouchableOpacity
                        onPress={() => setPreviewStyle(prev => styles.collapsed)}
                        >
                        <Image source={require('../../assets/icons/close.png')} style={[styles.icon, {marginLeft: width * 0.04, marginTop: width * 0.04, }]}/>
                    </TouchableOpacity>
                    <View>
                        <Text allowFontScaling={false} style={{marginLeft: width * 0.045, marginTop: width * 0.02, }}>Tray: <Text allowFontScaling={false} style={{fontWeight: "bold", fontSize: width * 0.05}}>{prevName}</Text></Text>
                        <Text allowFontScaling={false} style={{marginLeft: width * 0.045, marginTop: width * 0.02, }}>Current Location: <Text allowFontScaling={false} style={{fontWeight: "bold", fontSize: width * 0.05}}>{prevLocation}</Text></Text>
                        <View style={styles.row}>
                            <Text style={{marginLeft: width * 0.045, marginTop: width * 0.02, }}>Status:</Text>
                            <TouchableOpacity
                                style={styleA}
                                onPress={() => {
                                    let tempArr = [...trays];
                                    updateTrayStatus(trays[prevIndex].trayName, 'Sterile');
                                    tempArr[prevIndex].trayStatus = "Sterile";
                                    setTrays(prevArr => tempArr)
                                    setStyleA(prev => styles.prevGB);
                                    setStyleB(prev => styles.prevY);
                                    setStyleC(prev => styles.prevR);
                                }}
                                >
                                <Text allowFontScaling={false}>Sterile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styleB}
                                onPress={() => {
                                    let tempArr = [...trays];
                                    tempArr[prevIndex].trayStatus = "?";
                                    updateTrayStatus(trays[prevIndex].trayName, '?');
                                    setTrays(prevArr => tempArr);
                                    setStyleB(prev => styles.prevYB);
                                    setStyleA(prev => styles.prevG);
                                    setStyleC(prev => styles.prevR);
                                }}
                                >
                                <Text allowFontScaling={false}>?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styleC}
                                onPress={() => {
                                    let tempArr = [...trays];
                                    tempArr[prevIndex].trayStatus = "Dirty";
                                    updateTrayStatus(trays[prevIndex].trayName, 'Dirty');
                                    setTrays(prevArr => tempArr)
                                    setStyleC(prev => styles.prevRB);
                                    setStyleA(prev => styles.prevG);
                                    setStyleB(prev => styles.prevY);
                                }}
                                >
                                <Text allowFontScaling={false}>Dirty</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{marginLeft: width * 0.045, marginTop: width * 0.02, }}>Upcoming Cases:</Text>
                        <ScrollView style={{marginTop: width * 0.02, maxHeight: width * 1.2}}>
                            {prevComponent}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </SafeAreaView>
        
    );
  };

  const styles = StyleSheet.create({
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
          backgroundColor: "#717475",
          width: width * 0.955
      },
      columnText: {
          color: "#ffffff",
          fontSize: width * 0.04
      },
      cell: {
          flexDirection: "row",
          borderLeftWidth: width * 0.002,
          borderBottomWidth: width * 0.002,
          width: width * 0.44,
          minHeight: width * 0.11,
          padding: width * 0.01,
      },
      prevG: {
          backgroundColor: "#32a852",
          width: width * 0.219,
          height: width * 0.07,
          borderRadius: 5,
          marginTop: width * 0.01,
          marginLeft: width * 0.01,
          paddingLeft: width * 0.05,
          paddingTop: width * 0.013,
      },
      prevGB: {
          backgroundColor: "#32a852",
          borderWidth: width * 0.005,
          width: width * 0.219,
          height: width * 0.07,
          borderRadius: 5,
          marginTop: width * 0.01,
          marginLeft: width * 0.01,
          paddingLeft: width * 0.045,
          paddingTop: width * 0.008,
      },
      prevY: {
          backgroundColor: "#d1cc6f",
          width: width * 0.219,
          height: width * 0.07,
          borderRadius: 5,
          marginTop: width * 0.01,
          marginLeft: width * 0.01,
          paddingLeft: width * 0.095,
          paddingTop: width * 0.013
      },
      prevYB: {
          backgroundColor: "#d1cc6f",
          borderWidth: width * 0.005,
          width: width * 0.219,
          height: width * 0.07,
          borderRadius: 5,
          marginTop: width * 0.01,
          marginLeft: width * 0.01,
          paddingLeft: width * 0.09,
          paddingTop: width * 0.008
      },
      prevR: {
          backgroundColor: "#d16f6f",
          width: width * 0.219,
          height: width * 0.07,
          borderRadius: 5,
          marginTop: width * 0.01,
          marginLeft: width * 0.01,
          paddingLeft: width * 0.07,
          paddingTop: width * 0.013,
      },
      prevRB: {
          backgroundColor: "#d16f6f",
          borderWidth: width * 0.005,
          width: width * 0.219,
          height: width * 0.07,
          borderRadius: 5,
          marginTop: width * 0.01,
          marginLeft: width * 0.01,
          paddingLeft: width * 0.065,
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
          width: width * 0.9,
          height: height * 0.79,
          marginTop: height * 0.025,
          marginLeft: width * 0.05,
          borderWidth: width * 0.004,
          backgroundColor: "#fff",
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