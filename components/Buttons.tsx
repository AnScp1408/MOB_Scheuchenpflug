import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Definiert die erwarteten Props für die CustomButton-Komponente
interface CustomButtonProps {
    title: string;
    onPress: () => void;
}

// CustomButton-Komponente, die einen wiederverwendbaren Button rendert
const CustomButton: React.FC<CustomButtonProps> = ({ title, onPress }) => {
    // Rendert einen TouchableOpacity-Button mit dem übergebenen Titel und onPress-Handler
    return (
        <TouchableOpacity
            style={styles.button} // Stile für den Button
            onPress={onPress} // Funktion, die beim Drücken ausgeführt wird
            activeOpacity={0.8}
        >
            <Text style={styles.buttonText}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

// Stile für die CustomButton-Komponente
const styles = StyleSheet.create({
    button: {
        backgroundColor: '#54363b',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

// Exportiert die CustomButton-Komponente für die Verwendung in anderen Dateien
export default CustomButton;
