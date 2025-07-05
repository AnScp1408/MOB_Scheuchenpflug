import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, Button, Modal, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../db/firebase';
import { addDoc, collection } from 'firebase/firestore';
import CustomButton from '../components/Buttons';

// Hauptkomponente für die Buchdetailseite
export default function BookDetailScreen() {
    const { book } = useLocalSearchParams();
    const [bookDetails, setBookDetails] = useState(null);
    const [authorNames, setAuthorNames] = useState('Unbekannt');
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [readModalVisible, setReadModalVisible] = useState(false);
    const router = useRouter();

    // Hook, um Buchdetails beim Laden der Komponente abzurufen
    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const bookObject = typeof book === 'string' ? JSON.parse(book) : book;
                const response = await fetch(`https://openlibrary.org${bookObject.key}.json`);
                const data = await response.json();
                setBookDetails(data);
                if (data.authors) {
                    const names = await Promise.all(
                        data.authors.map(async (authorObj) => {
                            if (authorObj.author && authorObj.author.key) {
                                const authorResponse = await fetch(
                                    `https://openlibrary.org${authorObj.author.key}.json`
                                );
                                const authorData = await authorResponse.json();
                                return authorData.name || 'Unbekannt';
                            }
                            return 'Unbekannt';
                        })
                    );
                    setAuthorNames(names.join(', '));
                }
            } catch (error) {
                console.error('Fehler beim Abrufen der Buchdetails:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookDetails();
    }, [book]);

    // Hilfsfunktion für Buchbeschreibung
    const getDescription = (description) => {
        if (!description) return 'Keine Beschreibung verfügbar';
        if (typeof description === 'string') return description;
        if (description.value) return description.value;
        return 'Keine Beschreibung verfügbar';
    };

    // Öffnet das Modal "Lese ich aktuell"
    const handleCurrentlyReading = () => {
        setModalVisible(true);
    };

    // Öffnet das Modal "Bereits gelesen"
    const handleAlreadyRead = () => {
        setReadModalVisible(true);
    };

    // Bestätigt und fügt das Buch als aktuell gelesen zur Datenbank hinzu
    const handleConfirm = async () => {
        try {
            const coverUrl = bookDetails.covers
                ? `https://covers.openlibrary.org/b/id/${bookDetails.covers[0]}-L.jpg`
                : null;
            await addDoc(collection(db, 'buecher'), {
                title: bookDetails.title,
                author: authorNames,
                currentlyReading: true,
                finished: false,
                dateAdded: new Date().toISOString(),
                coverUrl: coverUrl,
                description: getDescription(bookDetails.description),
            });
            setModalVisible(false);
            router.push('/(tabs)/');
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Buches zur Datenbank:', error);
        }
    };

    // Bestätigt und fügt das Buch als bereits gelesen zur Datenbank hinzu
    const handleConfirmRead = async () => {
        try {
            const coverUrl = bookDetails.covers
                ? `https://covers.openlibrary.org/b/id/${bookDetails.covers[0]}-L.jpg`
                : null;
            await addDoc(collection(db, 'buecher'), {
                title: bookDetails.title,
                author: authorNames,
                currentlyReading: false,
                finished: true,
                dateAdded: new Date().toISOString(),
                coverUrl: coverUrl,
                description: getDescription(bookDetails.description),
            });
            setReadModalVisible(false);
            router.push('/(tabs)/two');
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Buches zur Datenbank:', error);
        }
    };

    // Schließt das Modal "Lese ich aktuell"
    const handleCancel = () => {
        setModalVisible(false);
    };

    // Schließt das Modal "Bereits gelesen"
    const closeReadModal = () => {
        setReadModalVisible(false);
    };

    // Zeigt Ladeindikator während des Ladens
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Zeigt Nachricht, wenn keine Details verfügbar sind
    if (!bookDetails) {
        return (
            <View style={styles.container}>
                <Text>Keine Details verfügbar</Text>
            </View>
        );
    }

    // Rendert die Buchdetails und Modals
    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>{bookDetails.title || 'Unbekannter Titel'}</Text>
            <Text style={styles.author}>Autor: {authorNames}</Text>
            <Text style={styles.description}>{getDescription(bookDetails.description)}</Text>
            <View style={styles.buttonContainer}>
                <View style={styles.button}>
                    <CustomButton title="Lese ich aktuell" onPress={handleCurrentlyReading} />
                </View>
                <View style={styles.button}>
                    <CustomButton title="Bereits gelesen" onPress={handleAlreadyRead} />
                </View>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCancel}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Liest du dieses Buch aktuell?</Text>
                        {bookDetails.covers && (
                            <Image
                                source={{ uri: `https://covers.openlibrary.org/b/id/${bookDetails.covers[0]}-L.jpg` }}
                                style={styles.modalBookCover}
                            />
                        )}
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Ja" onPress={handleConfirm} />
                            <CustomButton title="Nein" onPress={handleCancel} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={readModalVisible}
                onRequestClose={closeReadModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Hast du dieses Buch bereits gelesen?</Text>
                        {bookDetails.covers && (
                            <Image
                                source={{ uri: `https://covers.openlibrary.org/b/id/${bookDetails.covers[0]}-L.jpg` }}
                                style={styles.modalBookCover}
                            />
                        )}
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Ja" onPress={handleConfirmRead} />
                            <CustomButton title="Nein" onPress={closeReadModal} />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

// Stile für die Komponenten
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    author: {
        fontSize: 16,
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 20,
    },
    buttonContainer: {
        marginTop: 20,
        flexDirection: 'column',
    },
    button: {
        marginVertical: 8,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalBookCover: {
        width: 200,
        height: 300,
        resizeMode: 'contain',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: 300,
    },
});
