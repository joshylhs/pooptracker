import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import ScreenContainer from '../../components/shared/ScreenContainer';
import AppText from '../../components/shared/Text';
import Button from '../../components/shared/Button';

export default function ProfileScreen() {
  const user = useAuthStore(s => s.user);
  const logOut = useAuthStore(s => s.logOut);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogOut = async () => {
    setIsSigningOut(true);
    try {
      await logOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScreenContainer>
      <AppText variant="screenTitle" style={styles.heading}>
        Profile
      </AppText>

      {user && (
        <View style={styles.userBlock}>
          <AppText variant="body" colour="textSecondary">
            Display name: {user.displayName ?? '—'}
          </AppText>
          <AppText variant="body" colour="textSecondary">
            Email: {user.email ?? '—'}
          </AppText>
          <AppText variant="caption" colour="textPlaceholder">
            UID: {user.uid}
          </AppText>
        </View>
      )}

      <AppText variant="body" colour="textSecondary" style={styles.note}>
        Stats, settings, edit profile, notifications go here later.
      </AppText>

      <Button
        title="Sign out"
        variant="destructive"
        onPress={handleLogOut}
        loading={isSigningOut}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: 16 },
  userBlock: { marginBottom: 16, gap: 4 },
  note: { marginBottom: 24 },
});
