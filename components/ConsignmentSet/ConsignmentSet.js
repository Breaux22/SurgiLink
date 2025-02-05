import React, { Component, useCallback } from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, TextInput, Image, Dimensions } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { useMemory } from '../../MemoryContext';
import _ from 'lodash';

const { width } = Dimensions.get('window');

function Index({ sendDataToParent, props, index, myTrays, statuses }) {
  const [location, setLocation] = useState(props.location);
  const [trayName, setTrayName] = useState(props.trayName);
  const [trayStatus, setTrayStatus] = useState(props.trayStatus);
  const [spStyle, setSpStyle] = useState(styles.collapsed);
  const [setNeeded, setSetNeeded] = useState(props.trayName);
  const [snStyle, setSnStyle] = useState(styles.collapsed);
  const [removeStyle, setRemoveStyle] = useState(styles.collapsed);
  const { myMemory, setMyMemory } = useMemory();

  async function saveData (userInfo) {
      setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
  };

  const sendMessage = (myAction='', one, two, three) => {
    sendDataToParent({myAction: myAction, id: props.id, loaner: false, trayName: one, location: two, trayStatus: three}, index);
  };

  const updateLocation = (newLoc) => {
    sendMessage("updateLocation", trayName, newLoc, trayStatus)
  }

  const debouncedInputChange = useCallback(_.debounce(updateLocation, 1000), []);

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
    if (trayStatus == "Sterile") {
      return styles.greenB;
    } else {
      return styles.green;
    }
  }

  function getColorB () {
    if (trayStatus == "?") {
      return styles.yellowB;
    } else {
      return styles.yellow;
    }
  }

  function getColorC () {
    if (trayStatus == "Dirty") {
      return styles.redB;
    } else {
      return styles.red;
    }
  }

  return (
    <View style={styles.container2}>
      <View style={styles.row}>
        <Text  allowFontScaling={false}  style={styles.title}>Tray #{index+1}</Text>
        <Text allowFontscaling={false} style={{backgroundColor: "rgba(0, 122, 255, 0.4)", fontWeight: "bold", borderWidth: width * 0.003, borderRadius: 5, fontSize: width * 0.04, height: width * 0.055, marginTop: width * 0.01, marginLeft: width * 0.01, textAlign: "center", width: width * 0.35,  }}>CONSIGNMENT</Text>
        <TouchableOpacity 
          style={{marginTop: width * 0.015, marginLeft: width * 0.28, }}
          onPress={() => {
            sendMessage("remove", trayName, location, trayStatus);
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
            if (removeStyle == styles.container) {
              setSetNeeded('Choose Tray...');
            } 
            setSnStyle(styles.collapsed);
            setRemoveStyle(styles.collapsed);
        }
      }}>
        <Text  allowFontScaling={false} style={{color: "#39404d"}} >{setNeeded}</Text>
      </TouchableOpacity>
      <View style={snStyle}>
        <Picker
          selectedValue={setNeeded}
          onValueChange={(itemValue, itemIndex) => {
            if (setNeeded != "Choose Tray...") {
              // remove previous chosen set from case
              sendMessage("remove", setNeeded, location, trayStatus)
              setSetNeeded(itemValue);
              sendMessage("chooseTray", itemValue, location, trayStatus);
              setRemoveStyle(styles.collapsed);
            } else if (itemValue != "Choose Tray...") {
              setSetNeeded(itemValue);
              sendMessage("chooseTray", itemValue, location, trayStatus);
              setRemoveStyle(styles.collapsed);
            } 
          }}
          style={styles.picker}
        >
          <Picker.Item label="Choose Tray..." value="Choose Tray..."/>
          {myTrays.map((tray, index) => (
            <Picker.Item key={tray.trayName + index} label={tray.trayName} value={tray.trayName} />
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
            setTrayStatus("Sterile");
            sendMessage("updateStatus", trayName, location, "Sterile");
          }}
          >
          <Text allowFontScaling={false} style={styles.statusText}>Sterile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={getColorB()}
          onPress={() => {
            setTrayStatus("?");
            sendMessage("updateStatus", trayName, location, "");
          }}
          >
          <Text allowFontScaling={false} style={styles.statusText}>?</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={getColorC()}
          onPress={() => {
            setTrayStatus("Dirty");
            sendMessage("updateStatus", trayName, location, "Dirty");
          }}
          >
          <Text allowFontScaling={false} style={styles.statusText}>Dirty</Text>
        </TouchableOpacity>
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
    width: width * 0.29, 
    height: width * 0.09, 
    backgroundColor: "#32a852", 
    marginLeft: width * 0.02, 
    borderRadius: 5,
    paddingTop: width * 0.01,
  },
  greenB: {
    width: width * 0.29, 
    height: width * 0.09, 
    backgroundColor: "#32a852", 
    marginLeft: width * 0.02, 
    borderRadius: 5, 
    borderWidth: width * 0.01,
  },
  yellow: {
    width: width * 0.29, 
    height: width * 0.09, 
    backgroundColor: "#d1cc6f", 
    marginLeft: width * 0.02, 
    borderRadius: 5,
    paddingTop: width * 0.01,
  },
  yellowB: {
    width: width * 0.29, 
    height: width * 0.09, 
    backgroundColor: "#d1cc6f", 
    marginLeft: width * 0.02, 
    borderRadius: 5, 
    borderWidth: width * 0.01,
  },
  red: {
    width: width * 0.29, 
    height: width * 0.09, 
    backgroundColor: "#d16f6f", 
    marginLeft: width * 0.02, 
    borderRadius: 5,
    paddingTop: width * 0.01,
  },
  redB: {
    width: width * 0.29, 
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