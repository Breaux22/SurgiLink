import React, { Component, useCallback } from 'react';
import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image, Dimensions } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useMemory } from '../../MemoryContext';
import _ from 'lodash';

const { width, height } = Dimensions.get('window');

function Index({ sendDataToParent, props, index, myTrays, statuses }) {
  const [location, setLocation] = useState(props.location);
  const [trayName, setTrayName] = useState(props.trayName);
  const [spStyle, setSpStyle] = useState(styles.collapsed);
  const [setNeeded, setSetNeeded] = useState(props.trayName);
  const [snStyle, setSnStyle] = useState(styles.collapsed);
  const { myMemory, setMyMemory } = useMemory();
  const [checkedIn, setCheckedIn] = useState(props.checkedIn);
  const [open, setOpen] = useState(props.open);
  const firstRenderCheckedIn = useRef(true);
  const firstRenderOpen = useRef(true);

  async function saveData (userInfo) {
      setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
  };

  const updateLocation = (newLoc) => {
    sendDataToParent({myAction: 'updateLocation', location: newLoc}, index);
  }

  const updateName = (newName) => {
    sendDataToParent({myAction: 'updateLoanerName', newName: newName}, index);
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

  const debouncedInputChange2 = useCallback(_.debounce(updateName, 500), []);

  // useEffect to watch for changes in inputValue
  useEffect(() => {
    if (trayName) {
      debouncedInputChange2(trayName);
    }
    // Cleanup function to cancel debounce on unmount
    return () => {
      debouncedInputChange2.cancel();
    };
  }, [trayName, debouncedInputChange2]);
  
  useEffect(() => {
    if (firstRenderCheckedIn.current) {
      firstRenderCheckedIn.current = false;
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

  return (
    <View style={styles.container2}>
      <View style={styles.row}>
        <Text  allowFontScaling={false}  style={styles.title}>Tray #{index+1}</Text>
        <Text allowFontscaling={false} style={{backgroundColor: "#f08a0e", fontWeight: "bold", borderWidth: height * 0.0015, borderRadius: 5, fontSize: height * 0.02, height: height * 0.0275, marginTop: height * 0.005, marginLeft: width * 0.01, textAlign: "center", width: height * 0.15,  }}>LOANER</Text>
        <TouchableOpacity 
          style={{marginTop: height * 0.0075, position: "absolute", right: width * 0.03,  }}
          onPress={() => {
            sendDataToParent({myAction: 'remove', tray: props}, index);
          }}
          >
          <Text allowFontScaling={false} style={{color:"#e31e1e"}}>Remove</Text>
        </TouchableOpacity>
      </View>
      <TextInput
          placeholder="Enter Tray Name..."
          allowFontScaling={false}
          value={trayName}
          onChangeText={(input) => setTrayName(input)}
          style={{width: width * 0.91, height: height * 0.04, backgroundColor: "#ededed", borderRadius: 5, marginLeft: width * 0.02, marginTop: height * 0.01, padding: height * 0.01, }}
          />
      <View style={[styles.row, {marginBottom: height * 0.005}]}>
        <Image source={require('../../assets/icons/enter.png')} style={{width: height * 0.04, height: height * 0.04, marginLeft: width * 0.04,}}/>
        <View style={[styles.row, {position: "absolute", right: width * 0.029, marginTop: height * 0.0075}]}>
          <Text allowFontScaling={false} style={{fontSize: height * 0.03, height: height * 0.04, /*marginTop: height * 0.005,*/ backgroundColor: "#ededed", borderTopLeftRadius: 5, borderBottomLeftRadius: 5, marginLeft: width * 0.02, paddingLeft: width * 0.02, paddingTop: height * 0.001}}>@</Text>
          <TextInput
            allowFontScaling={false}
            value={location}
            onChangeText={(input) => setLocation(input)}
            style={styles.textInput}
            placeholder={"Tray Location (i.e. Storage Unit)"}
            />
        </View>
      </View>
      <View style={[styles.row, {marginTop: height * 0.01}]}>
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
        <View style={[styles.row, {position: "absolute", right: width * 0.03,}]}>
          <Text allowFontScaling={false} style={{fontSize: height * 0.018, marginLeft: width * 0.02, marginTop: height * 0.01, }}>Checked In</Text>
          <TouchableOpacity 
            style={{borderRadius: 5, borderWidth: height * 0.0025, marginLeft: width * 0.02, }}
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
  row: {
    flexDirection: "row",
  },
  container2: {
    backgroundColor: "#ffffff",
    borderRadius: 5,
    borderWidth: height * 0.001,
    marginLeft: width * 0.02,
    marginTop: height * 0.01,
    paddingBottom: width * 0.02,
    width: width * 0.96,
  },
  title: {
    color: "#292c3b",
    marginLeft: width * 0.02,
    marginTop: height * 0.0075,
    fontWeight: "bold",
  },
  textInput: {
    backgroundColor: "#ededed",
    color: "#39404d",
    width: width * 0.69,
    height: height * 0.04,
    //marginTop: height * 0.005,
    //marginBottom: height * 0.005,
    paddingLeft: width * 0.02,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },    
  textBox: {
      width: width * 0.91,
      height: height * 0.045,
      marginLeft: width * 0.02,
      marginTop: height * 0.01,
      padding: height * 0.01,
      borderRadius: 5,
      backgroundColor: '#ededed'
  },
  collapsed: {
      display: 'none'
  },
  green: {
    width: width * 0.28, 
    height: height * 0.045, 
    backgroundColor: "#ededed", 
    marginLeft: width * 0.02, 
    borderRadius: 5,
    borderWidth: height * 0.001,
    paddingTop: width * 0.005,
    opacity: 0.4,
  },
  greenB: {
    width: width * 0.28, 
    height: height * 0.045, 
    backgroundColor: "#32a852", 
    marginLeft: width * 0.02, 
    borderRadius: 5, 
    borderWidth: height * 0.005,
  },
  blue: {
    width: height * 0.04,
    height: height * 0.04,
    opacity: 0,
  },
  blueB: {
    width: height * 0.04,
    height: height * 0.04,
    backgroundColor: "rgba(0, 122, 255, 0.8)", 
    borderRadius: 4,
    fontSize: height * 0.03,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: width * 0.002,
  },
  red: {
    width: width * 0.28, 
    height: height * 0.045, 
    backgroundColor: "#ededed", 
    marginLeft: width * 0.02, 
    borderRadius: 5,
    borderWidth: height * 0.001,
    paddingTop: width * 0.005,
    opacity: 0.4,
  },
  redB: {
    width: width * 0.28, 
    height: height * 0.045, 
    backgroundColor: "#d16f6f", 
    marginLeft: width * 0.02, 
    borderRadius: 5, 
    borderWidth: height * 0.005,
  },
  statusText: {
    fontSize: height * 0.03,
    textAlign: "center",
  },
});

export default Index;