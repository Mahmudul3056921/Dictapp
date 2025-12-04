import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const SpeakingRoomFab = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  // Only show for logged-in users
  if (!user) return null;

  return (
    <FAB
      icon="microphone"
      label="Speaking Room"
      style={styles.fab}
      onPress={() =>
        navigation.navigate('Learn', {
          screen: 'SpeakingLounge',
        })
      }
    />
  );
};

export default SpeakingRoomFab;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
