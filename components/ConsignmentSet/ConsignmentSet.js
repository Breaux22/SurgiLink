import React, { Component, useCallback } from 'react';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, ScrollView, Image, Dimensions } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useMemory } from '../../MemoryContext';
import _ from 'lodash';

const { width } = Dimensions.get('window');

function Index({ sendDataToParent, surgdate, props, index, myTrays, statuses }) {
  const [location, setLocation] = useState(props.location || "");
  const [trayId, setTrayId] = useState(props.id); // id of tray before change
  const [setNeeded, setSetNeeded] = useState(props); // tray object at first and after change
  const [open, setOpen] = useState(props.open);
  const [checkedIn, setCheckedIn] = useState(props.checkedIn);
  const [spStyle, setSpStyle] = useState(styles.collapsed);
  const [snStyle, setSnStyle] = useState(styles.collapsed);
  const { myMemory, setMyMemory } = useMemory();
  const firstRenderCheckedIn = useRef(true);
  const firstRenderOpen = useRef(true);
  const conflictCheck = useRef(true);
  const [warningStyle, setWarningStyle] = useState(styles.collapsed);
  const [conflictObj, setConflictObj] = useState({surgdate: new Date(), dr: '', hosp: '', trayName: ''})

  async function checkForSameDay () {
    const data = {
      trayId: setNeeded.id,
      userId: myMemory.userInfo.id,
      surgdate: surgdate,
      sessionString: myMemory.userInfo.sessionString,
    }
    const headers = {
      'method': 'POST',
      'headers': {
        'content-type': 'application/json',
      },
      'body': JSON.stringify(data)
    }
    const url = 'https://surgiflow.replit.app/getTrayUsesByDate'
    //const url = 'https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/getTrayUsesByDate'
    const response = await fetch(url, headers)
      .then(response => response.json())
      .then(data => {return data});
    return response;
  }

  async function saveData (userInfo) {
      setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
  };

  const sendMessage = (myAction='',) => {

  };

  const updateLocation = (newLoc) => {
    sendDataToParent({myAction: 'updateLocation', location: newLoc}, index);
  }

  const debouncedInputChange = useCallback(_.debounce(updateLocation, 500), []);

  // useEffect to watch for changes in inputValue
  useEffect(() => {
    if (location) {
      debouncedInputChange(location);
    }
    // Cleanup function to cancel debounce on unmount
    return () => {
      debouncedInputChange.cancel();
    };
  }, [location, debouncedInputChange]);
  
  function getColorA () {
    if (open == true) {
      return styles.greenB;
    } else {
      return styles.green;
    }
  }

  function getColorB () {
    if (open == false) {
      return styles.redB;
    } else {
      return styles.red;
    }
  }

  function getColorC () {
    if (checkedIn == true) {
      return styles.blueB;
    } else {
      return styles.blue;
    }
  }

  function useAnyway() {
    sendDataToParent({myAction: 'remove', tray: props}, index);
    sendDataToParent({myAction: 'chooseTray', newSet: setNeeded}, index);
    setWarningStyle(styles.collapsed);
  }

  useEffect(() => {
    if (firstRenderCheckedIn.current) {
      firstRenderCheckedIn.current = false; // Mark first render as completed
      return;
    }
    sendDataToParent({myAction: 'checkedIn', checkedIn: checkedIn}, index);
    return;
  }, [checkedIn])

  useEffect(() => {
    if (firstRenderOpen.current) {
      firstRenderOpen.current = false;
      return;
    }
    sendDataToParent({myAction: 'openHold', open: open}, index);
    return;
  }, [open])

  useEffect(() => {
    if (conflictCheck.current) {
      conflictCheck.current = false;
      return;
    }
    (async () => {
        const myCheck = await checkForSameDay();
        if (myCheck.length > 0){
          if (myCheck[0].caseId == props.id) {return}
          setSnStyle(styles.collapsed);
          setConflictObj(prev => myCheck[0]);
          setWarningStyle(styles.warning);
          return;
        } else {
          sendDataToParent({myAction: 'remove', tray: props}, index);
          sendDataToParent({myAction: 'chooseTray', newSet: setNeeded}, index);
          return;
        }
    })();

  }, [setNeeded])

  return (
    <View style={styles.container2}>
      <View style={warningStyle}>
        <Text allowFontScaling={false} style={{textAlign: "center", fontSize: width * 0.05, fontWeight: "bold"}}>Warning, Tray Conflict!</Text>
        <ScrollView style={{minHeight: width * 0.23, maxHeight: width * 0.23, marginBottom: width * 0.02, padding: width * 0.02, backgroundColor: "#ededed"}}>
          <Text style={{fontSize: width * 0.04, textAlign: "justify"}}>{setNeeded.trayName} already scheduled for use with {conflictObj.surgeonName} at {conflictObj.facilityName} on the same day.</Text>
        </ScrollView>
        <View style={styles.row}>
          <TouchableOpacity
            onPress={() => {
              setSetNeeded({trayName: "Choose Tray...", location: '', loaner: false, checkedIn: false, open: true})
              sendDataToParent({myAction: 'remove', tray: props}, index);
              sendDataToParent({myAction: 'chooseTray', newSet: {trayName: "Choose Tray...", location: '', loaner: false, checkedIn: false, open: true}}, index);
              setWarningStyle(styles.collapsed);
            }}
            >
            <Text allowFontScaling={false} style={{backgroundColor: "#d6d6d7", height: width * 0.08, width: width * 0.25, fontSize: width * 0.06, borderRadius: 5, paddingLeft: width * 0.03, marginLeft: width * 0.02, }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => useAnyway()}
            >
            <Text allowFontScaling={false} style={{backgroundColor: "#f08b98", height: width * 0.08, width: width * 0.38, fontSize: width * 0.06, borderRadius: 5, paddingLeft: width * 0.03, marginLeft: width * 0.02,}}>Use Anyway</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <Text  allowFontScaling={false}  style={styles.title}>Tray #{index+1}</Text>
        <TouchableOpacity 
          style={{marginTop: width * 0.015, marginLeft: width * 0.65, }}
          onPress={() => {
            sendDataToParent({myAction: 'remove', tray: props}, index);
          }}
          >
          <Text allowFontScaling={false} style={{color:"#e31e1e"}}>Remove</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.textBox} onPress={() => {
        if (snStyle == styles.collapsed) {
            setSnStyle(styles.snStyle);
            setSpStyle(styles.collapsed);
        } else {
            setSnStyle(styles.collapsed);
        }
      }}>
        <Text  allowFontScaling={false} style={{color: "#39404d"}} >{setNeeded.trayName}</Text>
      </TouchableOpacity>
      <View style={snStyle}>
        <Picker
          selectedValue={setNeeded.id}
          onValueChange={async (itemValue, itemIndex) => {
            if (itemValue != "Choose Tray...") {
              const chosenTray = myTrays.filter((value) => value.id == itemValue)[0];
              console.log("Chosen: ", chosenTray);
              setSetNeeded(chosenTray);
            }
          }}
          style={styles.picker}
        >
          <Picker.Item label="Choose Tray..." value="Choose Tray..."/>
          {myTrays.map((tray, index) => (
            <Picker.Item key={tray.TrayId + index} label={tray.trayName} value={tray.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.row}>
        <Image source={require('../../assets/icons/enter.png')} style={{width: width * 0.09, height: width * 0.09, marginLeft: width * 0.04,}}/>
        <Text allowFontScaling={false} style={{fontSize: width * 0.06, marginTop: width * 0.02, backgroundColor: "#ededed", borderTopLeftRadius: 5, borderBottomLeftRadius: 5, marginLeft: width * 0.02, paddingLeft: width * 0.02, paddingTop: width * 0.005}}>@</Text>
        <TextInput
          allowFontScaling={false}
          value={location}
          onChangeText={(input) => setLocation(input)}
          style={styles.textInput}
          placeholder={"Tray Location (i.e. Storage Unit)"}
          />
      </View>
      <View style={[styles.row, {marginTop: width * 0.02}]}>
        <TouchableOpacity 
          style={getColorA()}
          onPress={() => {
            setOpen(true);
          }}
          >
          <Text allowFontScaling={false} style={styles.statusText}>Open</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={getColorB()}
          onPress={() => {
            setOpen(false);
          }}
          >
          <Text allowFontScaling={false} style={styles.statusText}>Hold</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <Text allowFontScaling={false} style={{fontSize: width * 0.04, marginLeft: width * 0.02, marginTop: width * 0.02, }}>Checked In</Text>
          <TouchableOpacity 
            style={{borderRadius: 5, borderWidth: width * 0.005, marginLeft: width * 0.02, }}
            onPress={() => {
              setCheckedIn(prev => !prev);
            }}
            >
            <Text allowFontScaling={false} style={getColorC()}>X</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warning: {
    position: "absolute",
    width: width * 0.957,
    height: width * 0.408,
    borderRadius: 4,
    backgroundColor: "#fff",
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
  },
  container2: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: width * 0.002,
    marginLeft: width * 0.02,
    marginTop: width * 0.02,
    paddingBottom: width * 0.02,
    width: width * 0.96,
  },
  title: {
    color: "#292c3b",
    marginLeft: width * 0.02,
    marginTop: width * 0.015,
    fontWeight: "bold",
  },
  textInput: {
    backgroundColor: "#ededed",
    color: "#39404d",
    width: width * 0.705,
    height: width * 0.09,
    marginTop: width * 0.02,
    paddingLeft: width * 0.02,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },    
  textBox: {
      width: width * 0.91,
      height: width * 0.09,
      marginLeft: width * 0.02,
      marginTop: width * 0.02,
      padding: width * 0.02,
      borderRadius: 5,
      backgroundColor: '#ededed'
  },
  collapsed: {
      display: 'none'
  },
  green: {
    width: width * 0.28, 
    height: width * 0.09, 
    backgroundColor: "#ededed", 
    marginLeft: width * 0.02, 
    borderRadius: 5,
    borderWidth: width * 0.002,
    paddingTop: width * 0.01,
    opacity: 0.4,
  },
  greenB: {
    width: width * 0.28, 
    height: width * 0.09, 
    backgroundColor: "#32a852", 
    marginLeft: width * 0.02, 
    borderRadius: 5, 
    borderWidth: width * 0.01,
  },
  blue: {
    width: width * 0.08, 
    height: width * 0.08, 
    opacity: 0,
  },
  blueB: {
    width: width * 0.08, 
    height: width * 0.08, 
    backgroundColor: "rgba(0, 122, 255, 0.8)", 
    borderRadius: 4,
    fontSize: width * 0.06,
    fontWeight: "bold",
    paddingLeft: width * 0.02,
    paddingTop: width * 0.004,
  },
  red: {
    width: width * 0.28, 
    height: width * 0.09, 
    backgroundColor: "#ededed", 
    marginLeft: width * 0.02, 
    borderRadius: 5,
    borderWidth: width * 0.002,
    paddingTop: width * 0.01,
    opacity: 0.4,
  },
  redB: {
    width: width * 0.28, 
    height: width * 0.09, 
    backgroundColor: "#d16f6f", 
    marginLeft: width * 0.02, 
    borderRadius: 5, 
    borderWidth: width * 0.01,
  },
  statusText: {
    fontSize: width * 0.06,
    textAlign: "center",
  },
});

export default Index;