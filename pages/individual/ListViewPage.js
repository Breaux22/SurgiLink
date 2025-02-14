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
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');


// TODO:
// Make sure preselected filters apply when changing month

const ListPage = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [month, setMonth] = useState(route.params?.month || new Date().getMonth());
    const [year, setYear] = useState(route.params?.year || new Date().getFullYear());
    const [cases, setCases] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const { myMemory, setMyMemory } = useMemory();
    const [surgeons, setSurgeons] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [lButText, setLButText] = useState('None');
    const [rButText, setRButText] = useState('None');
    // left button stays visible
    const [rButStyle, setRButStyle] = useState(styles.collapsed);
    const [lBoxStyle, setLBoxStyle] = useState(styles.collapsed);
    const [rBoxStyle, setRBoxStyle] = useState(styles.collapsed);
    // left box data is static
    const [rBoxData, setRBoxData] = useState([]);
    const [rBoxStyles, setRBoxStyles] = useState([]);
    const [filterBy, setFilterBy] = useState([]);

    async function saveData (userInfo) {
        setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
    };

    async function sessionVerify () {
        const userInfo = await getSecureStorage('userInfo');
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
        const response = await fetch('https://surgiflow.replit.app/verifySession', headers)
          .then(response => {
                if (!response.ok){
                    console.error("Error - sessionVerify()")
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
        const userInfo = await getSecureStorage('userInfo');
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
        const url = 'https://surgiflow.replit.app/logout';
        const response = await fetch(url, headers)
            .then(response => {
                    if (!response.ok){
                        console.error("Error - logout()")
                    }
                    return response.json()
                })
        return
    }

    async function getSurgeons () {
        const userInfo = await getSecureStorage('userInfo');
        const data = {
            userId: userInfo.id,
            sessionString: userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/getSurgeons';
        const response = await fetch(url, headers)
        .then(response => {
                if (!response.ok){
                    console.error("Error - getSurgeons()")
                }
                return response.json()
            })
        .then(data => {return data})
        setSurgeons(prev => response);
        return
    }

    async function getFacilities () {
        const userInfo = await getSecureStorage('userInfo');
        const data = {
            userId: userInfo.id,
            sessionString: userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/getFacilities';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getFacilities()")
                }
                return response.json()
            })
            .then(data => setFacilities(prev => data))
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
            getCases(year - 1, [12]);
            setMonth(11);
            setYear((prevYear) => prevYear - 1);
        } else {
            getCases(year, [month]);
            setMonth((prevMonth) => prevMonth - 1);
        }
    }

    async function nextMonth () {
        if (month === 11) {
            getCases(year + 1, [1]);
            setMonth(0);
            setYear((prevYear) => prevYear + 1);
        } else {
            getCases(year, [month + 2]);
            setMonth((prevMonth) => prevMonth + 1);
        }
    }

    async function convertMonthToString (myMonth) {
        const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthArr[myMonth];
    }

    async function getCases (year, month) {
        const data = {
            surgYear: year, 
            months: month,
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
        const url = 'https://surgiflow.replit.app/getCases';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getCases()")
                }
                return response.json()
            })
            .then(data => {
                setCases(prev => data);
            })
        const tempArr = [...response];
        tempArr.sort((a,b) => new Date(a.surgdate) - new Date(b.surgdate));
        setCases(tempArr);
    }

    function formatDate(dateInput) {
      const date = new Date(dateInput);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits
      const year = date.getFullYear();
      return `${month} ${day},  ${year}`;
    }

    function convertTo12HourTime(time24) {
      const [hours, minutes] = time24.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }

    function cellColor(index) {
        if (index % 2 == 0) {
            return styles.cell;
        } else {
            return styles.cellDark;
        }
    }

    function fillRightBoxData (choice) {
        if (choice == 'None') {
            // set filtered cases to all cases
            // set left button text to none
            // hide left box
            // hide right button
            // hide right box
            // [DONE]
            setFilteredCases(prev => cases);
            setLButText(prev => 'None');
            setLBoxStyle(prev => styles.collapsed);
            setRButStyle(prev => styles.collapsed);
            setRBoxStyle(prev => styles.collapsed);
        } else if (choice == 'Surgeons') {
            // set filtered cases to all cases (assume coming from a different filter)
            // set filterBy to []
            // set left button text to surgeons
            // hide left box
            // show right button
            // set right button text to none selected
            // show right box
            // set right box data to surgeons (as it comes from the server)
            // make rBoxStyles
            // [DONE]
            setFilteredCases(prev => cases);
            setFilterBy(prev => []);
            setLButText(prev => 'Surgeons');
            setLBoxStyle(prev => styles.collapsed);
            setRButStyle(prev => styles.rButton);
            setRButText(prev => 'None');
            setRBoxStyle(prev => styles.rBox);
            setRBoxData(prev => surgeons);
            let tempArr = [];
            surgeons.map(() => (tempArr.push(styles.buttonLight)));
            setRBoxStyles(prev => tempArr);
        } else if (choice == 'Facilities') {
            // set filtered cases to all cases (assume coming from a different filter)
            // set filterBy to []
            // set left button text to facilities
            // hide left box
            // show right button
            // set right button text to none selected
            // show right box
            // set right box data to facilities (as it comes from the server)
            // make rBoxStyles
            // [DONE]
            setFilteredCases(prev => cases);
            setFilterBy(prev => []);
            setLButText(prev => 'Facilities');
            setLBoxStyle(prev => styles.collapsed);
            setRButStyle(prev => styles.rButton);
            setRButText(prev => 'None');
            setRBoxStyle(prev => styles.rBox);
            setRBoxData(prev => facilities);
            let tempArr = [];
            facilities.map((item) => tempArr.push(styles.buttonLight));
            setRBoxStyles(prev => tempArr);
        }
        return;
    }

    function myFilter () {
        if (lButText == 'Surgeons') {
            let tempArr = [];
            for (const value of filterBy) {
                cases.map((item, index) => {
                    if (item.dr == value.id) {
                        tempArr.push(item);
                    }
                })
            }
            setFilteredCases(prev => tempArr);
        } else if (lButText == 'Facilities') {
            let tempArr = [];
            for (const value of filterBy) {
                cases.map((item, index) => {
                    if (item.facilityName == value.facilityName) {
                        tempArr.push(item);
                    }
                })
            }
            setFilteredCases(prev => tempArr);
        }
    }

    useEffect(() => {
        if (filterBy.length > 0) {
            // update filteredCases
            setRButText(filterBy.length);
            myFilter();
        } else {
            setFilteredCases(prev => cases);
            setRButText('None');
        }
    }, [filterBy])

    useEffect(() => {
        if (cases.length > 0) {
            if (filterBy.length > 0) {
                myFilter();
            } else {
                setFilteredCases(prev => cases);
            }
        } else {
            setFilteredCases([]);
        }
    }, [cases])

    useEffect(() => {
        getSurgeons();
        getFacilities();
        (async () => {
            var caseArray = await getCases(year || new Date().getFullYear(), [month + 1] || [new Date().getMonth() + 1]);
            caseArray = await caseArray.sort((a,b) => new Date(a.dateString) - new Date(b.dateString));
            setCases(oldCases => caseArray);
        })();

        return () => {
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={{position: "absolute", marginLeft: width * 0.89, marginTop: width * 0.125, zIndex: 1}}
                onPress={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'Create New Case', params: {backTo: {name: 'List Cases', params: {month: month, year: year}}}}]
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
                        closeMenu();
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
                          routes: [{ name: "List Trays", params: { month: month, year: year } }],
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
                <View style={backBlur}></View>
            </View>
            <View style={[styles.row, {backgroundColor: "#333436", width: width * 0.955, borderTopLeftRadius: 5, borderTopRightRadius: 5, marginTop: width * 0.025, marginLeft: width * 0.025}]}>
                <View>
                    <Text allowFontScaling={false} style={styles.monthYear}>{convertMonthToString(month)}</Text>
                    <Text allowFontScaling={false} style={styles.monthYear}>{year}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.arrow}
                    onPress={() => {
                        prevMonth();
                    }}
                    >
                    <Image source={require('../../assets/icons/left-arrow.png')} style={styles.arrowIcon}/>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.arrow2}
                    onPress={() => {
                        nextMonth();
                    }}
                    >
                    <Image source={require('../../assets/icons/right-arrow.png')} style={styles.arrowIcon2}/>
                </TouchableOpacity>
            </View>
            <View style={[styles.row, {backgroundColor: "#333436", width: width * 0.955, height: width * 0.1, marginLeft: width * 0.025, }]}>
                <TouchableOpacity
                    style={{width: width * 0.315, height: width * 0.08, backgroundColor: "#ededed", marginLeft: width * 0.02, borderRadius: 5, }}
                    onPress={() => {
                        // open or close left box [DONE]
                        // set filterBy to []
                        setFilterBy(prev => []);
                        if (lBoxStyle == styles.collapsed) {
                            setLBoxStyle(prev => styles.lBox);
                            setRBoxStyle(prev => styles.collapsed);
                        } else {
                            setLBoxStyle(prev => styles.collapsed);
                        }
                    }}
                    >
                    <Text allowFontScaling={false} style={{marginTop: width * 0.018, textAlign: "center", }}>filter: by {lButText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={rButStyle}
                    onPress={() => {
                        // open or close right box [DONE]
                        if (rBoxStyle == styles.collapsed) {
                            setRBoxStyle(prev => styles.rBox);
                            setLBoxStyle(prev => styles.collapsed);
                        } else {
                            setRBoxStyle(prev => styles.collapsed);
                        }
                    }}
                    >
                    <Text allowFontScaling={false} style={{textAlign: "center", marginTop: width * 0.018}}>{rButText} Selected</Text>
                </TouchableOpacity>
            </View>
            <View style={lBoxStyle}>
                <TouchableOpacity
                    style={{width: width * 0.45, height: width * 0.08, borderRadius: 5, marginLeft: width * 0.0225, marginTop: width * 0.02, borderWidth: width * 0.003, }}
                    onPress={() => {
                        // set left box to none [DONE]
                        fillRightBoxData('None');
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05, textAlign: "center", marginTop: width * 0.005, }}>None</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: width * 0.45, height: width * 0.08, borderRadius: 5, marginLeft: width * 0.0225, marginTop: width * 0.02, borderWidth: width * 0.003, }}
                    onPress={() => {
                        // set left box to surgeons [DONE]
                        fillRightBoxData('Surgeons');
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05, textAlign: "center", marginTop: width * 0.005, }}>Surgeons</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: width * 0.45, height: width * 0.08, borderRadius: 5, marginLeft: width * 0.0225, marginTop: width * 0.02, borderWidth: width * 0.003, }}
                    onPress={() => {
                        // set left box to facilities [DONE]
                        fillRightBoxData('Facilities');
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05, textAlign: "center", marginTop: width * 0.005, }}>Facilities</Text>
                </TouchableOpacity>
            </View>
            <View style={rBoxStyle}>
                {rBoxData.map((item, index) => (
                    <TouchableOpacity
                        key={item.surgeonName || item.facilityName}
                        onPress={() => {
                            if (rBoxStyles[index] == styles.buttonLight) {
                                // select filter button
                                // update
                                // add to filterBy
                                // update right button text
                                let tempArr = [...rBoxStyles];
                                tempArr[index] = styles.buttonDark;
                                setRBoxStyles(prev => tempArr);
                                setFilterBy(prev => [...prev, rBoxData[index]]) // filterBy has surgeon/facility object, not just the name
                            } else {
                                // deselect filter button
                                // remove from filterBy
                                // update right button text
                                let tempArr = [...rBoxStyles];
                                tempArr[index] = styles.buttonLight;
                                setRBoxStyles(prev => tempArr);
                                setFilterBy(prevFilterBy => {
                                    let newFilterBy = [];
                                    for (const value of prevFilterBy) {
                                        if (lButText == 'Surgeons' && value.surgeonName == rBoxData[index].surgeonName) {
                                            continue;
                                        } else if (lButText == 'Facilities' && value.facilityName == rBoxData[index].facilityName) {
                                            continue;
                                        } else {
                                            newFilterBy.push(value);
                                        }
                                    }
                                    return newFilterBy;
                                })
                            }
                        }}
                        >
                        <Text allowFontScaling={false} style={rBoxStyles[index]}>{lButText == 'Surgeons' ? item.surgeonName : item.facilityName}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.columns}>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Date</Text>
                </View>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Surgeon</Text>
                </View>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Facility</Text>
                </View>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Procedure</Text>
                </View>
            </View>
            <ScrollView style={styles.grid}>
                <View style={{width: width * 0.955, marginLeft: width * 0.025, borderRightWidth: width * 0.002, borderTopWidth: width * 0.002,}}>
                    {filteredCases.map((myCase, index) => (
                        <TouchableOpacity 
                            key={myCase.surgdate + index} 
                            style={styles.row}
                            onPress={() => {
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: "Case Info", params: { backTo: {name: 'List Cases', params: {month: month, year: year}}, caseProp: myCase} }],
                                });
                            }}
                        >
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: width * 0.002, borderBottomWidth: width * 0.002, width: width * 0.238, padding: width * 0.01,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>{formatDate(myCase.dateString)}</Text>
                                <Text allowFontScaling={false} style={styles.cellText}>{convertTo12HourTime(myCase.dateString.slice(11,16))}</Text>
                            </View>
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: width * 0.002, borderBottomWidth: width * 0.002, width: width * 0.238, padding: width * 0.01,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.surgeonName}</Text>
                            </View>
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: width * 0.002, borderBottomWidth: width * 0.002, width: width * 0.238, padding: width * 0.01,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.facilityName}</Text>
                            </View>
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: width * 0.002, borderBottomWidth: width * 0.002, width: width * 0.238, padding: width * 0.01,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.proctype}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
        
    );
  };

  const styles = StyleSheet.create({
      rButton: {
          width: width * 0.315,
          height: width * 0.08,
          marginLeft: width * 0.02,
          backgroundColor: "#ededed",
          borderRadius: 5,
      },
      buttonLight: {
          width: width * 0.45,
          height: width * 0.08,
          borderRadius: 5,
          borderWidth: width * 0.003,
          paddingTop: width * 0.011,
          marginTop: width * 0.01,
          textAlign: 'center',
      },
      buttonDark: {
        width: width * 0.45,
        height: width * 0.08,
        borderRadius: 5,
        borderWidth: width * 0.003,
        paddingTop: width * 0.011,
        marginTop: width * 0.01,
        backgroundColor: "#333436",
        color: "#fff",
        textAlign: "center",
      },
      lBox: {
          position: "absolute",
          width: width * 0.5,
          height: width * 0.33,
          backgroundColor: "#ededed",
          marginTop: width * 0.52,
          marginLeft: width * 0.04,
          borderRadius: 5,
          borderWidth: width * 0.003,
          zIndex: 1
      },
      rBox: {
          position: "absolute",
          width: width * 0.5,
          padding: width * 0.02,
          backgroundColor: "#ededed",
          marginTop: width * 0.52,
          marginLeft: width * 0.38,
          borderRadius: 5,
          borderWidth: width * 0.003,
          zIndex: 1
      },
      container: {
          backgroundColor: '#FFFFFF',
          height: height,
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
          color: "#4fd697",
          fontWeight: "bold",
          fontSize: width * 0.07,
          marginLeft: width * 0.025,
          width: width * 0.485, 
      },
      arrow: {
          backgroundColor: "rgba(0, 122, 255, 0.9)",
          width: width * 0.2,
          height: width * 0.1,
          borderRadius: 5,
          marginTop: width * 0.025
      },
      arrow2: {
          backgroundColor: "rgba(0, 122, 255, 0.9)",
          width: width * 0.2,
          height: width * 0.1,
          borderRadius: 5,
          marginTop: width * 0.025,
          marginLeft: width * 0.025,
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
      grid: {
          width: width * 0.985,
      },
      columns: {
          flexDirection: 'row',
          marginLeft: width * 0.025,
          backgroundColor: "#717475",
          width: width * 0.955
      },
      columnText: {
          color: "#ffffff",
          fontSize: width * 0.04,
          fontWeight: "bold",
      },
      cell: {
          borderLeftWidth: width * 0.002,
          borderBottomWidth: width * 0.002,
          width: width * 0.238,
          padding: width * 0.01,
      },
      cellDark: {
          borderLeftWidth: width * 0.002,
          borderBottomWidth: width * 0.002,
          width: width * 0.238,
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
          marginTop: width * 0.01,
      },
      body: {
          color: "#292c3b",
          marginLeft: width * 0.02,
          marginTop: width * 0.01,
          fontSize: width * 0.03
      },
      textInput: {
          color: "#39404d"
      },
      expandingTextInput: {
          width: width * 0.98,
          marginLeft: width * 0.02,
          marginTop: width * 0.01,
          padding: width * 0.01,
          borderRadius: 5,
          backgroundColor: '#ededed'
      },
      textBox: {
          width: width * 0.96,
          height: width * 0.08,
          marginLeft: width * 0.02,
          marginTop: width * 0.01,
          padding: width * 0.02,
          borderRadius: 5,
          backgroundColor: '#ededed'
      },
      bigTextBox: {
          width: width * 0.96,
          height: width * 0.2,
          marginLeft: width * 0.02,
          marginTop: width * 0.01,
          padding: width * 0.02,
          borderRadius: 5,
          backgroundColor: '#ededed'
      },
      bottom: {
          marginBottom: height
      },
      largeButton: {
          backgroundColor: '#ededed',
          width: width * 0.4,
          height: width * 0.1,
          borderRadius: 5,
          marginLeft: width * 0.025,
          marginTop: width * 0.015
      },
      button: {
          backgroundColor: '#ededed',
          width: width * 0.45,
          height: width * 0.1,
          borderRadius: 5,
          marginTop: width * 0.08,
          marginLeft: width * 0.02
      },
      smallButton: {
          backgroundColor: '#39404d',
          width: width * 0.29,
          height: width * 0.06,
          borderRadius: 5,
          marginTop: width * 0.02,
          marginLeft: width * 0.03
      },
      smallCancel: {
          backgroundColor: '#eb4034',
          width: width * 0.2,
          height: width * 0.06,
          borderRadius: 5,
          marginTop: width * 0.02,
          marginLeft: width * 0.455
      },
      smallButtonText: {
          color: "#ffffff",
          fontSize: width * 0.04,
          marginLeft: width * 0.03,
          marginTop: width * 0.01,
      },
      buttonText: {
          fontSize: width * 0.08,
          marginLeft: width * 0.03,
          marginTop: width * 0.01
      },
      calendar: {
          marginTop: width * 0.01,
          position: "absolute",
          marginLeft: width * 0.001
      },
      time: {
          marginTop: width * 0.01,
      },
      timezone: {
          marginTop: width * 0.01,
          marginLeft: width * 0.756,
          width: width * 0.22,
          height: width * 0.08,
          borderRadius: 5,
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
          paddingBottom: width * 0.02,
          fontSize: width * 0.06,
      },
      picture: {
          backgroundColor: '#007AFF',
          width: width * 0.45,
          height: width * 0.1,
          borderRadius: 5,
          marginTop: width * 0.08,
          marginLeft: width * 0.02
      },
      pictureText: {
          color: "#ffffff",
          fontSize: width * 0.08,
          marginLeft: width * 0.05,
          marginTop: width * 0.01,
      },
      icon: {
          height: width * 0.065,
          width: width * 0.065,
          marginTop: width * 0.01,
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
      menuButtons: {
          borderBottomWidth: width * 0.002,
          borderBottomColor: "#cfcfcf",
          height: width * 0.124,
          flexDirection: "row",
      },
      collapsed: {
            display: 'none',
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

            borderRadius: 5,
          flexDirection: "row",
      },
      optionText: {
            fontSize: width * 0.06,
            marginTop: width * 0.0075,
            marginLeft: width * 0.02,
            textAlign: "center",
          borderBottomWidth: 1,
      },
});

export default ListPage;