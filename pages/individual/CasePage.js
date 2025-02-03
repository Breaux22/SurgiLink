import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Button, ScrollView, SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCaseData from '../../components/FullCaseData/FullCaseData';
import ConsignmentSet from '../../components/ConsignmentSet/ConsignmentSet';
import LoanerSet from '../../components/LoanerSet/LoanerSet';
import { useRoute } from "@react-navigation/native";
import { utcToZonedTime, format } from 'date-fns-tz';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native';
import { useMemory } from '../../MemoryContext';

const { width, height } = Dimensions.get('window');

function CasePage () {
    const route = useRoute();
    const navigation = useNavigation();
    const myCase = route.params?.caseProp;
    const backTo = route.params?.backTo;
    const caseId = myCase['id'];
    const [surgdate, setSurgdate] = useState(new Date()); // surgdate
    const [surgtime, setSurgtime] = useState(new Date()); // time
    const [proctype, setProctype] = useState(); // procedure type
    const [notes, setNotes] = useState(); // surgery details
    const [trayList, setTrayList] = useState([]); // list of trays for case
    const [myTrays, setMyTrays] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loanerStatus, setLoanerStatus] = useState("?"); // status of new tray
    const [loanerName, setLoanerName] = useState("Choose Tray..."); // name of new tray
    const [loanerLocation, setLoanerLocation] = useState("");
    const [lsStyle, setLsStyle] = useState(styles.collapsed);
    const [loanerStyle, setLoanerStyle] = useState(styles.collapsed);
    const [timeZone, setTimeZone] = useState("PST (GMT-8)"); // time zone
    const [tzPickerStyle, setTzPickerStyle] = useState(styles.collapsed);
    const [sdHeight, setSDHeight] = useState(32);
    const [mstStyle, setMstStyle] = useState(styles.collapsed);
    const [surgeonStyle, setSurgeonStyle] = useState(styles.collapsed);
    const [surgeonText, setSurgeonText] = useState("Choose Surgeon..."); // Surgeon Name
    const [surgeonText2, setSurgeonText2] = useState("");
    const [surgeonList, setSurgeonList] = useState([]);
    const [mftStyle, setMftStyle] = useState(styles.collapsed);
    const [facilityStyle, setFacilityStyle] = useState(styles.collapsed);
    const [facilityText, setFacilityText] = useState("Choose Facility…"); // Surgeon Name
    const [facilityText2, setFacilityText2] = useState("");
    const [facilityList, setFacilityList] = useState([]);
    const [images, setImages] = useState([]); // array of image data from cloudinary
    const [loading, setLoading] = useState(styles.collapsed);
    const [previewStyle, setPreviewStyle] = useState(styles.collapsed);
    const [previewImage, setPreviewImage] = useState(null); // image data of clicked image from gallery
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalRef = useRef(null); // To store the interval ID
    const pressStartTime = useRef(null);
    const [loadBar, setLoadBar] = useState(0);
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const [backStyle, setBackStyle] = useState(styles.back);
    const loadBarRef = useRef(loadBar);
    const { myMemory, setMyMemory } = useMemory();
    
    async function saveData (userInfo) {
        setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
    };

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

    async function deleteImageFromCloudinary () {
        const data = {
            publicId: previewImage.public_id,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const response = await fetch('https://surgiflow.replit.app/destroyImage', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Error; Image Not Deleted.')
                } else if (response.ok) {
                    console.error('Image Removed.');
                }
            })
        return response;
    };

    const handlePressIn = () => {
        pressStartTime.current = Date.now();
        intervalRef.current = setInterval(() => {
            setLoadBar((prevLoadBar) => prevLoadBar + 0.019);
            const currentTime = Date.now();
            const timeElapsed = currentTime - pressStartTime.current;
            setElapsedTime(timeElapsed);
            if (loadBarRef.current >= 0.475) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
                // then delete image
                deleteImageFromCloudinary();
                setImages((prevArr) => prevArr.filter((img) => img.public_id != previewImage.public_id));
                closePreview();
            }
        }, 100);
    };

    const handlePressOut = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setElapsedTime(0);
        pressStartTime.current = null;
        setLoadBar(0);
    };

    useEffect(() => {
        loadBarRef.current = loadBar;
    }, [loadBar]);
    
    async function fetchImages() {
        setLoading(styles.icon2);
        try {
          const url = `https://api.cloudinary.com/v1_1/dxu39drpj/resources/image/upload?prefix=${caseId}&max_results=50`;
          // Basic Authentication (you need API key and API secret)
          const credentials = `439165798135593:Oyq3vYHkorc8QraXmZg55_I7cI0`;
          const encodedCredentials = Buffer.from(credentials).toString('base64');
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              Authorization: `Basic ${encodedCredentials}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch images');
          }
          const data = await response.json();
          const filteredImages = data.resources.filter((image) => {
            const myIndex = image.public_id.indexOf("_");
            if (image.public_id.slice(0, myIndex) === String(caseId)) {
                return image;   
            }
          });
          setImages(filteredImages);
          setLoading(styles.collapsed);
        } catch (error) {
          console.error('Error fetching images:', error);
          Alert.alert('Error', 'Failed to fetch images');
        }
    };
    
    async function handleChildData (data, index) {
        if (data.myAction == "remove") {
            const newArr = trayList.filter((item, i) => i !== index);
            setTrayList(prevArr => newArr);
            removeTrayFromCase(data);
        } else if (data.myAction == "updateStatus") {
            updateTrayStatus(data);
        } else if (data.myAction == "updateLocation") {
            updateTrayLocation(data);
        } else if (data.myAction == 'chooseTray') {
            // change tray selected
            const newArr = myTrays.filter((item, i) => item.trayName == data.trayName);
            const tempArr = [...trayList];
            tempArr[index] = newArr[0];
            setTrayList(prev => tempArr);
        } else if (data.myAction == "updateLoanerLocation") {
            updateTrayLocation(data);
        } else if (data.myAction == "updateLoanerName") {
            updateLoanerName(data);
        } else if (data.myAction == "updateLoanerStatus") {
            updateTrayStatus(data);
        } else {
            const tempArr = [...trayList];
            tempArr[index] = data;
            setTrayList(prev => tempArr);
        }
    };

    async function updateLoanerName (tray) {
        const data = {
            trayId: tray.trayId,
            newName: tray.trayName,
            userId: myMemory.userInfo.id,
        }
        const headers = {
            'method': 'POST',
            'headers' :{
                'content-type': 'application/json',
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/updateTrayName';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok) {console.error("Error updating loaner tray name.")}
            })
        return;
    }

    async function updateTrayStatus (tray) {
        const data = {
            trayName: tray.trayName,
            trayStatus: tray.trayStatus,
            userId: myMemory.userInfo.id,
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

    async function updateTrayLocation (tray) {
        const data = {
            trayName: tray.trayName,
            location: tray.location,
            userId: myMemory.userInfo.id,
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
        return;
    }

    async function removeTrayFromCase (tray) {
        const obj = trayList.filter(item => item.trayName == tray.trayName);
        const data = {
            trayId: obj[0].id,
            caseId: caseId,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/removeTrayFromCase';
        const response = await fetch(url, headers)
        return;
    }

    async function getMonthString (monthInt) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthInt];
    }

    async function getSurgeons() {
        const data = {
            userId: myMemory.userInfo.id
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://surgiflow.replit.app/getSurgeons';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setSurgeonList(response);
    }

    async function getFacilities() {
        const data = {
            userId: myMemory.userInfo.id
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://surgiflow.replit.app/getFacilities';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setFacilityList(response);
    }

    async function getMyTrays() {
        const data = {
            userId: myMemory.userInfo.id
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://surgiflow.replit.app/getTrays';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setMyTrays(response);
    }

    async function getCaseTrayUses () {
        const data = {
            caseId: caseId
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://surgiflow.replit.app/getCaseTrayUses';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        setTrayList(prev => response);
    }

    async function addSurgeonToDB() {
        const data = {
            surgeonName: surgeonText,
            userId: myMemory.userInfo.id,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const response = await fetch('https://surgiflow.replit.app/addSurgeon', headers)
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
            userId: myMemory.userInfo.id
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const response = await fetch('https://surgiflow.replit.app/addFacility', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Data Not Saved')
                }
            })
        return response;
    }

      async function addLoanerToDB() {
          const data = {
              trayName: loanerName,
              userId: myMemory.userInfo.id,
          }
          const headers = {
              'method': 'POST',
              'headers': {
                  'content-type': 'application/json'
              },
              'body': JSON.stringify(data)
          }
          const response = await fetch('https://surgiflow.replit.app/addTray', headers)
              .then(response => {
                  if (!response.ok) {
                      console.error('Data Not Saved')
                  }
              })
          return response;
      }

    async function deleteCase() {
        const data = {
            caseId: caseId,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const response = await fetch('https://surgiflow.replit.app/deleteCase', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Error deleting case.')
                } else {
                    navigation.reset({
                        index: 0,
                        routes: [{name: backTo.name, params: backTo.params}]
                    })
                }
            })
        return response;
    }

    useFocusEffect(
        useCallback(() => {
          const runOnFocus = () => {
            fetchImages();
          };
          runOnFocus();
          return () => {
          };
        }, [])
      );

    async function updateCase () {
        console.log(trayList)
        const caseData = {
            caseId: caseId,
            dateString: new Date(surgdate - (1000*60*60*8)),
            surgDate: new Date(surgdate - (1000*60*60*8)),
            surgTime: new Date(surgdate - (1000*60*60*8)),
            procType: proctype,
            dr: surgeonText,
            hosp: facilityText,
            notes: notes,
            trayList: JSON.stringify(trayList),
            userId: myMemory.userInfo.id,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(caseData)
        }
        const response = await fetch('https://surgiflow.replit.app/updateCase', headers)
        //const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/updateCase', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Data Not Saved')
                } else if (response.ok) {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: backTo.name, params: backTo.params }],
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
    
    async function updateValues() {
        setSurgdate(new Date(new Date(myCase.surgdate).getTime() + (1000*60*60*8)));
        setSurgtime(new Date(new Date(myCase.surgdate).getTime() + (1000*60*60*8)));
        setProctype(myCase.proctype);
        setFacilityText(myCase.hosp);
        setSurgeonText(myCase.dr);
        setNotes(myCase.notes);
    }

    async function openPreview (imageData) {
        setPreviewImage(imageData);
        setPreviewStyle(styles.preview);
        setBackStyle(styles.collapsed);
    }

    async function closePreview () {
        setPreviewImage(null);
        setPreviewStyle(styles.collapsed);
        setBackStyle(styles.back);
    }

    function mapPictures () {
        if (images.length > 0) {
            return images.map((myImage) => (
                <TouchableOpacity 
                    key={myImage.secure_url}
                    onPress={() => openPreview(myImage)}
                >
                        <Image
                          source={{ uri: myImage.url }}
                          style={styles.image}
                        />
                </TouchableOpacity>
            ))
        } else {
            return (
                <Text allowFontScaling={false} style={{marginLeft: width * 0.02, }}>No Images.</Text>
            )
        }
    }

    const setDate = (event, newDate) => {
        setSurgdate(newDate);
    }

    useEffect(() => {
        updateValues();
        getSurgeons();
        getFacilities();
        getMyTrays();
        getCaseTrayUses();
        fetchImages();
    }, []);

    return (
        <SafeAreaView style={{backgroundColor: "#fff"}}>
            <View style={{flexDirection: "row", borderBottomWidth: width * 0.002, borderBottomColor: "#cfcfcf", height: width * 0.124}}>
                <TouchableOpacity
                    style={{marginTop: width * 0.023, marginBottom: width * 0.03, marginLeft: width * 0.02, }}
                    onPress={async () => {
                        // save case then go back
                        deleteCase();
                    }}
                    >
                    {/*<Image source={require('../../assets/icons/left-arrow-thin.png')} style={styles.icon}/>*/}
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05, color: "#de0d29"}}>Delete Case</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: width * 0.023, marginBottom: width * 0.03, marginLeft: width * 0.57,}}
                    onPress={async () => {
                        // save case then go back
                        updateCase();
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: width * 0.05}}>Done</Text>
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.container}>
                <Text allowFontScaling={false} style={styles.title}>Surgery Date & Time:</Text>
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
                        <Text allowFontScaling={false} style={styles.body}>{timeZone}</Text>
                    </TouchableOpacity>
                </View>
                <Picker
                    selectedValue={timeZone}
                    onValueChange={(itemValue/*, itemIndex*/) => {
                        setTimeZone(itemValue);
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
                            setSurgeonStyle(styles.collapsed);
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
                            setFacilityText("Choose Facility…");
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
                            setFacilityText("Choose Facility…");
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
                            setFacilityStyle(styles.collapsed);
                        }
                    }}
                    style={facilityStyle}
                >
                    <Picker.Item label="Choose Facility..." value="Choose Facility…" />
                    {facilityList.map((item, index) => (
                        <Picker.Item key={item.facilityName + index} label={item.facilityName} value={item.facilityName} />
                    ))}
                    <Picker.Item label="Enter New Facility Manually..." value="..." />
                </Picker>
                <Text allowFontScaling={false} style={styles.title}>Sets Needed & Status:</Text>
                <View>
                    <View>
                        {trayList.map((item, index) => {
                            if (item.loaner === false) {
                                return (<View key={item.trayName + index}>
                                    <ConsignmentSet sendDataToParent={handleChildData} props={item} myTrays={myTrays} statuses={statuses} index={index}/>
                                </View>)
                            } else {
                                return (<View key={item.trayName + index}>
                                    <LoanerSet sendDataToParent={handleChildData} props={item} myTrays={myTrays} statuses={statuses} index={index}/>
                                </View>)
                            }
                        })}
                    </View>
                    <View style={loanerStyle}>
                        <TextInput
                            allowFontScaling={false}
                            style={{width: width * 0.65, height: width * 0.08, backgroundColor: "#ededed", borderRadius: 5, padding: width * 0.02, }}
                            value={loanerName}
                            onChangeText={(input) => setLoanerName(input)}
                            />
                        <TouchableOpacity
                            style={{backgroundColor: "#d6d6d7", width: width * 0.24, height: width * 0.08, marginLeft: width * 0.02, borderRadius: 5, }}
                            onPress={() => {
                                setTrayList((trayList) => [...trayList, {trayName: loanerName, trayStatus: 'Dirty', location: '', loaner: false}]);
                                addLoanerToDB()
                                setLoanerName('');
                                setLoanerStyle(styles.collapsed);
                            }}
                            >
                            <Text allowFontScaling={false} style={{fontSize: width * 0.05, marginLeft: width * 0.065, marginTop: width * 0.01, }}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity 
                            style={{width: width * 0.522, height: width * 0.09, marginTop: width * 0.03, marginLeft: width * 0.02, backgroundColor: "#ededed", borderRadius: 5, }} 
                            onPress={() => {
                                setTrayList((trayList) => [...trayList, {trayName: "Choose Tray...", trayStatus: '?', location: '', loaner: false}]);
                            //setLoanerStyle(styles.collapsed);
                            }}>
                            <View style={styles.row}>
                                <Text allowFontScaling={false} style={[styles.title, {fontWeight: "bold", }]}>Add Consignment Tray</Text>
                                <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
                            </View>                    
                        </TouchableOpacity>
                        <TouchableOpacity style={{width: width * 0.418, height: width * 0.09, marginTop: width * 0.03, marginLeft: width * 0.02, backgroundColor: "#ededed", borderRadius: 5, }} onPress={() => {
                            setTrayList((trayList) => [...trayList, {trayName: "", trayStatus: '?', location: '', loaner: true,}]);
                        }}>
                            <View style={[styles.row, {textAlign: "center"}]}>
                                <Text allowFontScaling={false} style={[styles.title, {fontWeight: "bold", }]}>Add Loaner Tray</Text>
                                <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
                            </View>                    
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.controlRow} >
                    <TouchableOpacity onPress={() => navigation.navigate('Take Picture', {caseId: caseId})}>
                        <View style={styles.picture}>
                            <Text allowFontScaling={false} style={styles.pictureText}>Add Photo</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Text allowFontScalling={false} style={styles.title}>Gallery:</Text>
                <Image source={require('../../assets/icons/loading.gif')} style={loading}/>
                <ScrollView
                    scrollEnabled={true}
                    keyboardShouldPersistTaps='handled'
                    style={styles.galContainer}
                    >
                    <View  style={styles.gallery}>
                        {mapPictures()}
                    </View>
                </ScrollView>
                <View style={previewStyle}>
                    {previewImage && <Image
                      source={{ uri: previewImage.url }}
                      style={styles.previewImage}
                    />}
                    <View style={styles.row}>
                        <TouchableOpacity style={styles.closePreview} onPress={() => closePreview()}>
                            <Text allowFontScaling={false} style={styles.closePreviewText}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.deleteButton}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                        >
                            <View style={{borderRadius: 5, width: width * loadBar, height: width * 0.11, backgroundColor: "#fff", zIndex: 1}}></View>
                            <Text allowFontScaling={false} style={styles.deleteButtonText}>Hold to Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    back: {
        marginTop: width * 0.03, 
        marginBottom: width * 0.02, 
        marginLeft: width * 0.02, 
        backgroundColor: "#fff"
    },
    loanerBox: {
        flexDirection: "row",
        width: width * 0.96,
        padding: width * 0.02,
        marginLeft: width * 0.02,
        marginTop: width * 0.02,
        borderWidth: width * 0.002,
        borderRadius: 5,
    },
    controlRow: {
      flexDirection: "row",
      marginBottom: width * 0.02,
    },
    gallery: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: width * 0.02,
        marginBottom: width * 0.1,
        width: width,
        paddingTop: width * 0.02,
        paddingBottom: width * 0.02
    },
    galContainer:{
        height: width,
        marginBottom: width * 0.1,
    },
    preview: {
        position: "absolute",
        width: width,
        height: height * 1.1,
        backgroundColor: "rgba(15, 15, 15, 0.75)",
    },
    previewImage: {
        marginTop: width * 0.1,
        marginLeft: width * 0.1,
        width: width * 0.8,
        height: width * 1.498
    },
    closePreview:{
        width: width * 0.3,  
        height: width * 0.11,
        borderRadius: 5,
        marginLeft: width * 0.1,
        marginTop: width * 0.06,
        backgroundColor: "#fff"
    },
    closePreviewText: {
        fontSize: width * 0.06,
        marginLeft: width * 0.07,
        marginTop: width * 0.02,
    },
    deleteButton: {
        width: width * 0.475,
        height: width * 0.11,
        borderRadius: 5,
        marginLeft: width * 0.025,
        marginTop: width * 0.06,
        backgroundColor: "#eb4034"
    },
    deleteLoadBar: {
        position: "absolute",
        height: width * 0.11,
        backgroundColor: "#fff",
        zIndex: 1
    },
    deleteButtonText: {
        fontSize: width * 0.06,
        marginLeft: width * 0.055,
        marginTop: -width * 0.09,
        color: "#fff",
    },
    image: {
        marginLeft: width * 0.01,
        marginBottom: width * 0.01,
        width: width * 0.32,
        height: width * 0.32,
    },
    tzPicker: {
      fontSize: width * 0.01  
    },
    title: {
        color: "#292c3b",
        marginLeft: width * 0.02,
        marginTop: width * 0.02,
    },
    body: {
        color: "#292c3b",
        marginLeft: width * 0.02,
        marginTop: width * 0.02,
        fontSize: width * 0.03
    },
    textInput: {
        color: "#39404d"
    },
    expandingTextInput: {
        width: width * 0.96,
        marginLeft: width * 0.02,
        marginTop: width * 0.02,
        padding: width * 0.02,
        borderRadius: 5,
        backgroundColor: '#ededed'
    },
    textBox: {
        width: width * 0.96,
        height: width * 0.08,
        marginLeft: width * 0.02,
        marginTop: width * 0.02,
        padding: width * 0.02,
        borderRadius: 5,
        backgroundColor: '#ededed'
    },
    bigTextBox: {
        width: width * 0.96,
        height: width * 0.2,
        marginLeft: width * 0.02,
        marginTop: width * 0.02,
        padding: width * 0.02,
        borderRadius: 5,
        backgroundColor: '#ededed'
    },
    largeButton: {
        backgroundColor: '#ededed',
        width: width * 0.4,
        height: width * 0.1,
        borderRadius: 5,
        marginLeft: width * 0.025,
        marginTop: width * 0.02,
    },
    button: {
        backgroundColor: '#ededed',
        width: width * 0.35,
        height: width * 0.1,
        borderRadius: 5,
        marginTop: width * 0.1,
        marginLeft: width * 0.02
    },
    smallButton: {
        backgroundColor: '#39404d',
        width: width * 0.335,
        height: width * 0.07,
        borderRadius: 5,
        marginTop: width * 0.02,
        marginLeft: width * 0.03
    },
    smallCancel: {
          backgroundColor: '#eb4034',
          width: width * 0.2,
          height: width * 0.07,
          borderRadius: 5,
          marginTop: width * 0.02,
          marginLeft: width * 0.42
    },
    smallButtonText: {
          color: "#ffffff",
          fontSize: width * 0.04,
          textAlign: "center",
          marginTop: width * 0.01,
    },
    buttonText: {
        fontSize: width * 0.08,
        marginLeft: width * 0.05,
        marginTop: width * 0.01,
    },
    calendar: {
        marginTop: width * 0.02,
        marginLeft: - width * 0.008
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
        display: 'none',
    },
    close: {
        color: "#ffffff",
        backgroundColor: '#39404d',
        textAlign: 'center',
        paddingBottom: width * 0.02,
        fontSize: width * 0.06
    },
    picture: {
        backgroundColor: 'rgba(0, 122, 255, 0.8)',
        width: width * 0.45,
        height: width * 0.12,
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
    icon2: {
        height: width * 0.1,
        width: width * 0.1,
        marginTop: width * 0.01,
        marginLeft: width * 0.45
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