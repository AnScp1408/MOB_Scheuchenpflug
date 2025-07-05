// app/(tabs)/_layout.tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// Komponente zur Darstellung eines Icons in der Tab-Leiste
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();

    // Rendert die Tab-Navigation
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,  // Farbe des aktiven Tab-Icons
                headerShown: useClientOnlyValue(false, true), // Zeigt den Header nur auf dem Client
                tabBarStyle: {
                    backgroundColor: '#e2d9b9', // Hintergrundfarbe der Tab-Leiste
                },
                headerStyle: {
                    backgroundColor: '#e2d9b9', // Hintergrundfarbe des Headers
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Aktuell',
                    tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
                    headerRight: () => (
                        <Link href="/Suche" asChild>
                            <Pressable>
                                {({ pressed }) => (
                                    <FontAwesome
                                        name="search"
                                        size={25}
                                        color={Colors[colorScheme ?? 'light'].text}
                                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                                    />
                                )}
                            </Pressable>
                        </Link>
                    ),
                }}
            />
            <Tabs.Screen
                name="two"
                options={{
                    title: 'Recap',
                    tabBarIcon: ({ color }) => <TabBarIcon name="history" color={color} />
                }}
            />
        </Tabs>
    );
}
