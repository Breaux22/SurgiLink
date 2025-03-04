import * as React from 'react';
import { useCallback } from 'react';
import { useState, useEffect } from 'react';
import { useRoute } from "@react-navigation/native";
import { Image, StyleSheet, View, ScrollView, Text, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DailyViewCase from '../../components/DailyViewCase/DailyViewCase';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const { width, height } = Dimensions.get('window');

const WeeklyViewPage = () => {
    const route = useRoute();
    const insets = useSafeAreaInsets();
    const [year, setYear] = useState(route.params?.year || new Date().getFullYear()); // integer
    const [month, setMonth] = useState(route.params?.month || new Date().getMonth()); // integer
    const [weekStart, setWeekStart] = useState(route.params?.weekStart || new Date(new Date().getTime() - (1000*60*60*24*(new Date().getDay())))); // date object
    const [weekArr, setWeekArr] = useState([]);
    const [weekComp, setWeekComp] = useState();
    const [cases, setCases] = useState([]); 
    const [masterData, setMasterData] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);
    const [style1, setStyle1] = useState(styles.regular); // other options .tall, .short
    const [style2, setStyle2] = useState(styles.regular);
    const [style3, setStyle3] = useState(styles.regular);
    const [style4, setStyle4] = useState(styles.regular);
    const [style5, setStyle5] = useState(styles.regular);
    const [style6, setStyle6] = useState(styles.regular);
    const [style7, setStyle7] = useState(styles.regular);
    const styleOptions = [style1, style2, style3, style4, style5, style6, style7];
    const setStyleOptions = [setStyle1, setStyle2, setStyle3, setStyle4, setStyle5, setStyle6, setStyle7];
    const [caseStyle1, setCaseStyle1] = useState(styles.regularCase);
    const [caseStyle2, setCaseStyle2] = useState(styles.regularCase);
    const [caseStyle3, setCaseStyle3] = useState(styles.regularCase);
    const [caseStyle4, setCaseStyle4] = useState(styles.regularCase);
    const [caseStyle5, setCaseStyle5] = useState(styles.regularCase);
    const [caseStyle6, setCaseStyle6] = useState(styles.regularCase);
    const [caseStyle7, setCaseStyle7] = useState(styles.regularCase);
    const caseStyleOptions = [caseStyle1, caseStyle2, caseStyle3, caseStyle4, caseStyle5, caseStyle6, caseStyle7];
    const setCaseStyleOptions = [setCaseStyle1, setCaseStyle2, setCaseStyle3, setCaseStyle4, setCaseStyle5, setCaseStyle6, setCaseStyle7];
    const [direction, setDirection] = useState(true);
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const navigation = useNavigation();
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

    async function displayRepName(repId) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        if (repId == userInfo.id) {
            return userInfo.username;
        } else {
            const filterUser = userList.filter((item) => item.id == repId);
            return filterUser[0].username;
        }
    }

    async function getCases () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        let monthArr = [];
        if (weekStart.getMonth() == new Date(weekStart.getTime() + (1000*60*60*24*7)).getMonth()){monthArr = [weekStart.getMonth() + 1]}
        else {monthArr = [weekStart.getMonth() + 1, new Date(weekStart.getTime() + (1000*60*60*24*7)).getMonth() + 1]}
        const data = {
            surgYear: weekStart.getFullYear(),
            months: monthArr,
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
        }
        const headers = {
            "method": "POST",
            "headers": {
                "content-type": "application/json"
            },
            "body": JSON.stringify(data),
        }
        const response = await fetch('https://SurgiLink.replit.app/getCases', headers)
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
                let newArr = tempArr.filter((value, index) => value.rep == myObj.id);
                setCases(newArr);
            }
        } else {
            setCases(prev => tempArr);
        }
    }

    async function filterCases (myId, myUsername) {
        if (myUsername == 'Everyone') {
            setCases(masterData);
        } else {
            let tempArr = [...masterData];
            let newArr = tempArr.filter((item, index) => item.userId == myId);
            setCases(newArr)   
        }
    }

    function getDayString (myIndex) {
        const dayArr = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return dayArr[myIndex];
    }

    function getMonthString (myIndex) {
        const monthArr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return monthArr[myIndex];
    }

    function getFullMonthString (myIndex) {
        const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthArr[myIndex];
    }

    function setMyStyles (myIndex) {
        if (styleOptions[myIndex] != styles.tall) {
            setStyleOptions[myIndex](prev => styles.tall);
            const tempArr = setStyleOptions.filter((item, index) => index != myIndex);
            tempArr.map((item, index) => {
                item(prev => styles.short);
            })
        } else {
            setStyleOptions.map((item, index) => {
                item(prev => styles.regular);
            })
        }
        getWeek();
    }

    function fillDailyCases (myDate, index) {
        if (styleOptions[index] == styles.regular) {
            let caseArr = cases.filter((item) => new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate() == myDate.getDate());
            return (
                <ScrollView horizontal>{
                    caseArr.map((item, index) => (
                        <TouchableOpacity
                            key={item + index}
                            style={{     
                                marginRight: height * 0.01,
                                marginBottom: height * 0.01,
                                backgroundColor: item.color,
                                height: height * 0.105,
                                width: width * 0.25,
                                borderRadius: 5,
                                padding: height * 0.005,
                            }}
                            onPress={() => {
                                navigation.reset({
                                    index: 0,
                                    routes: [{
                                        name: "Case Info",
                                        params: {
                                            backTo: {
                                                name: "Weekly View",
                                                params: {
                                                    weekStart: weekStart,
                                                    month: weekStart.getMonth(),
                                                    year: weekStart.getFullYear(),
                                                }
                                            },
                                            caseProp: item
                                        }
                                    }]
                                })
                            }}
                            >
                            <Text allowFontScaling={false} style={{borderBottomWidth: height * 0.0015, }}>{formatTo12HourTime(new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)))}</Text>
                            <Text allowFontScaling={false} ellipsizeMode="tail" numberOfLines={1} style={{fontWeight: "bold"}}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName : "Surgeon?"}</Text>
                            <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail">Rep: {displayRepName(item.rep)}</Text>
                            <Text allowFontScaling={false} style={{}}>{item.proctype}</Text>
                        </TouchableOpacity>
                    ))
                }</ScrollView>
            )
        } else if (styleOptions[index] == styles.short) {
            let caseArr = cases.filter((item) => new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate() == myDate.getDate());
            return (
                <ScrollView horizontal>{
                    caseArr.map((item, index) => (
                        <TouchableOpacity
                            key={item + index}
                            style={{
                                marginRight: height * 0.01,
                                marginBottom: height * 0.01,
                                backgroundColor: item.color,
                                height: height * 0.04,
                                width: width * 0.2,
                                borderRadius: 5,
                                overflow: "hidden",
                            }}
                            onPress={() => {
                                navigation.reset({
                                    index: 0,
                                    routes: [{
                                        name: "Case Info",
                                        params: {
                                            backTo: {
                                                name: "Weekly View",
                                                params: {
                                                    weekStart: weekStart,
                                                    month: weekStart.getMonth(),
                                                    year: weekStart.getFullYear(),
                                                }
                                            },
                                            caseProp: item
                                        }
                                    }]
                                })
                            }}
                            >
                            <Text allowFontScaling={false} style={{borderBottomWidth: height * 0.0015, width: width * 0.17, marginLeft: width * 0.01, fontSize: height * 0.015, }}>{formatTo12HourTime(new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)))}</Text>
                            <Text allowFontScaling={false} ellipsizeMode="tail" numberOfLines={1} style={{fontWeight: "bold", marginLeft: width * 0.01, }}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName.slice(0,10) : "Surgeon?"}</Text>
                        </TouchableOpacity>
                    ))
                }</ScrollView>
            )
        } else {
            let caseArr = cases.filter((item) => new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)).getDate() == myDate.getDate());
            return (
                <ScrollView style={{height: height * 0.49}}>{
                    caseArr.map((item, index) => (
                        <TouchableOpacity
                            key={item + index}
                            style={{
                                marginRight: height * 0.01,
                                marginBottom: height * 0.005,
                                backgroundColor: item.color,
                                minHeight: height * 0.105,
                                width: width * 0.68,
                                borderRadius: 5,
                                padding: height * 0.005,
                            }}
                            onPress={() => {
                                navigation.reset({
                                    index: 0,
                                    routes: [{
                                        name: "Case Info",
                                        params: {
                                            backTo: {
                                                name: "Weekly View",
                                                params: {
                                                    weekStart: weekStart,
                                                    month: weekStart.getMonth(),
                                                    year: weekStart.getFullYear(),
                                                }
                                            },
                                            caseProp: item
                                        }
                                    }]
                                })
                            }}
                            >
                            <Text allowFontScaling={false} style={{borderBottomWidth: height * 0.0015, }}>{formatTo12HourTime(new Date(new Date(item.surgdate).getTime() + (1000*60*60*8)))}</Text>
                            <Text allowFontScaling={false} ellipsizeMode="tail" numberOfLines={1} style={{fontWeight: "bold", }}>{item.surgeonName !== "Choose Surgeon..." ? item.surgeonName : "Surgeon?"}</Text>
                            <Text allowFontScaling={false} style={{}}>Procedure: {item.proctype !== "" ? item.proctype : "~"}</Text>
                            <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" >Rep: {displayRepName(item.rep)}</Text>
                            <Text allowFontScaling={false}>Notes:</Text>
                            <Text allowFontScaling={false}>{item.notes !== "" ? item.notes : "~"}</Text>
                        </TouchableOpacity>
                    ))
                }</ScrollView>
            )
        }
    }

    function fillWeekComp () {
        setWeekComp(prev =>
            weekArr.map((item, index) => (
                <View key={item + "A" + index} style={styles.row}>
                    <TouchableOpacity
                        style={[styleOptions[index], {width: width * 0.25, borderWidth: height * 0.0015, borderRadius: 5, padding: height * 0.005, marginLeft: width * 0.02, marginBottom: height * 0.005, opacity: 1, backgroundColor: "#333436", }]}
                        onPress={() => setMyStyles(index)}
                        >
                        <Text allowFontScaling={false} style={{color: "#fff", fontSize: height * 0.02, width: height * 0.0565, borderBottomWidth: height * 0.0015, borderBottomColor: "#fff", fontWeight: "bold", }}>{getDayString(index)}</Text>
                        <Text allowFontScaling={false} style={{color: "#fff"}}>{getMonthString(item.getMonth())} {item.getDate()}</Text>
                    </TouchableOpacity>
                    <View style={[styleOptions[index], {overflow: "hidden", flexDirection: "row", flexWrap: "wrap", borderColor: "#333436", marginLeft: - width * 0.02, width: width * 0.73, borderTopWidth: height * 0.0015, borderBottomWidth: height * 0.0015, borderRightWidth: height * 0.0015, borderRadius: 5, padding: height * 0.005, }]}>
                        <View style={{width: width * 0.025}}/>
                        {fillDailyCases(item, index)}
                    </View>
                </View>
            ))
        )
    }

    function getWeek () {
        let dateArr = [];
        for(let i=0;i<7;i++){dateArr = [...dateArr, new Date(weekStart.getTime() + (1000*60*60*24*i))]}
        setWeekArr(prev => dateArr);
        getCases();
    }

    function nextWeek () {
        setWeekStart(prev => new Date(weekStart.getTime() + (1000*60*60*24*7)));
    }

    function prevWeek () {
        setWeekStart(prev => new Date(weekStart.getTime() - (1000*60*60*24*7)));
    }

    function getDateString (myDate) {
        if(myDate < 10){return '0' + String(myDate)}
        else {return myDate}
    }

    useEffect(() => {
        getWeek();
    }, [weekStart])

    useEffect(() => {
        fillWeekComp();
    }, [cases])

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
                            routes: [{ 
                                name: "Monthly View",
                                params: {              
                                    month: weekStart.getMonth(),
                                    year: weekStart.getFullYear() 
                                }
                            }],
                        });
                      }}
                      >
                        <Image source={require('../../assets/icons/30-days.png')} style={styles.icon3}/>
                        <Text allowFontScaling={false} style={styles.optionText}>Monthly View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        closeMenu();
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
                            routes: [{ 
                                name: "List Cases",
                                params: {                
                                    month: weekStart.getMonth(),
                                    year: weekStart.getFullYear() 
                                }
                            }],
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
                            routes: [{
                                name: "List Trays",
                                params: {                                                                
                                    month: weekStart.getMonth(),
                                    year: weekStart.getFullYear()
                                }
                            }],
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
                            routes: [{ 
                                name: "Settings", 
                                params: {                                                                
                                    month: weekStart.getMonth(),
                                    year: weekStart.getFullYear()
                                }
                            }],
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
                    onPress={() => getCases(year, [month + 1])}
                    >
                    <Image source={require('../../assets/icons/refresh.png')} style={{width: height * 0.045, height: height * 0.045, marginLeft: width * 0.02, marginTop: height * 0.01,}}/>
                </TouchableOpacity>
                <View style={{  position: "absolute", right: width * 0.02, top: height * 0.01, flexDirection: "row" }}>
                    <View style={{paddingLeft: height * 0.01, paddingRight: height * 0.01, backgroundColor: "#333436", borderRadius: 30, flexDirection: "row", alignSelf: "center", }}>
                        <TouchableOpacity
                            style={{alignSelf: "center",}}
                            onPress={() => prevWeek()}
                            >
                            <Text style={{color: "#fff", fontSize: height * 0.035, marginTop: - width * 0.005, }}>{"<"}</Text>
                        </TouchableOpacity>
                        <View style={[styles.row, {alignSelf: "center", maxWidth: width * 0.69}]}>
                            <Text style={{color: "#4fd697", fontWeight: "bold", fontSize: height * 0.025, textAlign: "center", }}>{getMonthString(weekStart.getMonth())} {getDateString(weekStart.getDate())},</Text>
                            <Text allowFontScaling={false} style={{color: "#fff", fontSize: height * 0.025, marginLeft: height * 0.01, marginRight: height * 0.01, fontStyle: "italic", }}>{weekStart.getFullYear()}</Text>
                            <Text style={{color: "#4fd697", fontWeight: "bold", fontSize: height * 0.025, textAlign: "right"}}>{getMonthString(new Date(weekStart.getTime() + (1000*60*60*24*7)).getMonth())} {getDateString(new Date(weekStart.getTime() + (1000*60*60*24*7)).getDate())}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => nextWeek()}>
                            <Text style={{color: "#fff", fontSize: height * 0.035, marginTop: - width * 0.005, }}>{">"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={{alignSelf: "flex-end",  marginRight: width * 0.02, marginBottom: height * 0.01, maxWidth: height * 0.35, height: height * 0.04, borderRadius: 5, backgroundColor: "#ededed", paddingLeft: height * 0.005, paddingRight: height * 0.005, }}
                onPress={() => {
                    if (JSON.stringify(userListStyle) == JSON.stringify(styles.collapsed)) {
                        setUserListStyle({width: width, height: height * 0.25,});
                    } else {
                        setUserListStyle(styles.collapsed);
                    }
                }}
                >
                <Text allowFontScaling={false} numberOfLines={1} ellipsizeMode="tail" style={{marginTop: height * 0.009, textAlign: "center", }}>Calendar: {filterValue && JSON.parse(filterValue).username}</Text>
            </TouchableOpacity>
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
            <ScrollView>
                {weekComp}
                <View style={{height: height * 0.3}}/>
            </ScrollView>
        </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row'
    },
    regular: {
        height: height * 0.1175, 
    },
    tall: {
        height: height * 0.5, 
    },
    short: {
        height: height * 0.054, 
    },
    regularCase: {
        marginLeft: width * 0.02,
        marginBottom: height * 0.01,
        backgroundColor: "#dae9f7",
        height: height * 0.105,
        width: width * 0.25,
        borderRadius: 5,
        padding: height * 0.005,
    },
    shortCase: {
        marginLeft: width * 0.02,
        marginBottom: height * 0.01,
        backgroundColor: "#dae9f7",
        height: height * 0.04,
        width: width * 0.2,
        borderRadius: 5,
        overflow: "hidden",
    },
    tallCase: {
        marginLeft: width * 0.02,
        marginBottom: height * 0.005,
        backgroundColor: "#dae9f7",
        minHeight: height * 0.105,
        width: width * 0.68,
        borderRadius: 5,
        padding: height * 0.005,
    },
    refreshArrowStyle: {
        height: height * 0.06,
        width: height * 0.06,
        marginLeft: width * 0.08,
    },
    new: {
        backgroundColor: "#8a8a8a",
        width: height * 0.06,
        height: height * 0.06,
        marginLeft: width * 0.219,
        borderRadius: 5,
        marginBottom: 10
    },
    newText: {
        color: "#fefefe",
        fontSize: height * 0.09,
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
        marginTop: height * 0.00375,
        textAlign: "center",
        borderBottomWidth: height * 0.001,
        marginLeft: width * 0.02,
    },
});

export default WeeklyViewPage;
