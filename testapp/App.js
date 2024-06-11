import React, { useEffect, useRef, useState } from 'react';
import {StyleSheet, Text, View, Alert, Platform, TouchableOpacity, ActivityIndicator} from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import axios from 'axios';
import RecordingControls from "./src/components/RecordingControls";
import FaceLandmark from "./src/components/FaceLandmarks";

export default function App() {
    const faceDetectionOptions = useRef({
        landmarkMode: 'eyes',
    }).current;
    const { detectFaces } = useFaceDetector(faceDetectionOptions);
    const device = useCameraDevice('front');
    const [detectedFaces, setDetectedFaces] = useState([]);
    const [cameraPermission,setCameraPermission]=useState(false)
    const [loader,setLoader]=useState({isLoading:false,message:''})
    const [isRecording, setIsRecording] = useState(false);
    const [timer, setTimer] = useState(10);
    const [videoUri, setVideoUri] = useState(null);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setCameraPermission(status==='granted')
        })();
    }, []);

    const handleDetectedFaces = Worklets.createRunOnJS((faces) => {
        setDetectedFaces(faces);
    });

    useEffect(()=>{
        if(isRecording){
            let interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        return 10;
                    }
                    return prev - 1;
                });
            }, 1000)
        }
    },[isRecording])

    const frameProcessor = useFrameProcessor((frame) => {
        'worklet';
        const faces = detectFaces(frame);
        handleDetectedFaces(faces);
    }, [handleDetectedFaces]);
    const startVideoRecording = async () => {
        if (isRecording) return;

        try {
             await cameraRef.current.startRecording({
                fileType: Platform.OS === 'ios' ? 'mov' : 'mp4',
                onRecordingError: (error) => {
                    console.error('Recording failed!', error);
                },
                onRecordingFinished: async (video) => {
                    console.log(`Recording successfully finished! ${video.path}`);
                    setVideoUri(video.path);
                },
            });
            setTimeout(async () => {
                await cameraRef.current.stopRecording();
                setIsRecording(false)
            }, 10000);
        } catch (error) {
            console.error('Error recording video:', error);
            Alert.alert('Error', 'Failed to record video');
        }
    };

    const uploadVideo = async (uri) => {
        try {
            const formData = new FormData();
            formData.append('video', {
                uri:`file://${uri}`,
                type: 'video/mp4',
                name: `video_${Date.now()}.mp4`
            });
            const response = await axios.post('http://YOUR_IP_ADDRESS/uploadVideo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    transformRequest: () => formData,
                }
            });
            setLoader({isLoading: false,message:''})
            console.log('Video uploaded successfully:', response.data);
            Alert.alert('Success', 'Video uploaded successfully');
            setVideoUri(null);
        } catch (error) {
            setLoader({isLoading: false,message:''})
            console.error('Error uploading video:', error);
            Alert.alert('Error', 'Failed to upload video');
        }
    };

    return (
        <View style={styles.container}>
            {cameraPermission  ? (
                <Camera
                    orientation={'portrait'}
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={!videoUri}
                    frameProcessor={frameProcessor}
                    frameProcessorFps={1}
                    faceDetectionOptions={{
                        performanceMode: 'fast',
                        classificationMode: 'all',
                        landmarkMode: 'all'
                    }}
                />
            ) : (
                <Text>No Device</Text>
            )}
            {detectedFaces.map((face, index) => (
                <FaceLandmark key={index} face={face} />
            ))}
            <RecordingControls
                detectedFaces={detectedFaces}
                isRecording={isRecording}
                videoUri={videoUri}
                timer={timer}
                startVideoRecording={startVideoRecording}
                uploadVideo={uploadVideo}
                setIsRecording={setIsRecording}
                setVideoUri={setVideoUri}
                loader={loader}
                styles={styles}
                setLoader={setLoader}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1
    },
    bottomView:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomSubView:{
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%'
    },
    recordingButton:{
        position: 'absolute',
        bottom: 0,
        height: 40,
        width: '100%',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text:{
        color: 'white',
        fontSize: 16
    },
    uploadView:{
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    commonButton:{
        flex: 1,
        height: 40,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    }
})
