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
    const navigation = useNavigation();
    const styles = myStyles(useSafeAreaInsets());
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [month, setMonth] = useState(route.params?.month || new Date().getMonth());
    const [year, setYear] = useState(route.params?.year || new Date().getFullYear());
    const [cases, setCases] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
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
    // filters cases by user
    const [userList, setUserList] = useState();
    const [userListStyle, setUserListStyle] = useState(styles.collapsed);
    const [filterValue, setFilterValue] = useState(null);
    const [currUser, setCurrUser] = useState(null);

    useEffect(() => {
        (async () => {
            const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
            setFilterValue(JSON.stringify({id: userInfo.id, username: 'Everyone'}));
            setCurrUser(userInfo);
            const userArr = JSON.parse(userInfo.userList);
            setUserList(userArr);
        })();
        return;
    }, [])

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

    async function getSurgeons () {
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
        const url = 'https://SurgiLink.replit.app/getSurgeons';
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
        const url = 'https://SurgiLink.replit.app/getFacilities';
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
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            surgYear: year, 
            months: month,
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
                setCases(tempArr);
            } else {
                let newArr = tempArr.filter((value, index) => value.userId == myObj.id);
                setCases(newArr);
            }
        } else {
            setCases(prev => tempArr);
        }
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

    async function displayRepName(repId) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        if (repId == userInfo.id) {
            return userInfo.username;
        } else {
            const filterUser = userList.filter((item) => item.id == repId);
            return filterUser[0].username;
        }
    }

    function fillRightBoxData (choice) {
        if (choice == 'None') {
            setFilteredCases(prev => cases);
            setLButText(prev => 'None');
            setLBoxStyle(prev => styles.collapsed);
            setRButStyle(prev => styles.collapsed);
            setRBoxStyle(prev => styles.collapsed);
        } else if (choice == 'Surgeons') {
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

    async function filterCases (myId, myUsername) {
        if (myUsername == 'Everyone') {
            setCases(masterData);
        } else {
            let tempArr = [...masterData];
            let newArr = tempArr.filter((item, index) => item.rep == myId);
            setCases(newArr);
        }
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
                <TouchableOpacity style={backBlur} onPress={() => closeMenu()}/>
            </View>
            <View style={[styles.row, {backgroundColor: "#333436", width: width * 0.96, borderTopLeftRadius: 5, borderTopRightRadius: 5, marginTop: height * 0.0125, marginLeft: width * 0.02, paddingBottom: height * 0.005,}]}>
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
            <View style={{backgroundColor: "#333436", width: width * 0.96, marginLeft: width * 0.02,}}>
                <TouchableOpacity
                    style={{width: height * 0.19, height: height * 0.04, backgroundColor: "#ededed", marginLeft: height * 0.01, borderRadius: 5, marginBottom: height * 0.01, paddingLeft: height * 0.01, paddingRight: height * 0.01,}}
                    onPress={() => {
                        if (JSON.stringify(userListStyle) == JSON.stringify(styles.collapsed)) {
                            setUserListStyle({width: width, height: height * 0.25,});
                        } else {
                            setUserListStyle(styles.collapsed);
                        }
                        setLBoxStyle(styles.collapsed);
                        setRBoxStyle(styles.collapsed);
                    }}
                    >
                    <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={{marginTop: height * 0.009, textAlign: "center", }}>Calendar: {filterValue && JSON.parse(filterValue).username}</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.row, {backgroundColor: "#333436", width: width * 0.96, height: height * 0.05, marginLeft: width * 0.02, }]}>
                <TouchableOpacity
                    style={{width: height * 0.165, height: height * 0.04, backgroundColor: "#ededed", marginLeft: height * 0.01, borderRadius: 5, }}
                    onPress={() => {
                        setFilterBy(prev => []);
                        if (JSON.stringify(lBoxStyle) === JSON.stringify(styles.collapsed)) {
                            setLBoxStyle(prev => styles.lBox);
                            setRBoxStyle(prev => styles.collapsed);
                        } else {
                            setLBoxStyle(prev => styles.collapsed);
                        }
                    }}
                    >
                    <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={{marginTop: height * 0.009, textAlign: "center", }}>filter: by {lButText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={rButStyle}
                    onPress={() => {
                        if (JSON.stringify(rBoxStyle) == JSON.stringify(styles.collapsed)) {
                            setRBoxStyle(prev => styles.rBox);
                            setLBoxStyle(prev => styles.collapsed);
                        } else {
                            setRBoxStyle(prev => styles.collapsed);
                        }
                    }}
                    >
                    <Text allowFontScaling={false} style={{textAlign: "center", marginTop: height * 0.009}}>{rButText} Selected</Text>
                </TouchableOpacity>
            </View>
            <View style={lBoxStyle}>
                <TouchableOpacity
                    style={{width: height * 0.16, height: height * 0.04, borderRadius: 2.5, marginLeft: height * 0.01125, marginTop: height * 0.01, borderWidth: height * 0.0015, }}
                    onPress={() => {
                        fillRightBoxData('None');
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", marginTop: height * 0.006, }}>None</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: height * 0.16, height: height * 0.04, borderRadius: 2.5, marginLeft: height * 0.01125, marginTop: height * 0.01, borderWidth: height * 0.0015, }}
                    onPress={() => {
                        fillRightBoxData('Surgeons');
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", marginTop: height * 0.006, }}>Surgeons</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{width: height * 0.16, height: height * 0.04, borderRadius: 2.5, marginLeft: height * 0.01125, marginTop: height * 0.01, borderWidth: height * 0.0015, }}
                    onPress={() => {
                        fillRightBoxData('Facilities');
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: height * 0.02, textAlign: "center", marginTop: height * 0.006, }}>Facilities</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={rBoxStyle}>
                {rBoxData.map((item, index) => (
                    <TouchableOpacity
                        key={item.surgeonName || item.facilityName}
                        onPress={() => {
                            if (JSON.stringify(rBoxStyles[index]) == JSON.stringify(styles.buttonLight)) {
                                let tempArr = [...rBoxStyles];
                                tempArr[index] = styles.buttonDark;
                                setRBoxStyles(prev => tempArr);
                                setFilterBy(prev => [...prev, rBoxData[index]])
                            } else {
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
                        <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={rBoxStyles[index]}>{lButText == 'Surgeons' ? item.surgeonName : item.facilityName}</Text>
                    </TouchableOpacity>
                ))}
                <View style={{height: height * 0.015,}}/>
            </ScrollView>
            <View style={styles.columns}>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Date</Text>
                </View>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Surgeon</Text>
                </View>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Facility & Rep</Text>
                </View>
                <View style={styles.cell}>
                    <Text allowFontScaling={false} style={styles.columnText}>Procedure</Text>
                </View>
            </View>
            <Picker
                selectedValue={filterValue && filterValue}
                onValueChange={(itemValue) => {
                    setFilterValue(itemValue);
                    setUserListStyle(styles.collapsed);
                    filterCases(JSON.parse(itemValue).id, JSON.parse(itemValue).username);
                }}
                style={userListStyle}
            >        
                <Picker.Item label={'Everyone'} value={currUser && JSON.stringify({id: currUser.org, username: 'Everyone'})} />
                <Picker.Item label={currUser && currUser.username} value={currUser && JSON.stringify(currUser)} />
                {userList && userList.map((item, index) => (
                    <Picker.Item key={item.username + "A" + index} label={item.username} value={JSON.stringify(item)} />
                ))}
            </Picker>
            <ScrollView style={styles.grid}>
                <View style={{width: width * 0.96, marginLeft: width * 0.02, borderRightWidth: height * 0.001, borderTopWidth: height * 0.001,}}>
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
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: height * 0.001, borderBottomWidth: height * 0.001, width: width * 0.2398, padding: height * 0.005,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>{formatDate(myCase.dateString)}</Text>
                                <Text allowFontScaling={false} style={styles.cellText}>{convertTo12HourTime(myCase.dateString.slice(11,16))}</Text>
                            </View>
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: height * 0.001, borderBottomWidth: height * 0.001, width: width * 0.2398, padding: height * 0.005,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.surgeonName}</Text>
                            </View>
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: height * 0.001, borderBottomWidth: height * 0.001, width: width * 0.2398, padding: height * 0.005,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>@{myCase.facilityName} {'\n'}Rep: {displayRepName(myCase.rep)}</Text>
                            </View>
                            <View style={{backgroundColor: myCase.color, borderLeftWidth: height * 0.001, borderBottomWidth: height * 0.001, width: width * 0.2398, padding: height * 0.005,}}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.proctype}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
        
    );
  };

  const myStyles = (insets) => StyleSheet.create({
      rButton: {
          width: height * 0.15,
          height: height * 0.04,
          marginLeft: height * 0.01,
          backgroundColor: "#ededed",
          borderRadius: 5,
      },
      buttonLight: {
          width: height * 0.18,
          height: height * 0.04,
          borderRadius: 2.5,
          borderWidth: height * 0.0015,
          paddingTop: height * 0.0076,
          marginTop: height * 0.0055,
          textAlign: 'center',
      },
      buttonDark: {
        width: height * 0.18,
        height: height * 0.04,
        borderRadius: 2.5,
        borderWidth: height * 0.0015,
        paddingTop: height * 0.0076,
        marginTop: height * 0.0055,
        backgroundColor: "#333436",
        color: "#fff",
        textAlign: "center",
      },
      lBox: {
          position: "absolute",
          width: height * 0.185,
          height: height * 0.165,
          backgroundColor: "#ededed",
          top: insets.top + height * 0.26,
          left: width * 0.02 + height * 0.01,
          borderRadius: 5,
          borderWidth: height * 0.0015,
          zIndex: 1
      },
      rBox: {
          position: "absolute",
          width: height * 0.205,
          maxHeight: height * 0.5,
          padding: height * 0.01,
          backgroundColor: "#ededed",
          top: insets.top + height * 0.26,
          left: width * 0.02 + height * 0.185,
          borderRadius: 5,
          borderWidth: height * 0.0015,
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
          height: height * 0.085,
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
          color: "#4fd697",
          fontWeight: "bold",
          fontSize: height * 0.035,
          marginLeft: height * 0.01,
          width: width * 0.485, 
      },
      arrow: {
          backgroundColor: "rgba(0, 122, 255, 0.9)",
          width: height * 0.1,
          height: height * 0.05,
          borderRadius: 5,
          marginTop: height * 0.0125,
          position: "absolute",
          right: height * 0.12,
      },
      arrow2: {
          backgroundColor: "rgba(0, 122, 255, 0.9)",
          width: height * 0.1,
          height: height * 0.05,
          borderRadius: 5,
          marginTop: height * 0.0125,
          position: "absolute",
          right: height * 0.01,
      },
      arrowIcon: {
          width: height * 0.03,
          height: height * 0.03,
          marginLeft: height * 0.03,
          marginTop: height * 0.01
      },      
      arrowIcon2: {
        width: height * 0.03,
        height: height * 0.03,
        marginLeft: height * 0.0375,
        marginTop: height * 0.01
      },
      grid: {
          width: width * 0.985,
      },
      columns: {
          flexDirection: 'row',
          marginLeft: width * 0.02,
          backgroundColor: "#717475",
          width: width * 0.96
      },
      columnText: {
          color: "#ffffff",
          fontSize: height * 0.018,
          fontWeight: "bold",
      },
      cell: {
          borderLeftWidth: height * 0.001,
          borderBottomWidth: height * 0.001,
          width: width * 0.2399,
          padding: height * 0.005,
      },
      cellDark: {
          borderLeftWidth: height * 0.001,
          borderBottomWidth: height * 0.001,
          width: width * 0.238,
          padding: height * 0.005,
          backgroundColor: "#d4d6d6",
      },
      cellText: {
          fontSize: height * 0.0175,
      },
      tzPicker: {
        fontSize: height * 0.005
      },
      title: {
          color: "#292c3b",
          marginLeft: width * 0.02,
          marginTop: height * 0.005,
      },
      body: {
          color: "#292c3b",
          marginLeft: width * 0.02,
          marginTop: height * 0.005,
          fontSize: height * 0.015
      },
      textInput: {
          color: "#39404d"
      },
      expandingTextInput: {
          width: width * 0.98,
          marginLeft: width * 0.02,
          marginTop: height * 0.005,
          padding: height * 0.005,
          borderRadius: 5,
          backgroundColor: '#ededed'
      },
      textBox: {
          width: width * 0.96,
          height: height * 0.04,
          marginLeft: width * 0.02,
          marginTop: height * 0.005,
          padding: height * 0.01,
          borderRadius: 5,
          backgroundColor: '#ededed'
      },
      bigTextBox: {
          width: width * 0.96,
          height: height * 0.1,
          marginLeft: width * 0.02,
          marginTop: height * 0.005,
          padding: height * 0.01,
          borderRadius: 5,
          backgroundColor: '#ededed'
      },
      bottom: {
          marginBottom: height
      },
      largeButton: {
          backgroundColor: '#ededed',
          width: width * 0.4,
          height: height * 0.05,
          borderRadius: 5,
          marginLeft: width * 0.025,
          marginTop: height * 0.0075
      },
      button: {
          backgroundColor: '#ededed',
          width: width * 0.45,
          height: height * 0.05,
          borderRadius: 5,
          marginTop: height * 0.04,
          marginLeft: width * 0.02
      },
      smallButton: {
          backgroundColor: '#39404d',
          width: width * 0.29,
          height: height * 0.03,
          borderRadius: 5,
          marginTop: height * 0.01,
          marginLeft: width * 0.03
      },
      smallCancel: {
          backgroundColor: '#eb4034',
          width: width * 0.2,
          height: height * 0.03,
          borderRadius: 5,
          marginTop: height * 0.01,
          marginLeft: width * 0.455
      },
      smallButtonText: {
          color: "#ffffff",
          fontSize: height * 0.02,
          marginLeft: width * 0.03,
          marginTop: height * 0.005,
      },
      buttonText: {
          fontSize: height * 0.04,
          marginLeft: width * 0.03,
          marginTop: height * 0.005
      },
      calendar: {
          marginTop: height * 0.005,
          position: "absolute",
          marginLeft: width * 0.001
      },
      time: {
          marginTop: height * 0.005,
      },
      timezone: {
          marginTop: height * 0.005,
          marginLeft: width * 0.756,
          width: width * 0.22,
          height: height * 0.04,
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
          paddingBottom: height * 0.01,
          fontSize: height * 0.03,
      },
      picture: {
          backgroundColor: '#007AFF',
          width: width * 0.45,
          height: height * 0.05,
          borderRadius: 5,
          marginTop: height * 0.04,
          marginLeft: width * 0.02
      },
      pictureText: {
          color: "#ffffff",
          fontSize: height * 0.04,
          marginLeft: width * 0.05,
          marginTop: height * 0.005,
      },
      icon: {
          height: height * 0.0325,
          width: height * 0.0325,
          marginTop: height * 0.005,
          marginLeft: width * 0.015
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
      closeIcon: {
          width: height * 0.05,
          height: height * 0.05,
          marginLeft: 0
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
});

export default ListPage;