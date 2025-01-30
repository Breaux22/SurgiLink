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

const { width, height } = Dimensions.get('window');

function SettingsPage () {
    const route = useRoute();
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
    const [delete1, setDelete1] = useState(styles.collapsed);
    const [delete2, setDelete2] = useState(styles.collapsed);
    const [delete3, setDelete3] = useState(styles.collapsed);
    const [surgUpdate, setSurgUpdate] = useState('');
    const [facilUpdate, setFacilUpdate] = useState('');
    const [trayUpdate, setTrayUpdate] = useState('');
    const navigation = useNavigation();

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
      console.log("Items: ", items)
      const caseData = {
        items: items,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/${url}`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                follow();
                setDeleteNum(styles.collapsed);
            }
        })
      return response;
    };

    async function addItem (param, item, url, follow) {
      let caseData;
      if (param === 'surgeonName') {
        caseData = { surgeonName: item };
      } else if (param === 'facilityName') {
        caseData = { facilityName: item };
      } else if (param === 'trayName') {
        caseData = { trayName: item };
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/${url}`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
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
        var tempArr = response.map((surg) => ({ name: surg.surgeonName, myState: false, editStyle: styles.edit, nameStyle: styles.surgeonText, inputStyle: styles.collapsed }));
        setSurgChecklist(tempArr);
        setSurgeonList(response);
        setDelete1(styles.collapsed);
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
        var tempArr = response.map((facil) => ({ name: facil.facilityName, myState: false, editStyle: styles.edit, nameStyle: styles.facilityText, inputStyle: styles.collapsed }));
        setFacilChecklist(tempArr);
        setFacilityList(response);
        setDelete2(styles.collapsed);
    }

    async function getTrays() {
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
        var tempArr = response.map((tray) => ({ name: tray.trayName, myState: false, editStyle: styles.edit, nameStyle: styles.trayText, inputStyle: styles.collapsed }));
        setTrayChecklist(tempArr);
        setTrayList(response);
        setDelete2(styles.collapsed);
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
      console.log("I'm me!")
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
      const caseData = {
        prevName: prevName,
        newName: surgUpdate,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/updateSurgeon`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                updateVisible(setSurgChecklist, index, 1);
                getSurgeons();
            }
        })
      return response;
    }

    async function updateFacility (prevName, index) {
      const caseData = {
        prevName: prevName,
        newName: facilUpdate,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/updateFacility`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                updateVisible(setFacilChecklist, index, 1);
                getFacilities();
            }
        })
      return response;
    }

    async function updateTray (prevName, index) {
      const caseData = {
        prevName: prevName,
        newName: trayUpdate,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://e6b80fb8-7d8e-4c21-a8d1-7a5368d27fcd-00-2ty982vc8hd6g.spock.replit.dev/updateTray`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                updateVisible(setTrayChecklist, index, 1);
                getTrays();
            }
        })
      return response;
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
        })();    
      
        return () => {};
    }, [])
  
    return (
      <SafeAreaView>
        <View style={styles.menuButtons}>
          <TouchableOpacity onPress={openMenu}>
              <Image source={require('../../assets/icons/menu.png')} style={openStyle}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeMenu}>
              <Image source={require('../../assets/icons/close.png')} style={closeStyle}/>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={menuStyle}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Business Monthly View", params: {month: month, year: year} }],
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
                    routes: [{ name: "Business Weekly View", params: {month: month, year: year} }],
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
                    routes: [{ name: "Business List Cases", params: {month: month, year: year} }],
                  });
                }}
                >
                  <Text allowFontScaling={false} style={styles.optionText}>List View</Text>
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
        <ScrollView style={styles.container}>
          <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Edit Surgeons:</Text>
              <TouchableOpacity 
                style={delete1}
                onPress={() => deleteItems(surgChecklist, 'deleteSurgeons', setDelete1, getSurgeons)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={styles.editBox}>
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
              return (
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
                    <Text style={surgChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
          <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Edit Facilities:</Text>
              <TouchableOpacity 
                style={delete2}
                onPress={() => deleteItems(facilChecklist, 'deleteFacilities', setDelete2, getFacilities)}
                >
                <Text style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={styles.editBox}>
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
              return (
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
                    <Text style={facilChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
          <View style={styles.row}>
              <Text allowFontScaling={false} style={styles.title}>Edit Trays:</Text>
              <TouchableOpacity 
                style={delete3}
                onPress={() => deleteItems(trayChecklist, 'deleteTrays', setDelete3, getTrays)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={styles.editBox}>
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
                        updateTray(tray.trayName, index)
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
                    <Text style={trayChecklist[index].editStyle}>- Edit</Text>
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
    height: height * 1.5,
  },
  row: {
      flexDirection: 'row'
  },
  title: {
      fontSize: width * 0.06,
      width: width * 0.375,
      marginLeft: width * 0.025,
      marginTop: width * 0.025
  },
  edit: {
    color: "rgba(0, 122, 255, 0.8)"
  },
  editBox: {
      borderWidth: width * 0.001,
      width: width * 0.95,
      maxHeight: width * 0.4,    
      marginLeft: width * 0.025,
      padding: width * 0.02,
      borderRadius: 5,
  },
  checkbox: {
    marginLeft: width * 0.02,
    marginBottom: width * 0.02,
  },
  name: {
    marginLeft: width * 0.02,
    marginBottom: width * 0.02,
  },
  delete: {
    marginLeft: width * 0.31,
    marginTop: width * 0.045
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
  addBox: {
    borderWidth: width * 0.002,
    borderRadius: 5,
    width: width * 0.75,
    marginBottom: width * 0.04,
    flexDirection: "row",
  },
  addText: {
    width: width * 0.73,
    marginLeft: width * 0.02,
    height: width * 0.065
  },
  addButton: {
    backgroundColor: "rgba(211, 211, 211, 0.5)",
    width: width * 0.15,
    marginLeft: width * 0.01,
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: width * 0.05,
    marginLeft: width * 0.03
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

export default SettingsPage;