import React from 'react';
import {View, TouchableOpacity, Text, ActivityIndicator, StyleSheet} from 'react-native';

const RecordingControls = ({
                               detectedFaces,
                               isRecording,
                               videoUri,
                               timer,
                               startVideoRecording,
                               uploadVideo,
                               setIsRecording,
                               setVideoUri,
                               loader,
                               styles,
                               setLoader
                           }) => {
    return (
        <View style={styles.bottomView}>
            {loader.isLoading ? (
                <ActivityIndicator size={'large'} color={'blue'} />
            ) : (
                <View style={styles.bottomSubView}>
                    {!videoUri ? (
                        <TouchableOpacity
                            disabled={detectedFaces?.length === 0}
                            onPress={() => {
                                setIsRecording(true);
                                startVideoRecording();
                            }}
                            style={[styles.recordingButton, { backgroundColor: detectedFaces?.length > 0 || isRecording ? 'blue' : 'grey' }]}
                        >
                            <Text style={styles.text}>
                                {isRecording ? `Recording ${timer}s` : 'Start Recording'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.uploadView}>
                            <TouchableOpacity
                                onPress={() => {
                                    setLoader({ isLoading: true, message: 'Uploading...' });
                                    uploadVideo(videoUri);
                                }}
                                style={[styles.commonButton, { backgroundColor: 'green' }]}
                            >
                                <Text style={styles.text}>Upload</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setVideoUri(null)}
                                style={[styles.commonButton, { backgroundColor: 'red' }]}
                            >
                                <Text style={styles.text}>Reject</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default RecordingControls;
