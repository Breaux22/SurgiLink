import React, { useEffect, useRef, useState } from "react";
import { View, Button, Image, TouchableOpacity, Text, Dimensions } from "react-native";
import { useStripe, StripeProvider } from "@stripe/stripe-react-native";
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

export default function PaymentScreen({ userProp }) {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const isFirstLoad = useRef(true);

  async function deleteNewStripeUser () {
    try {
      const data = {
        customerId,
      }
      const headers = {
        'method': 'POST',
        'headers': {'content-type': 'application/json'},
        'body': JSON.stringify(data),
      }
      //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/deleteStripeUser';
      const url = 'https://SurgiLink.replit.app/deleteStripeUser';
      const response = await fetch(url, headers)
        .catch(err => console.error(err));
    } catch (err) {
      console.error("deleteNewStripeUser(): ", err);
    }
  }

  async function createStripeSubscription () {
    try {
      const data = {
        customerId: customerId,
        email: userProp.email,
        username: userProp.username,
        phone: userProp.phone,
        name: userProp.firstLast,
        line1: userProp.line1,
        line2: userProp.line2,
        city: userProp.city,
        state: userProp.myState,
        zipcode: userProp.zipcode
      }
      const headers = {
        'method': 'POST',
        'headers': {'content-type': 'application/json'},
        'body': JSON.stringify(data),
      }
      //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/createStripeSubscription';
      const url = 'https://SurgiLink.replit.app/createStripeSubscription';
      const response = await fetch(url, headers)
        .then(response => response.json())
        .then(data => {console.log("CSS: ", data)})
    } catch (err) {
      console.error('Error - createStripeSubscription(): ', err)
    }
  }

  async function createUser () {    
    const data = {
      username: userProp.username,
      password: userProp.password,
      email: userProp.email,
      phone: userProp.phone,
      name: userProp.firstLast,
      line1: userProp.line1,
      line2: userProp.line2,
      city: userProp.city,
      state: userProp.myState,
      zip: userProp.zipcode,
    }
    const headers = {
      'method': 'POST',
      'headers': {
          'content-type': 'application/json'
      },
      'body': JSON.stringify(data)
    }
    //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/createUser';
    const url = 'https://SurgiLink.replit.app/createUser'
    const response = await fetch(url, headers)
      .then(response => {
        if (!response.ok) {
          console.error('Error - createUser()');
        }
        return response.json()
      })
      .then(data => {return data})
    if (response.myMessage == 'Username Already In Use.') {
      setUsernameConflict('Username Already In Use.');
    } else if (response.myMessage == 'Email Already In Use.') {
      setEmailConflict('Username Already In Use.');
    } else {
      // create subscription
      createStripeSubscription()
    }
    return;
  }

  useEffect(() => {
    async function fetchPaymentSheetParams() {
      //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/payment-sheet';
      const url = 'https://SurgiLink.replit.app/payment-sheet';
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userProp.email }),
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
    }
    if (isFirstLoad.current) {
      fetchPaymentSheetParams();
      isFirstLoad.current = false;
    }
  }, []);

 async function openPaymentSheet () {
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setDone(true);
      setReady(false);
    }
  };

  return (
      <View>
        {!ready && !done && <Image source={require('../../assets/icons/loading.gif')} style={{height: height * 0.05, width: height * 0.05, alignSelf: "center",}}/>}
        {ready && <TouchableOpacity
          style={{width: width * 0.7, alignSelf: "center", backgroundColor: "#d6d6d7", height: height * 0.04, paddingTop: height * 0.008, borderRadius: 5,}}
          onPress={openPaymentSheet}
          >
          <Text allowFontScaling={false} style={{textAlign: "center", fontSize: height * 0.02}}>Enter Payment Details</Text>
        </TouchableOpacity>}
        {done && <View>
            <Text allowFontScaling={false} style={{alignSelf: "center", marginBottom: height * 0.01,}}>Card Accepted!</Text>
            <TouchableOpacity
              onPress={() => {
                // create user
                // add subscription with payment info
                // go to login page
                createUser();
                navigation.reset({
                  index: 0,
                  routes: [{
                    name: "Login",
                    params: {},
                  }]
                })
              }}
              style={{width: width * 0.7, height: height * 0.04, backgroundColor: "#d6d6d7", borderRadius: 5, paddingTop: height * 0.01, alignSelf: "center"}}
                     >
            <Text allowFontScaling={false} style={{textAlign: "center", fontSize: height * 0.02,}}>Finish and Subscribe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{alignSelf: "center", marginTop: height * 0.01,}}
            // next step make this delete the stripe user, but surgilink user not yet created
            onPress={() => deleteNewStripeUser()}
            >
            <Text allowFontScaling={false} style={{borderBottomWidth: height * 0.00125}}>Cancel</Text>
          </TouchableOpacity>
        </View>}
      </View>
  );
}
