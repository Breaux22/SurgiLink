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
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify({'surgYear': year, 'months': month})
        }
        const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getCases';
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
        <SafeAreaView>
            <View style={styles.menuButtons}>
                <TouchableOpacity onPress={openMenu}>
                    <Image source={require('../../assets/icons/menu.png')} style={openStyle}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeMenu}>
                    <Image source={require('../../assets/icons/close.png')} style={closeStyle}/>
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.year}>{year}</Text>
            </View>
            <View style={styles.row}>
                <View style={menuStyle}>
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Business Monthly View", params: { month: month, year: year } }],
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
                          routes: [{ name: "Business Weekly View", params: { month: month, year: year } }],
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
                          routes: [{ name: "Business Settings", params: { month: month, year: year } }],
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
            <Text>BUSINESS PAGE</Text>
            <View style={[styles.nav, {marginTop: width * 0.03}]}>
                <TouchableOpacity 
                    style={styles.arrow}
                    onPress={() => {
                        prevMonth();
                    }}
                    >
                    <Image source={require('../../assets/icons/left-arrow.png')} style={styles.arrowIcon}/>
                </TouchableOpacity>
                <Text allowFontScaling={false} style={styles.month}>{convertMonthToString(month)}</Text>
                <TouchableOpacity 
                    style={styles.arrow2}
                    onPress={() => {
                        nextMonth();
                    }}
                    >
                    <Image source={require('../../assets/icons/right-arrow.png')} style={styles.arrowIcon2}/>
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
                                  routes: [{ name: "Business Case Info", params: { backTo: {name: 'Business List Cases', params: {month: month, year: year}}, caseProp: myCase} }],
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
      },
      row: {
          flexDirection: 'row',
      },
      nav: {
          flexDirection: "row",
          marginLeft: width * 0.025,
      },
      year: {
          fontSize: width * 0.1,
          marginLeft: width * 0.26,
      },
      month: {
          fontSize: width * 0.1,
          textAlign: "center",
          width: width * 0.56,
          marginTop: - width * 0.01,
          marginBottom: width * 0.02
      },
      arrow: {
          backgroundColor: "rgba(0, 122, 255, 0.8)",
          width: width * 0.2,
          height: width * 0.1,
          borderRadius: 5
      },
      arrow2: {
          backgroundColor: "rgba(0, 122, 255, 0.8)",
          width: width * 0.2,
          height: width * 0.1,
          borderRadius: 5
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
          //borderRightWidth: width * 0.002,
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
          backgroundColor: '#39404d',
          width: width * 0.29,
          height: 25,
          borderRadius: 5,
          marginTop: 8,
          marginLeft: width * 0.03
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
      icon3: {
            width: width * 0.1,
            height: width * 0.1,
            marginLeft: width * 0.02,
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

export default ListPage;