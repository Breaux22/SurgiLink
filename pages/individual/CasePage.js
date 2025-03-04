import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Button, ScrollView, SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, Alert, Animated } from 'react-native';
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
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function CasePage () {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const route = useRoute();
    const styles = myStyles(useSafeAreaInsets());
    const navigation = useNavigation();
    const myCase = route.params?.caseProp;
    const backTo = route.params?.backTo;
    const caseId = myCase['caseId'] || myCase['id'];
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
    const [surgeonText, setSurgeonText] = useState(myCase.surgeonName || "Choose Surgeon..."); // Surgeon Name
    const [surgeonList, setSurgeonList] = useState([]);
    const [mftStyle, setMftStyle] = useState(styles.collapsed);
    const [facilityStyle, setFacilityStyle] = useState(styles.collapsed);
    const [facilityText, setFacilityText] = useState(myCase.facilityName || "Choose Facility..."); // Surgeon Name
    const [facilityList, setFacilityList] = useState([]);
    const [images, setImages] = useState([]); // array of image data from cloudinary
    const [loading, setLoading] = useState(styles.collapsed);
    const [previewStyle, setPreviewStyle] = useState(styles.collapsed);
    const [previewImage, setPreviewImage] = useState(null); // image data of clicked image from gallery
    const [previewIndex, setPreviewIndex] = useState(0);
    const [prevImgStyle, setPrevImgStyle] = useState({width: 0});
    const [loadBar, setLoadBar] = useState(0);
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const [backStyle, setBackStyle] = useState(styles.back);
    const scrollViewRef = useRef(null);
    const collapseTimeout = useRef(null);
    const [deleteStyle, setDeleteStyle] = useState(styles.collapsed);
    const firstLoad = useRef(true);
    const [userList, setUserList] = useState(null);
    const [currUser, setCurrUser] = useState(null);
    const [userSelected, setUserSelected] = useState(null);
    const [usersStyle, setUsersStyle] = useState(styles.collapsed);

    useEffect(() => {
        (async () => {
            const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
            const userArr = JSON.parse(userInfo.userList);
            if (myCase.rep == userInfo.id) {
                setUserSelected(JSON.stringify(userInfo));
            } else {
                const filterUser = userArr.filter((item) => item.id == myCase.rep)
                setUserSelected(JSON.stringify(filterUser[0]));
            }
            setUserList(userArr);
            setCurrUser(userInfo);
        })();
        return;
    }, [])

    const scrollToTop = () => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    const handleValueChange = (value, mode) => {
        if (mode == 1) {
            setSurgeonText(value);
        } else if (mode == 2) {
            setFacilityText(value);
        }
        if (collapseTimeout.current) {
            clearTimeout(collapseTimeout.current);
        }
        collapseTimeout.current = setTimeout(() => {
            setMstStyle(styles.collapsed);
            setSurgeonStyle(styles.collapsed);
            setMftStyle(styles.collapsed);
            setFacilityStyle(styles.collapsed);
        }, 2500);
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
        const userInfo = JSON.parse(JSON.parse(await SecureStore.getItemAsync('userInfo')))
        const data = {
            publicId: previewImage.public_id,
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
        const response = await fetch('https://SurgiLink.replit.app/destroyImage', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Error - deleteImageFromCloudinary()')
                } else if (response.ok) {
                    console.error('Image Removed.');
                }
            })
        return response;
    };

    async function getCloudCreds () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json',
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://SurgiLink.replit.app/getCloudinaryCreds';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Error - getCloudCreds()')
                }
                return response.json()
            })
            .then(data => {return data})
        return response;
    }
    
    async function fetchImages() {
        try {
          setLoading(styles.icon2);
          const cloudCreds = await getCloudCreds();
          const url = `https://api.cloudinary.com/v1_1/${cloudCreds.cloud_name}/resources/image/upload?prefix=${caseId}&max_results=50`;
          // Basic Authentication (you need API key and API secret)
          const credentials = `${cloudCreds.api_key}:${cloudCreds.api_secret}`;
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
            const tempArr = trayList.filter((item, i) => i !== index);
            setTrayList(prev => tempArr);
            // if id not null, send request to server to remove tray from uses
            if (data.tray.id != null) {
                removeTrayFromCase(data.tray);
            }
        } else if (data.myAction == 'chooseTray') {
            // change tray selected
            console.log("data: ", data.newSet)
            const tempArr = [...trayList];
            data.newSet.checkedIn = false;
            data.newSet.open = true;
            tempArr[index] = data.newSet;
            setTrayList(prev => tempArr);
        } else if (data.myAction == "openHold") {
            const tempArr = [...trayList];
            tempArr[index].open = data.open;
            setTrayList(prev => tempArr);
        } else if (data.myAction == "checkedIn") {
            const tempArr = [...trayList];
            tempArr[index].checkedIn = data.checkedIn;
            setTrayList(prev => tempArr);
        } else if (data.myAction == 'updateLoanerName') {
            const tempArr = trayList;
            tempArr[index].trayName = data.newName;
            setTrayList(tempArr);
        } else if (data.myAction = 'updateLocation') {
            const tempArr = trayList;
            tempArr[index].location = data.location;
            setTrayList(tempArr);
        }
    };

    async function updateLoanerName (tray) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            trayId: tray.trayId,
            newName: tray.trayName,
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers' :{
                'content-type': 'application/json',
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://SurgiLink.replit.app/updateTrayName';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok) {console.error("Error - updateLoanerName()")}
            })
        return;
    }

    async function updateTrayLocation (tray) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            trayId: tray.id,
            location: tray.location,
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
        const url = 'https://SurgiLink.replit.app/updateTrayLocation';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Error - updateTrayLocation()');
                }
            })
        return;
    }

    async function removeTrayFromCase (tray) {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            trayId: tray.id,
            caseId: caseId,
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
        const url = 'https://SurgiLink.replit.app/removeTrayFromCase';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok) {
                    console.error("Error - removeTrayFromCase()")
                }
            })
        return;
    }

    async function getMonthString (monthInt) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthInt];
    }

    async function getSurgeons() {
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
            'body': JSON.stringify(data),
        }
        const url = 'https://SurgiLink.replit.app/getSurgeons';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok) {
                    console.error("Error - getSurgeons()")
                }
                return response.json()
            })
            .then(data => {return data})
        setSurgeonList(response);
    }

    async function getFacilities() {
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
            'body': JSON.stringify(data),
        }
        const url = 'https://SurgiLink.replit.app/getFacilities';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getFacilities()")
                }
                return response.json()
            })
            .then(data => {return data})
        setFacilityList(response);
    }

    async function getMyTrays() {
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
            'body': JSON.stringify(data),
        }
        const url = 'https://SurgiLink.replit.app/getTrays';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getMyTrays()")
                }
                return response.json()
            })
            .then(data => {return data})
        setMyTrays(response);
    }

    async function getCaseTrayUses () {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            caseId: caseId,
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://SurgiLink.replit.app/getCaseTrayUses';
        const response = await fetch(url, headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - getCaseTrayUses()")
                }
                return response.json()
            })
            .then(data => {return data})
        setTrayList(prev => response);
    }

    async function addSurgeonToDB() {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            surgeonName: surgeonText,
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
        const response = await fetch('https://SurgiLink.replit.app/addSurgeon', headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - addSurgeonToDB()")
                }
                return response.json()
            })
            .then(data => {return data})
        const tempArr = [...surgeonList, response[0]];
        tempArr.sort((a,b) => a.surgeonName - b.surgeonName);
        setSurgeonList(prev => tempArr);
        return;
    }

    async function addFacilityToDB() {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            facilityName: facilityText,
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
        const response = await fetch('https://SurgiLink.replit.app/addFacility', headers)
            .then(response => {
                if (!response.ok){
                    console.error("Error - addFacilityToDB()")
                }
                return response.json()
            })
            .then(data => {return data})
        const tempArr = [...facilityList, response[0]];
        tempArr.sort((a,b) => a.facilityName - b.facilityName);
        setFacilityList(prev => tempArr);
        return;
    }

      async function addLoanerToDB() {
          const data = {
              trayName: loanerName,
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
          const response = await fetch('https://SurgiLink.replit.app/addTray', headers)
              .then(response => {
                  if (!response.ok) {
                      console.error('Error - addLoanerToDB()')
                  }
              })
          return response;
      }

    async function deleteCase() {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const data = {
            caseId: caseId,
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
        const response = await fetch('https://SurgiLink.replit.app/deleteCase', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Error - deleteCase()')
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
            setTimeout(() => {
                fetchImages();
            }, 2000)
          };
          runOnFocus();
          return () => {
          };
        }, [])
      );

    async function updateCase () {
        for (const tray of trayList) {
            if (tray.trayName == 'Choose Tray...') {
                Alert.alert(
                  "Missing Values",
                  'Tray Value Cannot be "Choose Tray..."',
                  [
                    { text: "OK", onPress: () => console.log("OK1 Pressed") }
                  ]
                );
                return;
            } else if (tray.trayName == "") {
                Alert.alert(
                  "Missing Values",
                  "Loaner Name Cannot Be Blank.",
                  [
                    { text: "OK", onPress: () => console.log("OK2 Pressed") }
                  ]
                );
                return;
            }
        }
        const tempArr = [];
        surgeonList.map((item, index) => {
            if (item.surgeonName === surgeonText) {
                tempArr.push(item.id);
            }
        })
        const tempArr2 = [];
        facilityList.map((item, index) => {
            if (item.facilityName === facilityText) {
                tempArr2.push(item.id);
            }
        })
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const caseData = {
            caseId: caseId,
            dateString: new Date(surgdate - (1000*60*60*8)),
            surgDate: new Date(surgdate - (1000*60*60*8)),
            surgTime: new Date(surgdate - (1000*60*60*8)),
            procType: proctype,
            dr: tempArr[0],
            rep: JSON.parse(userSelected).id,
            hosp: tempArr2[0],
            notes: notes,
            trayList: JSON.stringify(trayList),
            userId: userInfo.id,
            org: userInfo.org,
            sessionString: userInfo.sessionString,
        }
        console.log("CD: ", caseData)
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(caseData)
        }
        const response = await fetch('https://SurgiLink.replit.app/updateCase', headers)
        //const response = await fetch('https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/updateCase', headers)
            .then(response => {
                if (!response.ok) {
                    console.error('Error - updateCase()')
                } else if (response.ok) {
                    console.log("BT: ", backTo)
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
        setNotes(myCase.notes);
    }

    async function openPreview (imageData, myIndex) {
        setPreviewImage(imageData);
        setPreviewIndex(myIndex);
        setPreviewStyle(styles.preview);
        setBackStyle(styles.collapsed);
        scrollToTop();
    }

    async function closePreview () {
        setPreviewImage(null);
        setPreviewStyle(styles.collapsed);
        setBackStyle(styles.back);
    }

    function mapPictures () {
        if (images.length > 0) {
            return images.map((myImage, myIndex) => (
                <TouchableOpacity 
                    key={myImage.secure_url}
                    onPress={() => openPreview(myImage, myIndex)}
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

    const updateImgStyle = () => {
        myFade()
        if (width > height) {
          setPrevImgStyle({ alignSelf: "center", width: (height * 0.91) * (previewImage.width / previewImage.height) , height: (height * 0.91), })
        } else {
          setPrevImgStyle({ alignSelf: "center", width: width, height: width * (previewImage.height / previewImage.width), })
        }
        return;
    }

      async function myFade ()  {
          fadeAnim.setValue(0);
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
      };

    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false;
            updateValues();
            getSurgeons();
            getFacilities();
            getMyTrays();
            fetchImages();
            getCaseTrayUses();
        }
    }, []);

    return (
        <SafeAreaView style={{backgroundColor: "#fff"}}>
            <Image source={require('../../assets/icons/surgilink-logo.png')} resizeMode="contain" style={{position: "absolute", marginTop: useSafeAreaInsets().top, alignSelf: "center", height: height * 0.05,}}/>
            <View style={deleteStyle}>
                <View style={{position: "absolute", width: width * 0.8, height: height * 0.175, marginLeft: width * 0.1, marginTop: height * 0.175, backgroundColor: "#fff", borderRadius: 5, borderWidth: height * 0.0025,}}>
                    <Text allowFontScaling={false} style={{fontSize: height * 0.035, textAlign: "justify", padding: width * 0.02,}}>Are you sure you want to delete this case?</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            onPress={() => setDeleteStyle(styles.collapsed)}
                            >
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.1, height: height * 0.05, width: width * 0.25, textAlign: "center", backgroundColor: "#d6d6d7", borderRadius: 5, fontSize: height * 0.03, paddingTop: height * 0.005}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => deleteCase()}
                            >
                            <Text allowFontScaling={false} style={{marginLeft: width * 0.1, height: height * 0.05, width: width * 0.25, textAlign: "center", backgroundColor: "#d16f6f", borderRadius: 5, fontSize: height * 0.03, paddingTop: height * 0.005}}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <View style={{flexDirection: "row", borderBottomWidth: width * 0.002, borderBottomColor: "#cfcfcf", height: height * 0.0625}}>
                <TouchableOpacity
                    style={{marginTop: height * 0.0115, marginBottom: height * 0.015, marginLeft: width * 0.02, }}
                    onPress={async () => {
                        // save case then go back
                        setDeleteStyle(styles.deleteStyle);
                    }}
                    >
                    {/*<Image source={require('../../assets/icons/left-arrow-thin.png')} style={styles.icon}/>*/}
                    <Text allowFontScaling={false} style={{fontSize: height * 0.025, color: "#de0d29"}}>Delete Case</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{marginTop: height * 0.0115, marginBottom: height * 0.015, position: "absolute", right: height * 0.02, }}
                    onPress={async () => {
                        // save case then go back
                        updateCase();
                    }}
                    >
                    <Text allowFontScaling={false} style={{fontSize: height * 0.025}}>Done</Text>
                </TouchableOpacity>
            </View>
            <ScrollView ref={scrollViewRef} style={styles.container}>
                <Text allowFontScaling={false} style={styles.title}>Surgery Date & Time:</Text>
                <View style={styles.row}>
                    <DateTimePicker
                        value={surgdate}
                        mode="datetime"
                        style={styles.calendar}
                        onChange={setDate}
                        minuteInterval={5}
                    />
                </View>
                <Text allowFontScaling={false} style={styles.title}>Surgeon Name:</Text>
                <TouchableOpacity style={styles.textBox} onPress={() => {
                    if (JSON.stringify(surgeonStyle) == JSON.stringify(styles.collapsed)) {
                        if (collapseTimeout.current) {
                            clearTimeout(collapseTimeout.current);
                        }
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
                            }}
                            placeholder='Type New Name Here...'
                            value={surgeonText}
                        />
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity 
                            style={styles.smallCancel}
                            onPress={() => {
                            setMstStyle(styles.collapsed);
                            setSurgeonText("Choose Surgeon...");
                        }}>
                            <Text allowFontScaling={false} style={styles.smallButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.smallButton}
                            onPress={() => {
                            setMstStyle(styles.collapsed);
                            setSurgeonStyle(styles.collapsed);
                            addSurgeonToDB();
                        }}>
                            <Text allowFontScaling={false} style={styles.smallButtonText}>Accept Name</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Picker
                    selectedValue={surgeonText}
                    onValueChange={(itemValue/*, itemIndex*/) => {
                        if (itemValue == "...") {
                            setMstStyle(styles.container);
                            setSurgeonText("");
                        } else {
                            handleValueChange(itemValue, 1);
                        }
                    }}
                    style={surgeonStyle}
                >        
                    {surgeonList.map((item, index) => (
                        <Picker.Item key={item.id + "A" + index} label={item.surgeonName} value={item.surgeonName} />
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
                <Text allowFontScaling={false} style={styles.title}>Notes:</Text>
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
                <Text allowFontScaling={false} style={styles.title}>Rep:</Text>
                <TouchableOpacity
                    onPress={() => {
                        if (JSON.stringify(usersStyle) == JSON.stringify(styles.collapsed)) {
                            setUsersStyle({width: width, height: height * 0.2});
                        } else {
                            setUsersStyle(styles.collapsed);
                        }
                    }}
                    style={styles.textBox}
                    >
                    <Text allowFontScaling={false} style={styles.textInput}>{userSelected && JSON.parse(userSelected).username}</Text>
                </TouchableOpacity>
                <Picker
                    selectedValue={userSelected}
                    onValueChange={(itemValue/*, itemIndex*/) => {
                        setUserSelected(itemValue);
                    }}
                    style={usersStyle}
                >        
                    <Picker.Item label={currUser && currUser.username} value={currUser && JSON.stringify(currUser)}/>
                    {userList && userList.map((item, index) => (
                        <Picker.Item key={item.username + "A"} label={item.username} value={JSON.stringify(item)} />
                    ))}
                </Picker>
                <Text allowFontScaling={false} style={styles.title}>Facility Name:</Text>
                <TouchableOpacity style={styles.textBox} onPress={() => {
                    if (JSON.stringify(facilityStyle) == JSON.stringify(styles.collapsed)) {
                        if (collapseTimeout.current) {
                            clearTimeout(collapseTimeout.current);
                        }
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
                            }}
                            placeholder='Type New Name Here...'
                            value={facilityText}
                        />
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity onPress={() => {
                            setMftStyle(styles.collapsed);
                            setFacilityText("Choose Facility...");
                        }}>
                            <View style={styles.smallCancel}>
                                <Text allowFontScaling={false} style={styles.smallButtonText}>Cancel</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setMftStyle(styles.collapsed);
                            setFacilityStyle(styles.collapsed);
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
                        if (itemValue == "...") {
                            setMftStyle(styles.container);
                            setFacilityText("");
                        } else {
                            handleValueChange(itemValue, 2);
                        }
                    }}
                    style={facilityStyle}
                >
                    {facilityList.map((item, index) => (
                        <Picker.Item key={item.facilityName + "B" + index} label={item.facilityName} value={item.facilityName} />
                    ))}
                    <Picker.Item label="Enter New Facility Manually..." value="..." />
                </Picker>
                <Text allowFontScaling={false} style={styles.title}>Sets Needed & Status:</Text>
                <View>
                    <View>
                        {trayList.map((item, index) => {
                            if (item.loaner == false) {
                                return (<View key={item.trayName + "C" + index}>
                                    <ConsignmentSet surgdate={surgdate} sendDataToParent={handleChildData} props={item} myTrays={myTrays}  index={index}/>
                                </View>)
                            } else {
                                return (<View key={item.trayName + "D" + index}>
                                    <LoanerSet sendDataToParent={handleChildData} props={item} myTrays={myTrays} index={index}/>
                                </View>)
                            }
                        })}
                    </View>
                    <View style={styles.row}>
                        <TouchableOpacity 
                            style={{width: height * 0.2, height: height * 0.045, marginTop: height * 0.015, marginLeft: width * 0.02, backgroundColor: "#ededed", borderRadius: 5, }} 
                            onPress={() => {
                                setTrayList((trayList) => [...trayList, {trayName: "Choose Tray...", location: '', loaner: false, checkedIn: false, open: true}]);
                            //setLoanerStyle(styles.collapsed);
                            }}>
                            <View style={[styles.row, {alignSelf: "center"}]}>
                                <Text allowFontScaling={false} style={{fontWeight: "bold", marginTop: height * 0.012, marginRight: height * 0.01,}}>Add My Tray</Text>
                                <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
                            </View>                    
                        </TouchableOpacity>
                        <TouchableOpacity style={{width: height * 0.23, height: height * 0.045, marginTop: height * 0.015, marginLeft: height * 0.01, backgroundColor: "#ededed", borderRadius: 5, }} onPress={() => {
                            setTrayList((trayList) => [...trayList, {id: null, trayName: "", location: '', loaner: true, checkedIn: false, open: true}]);
                        }}>
                            <View style={[styles.row, {alignSelf: "center"}]}>
                                <Text allowFontScaling={false} style={{fontWeight: "bold", marginTop: height * 0.012, marginRight: height * 0.01,}}>Add Loaner Tray</Text>
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
                <View style={styles.row}>
                    <Text allowFontScalling={false} style={styles.title}>Gallery:</Text>
                    <TouchableOpacity
                        onPress={() => fetchImages()}
                        >
                        <Image source={require('../../assets/icons/refresh.png')} style={{width: height * 0.04, height: height * 0.04,}}/>
                    </TouchableOpacity>
                </View>
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
            </ScrollView>
                {previewImage && 
                <View style={previewStyle}>
                    <TouchableOpacity
                        style={{position: "absolute", top: height * 0.02, left: height * 0.02, zIndex: 1, opacity: 0.5,}}
                        onPress={() => setPreviewStyle(styles.collapsed)}
                        >
                        <Image source={require('../../assets/icons/close-white.png')} style={{height: height * 0.05, width: height * 0.05,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{position: "absolute", top: height * 0.45, left: height * 0.02, zIndex: 1, opacity: 0.5,}}
                        onPress={() => {
                            setPreviewIndex(prev => {
                                if (prev > 0) {
                                    setPreviewImage(images[prev - 1]);
                                    return prev - 1;
                                } else {return prev}
                            });
                        }}
                        >
                        <Image source={require('../../assets/icons/left-arrow.png')} style={{height: height * 0.05, width: height * 0.05,}}/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{position: "absolute", top: height * 0.45, right: height * 0.02, zIndex: 1, opacity: 0.5,}}
                        onPress={() => {
                            setPreviewIndex(prev => {
                                if (prev < images.length - 1) {
                                    setPreviewImage(images[prev + 1]);
                                    return prev + 1;
                                } else {return prev}
                            });
                        }}
                        >
                        <Image source={require('../../assets/icons/right-arrow.png')} style={{height: height * 0.05, width: height * 0.05,}}/>
                    </TouchableOpacity>
                    <ScrollView >
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <Image
                                style={prevImgStyle}
                                source={{ uri: previewImage.url }}
                                onLoad={() => {
                                    updateImgStyle();
                                }}
                            />
                        </Animated.View>
                    </ScrollView>
                </View>}
        </SafeAreaView>
    );
  };


  const myStyles = (insets) => StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
    },
    back: {
        marginTop: height * 0.015,
        marginBottom: height * 0.01, 
        marginLeft: width * 0.02, 
        backgroundColor: "#fff"
    },
    loanerBox: {
        flexDirection: "row",
        width: width * 0.96,
        padding: width * 0.02,
        marginLeft: width * 0.02,
        marginTop: height * 0.01,
        borderWidth: height * 0.001,
        borderRadius: 5,
    },
    controlRow: {
      flexDirection: "row",
      marginBottom: height * 0.01,
    },
    gallery: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: height * 0.01,
        marginBottom: height * 0.05,
        width: width,
        paddingTop: width * 0.02,
        paddingBottom: width * 0.02
    },
    galContainer:{
        height: width,
        marginBottom: height * 0.05,
    },
    preview: {
        position: "absolute",
        width: width, height: height * 2,
        marginTop: insets.top,
        backgroundColor: "rgba(0,0,0,0.95)",
    },
    previewImage: {
        //marginTop: height * 0.025,
        alignSelf: "center",
        width: height * 0.427,
        height: height * 0.8
    },
    closePreview:{
        width: height * 0.275,  
        height: height * 0.055,
        //marginLeft: width * 0.1,
        //marginTop: height * 0.03,
        backgroundColor: "#fff"
    },
    closePreviewText: {
        fontSize: height * 0.03,
        textAlign: "center",
        marginTop: height * 0.01,
    },
    deleteButton: {
        width: height * 0.15,
        height: height * 0.055,
        //marginLeft: width * 0.025,
        //marginTop: height * 0.03,
        backgroundColor: "#eb4034"
    },
    deleteLoadBar: {
        position: "absolute",
        height: height * 0.055,
        backgroundColor: "#fff",
        zIndex: 1
    },
    deleteButtonText: {
        fontSize: height * 0.03,
        //marginLeft: width * 0.055,
        textAlign: "center",
        marginTop: height * 0.01,
        color: "#fff",
    },
    deleteStyle: {
        width: width,
        height: height,
        position: "absolute",
        backgroundColor: "rgba(0,0,0,0.3)",
        zIndex: 1
    },
    image: {
        marginLeft: width * 0.01,
        marginBottom: width * 0.01,
        width: width * 0.32,
        height: width * 0.32,
    },
    tzPicker: {
      fontSize: height * 0.005
    },
    title: {
        color: "#292c3b",
        marginLeft: width * 0.02,
        marginTop: height * 0.01,
    },
    body: {
        color: "#292c3b",
        marginLeft: width * 0.02,
        marginTop: height * 0.01,
        fontSize: height * 0.015
    },
    textInput: {
        color: "#39404d", 
    },
    expandingTextInput: {
        width: width * 0.96,
        marginLeft: width * 0.02,
        marginTop: height * 0.01,
        padding: height * 0.01,
        borderRadius: 5,
        backgroundColor: '#ededed'
    },
    textBox: {
        width: width * 0.96,
        height: height * 0.04,
        marginLeft: width * 0.02,
        marginTop: height * 0.01,
        padding: height * 0.01,
        borderRadius: 5,
        backgroundColor: '#ededed'
    },
    bigTextBox: {
        width: width * 0.96,
        height: height * 0.1,
        marginLeft: width * 0.02,
        marginTop: height * 0.01,
        padding: width * 0.02,
        borderRadius: 5,
        backgroundColor: '#ededed'
    },
    largeButton: {
        backgroundColor: '#ededed',
        width: width * 0.4,
        height: height * 0.05,
        borderRadius: 5,
        marginLeft: width * 0.025,
        marginTop: height * 0.01,
    },
    button: {
        backgroundColor: '#ededed',
        width: width * 0.35,
        height: height * 0.05,
        borderRadius: 5,
        marginTop: height * 0.05,
        marginLeft: width * 0.02
    },
    smallButton: {
        backgroundColor: '#39404d',
        width: height * 0.2,
        height: height * 0.035,
        borderRadius: 5,
        marginTop: height * 0.01,
        marginLeft: height * 0.01,
    },
    smallCancel: {
          backgroundColor: '#eb4034',
          width: height * 0.1,
          height: height * 0.035,
          borderRadius: 5,
          marginTop: height * 0.01,
          marginLeft: width * 0.02,
    },
    smallButtonText: {
          color: "#ffffff",
          fontSize: height * 0.02,
          textAlign: "center",
          marginTop: height * 0.005,
    },
    buttonText: {
        fontSize: height * 0.04,
        marginLeft: width * 0.05,
        marginTop: height * 0.005,
    },
    calendar: {
        marginTop: height * 0.01,
        marginLeft: height * 0.01,
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
        display: 'none',
    },
    close: {
        color: "#ffffff",
        backgroundColor: '#39404d',
        textAlign: 'center',
        paddingBottom: width * 0.02,
        fontSize: height * 0.03
    },
    picture: {
        backgroundColor: 'rgba(0, 122, 255, 0.8)',
        width: height * 0.225,
        height: height * 0.06,
        borderRadius: 5,
        marginTop: height * 0.02,
        marginLeft: width * 0.02
    },
    pictureText: {
        color: "#ffffff",
        fontSize: height * 0.04,
        textAlign: "center",
        marginTop: height * 0.005,
    },
    icon: {
        height: height * 0.0325,
        width: height * 0.0325,
        marginTop: height * 0.005,
    },
    icon2: {
        height: height * 0.05,
        width: height * 0.05,
        marginTop: height * 0.005,
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
    menuButtons: {
        borderBottomWidth: width * 0.002,
        borderBottomColor: "#cfcfcf",
        height: height * 0.0625
    },
    icon3: {
          width: height * 0.05,
          height: height * 0.05,
          marginLeft: width * 0.02,
    },
});

export default CasePage;