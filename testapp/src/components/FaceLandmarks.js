import React from 'react';
import { View } from 'react-native';

const FaceLandmark = ({ face }) => {
    return (
        <View
            style={{
                position: 'absolute',
                left: face.bounds.x - 30,
                top: face.bounds.y + 25,
                width: face.bounds.width,
                height: face.bounds.height + face.bounds.height * 0.3,
                borderWidth: 2,
            }}
        />
    );
};

export default FaceLandmark;
