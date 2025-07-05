import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, Button, TextInput, Switch } from 'react-native';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../db/firebase';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '@/components/Buttons';

// Interface für die Struktur eines Buches
interface Book {
    id: string;
    title: string;
    author: string;
    currentlyReading: boolean;
    finished: boolean;
    dateAdded: string;
    coverUrl: string | null;
    note?: string;
    description?: string;
}

// Hauptkomponente für die Anzeige aktuell gelesener Bücher
export default function TabOneScreen() {
    // Zustände für Bücher, Ansichten und Modals
    const [books, setBooks] = useState<Book[]>([]);
    const [isCardView, setIsCardView] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [finishedModalVisible, setFinishedModalVisible] = useState(false);
    const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    // Hook, um aktuell gelesene Bücher aus Firestore abzurufen
    useEffect(() => {
        const q = query(collection(db, 'buecher'), where('currentlyReading', '==', true));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const booksData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Book));
            setBooks(booksData);
        });
        return () => unsubscribe();
    }, []);

    // Wechselt zwischen Karten- und Listenansicht
    const toggleView = () => {
        setIsCardView(!isCardView);
    };

    // Öffnet das Modal zum Löschen eines Buches
    const openDeleteModal = (bookId: string) => {
        setBookToDelete(bookId);
        setModalVisible(true);
    };

    // Schließt das Modal zum Löschen eines Buches
    const closeDeleteModal = () => {
        setModalVisible(false);
        setBookToDelete(null);
    };

    // Löscht ein Buch aus der Datenbank
    const handleDeleteBook = async () => {
        if (bookToDelete) {
            try {
                await deleteDoc(doc(db, 'buecher', bookToDelete));
                closeDeleteModal();
            } catch (error) {
                console.error('Fehler beim Löschen des Buches:', error);
            }
        }
    };

    // Öffnet das Modal zur Bearbeitung von Notizen
    const openNoteModal = (book: Book) => {
        setCurrentBook(book);
        setNoteText(book.note || '');
        setNoteModalVisible(true);
    };

    // Schließt das Modal zur Bearbeitung von Notizen
    const closeNoteModal = () => {
        setNoteModalVisible(false);
        setCurrentBook(null);
        setNoteText('');
    };

    // Speichert eine Notiz zu einem Buch in der Datenbank
    const saveNote = async () => {
        if (currentBook) {
            try {
                await updateDoc(doc(db, 'buecher', currentBook.id), {
                    note: noteText,
                });
                closeNoteModal();
            } catch (error) {
                console.error('Fehler beim Speichern der Notiz:', error);
            }
        }
    };

    // Öffnet das Modal zum Markieren eines Buches als gelesen
    const openFinishedModal = (bookId: string) => {
        setBookToDelete(bookId);
        setFinishedModalVisible(true);
    };

    // Schließt das Modal zum Markieren eines Buches als gelesen
    const closeFinishedModal = () => {
        setFinishedModalVisible(false);
        setBookToDelete(null);
    };

    // Markiert ein Buch als gelesen in der Datenbank
    const handleMarkAsFinished = async () => {
        if (bookToDelete) {
            try {
                await updateDoc(doc(db, 'buecher', bookToDelete), {
                    finished: true,
                    currentlyReading: false,
                });
                closeFinishedModal();
            } catch (error) {
                console.error('Fehler beim Aktualisieren des Buchstatus:', error);
            }
        }
    };

    // Öffnet das Modal zur Anzeige der Beschreibung eines Buches
    const openDescriptionModal = (book: Book) => {
        setCurrentBook(book);
        setDescriptionModalVisible(true);
    };

    // Schließt das Modal zur Anzeige der Beschreibung eines Buches
    const closeDescriptionModal = () => {
        setDescriptionModalVisible(false);
        setCurrentBook(null);
    };

    // Gibt die Beschreibung eines Buches zurück
    const getDescription = (description?: string) => {
        if (!description) return 'Keine Beschreibung verfügbar';
        if (typeof description === 'string') return description;
        if (description.value) return description.value;
        return 'Keine Beschreibung verfügbar';
    };

    // Rendert Kartenansicht
    const renderCardView = ({ item }: { item: Book }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => openDescriptionModal(item)}>
                {item.coverUrl && <Image source={{ uri: item.coverUrl }} style={styles.cardCover} />}
            </TouchableOpacity>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardAuthor}>Autor: {item.author}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => openNoteModal(item)}>
                    <Ionicons name="document-text-outline" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openFinishedModal(item.id)}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="green" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openDeleteModal(item.id)}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
            </View>
        </View>
    );

    // Rendert Listenansicht
    const renderListView = ({ item }: { item: Book }) => (
        <View style={styles.listItem}>
            <TouchableOpacity onPress={() => openDescriptionModal(item)}>
                {item.coverUrl && <Image source={{ uri: item.coverUrl }} style={styles.listCover} />}
            </TouchableOpacity>
            <View style={styles.listInfo}>
                <Text style={styles.listTitle}>{item.title}</Text>
                <Text style={styles.listAuthor}>Autor: {item.author}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={() => openNoteModal(item)}>
                        <Ionicons name="document-text-outline" size={24} color="blue" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openFinishedModal(item.id)}>
                        <Ionicons name="checkmark-circle-outline" size={24} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openDeleteModal(item.id)}>
                        <Ionicons name="trash-outline" size={24} color="red" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Rendert die Benutzeroberfläche
    return (
        <View style={styles.container}>
            <View style={styles.toggleContainer}>
                <Text>Listenansicht</Text>
                <Switch value={isCardView} onValueChange={toggleView} />
                <Text>Kartenansicht</Text>
            </View>
            {isCardView ? (
                <FlatList
                    data={books}
                    renderItem={renderCardView}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.flatListContentContainer}
                />
            ) : (
                <FlatList
                    data={books}
                    renderItem={renderListView}
                    keyExtractor={item => item.id}
                />
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeDeleteModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Buch wirklich löschen?</Text>
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Ja" onPress={handleDeleteBook} />
                            <CustomButton title="Nein" onPress={closeDeleteModal} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={noteModalVisible}
                onRequestClose={closeNoteModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Notiz hinzufügen/bearbeiten</Text>
                        <TextInput
                            style={styles.noteInput}
                            multiline
                            numberOfLines={10}
                            onChangeText={setNoteText}
                            value={noteText}
                            placeholder="Schreibe hier deine Notiz..."
                            textAlignVertical="top"
                        />
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Speichern" onPress={saveNote} />
                            <CustomButton title="Abbrechen" onPress={closeNoteModal} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={finishedModalVisible}
                onRequestClose={closeFinishedModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Hast du das Buch fertig gelesen?</Text>
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Ja" onPress={handleMarkAsFinished} />
                            <CustomButton title="Nein" onPress={closeFinishedModal} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={descriptionModalVisible}
                onRequestClose={closeDescriptionModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{currentBook?.title}</Text>
                        <Text style={styles.modalDescription}>{getDescription(currentBook?.description)}</Text>
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Schließen" onPress={closeDescriptionModal} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// Stile für die Komponenten
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#faf0e6'
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    flatListContentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: 320,
        marginRight: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.10,
        shadowRadius: 3.5,
        elevation: 5,
        marginBottom: 5,
    },
    cardCover: {
        width: '100%',
        height: 500,
        resizeMode: 'cover',
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
    },
    cardAuthor: {
        fontSize: 14,
        color: 'gray',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginRight: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.10,
        shadowRadius: 3.5,
        elevation: 5,
        marginBottom: 5,
    },
    listCover: {
        width: 80,
        height: 130,
        resizeMode: 'cover',
        marginRight: 16,
    },
    listInfo: {
        flex: 1,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    listAuthor: {
        fontSize: 14,
        color: 'gray',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: 120,
        marginTop: 10,
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
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    modalDescription: {
        marginBottom: 15,
        textAlign: 'left',
        fontSize: 16,
    },
    noteInput: {
        width: 300,
        minHeight: 200,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        textAlignVertical: 'top',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: 300,
    },
});
