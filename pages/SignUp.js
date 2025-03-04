import * as React from 'react';
import { useCallback } from 'react';
import { useRoute } from "@react-navigation/native";
import { useState, useEffect, useRef } from 'react';
import { Image, Button, StyleSheet, FlatList, SafeAreaView, View, ScrollView, Text, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView } from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCalendar from '../components/FullCalendar/FullCalendar';
import MonthlyViewObject_1 from '../components/MonthlyViewObject/MonthlyViewObject_1';
import HeaderMenu from '../components/HeaderMenu/HeaderMenu';
import EntypoIcon from "react-native-vector-icons/Entypo";
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from "react-native-reanimated";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Stripe from '../components/Stripe/StripeInput';
import { CardField, useStripe } from "@stripe/stripe-react-native";
import { Picker } from '@react-native-picker/picker';
import PaymentScreen from '../components/Stripe/StripeInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function SignUpPage () {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [email, setEmail] = useState('');
  const [invalidEmail, setInvalidEmail] = useState('');
  //const [org, setOrg] = useState('');
  const [usernameConflict, setUsernameConflict] = useState(null);
  const [noMatch, setNoMatch] = useState(null);
  const [choice, setChoice] = useState(styles.choice);
  const [plan, setPlan] = useState('');
  const [version, setVersion] = useState(styles.version1);
  const [usernameTooShort, setUsernameTooShort] = useState(null);
  const [passwordTooShort, setPasswordTooShort] = useState(null);
  const [box1, setBox1] = useState(true);
  const [box2, setBox2] = useState(false);
  const [box3, setBox3] = useState(false);
  const { createPaymentMethod } = useStripe();
  const [phone, setPhone] = useState('');
  const [invalidPhone, setInvalidPhone] = useState('');
  const [firstLast, setFirstLast] = useState('');
  const [invalidName, setInvalidName] = useState('');
  const [line1, setLine1] = useState('');
  const [invalidLine1, setInvalidLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [invalidCity, setInvalidCity] = useState('');
  const [myState, setMyState] = useState('Select From List...');
  const [invalidState, setInvalidState] = useState('');
  const [showPicker, setShowPicker] = useState(false)
  const [zipcode, setZipcode] = useState('');
  const [invalidZip, setInvalidZip] = useState('');
  const [pickerStyle, setPickerStyle] = useState(styles.collapsed);
  const stateList = useRef(["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"]);

  function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function formatDate(dateInput) {
    const date = new Date(dateInput);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = String(date.getDate()).padStart(2, '0'); // Ensures two digits
    const year = date.getFullYear();
    return `${month} ${day},  ${year}`;
  }

  return (
    <SafeAreaView style={{backgroundColor: "#fff"}}>
      <ScrollView>
        <TouchableOpacity
          style={styles.login}
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login", params: {} }],
            });
          }}
          >
          <Text allowFontScaling={false} style={styles.loginText}>Back to Login</Text>
        </TouchableOpacity>
        <Text allowFontScaling={false} style={{textAlign: "center", marginBottom: height * 0.02, width: height * 0.35, alignSelf: "center"}}>This app is in early release. Early adopters get a 90 day free trial. Please email "info.surgilink@gmail.com" with any issues and suggestions. Thank you!</Text>
        <View style={{backgroundColor: "#333436", width: height * 0.325, alignSelf: "center", borderRadius: 5, marginBottom: height * 0.025, padding: height * 0.012,}}>
          <Image source={require('../assets/icons/surgilink-logo.png')} style={{width: height * 0.3, height: height * 0.1, alignSelf: "center",}}/>
          <Text allowFontScaling={false} style={{color: "#fff", textAlign: "center", fontSize: height * 0.03, fontWeight: "bold", marginTop: height * 0.01, marginBottom: height * 0.01,}}>$20/mo for First User</Text>
          <View style={{paddingTop: height * 0.005, paddingBottom: height * 0.005, backgroundColor: "#fff", borderRadius: 5, width: height * 0.3, alignSelf: "center",}}>
            <Text allowFontScaling={false} style={{fontStyle: "italic", fontWeight: "bold", fontSize: height * 0.02, textAlign: "center"}}>+$10/mo Each Additional User</Text>
            <Text allowFontScaling={false} style={{textAlign: "center", marginTop: height * 0.01,}}>- Schedule Upcoming Cases</Text>
            <Text allowFontScaling={false} style={{textAlign: "center",}}>- Keep Track of Tray Inventory</Text>
            <Text allowFontScaling={false} style={{textAlign: "center",}}>- Avoid Scheduling Conflicts</Text>
            <Text allowFontScaling={false} style={{textAlign: "center",}}>- Schedule Upcoming Cases</Text>
          </View>
        </View>
        <View style={styles.info}>
          <Text allowFontScaling={false} style={[styles.title, {fontWeight: "bold", fontSize: height * 0.025}]}>1. User Info</Text>
          {box1 && <View>
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Create Username:</Text>
              {usernameConflict && <Text allowFontScaling={false} style={styles.badUname}>{usernameConflict}</Text>}
              {usernameTooShort && <Text allowFontScaling={false} style={styles.badUname}>{usernameTooShort}</Text>}
            </View>
            <TextInput
              autoCapitalize="none"
              placeholder={'...'}
              allowFontScaling={false}
              style={styles.textInput}
              value={username}
              onChangeText={(input) => {
                setUsername(input);
              }}
              />
            <Text allowFontScaling={false} style={styles.title}>Create Password:</Text>
            <TextInput
              autoCapitalize="none"
              placeholder={"********"}
              allowFontScaling={false}
              style={styles.textInput}
              secureTextEntry={true}
              value={password}
              onChangeText={(input) => {
                setPassword(input);
              }}
              />
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Enter Password Again:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{noMatch}</Text>
            </View>
            <TextInput
              autoCapitalize="none"
              placeholder={"********"}
              allowFontScaling={false}
              style={styles.textInput}
              secureTextEntry={true}
              value={password2}
              onChangeText={(input) => {
                setPassword2(input);
              }}
              />
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Email:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{invalidEmail}</Text>
            </View>
            <TextInput
              autoCapitalize="none"
              placeholder={"..."}
              allowFontScaling={false}
              style={styles.textInput}
              value={email}
              onChangeText={(input) => {
                setEmail(input);
              }}
              />
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Phone:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{invalidPhone}</Text>
            </View>
            <TextInput
              placeholder={"..."}
              allowFontScaling={false}
              style={styles.textInput}
              value={phone}
              onChangeText={(input) => {
                setPhone(input);
              }}
              />

            <TouchableOpacity
              onPress={() => {
                let flag = false;
                if (password != password2) {
                  setNoMatch('Passwords Do Not Match.');
                  flag = true;
                } 
                if (username.length < 8) {
                  setUsernameTooShort('Must be 8+ Characters.');
                  flag = true;
                } 
                if (password.length < 8) {
                  setPasswordTooShort('Must be 8+ Characters.');
                  flag = true;
                }
                if (!isValidEmail(email)) {
                  setInvalidEmail("Must be a Valid Email.");
                  flag = true;
                }
                if (flag){return}
                else {
                  setBox1(false);
                  setBox2(true);
                }
              }}
              style={{height: height * 0.04, width: width * 0.25, backgroundColor: "#d6d6d7", borderRadius: 5, marginLeft: width * 0.6, marginTop: height * 0.03, marginBottom: height * 0.01,}}
              >
              <Text allowFontScaling={false} style={{textAlign: "center", paddingTop: height * 0.01,}}>Continue</Text>
            </TouchableOpacity>
          </View>}
          <View style={styles.row}>
            <Text allowFontScaling={false} style={[styles.title, {fontWeight: "bold", fontSize: height * 0.025,}]}>2. Billing Address</Text>
            {box2 && <TouchableOpacity
              style={{width: width * 0.2, height: height * 0.03, backgroundColor: "#d6d6d7", paddingTop: height * 0.0065, borderRadius: 3, marginLeft: width * 0.06}}
              onPress={() => {
                setBox2(false);
                setBox1(true);
                
              }}
              >
              <Text allowFontScaling={false} style={{textAlign: "center"}}>Edit #1</Text>
            </TouchableOpacity>}
          </View>
          {box2 && <View>
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>First & Last Name:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{invalidName}</Text>
            </View>
            <TextInput
              placeholder={"..."}
              allowFontScaling={false}
              style={styles.textInput}
              value={firstLast}
              onChangeText={(input) => {
                setFirstLast(input);
              }}
              />
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Line 1:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{invalidLine1}</Text>
            </View>
            <TextInput
              placeholder={"..."}
              allowFontScaling={false}
              style={styles.textInput}
              value={line1}
              onChangeText={(input) => {
                setLine1(input);
              }}
              />
            <Text allowFontScaling={false} style={styles.title}>Line2:</Text>
            <TextInput
              placeholder={"..."}
              allowFontScaling={false}
              style={styles.textInput}
              value={line2}
              onChangeText={(input) => {
                setLine2(input);
              }}
              />
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>City:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{invalidCity}</Text>
            </View>
            <TextInput
              placeholder={"..."}
              allowFontScaling={false}
              style={styles.textInput}
              value={city}
              onChangeText={(input) => {
                setCity(input);
              }}
              />
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>State:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{invalidState}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (JSON.stringify(pickerStyle) == JSON.stringify(styles.collapsed)){
                  setPickerStyle({});
                } else {
                  setPickerStyle(styles.collapsed);
                }
              }}
              >
              <Text allowFontScaling={false} style={styles.textInput}>{myState && myState}</Text>
            </TouchableOpacity>
            <Picker
              style={pickerStyle}
              selectedValue={myState && myState}
              onValueChange={(itemValue) => {
                setMyState((prev) => itemValue)
              }}
              >
              {stateList.current.map((item, index) => (
                <Picker.Item key={"STATES" + index} label={item} value={item} />
              ))}
            </Picker>
            <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Zipcode:</Text>
              <Text allowFontScaling={false} style={styles.badUname}>{invalidZip}</Text>
            </View>
            <TextInput
              placeholder={"..."}
              allowFontScaling={false}
              style={styles.textInput}
              value={zipcode}
              onChangeText={(input) => {
                setZipcode(input);
              }}
              />
            <TouchableOpacity
              onPress={() => {
                let flag = false;
                if (phone == '') {
                  setInvalidPhone('Phone Number Required For Billing');
                  flag = true;
                }
                if (firstLast == '') {
                  setInvalidName('Name Required for Billing');
                  flag = true;
                }
                if (line1 == '') {
                  setInvalidLine1('Address Required for Billing');
                  flag = true;
                }
                if (city == '') {
                  setInvalidCity('City Required for Billing');
                  flag = true;
                }
                if (myState == 'Select From List...') {
                  setInvalidState("State Required");
                  flag = true;
                }
                if (zipcode == '') {
                  setInvalidZip('Zipcode Required for Billing')
                  flag = true;
                }
                if (flag){return}
                else {
                  setBox2(false);
                  setBox3(true);
                }
              }}
              style={{height: height * 0.04, width: width * 0.25, backgroundColor: "#d6d6d7", borderRadius: 5, marginLeft: width * 0.6, marginTop: height * 0.03, marginBottom: height * 0.01,}}
              >
              <Text allowFontScaling={false} style={{textAlign: "center", paddingTop: height * 0.01,}}>Continue</Text>
            </TouchableOpacity>
          </View>}
          <View style={styles.row}>
            <Text allowFontScaling={false} style={[styles.title, {fontWeight: "bold", fontSize: height * 0.025,}]}>3. Payment Info</Text>
            
            {box3 && <TouchableOpacity
              style={{width: width * 0.2, height: height * 0.03, backgroundColor: "#d6d6d7", paddingTop: height * 0.0065, borderRadius: 3, marginLeft: width * 0.1}}
              onPress={() => {
                setBox3(false);
                setBox2(true);
              }}
              >
              <Text allowFontScaling={false} style={{textAlign: "center"}}>Edit #2</Text>
            </TouchableOpacity>}
          </View>
          {box3 && <View>
            {/* MY CUSTOM STRIPE COMPONENT */}
            <PaymentScreen userProp={{
              username,
              password,
              password2,
              email,
              phone,
              firstLast,
              line1,
              line2,
              city,
              myState,
              zipcode,
            }}/>
          </View>}
        </View>
        <View style={{height: height * 0.4}}/>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  collapsed: {
    display: "none",
  },
  back: {
    color: "rgba(0, 122, 255, 0.8)",
    marginLeft: width * 0.15,
    marginBottom: width * 0.05
  },
  planStyle: {
    textAlign: "center",
    fontSize: width * 0.05,
    marginBottom: width * 0.075,
  },
  chooseButton: {
    backgroundColor: "rgba(0, 122, 255, 0.5)",
    width: width * 0.4,
    height: width * 0.1,
    marginTop: width * 0.02,
    marginLeft: width * 0.23,
    borderWidth: width * 0.002,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: width * 0.04,
    marginLeft: width * 0.045,
    marginTop: width * 0.025
  },
  feature: {
    textAlign: "center",
    fontSize: width * 0.06
  },
  info: {
    width: width
  },
  bigIcon: {
    width: width * 0.4,
    height: width * 0.4,
    marginLeft: width * 0.3,
    marginTop: width * 0.25,
    marginBottom: width * 0.05,
  },
  title: {
    marginLeft: width * 0.15,
    marginBottom: height * 0.01,
  },
  badUname: {
    marginLeft: width * 0.03,
    color: "#cc293c"
  },
  textInput: {
    backgroundColor: "#d6d6d7",
    width: width * 0.7,
    height: height * 0.05,
    fontSize: height * 0.02,
    alignSelf: "center",
    marginBottom: height * 0.01,
    padding: height * 0.01,
    borderRadius: 5
  },
  login: {
    backgroundColor: "#d6d6d7",
    width: height * 0.25,
    height: height * 0.05,
    marginTop: height * 0.03,
    alignSelf: "center",
    marginBottom: height * 0.025,
    borderRadius: 5
  },
  loginText: {
    fontSize: height * 0.03,
    textAlign: "center",
    marginTop: height * 0.005
  },
  signUp: {
    backgroundColor: "#d6d6d7",
    width: height * 0.25,
    height: height * 0.05,
    marginTop: width * 0.06,
    alignSelf: "center",
    borderRadius: 5
  },
  signUpText: {
    fontSize: height * 0.03,
    textAlign: "center",
    marginTop: height * 0.005
  },
  version: {
    textAlign: "center",
    width: width,
  },
  version1: {
    textAlign: "center",
    width: width,
    marginTop: width * 0.35
  },  
  version2: {
    textAlign: "center",
    width: width,
    marginTop: width * 0.2
  },
  forgot: {
    marginTop: width * 0.05,
    textAlign: "center",
  },
})

export default SignUpPage;