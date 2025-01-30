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
    const navigation = useNavigation();
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [month, setMonth] = useState(route.params?.month || new Date().getMonth());
    const [year, setYear] = useState(route.params?.year || new Date().getFullYear());
    const [cases, setCases] = useState([]);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const { myMemory, setMyMemory } = useMemory();

    async function saveData (userInfo) {
        setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
    };

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

    async function getCases (year, month) {
        const data = {
            surgYear: year, 
            months: month,
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
            .then(data => {
                setCases(prev => data);
            })
        return response;
    }

    function formatDate(dateInput) {
      const date = new Date(dateInput);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits
      const year = date.getFullYear();
      return `${month}, ${day} ${year}`;
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

    useEffect(() => {
        (async () => {
            var caseArray = await getCases(year || new Date().getFullYear(), [month] || [new Date().getMonth()]);
            caseArray = await caseArray.sort((a,b) => new Date(a.dateString) - new Date(b.dateString));
            setCases(oldCases => caseArray);
        })();

        return () => {
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                style={{position: "absolute", marginLeft: width * 0.89, marginTop: width * 0.125, }}
                onPress={() => {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'New Case', params: {backTo: {name: 'Case List', params: {month: month, year: year}}}}]
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
                          routes: [{ name: "List Trays", params: { month: month, year: year } }],
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
                <View style={backBlur}></View>
            </View>
            <Text allowFontScaling={false} style={styles.monthYear}>{convertMonthToString(month)}, {year}</Text>
            <View style={styles.row}>
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
                <TouchableOpacity 
                    style={styles.new}
                    onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Create New Case", params: {backTo: {name: "List View", params: {month: month, year: year}}}}],
                        });
                    }}
                    >
                    <Text allowFontScaling={false} style={styles.newText}>+</Text>
                </TouchableOpacity>
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
                    {cases.map((myCase, index) => (
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
                            <View style={cellColor(index)}>
                                <Text allowFontScaling={false} style={styles.cellText}>{formatDate(myCase.dateString)}</Text>
                                <Text allowFontScaling={false} style={styles.cellText}>{convertTo12HourTime(myCase.dateString.slice(11,16))}</Text>
                            </View>
                            <View style={cellColor(index)}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.dr}</Text>
                            </View>
                            <View style={cellColor(index)}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.hosp}</Text>
                            </View>
                            <View style={cellColor(index)}>
                                <Text allowFontScaling={false} style={styles.cellText}>{myCase.proctype}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{height: width * 0.2}} />
            </ScrollView>
        </SafeAreaView>
        
    );
  };

  const styles = StyleSheet.create({
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
      grid: {
          width: width * 0.985,
          marginBottom: width * 0.33,
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
            borderBottomWidth: 1,
            borderRadius: 5
      },
      optionText: {
            fontSize: width * 0.06,
            marginTop: width * 0.0075,
            textAlign: "center"
      },
});

export default ListPage;