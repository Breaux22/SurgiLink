import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Button, ScrollView, SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCaseData from '../../components/FullCaseData/FullCaseData';
import ConsignmentSet from '../../components/ConsignmentSet/ConsignmentSet';
import { useRoute } from "@react-navigation/native";
import { utcToZonedTime, format } from 'date-fns-tz';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useStripe, StripeProvider } from "@stripe/stripe-react-native"
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function SettingsPage () {
  const route = useRoute();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const month = route.params?.month;
  const year = route.params?.year;
  const [menuStyle, setMenuStyle] = useState(styles.collapsed);
  const [openStyle, setOpenStyle] = useState(styles.icon3);
  const [closeStyle, setCloseStyle] = useState(styles.collapsed);
  const [backBlur, setBackBlur] = useState(styles.collapsed);
  const [surgeonList, setSurgeonList] = useState([]);
  const [surgChecklist, setSurgChecklist] = useState([]);
  const [newSurgeon, setNewSurgeon] = useState('');
  const [facilityList, setFacilityList] = useState([]);
  const [facilChecklist, setFacilChecklist] = useState([]);
  const [newFacility, setNewFacility] = useState('');
  const [trayList, setTrayList] = useState([]);
  const [trayChecklist, setTrayChecklist] = useState([]);
  const [newTray, setNewTray] = useState('');
  const [statList, setStatList] = useState([]);
  const [statChecklist, setStatChecklist] = useState([]);
  const [newStat, setNewStat] = useState('');
  const [delete1, setDelete1] = useState(styles.collapsed);
  const [delete2, setDelete2] = useState(styles.collapsed);
  const [delete3, setDelete3] = useState(styles.collapsed);
  const [delete4, setDelete4] = useState(styles.collapsed);
  const [surgUpdate, setSurgUpdate] = useState('');
  const [facilUpdate, setFacilUpdate] = useState('');
  const [trayUpdate, setTrayUpdate] = useState('');
  const [statUpdate, setStatUpdate] = useState('');
  const [surgeons1, setSurgeons1] = useState(styles.row);
  const [surgeons2, setSurgeons2] = useState(styles.collapsed);
  const [surgeons3, setSurgeons3] = useState(styles.collapsed);
  const [facil1, setFacil1] = useState(styles.row);
  const [facil2, setFacil2] = useState(styles.collapsed);
  const [facil3, setFacil3] = useState(styles.collapsed);
  const [trays1, setTrays1] = useState(styles.row);
  const [trays2, setTrays2] = useState(styles.collapsed);
  const [trays3, setTrays3] = useState(styles.collapsed);
  const [stats1, setStats1] = useState(styles.row);
  const [stats2, setStats2] = useState(styles.collapsed);
  const [stats3, setStats3] = useState(styles.collapsed);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [newPassStyle, setNewPassStyle] = useState(false);
  const [accountDetails1, setAccountDetails1] = useState(styles.collapsed);
  const [accountDetails2, setAccountDetails2] = useState(styles.row);
  const [accountDetails3, setAccountDetails3] = useState(styles.accountDetails);
  const [subscription1, setSubscription1] = useState(styles.row);
  const [subscription2, setSubscription2] = useState(styles.collapsed);
  const [subscription3, setSubscription3] = useState(styles.collapsed);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [passCheck, setPassCheck] = useState('');
  const [incorrect, setIncorrect] = useState(false);
  const [noMatch, setNoMatch] = useState(false);
  const [addNew, setAddNew] = useState(styles.collapsed);
  const [addClicked, setAddClicked] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPass1, setNewPass1] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [userList, setUserList] = useState([]);
  const [newPassWarning, setNewPassWarning] = useState(null);
  const [usernameWarning, setUsernameWarning] = useState(null);
  const [price, setPrice] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [role, setRole] = useState('');
  const [lastFour, setLastFour] = useState(null);
  const [subEndDate, setSubEndDate] = useState('');
  const isFirstLoad = useRef(true);

  useEffect(() => {
    (async () => {
      const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
      userInfo && [setEmail(userInfo.email), setUsername(userInfo.username), setRole(userInfo.role)];
    })();
  },[])

  async function updateDefaultCard () {
    const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
    const headers = {
      'method': 'POST',
      'headers': {'content-type': 'application/json'},
      'body': JSON.stringify({ customerId: userInfo.stripeCustId, lastFour: lastFour, })
    }
    //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/updateDefaultPayment';
    const url = 'https://SurgiLink.replit.app/updateDefaultPayment';
    const response = await fetch(url, headers)
      .then(response => response.json())
      .then(data => {
        // need to update session memory
        setLastFour(data.newLastFour)
      })
      .catch(err => console.error(err));
  }

  async function getLastFour () {
    try {
      const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
      const headers = {
        'method': 'POST',
        'headers': {'content-type': 'application/json'},
        'body': JSON.stringify({ customerId: userInfo.stripeCustId }),
      }
      //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getLastFour';
      const url = 'https://SurgiLink.replit.app/getLastFour';
      const response = await fetch(url, headers)
        .then(response => response.json())
        .then(data => setLastFour(data.lastFour))
        .catch(err => console.error(err))
    } catch (err) {
      console.error("getLastFour: ", err);
    }
    return;
  }

  async function openPaymentSheet () {
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setReady(false);
      setDone(true);
      updateDefaultCard();
    }
    return;
  };

  async function fetchPaymentSheetParams() {
    const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
    //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/payment-sheet'
    const url = 'https://SurgiLink.replit.app/payment-sheet';
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: userInfo.stripeCustId, email: userInfo.email }),
    });
    const { setupIntent, ephemeralKey, customer } = await response.json();
    setCustomerId(customer);

    const { error } = await initPaymentSheet({
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      setupIntentClientSecret: setupIntent,
      merchantDisplayName: "SurgiLink",
      returnURL: "SurgiLink://payment-complete",
    });

    if (!error) {
      setReady(true);
    }
    getLastFour();
    return;
  }

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
      const url = 'https://SurgiLink.replit.app/verifySession';
      const response = await fetch(url, headers)
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

