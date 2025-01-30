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

const CasePage = () => {
    const route = useRoute();
    const backTo = route.params?.backTo;
    const [surgdate, setSurgdate] = useState(new Date());
    const [surgdateText, setSDT] = useState('Select Date...'); // date
    const [sdStyle, setSdstyle] = useState(styles.collapsed);
    const [surgtime, setSurgtime] = useState(new Date()); // time
    const [proctype, setProctype] = useState(""); // procedure type
    const [notes, setNotes] = useState(""); // surgery details
    const [trayList, setTrayList] = useState([]); // list of trays for case
    const [myTrays, setMyTrays] = useState([]);
    const [loanerStatus, setLoanerStatus] = useState("Not Ordered"); // status of new tray
    const [loanerName, setLoanerName] = useState(""); // name of new tray
    const [lsStyle, setLsStyle] = useState(styles.collapsed);
    const [loanerStyle, setLoanerStyle] = useState(styles.collapsed);
    const [timezone, setTimezone] = useState("PST (GMT-8)"); // time zone
    const [tzPickerStyle, setTzPickerStyle] = useState(styles.collapsed);
    const [sdHeight, setSDHeight] = useState(32);
    const [mstStyle, setMstStyle] = useState(styles.collapsed);
    const [surgeonStyle, setSurgeonStyle] = useState(styles.collapsed);
    const [surgeonText, setSurgeonText] = useState("Choose Surgeon..."); // Surgeon Name
    const [surgeonText2, setSurgeonText2] = useState("");
    const [surgeonList, setSurgeonList] = useState([])
    const [mftStyle, setMftStyle] = useState(styles.collapsed);
    const [facilityStyle, setFacilityStyle] = useState(styles.collapsed);
    const [facilityText, setFacilityText] = useState("Choose Facility..."); // Surgeon Name
    const [facilityText2, setFacilityText2] = useState("");
    const [facilityList, setFacilityList] = useState([]);
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const navigation = useNavigation();

    async function getSurgeons() {
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
        }
        const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getSurgeons';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setSurgeonList(response);
    }

    async function getFacilities() {
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
        }
        const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getFacilities';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setFacilityList(response);
    }

    async function getMyTrays() {
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
        }
        const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getTrays';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setMyTrays(response);
    }

    async function addSurgeonToDB() {
        const data = {
            surgeonName: surgeonText,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/addSurgeon', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Data Not Saved')
                }
            })
        return response;
    }

    // not refactored
    async function addFacilityToDB() {
        const data = {
            facilityName: facilityText,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/addFacility', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Data Not Saved')
                }
            })
        return response;
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
    
    // Callback function to handle data from child
      async function handleChildData (data, index) {
        if (data.tray == "remove") {
            const newArr = trayList.filter((item, i) => i !== index);
            await setTrayList(prevArr => newArr);
        } else {
            const tempArr = trayList;
            tempArr[index] = data;
            setTrayList(tempArr);
        }
      };

    async function getMonthString (monthInt) {
        const months = ['January', 'Februrary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthInt];
    }

    async function addLoanerToDB(trayText) {
          const data = {
              trayName: trayText,
          }
          const headers = {
              'method': 'POST',
              'headers': {
                  'content-type': 'application/json'
              },
              'body': JSON.stringify(data)
          }
          const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/addTray', headers)
              .then(response => {
                  if (!response.ok) {
                      console.error('Data Not Saved')
                  } else {
                      getMyTrays();
                  }
              })
          return response;
    }

    async function addCase () {
        const caseData = {
            dateString: surgdate,
            surgDate: surgdate,
            surgTime: surgdate,
            timezone: timezone,
            surgMonth: await getMonthString(surgdate.getMonth()),
            surgYear: surgdate.getFullYear(),
            procType: proctype,
            dr: surgeonText,
            hosp: facilityText,
            notes: notes,
            trayList: JSON.stringify(trayList)
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(caseData)
        }
        const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/addCase', headers)
            .then(async response => {
                if (!response.ok) {
                    console.error('Data Not Saved')
                } else if (response.ok) {
                    const responseData = await response.json()
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Business Case Info', params: {backTo: backTo, caseProp: responseData}}],
                    });
                }
            })
        return response;
    }

    async function monthIntFromString(monthString) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthIndex = months.indexOf(monthString);
        return monthIndex;
    }

    const setDate = (event: DateTimePickerEvent, date: Date) => {
        setSurgdate(date);
        setSurgtime(date);
    };

    useEffect(() => {
        getSurgeons();
        getFacilities();
        getMyTrays();
    }, []);

    return (
        <SafeAreaView style={{backgroundColor: "#fff"}}>
            <View style={[styles.menuButtons, {flexDirection: "row"}]}>
                <TouchableOpacity
                    style={{marginTop: width * 0.01, marginBottom: width * 0.03, marginLeft: 0, flexDirection: "row"}}
                    onPress={() => {
                        // go back to page before creation or just prev page
                        navigation.reset({
                          index: 0,
                          routes: [{ name: backTo.name, params: backTo.params }],
                        });
                    }}
                    >
                    <Image source={require('../../assets/icons/left-arrow-thin.png')} style={styles.icon}/>
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05, marginLeft: width * 0.02, marginTop: width * 0.013,}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: width * 0.01, marginBottom: width * 0.03, marginLeft: width * 0.02, flexDirection: "row"}}
                    onPress={() => {
                        addCase();
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05, marginLeft: width * 0.52, marginTop: width * 0.013,}}>Save</Text>
                    <Image source={require('../../assets/icons/right-arrow-thin.png')} style={styles.icon}/>
                </TouchableOpacity>
            </View>
            <Text>BUSINESS PAGE</Text>
            <Text allowFontScaling={false} style={{marginLeft: width * 0.02, marginTop: width * 0.025, opacity: 0.3}}>*Save case first to add images.</Text>
            <ScrollView style={styles.container}>
                <Text  allowFontScaling={false}  style={styles.title}>Surgery Date & Time:</Text>
                <View style={styles.row}>
                    <DateTimePicker
                        value={surgdate}
                        mode="datetime"
                        style={styles.calendar}
                        onChange={setDate}
                        minuteInterval={5}
                    />
                    <TouchableOpacity style={styles.timezone} onPress={() => {
                        if (tzPickerStyle == styles.collapsed) {
                            setTzPickerStyle(styles.container);
                        } else {
                            setTzPickerStyle(styles.collapsed);
                        }
                    }}>
                        <Text  allowFontScaling={false}  style={styles.body}>{timezone}</Text>
                    </TouchableOpacity>
                </View>
                <Picker
                    selectedValue={timezone}
                    onValueChange={(itemValue/*, itemIndex*/) => {
                        setTimezone(itemValue);
                    }}
                    style={tzPickerStyle}
                >
                    <Picker.Item label="HST (GMT-10)" value="HST (GMT-10)" />
                    <Picker.Item label="AST (GMT-9)" value="AST (GMT-9)" />
                    <Picker.Item label="PST (GMT-8)" value="PST (GMT-8)" />
                    <Picker.Item label="MST (GMT-7)" value="MST (GMT-7)" />
                    <Picker.Item label="CST (GMT-6)" value="CST (GMT-6)" />
                    <Picker.Item label="EST (GMT-5)" value="EST (GMT-5)" />
                </Picker>
                <Text allowFontScaling={false} style={styles.title}>Surgeon Name:</Text>
                <TouchableOpacity style={styles.textBox} onPress={() => {
                    if (surgeonStyle == styles.collapsed) {
                        setSurgeonStyle(styles.container);
                    } else {
                        if (surgeonText == "...") {
                            setSurgeonText("Choose Surgeon...");
                        }
                        setSurgeonStyle(styles.collapsed);
                        setMstStyle(styles.collapsed);
                    }
                }}> 
                    <Text allowFontScaling={false} style={styles.textInput}>{surgeonText}</Text>
                </TouchableOpacity>
                <View style={mstStyle}>
                    <View style={styles.textBox}>
                        <TextInput
                            allowFontScaling={false}
                            style={styles.textInput}
                            onChangeText={(params) => {
                                setSurgeonText(params);
                                setSurgeonText2(params);
                            }}
                            placeholder='Type New Name Here...'
                            value={surgeonText2}
                        />
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => {
                            setMstStyle(styles.collapsed);
                            setSurgeonText("Choose Surgeon...");
                            setSurgeonText2("");
                        }}>
                            <View style={styles.smallCancel}>
                                <Text allowFontScaling={false} style={styles.smallButtonText}>Cancel</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setMstStyle(styles.collapsed);
                            setSurgeonStyle(styles.collapsed);
                            setSurgeonText2("");
                            addSurgeonToDB();
                        }}>
                            <View style={styles.smallButton}>
                                <Text allowFontScaling={false} style={styles.smallButtonText}>Accept Name</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <Picker
                    selectedValue={surgeonText}
                    onValueChange={(itemValue/*, itemIndex*/) => {
                        setSurgeonText(itemValue);
                        if (itemValue == "...") {
                            setMstStyle(styles.container);
                        } else {
                            setMstStyle(styles.collapsed);
                        }
                    }}
                    style={surgeonStyle}
                >        
                    <Picker.Item label="Choose Surgeon..." value="Choose Surgeon..." />
                    {surgeonList.map((item, index) => (
                        <Picker.Item key={item.surgeonName + index} label={item.surgeonName} value={item.surgeonName} />
                    ))}
                    <Picker.Item label="Enter New Surgeon Manually..." value="..." />
                </Picker>
                <Text allowFontScaling={false} style={styles.title}>Procedure Type:</Text>
                <View style={styles.textBox}>
                    <TextInput
                        allowFontScaling={false}
                        style={styles.textInput}
                        onChangeText={(params) => setProctype(params)}
                        placeholder='i.e. ACDF'
                        value={proctype}
                    />
                </View>
                <Text allowFontScaling={false} style={styles.title}>Surgery Details:</Text>
                <TextInput
                    allowFontScaling={false}
                    style={[styles.expandingTextInput, { sdHeight }]}
                    onChangeText={(params) => setNotes(params)}
                    placeholder='...'
                    value={notes}
                    multiline
                    numberOfLines={10}
                    onContentSizeChange={(event) => {
                      setSDHeight(event.nativeEvent.contentSize.height);
                    }}
                />
                <Text allowFontScaling={false} style={styles.title}>Facility Name:</Text>
                <TouchableOpacity style={styles.textBox} onPress={() => {
                    if (facilityStyle == styles.collapsed) {
                        setFacilityStyle(styles.container);
                    } else {
                        if (facilityText == "...") {
                            setFacilityText("Choose Facility...");
                        }
                        setFacilityStyle(styles.collapsed);
                        setMftStyle(styles.collapsed);
                    }
                }}> 
                    <Text allowFontScaling={false} style={styles.textInput}>{facilityText}</Text>
                </TouchableOpacity>
                <View style={mftStyle}>
                    <View style={styles.textBox}>
                        <TextInput
                            allowFontScaling={false}
                            style={styles.textInput}
                            onChangeText={(params) => {
                                setFacilityText(params);
                                setFacilityText2(params);
                            }}
                            placeholder='Type New Name Here...'
                            value={facilityText2}
                        />
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => {
                            setMftStyle(styles.collapsed);
                            setFacilityText("Choose Facility...");
                            setFacilityText2("");
                        }}>
                            <View style={styles.smallCancel}>
                                <Text allowFontScaling={false} style={styles.smallButtonText}>Cancel</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setMftStyle(styles.collapsed);
                            setFacilityStyle(styles.collapsed);
                            setFacilityText2("");
                            addFacilityToDB();
                        }}>
                            <View style={styles.smallButton}>
                                <Text allowFontScaling={false} style={styles.smallButtonText}>Accept Name</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <Picker
                    selectedValue={facilityText}
                    onValueChange={(itemValue/*, itemIndex*/) => {
                        setFacilityText(itemValue);
                        if (itemValue == "...") {
                            setMftStyle(styles.container);
                        } else {
                            setMftStyle(styles.collapsed);
                        }
                    }}
                    style={facilityStyle}
                >
                    <Picker.Item label="Choose Facility..." value="Choose Facility..." />
                    {facilityList.map((item, index) => (
                        <Picker.Item key={item.facilityName + index} label={item.facilityName} value={item.facilityName} />
                    ))}
                    <Picker.Item label="Enter New Facility Manually..." value="..." />
                </Picker>
                <Text  allowFontScaling={false}  style={styles.title}>Sets Needed & Status:</Text>
                <View>
                    <View style={styles.elementsContainer}>
                        {trayList.map((item, index) => (
                            <View key={item.tray + index}>
                                <ConsignmentSet sendDataToParent={handleChildData} myTrays={myTrays} props={item} index={index}/>
                            </View>
                        ))}
                    </View>
                    <View style={loanerStyle}>
                        <Text  allowFontScaling={false}  style={styles.title}>Enter New Tray Name Below:</Text>
                        <View style={styles.textBox}>
                            <TextInput
                                allowFontScaling={false}
                                style={styles.textInput}
                                onChangeText={(params) => {
                                    setLoanerName(params);
                                }}
                                placeholder='Type Tray Name...'
                                value={loanerName}
                            />
                        </View>
                        <TouchableOpacity style={styles.textBox} onPress={() => {
                            if (lsStyle == styles.collapsed) {
                                setLsStyle(styles.container);
                            } else {
                                setLsStyle(styles.collapsed);
                            }
                        }}> 
                            <Text  allowFontScaling={false}  style={styles.textInput}>{loanerStatus}</Text>
                        </TouchableOpacity>
                        <Picker
                            selectedValue={loanerStatus}
                            onValueChange={(itemValue/*, itemIndex*/) => {
                              setLoanerStatus(itemValue);
                            }}
                            style={lsStyle}
                        >
                            <Picker.Item label="Not Ordered" value="Not Ordered" />
                            <Picker.Item label="Ordered" value="Ordered" />
                            <Picker.Item label="Received" value="Received" />
                            <Picker.Item label="On Hand" value="On Hand" />
                            <Picker.Item label="Ready at Facility" value="Ready at Facility" />
                            <Picker.Item label="Conflict" value="Conflict" /> 
                            <Picker.Item label="Returned" value="Returned" /> 
                        </Picker>
                        <View style={styles.row}>
                            <TouchableOpacity onPress={() => {
                                setLoanerStyle(styles.collapsed);
                                setLoanerStatus("Not Ordered");
                                setLoanerName("");
                            }}>
                                <View style={styles.smallCancel}>
                                    <Text  allowFontScaling={false}  style={styles.smallButtonText}>Cancel</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                setTrayList((trayList) => [...trayList, {tray: loanerName, status: loanerStatus}]);
                                addLoanerToDB(loanerName);
                                setLoanerStyle(styles.collapsed);
                                setLoanerStatus("Not Ordered");
                                setLoanerName("");
                            }}>
                                <View style={styles.smallButton}>
                                    <Text  allowFontScaling={false}  style={styles.smallButtonText}>Save New Tray</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.largeButton} onPress={() => {
                            setTrayList((trayList) => [...trayList, {tray: "Choose Tray", status: "Not Ordered"}]);
                            setLoanerStyle(styles.collapsed);
                        }}>
                            <View style={styles.row}>
                                <Text  allowFontScaling={false}  style={styles.title}>Select From List</Text>
                                <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
                            </View>                    
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.largeButton} onPress={() => {
                            setLoanerStyle(styles.container);
                        }}>
                            <View style={styles.row}>
                                <Text  allowFontScaling={false}  style={styles.title}>Type In New Tray</Text>
                                <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
                            </View>                    
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottom}/>
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
          marginBottom: 5
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
          width: width * 0.96,
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
          width: width * 0.335,
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
          marginLeft: width * 0.42
      },
      smallButtonText: {
          color: "#ffffff",
          fontSize: width * 0.04,
          textAlign: "center",
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
          height: width * 0.124
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

export default CasePage;