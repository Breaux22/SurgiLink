import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState, useRef } from 'react';
import { useRoute } from "@react-navigation/native";
import { Button, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, View, Image, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Cloudinary } from "@cloudinary/url-gen";
import * as SecureStore from 'expo-secure-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function CameraPage({ navigation, caseId }) {
  const route = useRoute();
  const styles = myStyles(useSafeAreaInsets());
  const myCaseId = route.params?.caseId;
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState('off');
  const [image, setImage] = useState(null);
  const [imageB64, setImageB64] = useState();
  const [retakeStyle, setRetakeStyle] = useState(styles.collapsed);
  const [keepStyle, setKeepStyle] = useState(styles.collapsed);
  const [shutterStyle, setShutterStyle] = useState(styles.snap);
  const [optionStyle, setOptionStyle] = useState(styles.row);
  const [loadingStyle, setLoadingStyle] = useState(false);
  const keepRef = useRef(false);

  const cameraRef = useRef();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text allowFontScaling={false} style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'front' ? 'back' : 'front'));
  }

  function toggleFlash () {
    if (flash === 'on') {
      setFlash('off');
    } else {
      setFlash('on');
    }
  }
  
  async function takeImage() {
    if (cameraRef.current) {
      setLoadingStyle(true);
      cameraRef.current.takePictureAsync({
        base64: true,
        onPictureSaved: async (picture) => {
          setImage(String(picture.uri));
          setImageB64(picture.base64)
          setTimeout(() => {
            setLoadingStyle(false);
          }, 250)
          //const asset = await MediaLibrary.createAssetAsync(picture.uri);
        }
      });
      setRetakeStyle(styles.retake);
      setKeepStyle(styles.keep);
      setShutterStyle(styles.collapsed);
      setOptionStyle(styles.collapsed);
    }
  }

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

  async function saveImage() {
    try {
      setShutterStyle(styles.snap);
      setOptionStyle(styles.row);
      setRetakeStyle(styles.collapsed);
      setKeepStyle(styles.collapsed);
      const myImage = image;
      setImage(null);
      const cloudCreds = await getCloudCreds();
      // Cloudinary unsigned upload URL
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudCreds.cloud_name}/image/upload`;
      // Form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', {
        uri: myImage,
        type: 'image/jpeg', // You can adjust this based on your image type
        name: `${myCaseId}_${JSON.stringify(new Date())}.jpg`,   // Change the filename if needed
      });
      formData.append('upload_preset', 'SetTracker');  // Replace with your unsigned upload preset

      // Perform the upload using fetch
      const response = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          >
            <Text allowFontScaling={false} style={styles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
      </View>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={optionStyle}>
            <TouchableOpacity style={styles.icon1} onPress={toggleCameraFacing}>
              <Image source={require('../../assets/icons/repeat.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon2} onPress={toggleFlash}>
              <Image source={require('../../assets/icons/thunder.png')} style={styles.icon} />
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={[shutterStyle, {alignSelf: "center"}]} onPress={takeImage}>
            <Image source={require('../../assets/icons/circle.png')} style={styles.bigIcon} />
        </TouchableOpacity>
          {loadingStyle == true && <View style={[styles.camera, {backgroundColor: "#fff"}]}><Image source={require('../../assets/icons/loading.gif')} style={{width: height * 0.25, height: height * 0.25, alignSelf: "center", marginTop: height * 0.25, }}/></View>}
          {image && <Image 
                      source={{ uri: image }} 
                      style={styles.camera} 
                    />}
        <TouchableOpacity style={retakeStyle} onPress={() => {
          setShutterStyle(styles.snap);
          setOptionStyle(styles.row);
          setRetakeStyle(styles.collapsed);
          setKeepStyle(styles.collapsed);
          setImage(null);
        }}>
          <Text allowFontScaling={false} style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={keepStyle} onPress={saveImage}>
          <Text allowFontScaling={false} style={styles.keepText}>Keep</Text>
        </TouchableOpacity>
      </CameraView>
    </SafeAreaView>
  );
}

const myStyles = (insets) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }, 
  header: {
    backgroundColor: "#fff",
    width: width,
    height: height * 0.05,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsed: {
    display: "none"
  },
  backText: {
    color: "rgba(0, 122, 255, 0.8)",
    fontSize: height * 0.025,
    marginTop: height * 0.01,
    marginLeft: width * 0.02
  },
  camera: {
    width: width,
    height: height * 0.95 - insets.top,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  retake: {
    backgroundColor: "rgba(201, 18, 52, 0.75)",
    position: "absolute",
    width: width * 0.25,
    height: 45,
    marginLeft: width * 0.15,
    marginTop: height * 0.7,
    borderRadius: 5,
    zIndex: 1
  },
  retakeText: {
    color: "#fff",
    fontSize: height * 0.035,
    marginTop: 5,
    textAlign: "center",
  },
  keep: {
    backgroundColor: "rgba(240, 228, 230, 0.75)",
    position: "absolute",
    width: width * 0.25,
    height: 45,
    marginLeft: width * 0.6,
    marginTop: height * 0.7,
    borderRadius: 5,
    zIndex: 1
  },
  keepText: {
    fontSize: height * 0.035,
    marginTop: 5,
    textAlign: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  row: {
    flexDirection: 'row'
  },
  icon: {
    width: height * 0.05,
    height: height * 0.05,
  },
  bigIcon: {
    width: height * 0.1,
    height: height * 0.1,
  },
  icon1: {
    marginLeft: height * 0.01,
    marginTop: height * 0.01,
  },
  icon2: {
    marginTop: height * 0.01,
    position: "absolute",
    right: height * 0.01,
  },
  snap: {
    position: "absolute",
    top: height * 0.75,
  },
});