/*async function updateUserInfo () {
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
    'body': JSON.stringify(data),
  }
  const url = 'https://SurgiLink.replit.app/getUser';
  const respose = await fetch(url, headers);
    .then(response => response.json())
    .then(data => {return data})
  setPrice(data.price);
}*/

  async function getPrice() {
    const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
    setPrice(Number(userInfo.monthlyPrice) * Number(userInfo.discount));
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

  async function cancelSubscription () {
    const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
    const data = {
      userId: userInfo.id,
      org: userInfo.org,
      sessionString: userInfo.sessionString,
      password: passCheck,
      username: userInfo.username,
      customerId: userInfo.stripeCustId,
      subscriptionId: userInfo.stripeSubId,
    }
    const headers = {        
      'method': 'POST',         
      'headers': {
          'content-type': 'application/json'
          },
      'body': JSON.stringify(data),
    }
    const url = 'https://SurgiLink.replit.app/cancelSubscription';
    const response = await fetch(url, headers)
      .then(response => {
        if (!response.ok){
          console.error('Error - deleteAccount()');
        } else {
          navigation.reset({
            index: 0,
            routes: [{
              name: "Login",
              params: {}
            }]
          })
        }
      })
  }

  async function deleteSubUser (myUsername) {
    const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
    const data = {
      userId: userInfo.id,
            org: userInfo.org,
      sessionString: userInfo.sessionString,
      username: myUsername,
      masterUsername: userInfo.username,
    }
    const headers = {        
      'method': 'POST',         
      'headers': {
          'content-type': 'application/json'
          },
      'body': JSON.stringify(data),
    }
    const url = 'https://SurgiLink.replit.app/deleteSubUser';
    const response = await fetch(url, headers)
      .then(response => response.json())
      .then(async data => {
        setUserList(data.users);
        userInfo.userList = JSON.stringify(data.users);
        await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo), {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // iOS security setting
        });
        setPrice(data.newPrice * userInfo.discount);
        return
      })
  }

  async function getGroupUsers () {
    const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
    const data = {
      userId: userInfo.id,
      org: userInfo.org,
      sessionString: userInfo.sessionString,
      masterUsername: userInfo.username,
    }
    const headers = {        
      'method': 'POST',         
      'headers': {
          'content-type': 'application/json'
          },
      'body': JSON.stringify(data),
    }
    const url = 'https://SurgiLink.replit.app/getGroupUsers';
    const response = await fetch(url, headers)
      .then(response => response.json())
      .then(data => {return data})
    setUserList(response);
  }

  async function addUserToGroup () {
    if (newUsername.length < 8) {
      setUsernameWarning("Username too short (8+).");
      return;
    }
    if (newPass1 != newPass2) {
      setPassWarning("Passwords do not match.");
      return;
    }
    if (newPass1.length < 8) {
      setPassWarning("Password too short (8+).");
      return;
    }
    const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
    const data = {
      userId: userInfo.id,
            org: userInfo.org,
      sessionString: userInfo.sessionString,
      username: newUsername,
      password: newPass1,
      masterUsername: userInfo.username,
      email: 'breaux.smith@gmail.com',
    }
    const headers = {        
      'method': 'POST',         
      'headers': {
          'content-type': 'application/json'
          },
      'body': JSON.stringify(data),
    }
    //const url = "https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/addUserToGroup";
    const url = 'https://SurgiLink.replit.app/addUserToGroup';
    const response = await fetch(url, headers)
      .then(response => {
        if (!response.ok){
          console.error('Error - addUserToGroup()');
        }
        return response.json();
      })
      .then(async (data) => {
          if (data.myMessage == "Username Already In Use.") {
            setUsernameWarning("Username Already In Use");
          } else if (data.myMessage == "User Created.") {
            const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
            userInfo.monthlyPrice = data.newPrice;
            await SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo), {
              keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            });
            setPrice(data.newPrice * userInfo.discount);
            setNewPassWarning(null);
            setUsernameWarning(null);
            getGroupUsers();
            setNewUsername('');
            setNewPass1('');
            setNewPass2('');
            setAddClicked(false);
            setAddNew(styles.collapsed);
          }
      })
    return;
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

    async function deleteItems (list, url, setDeleteNum, follow) {
      const items = await list.filter((obj) => obj.myState === true);
      const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
      const caseData = {
        items: items,
        userId: userInfo.id,
            org: userInfo.org,
        sessionString: userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://SurgiLink.replit.app/${url}`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Error - deleteItems()')
            } else if (response.ok) {
                follow();
                setDeleteNum(styles.collapsed);
            }
        })
      return response;
    };

    async function addItem (param, item, url, follow) {
      const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
      let caseData;
      if (param === 'surgeonName') {
        caseData = { 
          surgeonName: item,
          userId: userInfo.id,
            org: userInfo.org,
          sessionString: userInfo.sessionString, };
      } else if (param === 'facilityName') {
        caseData = { 
          facilityName: item, 
          userId: userInfo.id,
            org: userInfo.org, 
          sessionString: userInfo.sessionString,
        };
      } else if (param === 'trayName') {
        caseData = {
          trayName: item,
          userId: userInfo.id,
            org: userInfo.org,
          sessionString: userInfo.sessionString,
        };
      } else if (param === 'status') {
        caseData = {
          status: item,
          userId: userInfo.id,
            org: userInfo.org,
          sessionString: userInfo.sessionString,
        };
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://SurgiLink.replit.app/${url}`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Error - addItem()')
            } else if (response.ok) {
                follow();
            }
        })
      return response;
    }

    async function deleteCheck (list, setDeleteNum) {
        if (list.some((obj) => obj.myState === true)) {
          setDeleteNum(styles.delete);
        } else {
          setDeleteNum(styles.collapsed);
        }
        return
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
              if (!response.ok){
                  console.error("Error - getSurgeons()")
              }
              return response.json()
          })
            .then(data => {return data})
        var tempArr = response.map((surg) => ({ id: surg.id, name: surg.surgeonName, myState: false, editStyle: styles.edit, nameStyle: styles.surgeonText, inputStyle: styles.collapsed }));
        setSurgChecklist(tempArr);
        setSurgeonList(response);
        setDelete1(styles.collapsed);
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
        var tempArr = response.map((facil) => ({ id: facil.id, name: facil.facilityName, myState: false, editStyle: styles.edit, nameStyle: styles.facilityText, inputStyle: styles.collapsed }));
        setFacilChecklist(tempArr);
        setFacilityList(response);
        setDelete2(styles.collapsed);
    }

    async function getTrays() {
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
                  console.error("Error - getTrays()")
              }
              return response.json()
          })
            .then(data => {return data})
        var tempArr = response.map((tray) => ({ name: tray.trayName, myState: false, editStyle: styles.edit, nameStyle: styles.trayText, inputStyle: styles.collapsed }));
        setTrayChecklist(tempArr);
        setTrayList(response);
        setDelete3(styles.collapsed);
    }

    async function updateCheck(setList, index, deleteNum) {
      setList((prevArr) => {
        const updatedArr = [...prevArr];
        if (updatedArr[index].myState === false) {
          updatedArr[index].myState = true;
          deleteCheck(updatedArr, deleteNum)
          return updatedArr;
        } else {
          updatedArr[index].myState = false;
          deleteCheck(updatedArr, deleteNum);
          return updatedArr;
        }
      })
    }

    async function updateVisible(setList, index, isVisible) {
      if (isVisible == 0) {
        setList((prevArr) => {
          const updatedArr = [...prevArr];
          updatedArr[index].nameStyle = styles.collapsed;
          updatedArr[index].inputStyle = styles.addBox;
          updatedArr[index].editStyle = styles.collapsed;
          return updatedArr;
        })
      } else {
        setList((prevArr) => {
          const updatedArr = [...prevArr];
          updatedArr[index].nameStyle = styles.surgeonText;
          updatedArr[index].inputStyle = styles.collapsed;
          updatedArr[index].editStyle = styles.edit;
          return updatedArr;
        })
      }
    }

    async function updateSurgeon (prevName, index) {
      const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
      const caseData = {
        prevName: prevName,
        newName: surgUpdate,
        userId: userInfo.id,
            org: userInfo.org,
        sessionString: userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://SurgiLink.replit.app/updateSurgeon`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Error - updateSurgeon()')
            } else if (response.ok) {
                updateVisible(setSurgChecklist, index, 1);
                getSurgeons();
            }
        })
      return response;
    }

    async function updateFacility (prevName, index) {
      const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
      const caseData = {
        prevName: prevName,
        newName: facilUpdate,
        userId: userInfo.id,
            org: userInfo.org,
        sessionString: userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://SurgiLink.replit.app/updateFacility`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Error - updateFacility()')
            } else if (response.ok) {
                updateVisible(setFacilChecklist, index, 1);
                getFacilities();
            }
        })
      return response;
    }

    async function updateTray (tray, index) {
      const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
      const caseData = {
        trayId: tray.id,
        newName: trayUpdate,
        userId: userInfo.id,
            org: userInfo.org,
        sessionString: userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://SurgiLink.replit.app/updateTrayName`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Error - updateTray()')
            } else if (response.ok) {
                updateVisible(setTrayChecklist, index, 1);
                getTrays();
            }
        })
      return response;
    }

    async function getSubEndDate () {
      try {
        const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
        const date = new Date(userInfo.subEndDate);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits
        const year = date.getFullYear();
        setSubEndDate(`${month} ${day}, ${year}`);
      } catch (err) {
        console.error(err)
      }
    }

    async function hideEdits(setList, isVisible) {
      if (isVisible == 1) {
        // hide
        setList((prevArr) => {
          var tempArr = [...prevArr];
          tempArr.map((item) => {
            item.editStyle = styles.collapsed;
            item.myState = false;
          })
          return tempArr;
        })
      } else {
        // show
        setList((prevArr) => {
          var tempArr = [...prevArr];
          tempArr.map((item) => {
            item.editStyle = styles.edit;
          })
          return tempArr;
        })
      }
    }

    useEffect(() => {
        (async () => {
          getSurgeons();
          getFacilities();
          getTrays();
          getGroupUsers();
          getPrice();
          const userInfo = JSON.parse(await SecureStore.getItemAsync('userInfo'));
          getSubEndDate();
          if (userInfo.role == 'admin'){setIsAdmin(true)}
        })();    

        return () => {};
    }, [])

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
                    routes: [{ name: "Monthly View", params: {month: month, year: year} }],
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
                    routes: [{ name: "Weekly View", params: {month: month, year: year} }],
                  });
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
                    routes: [{ name: "List Cases", params: {month: month, year: year} }],
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
                    routes: [{ name: "List Trays", params: {month: month, year: year} }],
                  });
                }}
                >
                <Image source={require('../../assets/icons/baking-tray.png')} style={styles.icon3}/>
                  <Text allowFontScaling={false} style={styles.optionText}>Tray List</Text>
              </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                closeMenu();
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
        <ScrollView>
          <View style={accountDetails1}>
            <Text allowFontScaling={false} style={styles.title}>Account:</Text>
            <TouchableOpacity
              onPress={() => {
                setAccountDetails1(styles.collapsed);
                setAccountDetails2(styles.row);
                setAccountDetails3(styles.accountDetails);
              }}
              >
              <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={accountDetails2}>
            <Text allowFontScaling={false} style={styles.title}>Account:</Text>
            <TouchableOpacity
              onPress={() => {
                setAccountDetails1(styles.row);
                setAccountDetails2(styles.collapsed);
                setAccountDetails3(styles.collapsed);
              }}
              >
              <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={accountDetails3}>
            <View style={styles.row}>
              <Text allowFontScaling={false} style={{
                width: height * 0.125,
              }}>Email:</Text>
              <Text allowFontScaling={false} style={{
                fontSize: height * 0.025,
                marginLeft: width * 0.02,
        marginBottom: height * 0.02,
              }}>{email}</Text>
            </View>
            <View style={styles.row}>
              <Text allowFontScaling={false} style={{
                  width: height * 0.125,
                }}>Username:</Text>
              <Text allowFontScaling={false} style={{
                  fontSize: height * 0.025,
                  marginLeft: width * 0.02,
        marginBottom: height * 0.02,
                }}>{username}</Text>
            </View>
            {isAdmin && <TouchableOpacity
              onPress={() => setShowDelete(true)}
              >
              <Text allowFontScaling={false} style={{
                color: "#E61212",
                fontSize: height * 0.025,
                textAlign: "center",
                borderBottomWidth: width * 0.002,
                width: height * 0.235,
                borderBottomColor: "#e61212",
                marginTop: height * 0.01,
                marginBottom: height * 0.01,
              }}>Cancel Subscription</Text>
            </TouchableOpacity>}
          </View>
          {showDelete && <View>
              <Text allowFontScalling={false} style={{
                  fontSize: height * 0.03,
                  width: width * 0.9,
                  marginBottom: height * 0.02,
                  marginLeft: width * 0.04,
                  textAlign: "justify",
                }}>Are you sure you want to end your subscription? You'll still have access to your account until the end of the billing cycle.</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  onPress={() => {
                    setShowDelete(false);
                    setConfirmDelete(false);
                    setPassCheck('');
                  }}
                  >
                  <Text allowFontScaling={false}
                    style={{
                      textAlign: "center",
                      width: height * 0.125,
                      height: height * 0.05,
                      backgroundColor: "#d6d6d7",
                      marginLeft: width * 0.04,
                      borderRadius: 5,
                      fontSize: height * 0.025,
                      paddingTop: height * 0.01
                    }}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setConfirmDelete(true)}
                  >
                  <Text allowFontScaling={false}
                    style={{
                      textAlign: "center",
                      width: height * 0.125,
                      height: height * 0.05,
                      color: "#fff",
                      backgroundColor: "#f25c5c",
                      marginLeft: width * 0.02,
                      borderRadius: 5,
                      fontSize: height * 0.025,
                      paddingTop: height * 0.01
                    }}>Yes</Text>
                </TouchableOpacity>
              </View>
          </View>}
          {confirmDelete && <View style={[styles.row, {marginTop: height * 0.02,}]}>
            <TextInput 
              style={{
                width: height * 0.33,
                height: height * 0.05,
                marginLeft: width * 0.04,
                backgroundColor: "#ededed",
                borderRadius: 5,
                borderWidth: height * 0.001,
                padding: height * 0.005,
                fontSize: height * 0.02,
              }}
              secureTextEntry={true}
              allowFontScaling={false}
              value={passCheck}
              placeholder={"Enter Password to De-Activate Account"}
              onChangeText={(input) => setPassCheck(input)}
              />
            <TouchableOpacity
              // try delete account
                onPress={() => cancelSubscription()}
              >
              <Text allowFontScaling={false} style={{
                textAlign: "center",
                width: height * 0.1,
                height: height * 0.05,
                color: "#fff",
                backgroundColor: "#f25c5c",
                marginLeft: height * 0.008,
                paddingTop: height * 0.01,
                borderRadius: 5,
                fontSize: height * 0.02
              }}>Confirm</Text>
            </TouchableOpacity>
          </View>}
          {isAdmin && <View>
            <View style={subscription1}>
              <Text allowFontScaling={false} style={styles.title}>Subscription:</Text>
              <TouchableOpacity
                onPress={() => {
                  setSubscription1(styles.collapsed);
                  setSubscription2(styles.row);
                  setSubscription3(styles.accountDetails);
                  fetchPaymentSheetParams();
                  getLastFour();
                }}
                >
                <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
              </TouchableOpacity>
            </View>
            <View style={subscription2}>
              <Text allowFontScaling={false} style={styles.title}>Subscription:</Text>
              <TouchableOpacity
                onPress={() => {
                  setSubscription1(styles.row);
                  setSubscription2(styles.collapsed);
                  setSubscription3(styles.collapsed);
                }}
                >
                <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
            </View>
            <View style={subscription3}>
              <View style={styles.row}>
                <Text allowFontScaling={false} style={{width: height * 0.2,}}>Plan Price:</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.025, color: "#077eed", marginLeft: height * 0.01, marginTop: -height * 0.005, marginBottom: height * 0.01, fontWeight: "bold",}}>${price}/Month</Text>
              </View>
              <View style={styles.row}>
                <Text allowFontScaling={false} style={{width: height * 0.2,}}>Next Bill Date:</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.025, color: "#077eed", marginLeft: height * 0.01, marginTop: -height * 0.005, marginBottom: height * 0.01, fontWeight: "bold",}}>{subEndDate}</Text>
              </View>
              <View style={styles.row}>
                <Text allowFontScaling={false} style={{width: height * 0.2,}}>Payment Info:</Text>
                {lastFour && <Text allowFontScaling={false} style={{fontSize: height * 0.025, color: "#077eed", marginLeft: height * 0.01, marginTop: -height * 0.005, marginBottom: height * 0.01, fontWeight: "bold",}}>****{lastFour}</Text>}
              </View>
              {ready && <TouchableOpacity
                onPress={() => openPaymentSheet()}
                >
                <Text allowFontScaling={false} style={{width: height * 0.325, textAlign: "center", paddingTop: height * 0.01, marginBottom: height * 0.02, borderRadius: 5, height: height * 0.04, backgroundColor: "#d6d6d7"}}>Update Payment Method</Text>
              </TouchableOpacity>}
              {done && <Text allowFontScaling={false} style={{width: height * 0.325, textAlign: "center", paddingTop: height * 0.01, marginBottom: height * 0.02, borderRadius: 5, height: height * 0.04, backgroundColor: "#d6d6d7"}}>Payment Updated!</Text>}
              <View style={styles.row}>
                <Text allowFontScaling={false} style={{width: height * 0.2,}}>Number of Sub-Users:</Text>
                <Text allowFontScaling={false} style={{fontSize: height * 0.025, color: "#077eed", marginLeft: height * 0.01, marginTop: -height * 0.005, marginBottom: height * 0.01, fontWeight: "bold",}}>{userList ? userList.length : '0'}</Text>
              </View>
              <Text allowFontScaling={false} style={{width: height * 0.2, marginBottom: height * 0.01,}}>Sub-User List:</Text>
              <View style={{marginBottom: height * 0.02,}}>
                {userList.map((item, index) => (
                  <View key={item.username} style={[styles.row, {marginBottom: height * 0.01,}]}>
                    <Text allowFontScaling={false} style={{marginLeft: height * 0.02, width: height * 0.26}}>{item.username}</Text>
                    <TouchableOpacity
                      onPress={() => deleteSubUser(item.username)}
                      >
                      <Text allowFontScaling={false} style={{marginLeft: height * 0.02, color: "#077eed"}}>-Remove User</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setAddNew(styles.container)}
                >
                <Text allowFontScaling={false} style={{width: height * 0.2, textAlign: "center", paddingTop: height * 0.01, height: height * 0.04, backgroundColor: "#d6d6d7", borderRadius: 5, borderWidth: height * 0.00125, backgroundColor: "#fff", color: "#077eed", marginBottom: height * 0.02,}}>Add New User +</Text>
              </TouchableOpacity>
              <View style={addNew}>
                <Text allowFontScaling={false}>{usernameWarning && usernameWarning}</Text>
                <View style={styles.row}>
                  <Text allowFontScaling={false} style={{width: height * 0.1,}}>Username:</Text>
                  <TextInput
                    value={newUsername}
                    onChangeText={setNewUsername}
                    allowFontScaling={false}
                    style={{padding: height * 0.01, height: height * 0.04, width: height * 0.3, backgroundColor: "#ededed", borderRadius: 5, borderWidth: height * 0.00125, marginLeft: height * 0.01, marginBottom: height * 0.01}}
                    placeholder={"Create a Username"}
                    />
                </View>
                <Text allowFontScaling={false}>{newPassWarning && newPassWarning}</Text>
                <View style={styles.row}>
                  <Text allowFontScaling={false} style={{width: height * 0.1,}}>Password:</Text>
                  <TextInput
                    value={newPass1}
                    onChangeText={setNewPass1}
                    allowFontScaling={false}
                    style={{padding: height * 0.01, height: height * 0.04, width: height * 0.3, backgroundColor: "#ededed", borderRadius: 5, borderWidth: height * 0.00125, marginLeft: height * 0.01, marginBottom: height * 0.01}}
                    placeholder={"Create a Password"}
                    />
                </View>
                <View style={styles.row}>
                  <Text allowFontScaling={false} style={{width: height * 0.1,}}>Password:</Text>
                  <TextInput
                    value={newPass2}
                    onChangeText={setNewPass2}
                    allowFontScaling={false}
                    style={{padding: height * 0.01, height: height * 0.04, width: height * 0.3, backgroundColor: "#ededed", borderRadius: 5, borderWidth: height * 0.00125, marginLeft: height * 0.01, marginBottom: height * 0.02}}
                    placeholder={"Re-Enter Password"}
                    />
                </View>
                <View style={styles.row}>
                  <TouchableOpacity
                    onPress={() => {
                      setAddNew(styles.collapsed);
                      setNewUsername('');
                      setNewPass1('');
                      setNewPass2('');
                    }}
                    >
                    <Text allowFontScaling={false} style={{width: height * 0.09, textAlign: "center", paddingTop: height * 0.01, height: height * 0.04, backgroundColor: "#d6d6d7", borderRadius: 5, borderWidth: height * 0.00125, marginBottom: height * 0.02,}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAddClicked(true)}
                    >
                    <Text allowFontScaling={false} style={{width: height * 0.1, textAlign: "center", paddingTop: height * 0.01, height: height * 0.04, backgroundColor: "#d6d6d7", borderRadius: 5, borderWidth: height * 0.00125, backgroundColor: "#fff", color: "#077eed", marginLeft: height * 0.01,}}>Add +</Text>
                  </TouchableOpacity>
                  {addClicked && <View style={{height: height * 0.225, width: height * 0.411, marginLeft: -height * 0.2, marginTop: -height * 0.1825, zIndex: 2, backgroundColor: "#fff", borderRadius: 5, borderWidth: height * 0.00125, padding: height * 0.01, }}>
                    <Text allowFontScaling={false} style={{textAlign: "justify", fontSize: height * 0.025}}>This Action will add $10 to your monthly payment. Please confirm you'd like to add a user.</Text>
                    <View style={styles.row}>
                      <TouchableOpacity
                        onPress={() => setAddClicked(false)}
                        style={{height: height * 0.05, width: height * 0.1, alignSelf: "center", marginTop: height * 0.05, backgroundColor: "#d6d6d7", borderRadius: 5, borderWidth: height * 0.00125, padding: height * 0.01, }}
                        >
                        <Text allowFontScaling={false} style={{textAlign: "center", fontSize: height * 0.025}}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => addUserToGroup()}
                        style={{height: height * 0.05, width: height * 0.15, alignSelf: "center", marginTop: height * 0.05, borderRadius: 5, borderWidth: height * 0.00125, padding: height * 0.01, marginLeft: height * 0.01,}}
                        >
                        <Text allowFontScaling={false} style={{textAlign: "center", color: "#077eed", fontSize: height * 0.025}}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>}
                </View>
              </View>
            </View>
          </View>}
          <View style={surgeons1}>
            <Text allowFontScaling={false} style={styles.title}>Edit Surgeons:</Text>
            <TouchableOpacity
              onPress={() => {
                setSurgeons1(styles.collapsed);
                setSurgeons2([styles.row, {marginBottom: width * 0.02}]);
                setSurgeons3(styles.editBox)
              }}
              >
              <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={surgeons2}>
              <Text allowFontScaling={false} style={styles.title}>Edit Surgeons:</Text>
              <TouchableOpacity
                onPress={() => {
                  setSurgeons1(styles.row);
                  setSurgeons2(styles.collapsed);
                  setSurgeons3(styles.collapsed);
                }}
                >
                <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
              <TouchableOpacity 
                style={delete1}
                onPress={() => deleteItems(surgChecklist, 'deleteSurgeons', setDelete1, getSurgeons)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={surgeons3}>
            <View style={styles.addBox}>
              <TextInput 
                allowFontScaling={false}
                value={newSurgeon}
                onChangeText={(input) => {setNewSurgeon(input)}}
                style={styles.addText}
                placeholder={"Add New Surgeon..."}
                />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  addItem('surgeonName', newSurgeon, 'addSurgeon', getSurgeons);
                  setNewSurgeon('');
                }}
                >
                <Text allowFontScaling={false} style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {surgeonList.map((surgeon, index) => {
              if (index != 0) {return (
                <View key={surgeon.surgeonName + index} style={styles.row}>
                  <View style={surgChecklist[index].nameStyle}>
                    <Checkbox
                      value={surgChecklist[index].myState}
                      onValueChange={() => updateCheck(setSurgChecklist, index, setDelete1)}
                      style={styles.checkbox}
                    />
                    <Text allowFontScaling={false} style={styles.name}>{surgeon.surgeonName}</Text>
                  </View>
                  <View style={surgChecklist[index].inputStyle}>
                    <TextInput 
                      allowFontScaling={false}
                      value={surgUpdate}
                      onChangeText={(input) => {setSurgUpdate(input)}}
                      style={styles.addText}
                      placeholder={"Edit Surgeon Name..."}
                      />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        hideEdits(setSurgChecklist, 0);
                        updateSurgeon(surgeon.surgeonName, index)
                      }}
                      >
                      <Text allowFontScaling={false} style={styles.addButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                      onPress={() => {
                        hideEdits(setSurgChecklist, 1);
                        updateVisible(setSurgChecklist, index, 0);
                        setSurgUpdate(surgeon.surgeonName);
                      }}
                    >
                    <Text allowFontScaling={false} style={surgChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            })}
          </ScrollView>
          <View style={facil1}>
            <Text allowFontScaling={false} style={styles.title}>Edit Facilities:</Text>
            <TouchableOpacity
              onPress={() => {
                setFacil1(styles.collapsed);
                setFacil2([styles.row, {marginBottom: height * 0.01}]);
                setFacil3(styles.editBox)
              }}
              >
              <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={facil2}>
              <Text allowFontScaling={false} style={styles.title}>Edit Facilities:</Text>
              <TouchableOpacity
                onPress={() => {
                  setFacil1(styles.row);
                  setFacil2(styles.collapsed);
                  setFacil3(styles.collapsed);
                }}
                >
                <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
              <TouchableOpacity 
                style={delete2}
                onPress={() => deleteItems(facilChecklist, 'deleteFacilities', setDelete2, getFacilities)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={facil3}>
            <View style={styles.addBox}>
              <TextInput 
                 allowFontScaling={false}
                value={newFacility}
                onChangeText={(input) => {setNewFacility(input)}}
                style={styles.addText}
                placeholder={"Add New Facility..."}
                />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  addItem('facilityName', newFacility, 'addFacility', getFacilities)
                  setNewFacility('');
                }}
                >
                <Text allowFontScaling={false} style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {facilityList.map((facility, index) => {
              if (index != 0) {return (
                <View key={facility.facilityName + index} style={styles.row}>
                  <View style={facilChecklist[index].nameStyle}>
                    <Checkbox
                      value={facilChecklist[index].myState}
                      onValueChange={() => updateCheck(setFacilChecklist, index, setDelete2)}
                      style={styles.checkbox}
                    />
                    <Text allowFontScaling={false} style={styles.name}>{facility.facilityName}</Text>
                  </View>
                  <View style={facilChecklist[index].inputStyle}>
                    <TextInput 
                      allowFontScaling={false}
                      value={facilUpdate}
                      onChangeText={(input) => {setFacilUpdate(input)}}
                      style={styles.addText}
                      placeholder={"Edit Facility Name..."}
                      />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        hideEdits(setFacilChecklist, 0);
                        updateFacility(facility.facilityName, index)
                      }}
                      >
                      <Text allowFontScaling={false} style={styles.addButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                      onPress={() => {
                        hideEdits(setFacilChecklist, 1);
                        updateVisible(setFacilChecklist, index, 0);
                        setFacilUpdate(facility.facilityName);
                      }}
                    >
                    <Text allowFontScaling={false} style={facilChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            })}
          </ScrollView>
          <View style={trays1}>
            <Text allowFontScaling={false} style={styles.title}>Edit Trays:</Text>
            <TouchableOpacity
              onPress={() => {
                setTrays1(styles.collapsed);
                setTrays2([styles.row, {marginBottom: height * 0.01}]);
                setTrays3(styles.editBox)
              }}
              >
              <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={trays2}>
              <Text allowFontScaling={false} style={styles.title}>Edit Trays:</Text>
              <TouchableOpacity
                onPress={() => {
                  setTrays1(styles.row);
                  setTrays2(styles.collapsed);
                  setTrays3(styles.collapsed);
                }}
                >
                <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
              <TouchableOpacity 
                style={delete3}
                onPress={() => deleteItems(trayChecklist, 'deleteTrays', setDelete3, getTrays)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={trays3}>
            <View style={styles.addBox}>
              <TextInput 
                 allowFontScaling={false}
                value={newTray}
                onChangeText={(input) => {setNewTray(input)}}
                style={styles.addText}
                placeholder={"Add New Tray..."}
                />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  addItem('trayName', newTray, 'addTray', getTrays);
                  setNewTray('');
                }}
                >
                <Text allowFontScaling={false} style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {trayList.map((tray, index) => {
              return (
                <View key={tray.trayName + index} style={styles.row}>
                  <View style={trayChecklist[index].nameStyle}>
                    <Checkbox
                      value={trayChecklist[index].myState}
                      onValueChange={() => updateCheck(setTrayChecklist, index, setDelete3)}
                      style={styles.checkbox}
                    />
                    <Text allowFontScaling={false} style={styles.name}>{tray.trayName}</Text>
                  </View>
                  <View style={trayChecklist[index].inputStyle}>
                    <TextInput 
                      allowFontScaling={false}
                      value={trayUpdate}
                      onChangeText={(input) => {setTrayUpdate(input)}}
                      style={styles.addText}
                      placeholder={"Edit Tray Name..."}
                      />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        hideEdits(setTrayChecklist, 0);
                        updateTray(tray, index)
                      }}
                      >
                      <Text allowFontScaling={false} style={styles.addButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                      onPress={() => {
                        hideEdits(setTrayChecklist, 1);
                        updateVisible(setTrayChecklist, index, 0);
                        setTrayUpdate(tray.trayName);
                      }}
                    >
                    <Text allowFontScaling={false} style={trayChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
          <View style={{height: height * 1.1}}></View>
        </ScrollView>
      </SafeAreaView>
    )
};

const styles = StyleSheet.create({
  container: {
  },
  icon: {
    width: height * 0.03,
    height: height * 0.03,
    marginTop: height * 0.0175,
    marginLeft: width * 0.01
  },
  row: {
      flexDirection: 'row'
  },
  title: {
      fontSize: height * 0.03,
      width: height * 0.2,
      marginLeft: width * 0.025,
      marginTop: height * 0.0125
  },
  edit: {
    color: "rgba(0, 122, 255, 0.8)"
  },
  editBox: {
      borderWidth: height * 0.0005,
      width: width * 0.95,
      minheight: height * 0.2,    
      maxHeight: width,
      marginLeft: width * 0.025,
      padding: height * 0.01,
      borderRadius: 5,
  },
  checkbox: {
    marginLeft: width * 0.02,
    marginBottom: height * 0.01,
  },
  name: {
    marginLeft: width * 0.02,
    marginBottom: height * 0.01,
  },
  delete: {
    marginLeft: height * 0.01,
    marginTop: height * 0.0225
  },
  deleteText: {
    color: "#c2042d"
  },
  surgeonText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  facilityText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  trayText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  statusText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  addBox: {
    borderWidth: height * 0.001,
    borderRadius: 5,
    width: width * 0.75,
    marginBottom: height * 0.02,
    flexDirection: "row",
  },
  addText: {
    width: width * 0.73,
    marginLeft: width * 0.02,
    height: height * 0.0325
  },
  addButton: {
    backgroundColor: "rgba(211, 211, 211, 0.5)",
    width: width * 0.15,
    marginLeft: width * 0.01,
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: height * 0.025,
    textAlign: "center",
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
  accountDetails: {
      marginLeft: width * 0.04,
      marginTop: height * 0.02,
  }
});

export default SettingsPage;