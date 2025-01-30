import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useState, useRef } from 'react';
import { useRoute } from "@react-navigation/native";
import { Button, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView, View, Image, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { Cloudinary } from "@cloudinary/url-gen";

const { width, height } = Dimensions.get('window');

export default function CameraPage({ navigation, caseId }) {
  const route = useRoute();
  const myCaseId = route.params?.caseId;
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState('off');
  const [image, setImage] = useState();
  const [imageB64, setImageB64] = useState();
  const [retakeStyle, setRetakeStyle] = useState(styles.collapsed);
  const [keepStyle, setKeepStyle] = useState(styles.collapsed);
  const [shutterStyle, setShutterStyle] = useState(styles.snap);
  const [optionStyle, setOptionStyle] = useState(styles.row);

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
      cameraRef.current.takePictureAsync({
        base64: true,
        onPictureSaved: async (picture) => {
          setImage(String(picture.uri));
          setImageB64(picture.base64)
          const asset = await MediaLibrary.createAssetAsync(picture.uri);
        }
      });
      setRetakeStyle(styles.retake);
      setKeepStyle(styles.keep);
      setShutterStyle(styles.collapsed);
      setOptionStyle(styles.collapsed);
    }
  }

  async function saveImage() {
    try {
      // Cloudinary unsigned upload URL
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dxu39drpj/image/upload`;

      // Form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', {
        uri: image,
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

      setShutterStyle(styles.snap);
      setOptionStyle(styles.row);
      setRetakeStyle(styles.collapsed);
      setKeepStyle(styles.collapsed);
      setImage(null);
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
      <Text>BUSINESS PAGE</Text>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={optionStyle}>
            <TouchableOpacity style={styles.icon1} onPress={toggleCameraFacing}>
              <Image source={require('../../assets/icons/repeat.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.icon2} onPress={toggleFlash}>
              <Image source={require('../../assets/icons/thunder.png')} style={styles.icon} />
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={shutterStyle} onPress={takeImage}>
            <Image source={require('../../assets/icons/circle.png')} style={styles.bigIcon} />
        </TouchableOpacity>
          {image && <Image 
                      source={{ uri: image }} 
                      style={{width: width, height: height * 0.9, resizeMode: 'contain',}} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }, 
  header: {
    backgroundColor: "#fff",
    width: width,
    height: width * 0.1,
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
    fontSize: width * 0.05,
    marginTop: width * 0.02,
    marginLeft: width * 0.02
  },
  camera: {
    width: width,
    height: height * 0.9
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
    fontSize: width * 0.07,
    marginTop: 5,
    marginLeft: width * 0.02
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
    fontSize: width * 0.07,
    marginTop: 5,
    marginLeft: width * 0.05
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
    width: 50,
    height: 50,
  },
  bigIcon: {
    width: 100,
    height: 100
  },
  icon1: {
    marginLeft: 20,
    marginTop: 20,
  },
  icon2: {
    marginTop: 20,
    marginLeft: 250
  },
  snap: {
    position: "absolute",
    width: width * 0.1,
    marginLeft: width * 0.37,
    marginTop: height * 0.75,
  },
});
