 
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { usePathname, router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function FooterNav() {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: 'Home',
      route: '/(dashboard)/home',
      icon: 'home',
      label: 'Home',
      activeIcon: 'home-filled'
    },
    {
      name: 'Timer',
      route: '/(dashboard)/timer',
      icon: 'timer',
      label: 'Timer',
      activeIcon: 'timer'
    },
    {
      name: 'History',
      route: '/(dashboard)/history',
      icon: 'history',
      label: 'History',
      activeIcon: 'history'
    },
    {
      name: 'Profile',
      route: '/(dashboard)/profile',
      icon: 'person',
      label: 'Profile',
      activeIcon: 'person'
    }
  ];

  const isActive = (route: string) => {
    // Handle both /(dashboard) and /(dashboard)/home routes for home
    if (route === '/(dashboard)/home') {
      return pathname === '/(dashboard)' || pathname === '/(dashboard)/home';
    }
    return pathname === route;
  };

  const handleNavigation = (route: string) => {
    // Special handling for home route
    if (route === '/(dashboard)/home') {
      router.replace('/(dashboard)');
    } else {
      router.push(route as any);
    }
  };

  const getIconName = (item: typeof navigationItems[0]) => {
    return isActive(item.route) ? item.activeIcon : item.icon;
  };

  return (
    <View style={styles.container}>
      {navigationItems.map((item) => {
        const active = isActive(item.route);
        
        return (
          <TouchableOpacity
            key={item.name}
            style={[styles.navItem, active && styles.activeNavItem]}
            onPress={() => handleNavigation(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon 
                name={getIconName(item)} 
                size={24} 
                color={active ? '#4A6572' : '#666'} 
              />
              {active && <View style={styles.activeDot} />}
            </View>
            <Text style={[
              styles.navText,
              active && styles.activeNavText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeNavItem: {
    backgroundColor: '#f8fafc',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4A6572',
  },
  navText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#4A6572',
    fontWeight: '600',
  },
});