import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Button, ScrollView, SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { useRoute } from "@react-navigation/native";
import { utcToZonedTime, format } from 'date-fns-tz';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

function HeaderMenu() {
  const [menuStyle, setMenuStyle] = useState(styles.collapsed);
  const [openStyle, setOpenStyle] = useState(styles.icon3);
  const [closeStyle, setCloseStyle] = useState(styles.collapsed);
  const navigation = useNavigation();

  async function openMenu() {
    setOpenStyle(styles.collapsed);
    setCloseStyle(styles.icon3);
    setMenuStyle(styles.menu);
  }

  async function closeMenu() {
    setCloseStyle(styles.collapsed);
    setOpenStyle(styles.icon3);
    setMenuStyle(styles.collapsed);
  }
  
  return (
    <View style={styles.menuContainer}>
        <TouchableOpacity onPress={openMenu}>
            <Image source={require('../../assets/icons/menu.png')} style={openStyle}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={closeMenu}>
            <Image source={require('../../assets/icons/close.png')} style={closeStyle}/>
        </TouchableOpacity>
        <View style={menuStyle}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Weekly View", params: { calendar: calendar, month: currMonth, year: currYear} }],
                });
              }}
              >
                <Text style={styles.optionText}>Weekly View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              >
                <Text style={styles.optionText}>Daily View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              >
                <Text style={styles.optionText}>List View</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              >
                <Text style={styles.optionText}>Settings</Text>
            </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    backgroundColor: "#EFEFEF4",
    opacity: 1,
    marginTop: - width * 0.1,
    marginBottom: width * 0.02
  },
  collapsed: {
    display: 'none',
  },
  icon33: {
    width: width * 0.1,
    height: width * 0.1,
    marginLeft: width * 0.02,
  },
  menu: {
    backgroundColor: "#EFEFEF4",
    marginTop: width * 0.05,
    marginLeft: width * 0.02,
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
});

export default HeaderMenu;