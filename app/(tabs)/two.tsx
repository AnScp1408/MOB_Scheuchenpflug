import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Modal, Button, TextInput } from 'react-native';
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../db/firebase';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/Buttons';

// Interface für die Struktur eines Buches
interface Book {
    id: string;
    title: string;
    author: string;
    finished: boolean;
    coverUrl: string | null;
    note?: string;
    rating?: number;
    dateAdded: string;
}

// Hauptkomponente für die Anzeige gelesener Bücher
export default function TabTwoScreen() {
    // Zustände für Bücher, Filter und Modals
    const [readBooks, setReadBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
    const [noteModalVisible, setNoteModalVisible] = useState(false);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

    // Hook, um gelesene Bücher aus Firestore abzurufen
    useEffect(() => {
        const q = query(collection(db, 'buecher'), where('finished', '==', true), orderBy('dateAdded', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const booksData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Book));
            setReadBooks(booksData);
            setFilteredBooks(booksData);
        });
        return () => unsubscribe();
    }, []);

    // Hook, um Bücher basierend auf Bewertungsfilter zu filtern
    useEffect(() => {
        if (selectedRatingFilter === null) {
            setFilteredBooks(readBooks);
        } else if (selectedRatingFilter === 0) {
            const filtered = readBooks.filter(book => !book.rating);
            setFilteredBooks(filtered);
        } else {
            const filtered = readBooks.filter(book => book.rating === selectedRatingFilter);
            setFilteredBooks(filtered);
        }
    }, [selectedRatingFilter, readBooks]);

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

    // Öffnet das Modal zur Bewertung eines Buches
    const openRatingModal = (book: Book) => {
        setCurrentBook(book);
        setRating(book.rating);
        setRatingModalVisible(true);
    };

    // Schließt das Modal zur Bewertung eines Buches
    const closeRatingModal = () => {
        setRatingModalVisible(false);
        setCurrentBook(null);
    };

    // Öffnet das Modal zur Filterung von Büchern
    const openFilterModal = () => {
        setFilterModalVisible(true);
    };

    // Schließt das Modal zur Filterung von Büchern
    const closeFilterModal = () => {
        setFilterModalVisible(false);
    };

    // Öffnet das Modal zum Löschen eines Buches
    const openDeleteModal = (bookId: string) => {
        setBookToDelete(bookId);
        setDeleteModalVisible(true);
    };

    // Schließt das Modal zum Löschen eines Buches
    const closeDeleteModal = () => {
        setDeleteModalVisible(false);
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

    // Speichert eine Notiz Buch in der Datenbank
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

    // Speichert eine Bewertung Buch in der Datenbank
    const saveRating = async () => {
        if (currentBook && rating !== undefined) {
            try {
                await updateDoc(doc(db, 'buecher', currentBook.id), {
                    rating: rating,
                });
                closeRatingModal();
            } catch (error) {
                console.error('Fehler beim Speichern der Bewertung:', error);
            }
        }
    };

    // Rendert die Benutzeroberfläche
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Gelesene Bücher</Text>
                <TouchableOpacity onPress={openFilterModal}>
                    <Ionicons name="filter" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredBooks}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.bookItem}>
                        {item.coverUrl && (
                            <Image source={{ uri: item.coverUrl }} style={styles.bookCover} />
                        )}
                        <View style={styles.bookInfo}>
                            <Text style={styles.bookTitle}>{item.title}</Text>
                            <Text style={styles.bookAuthor}>Autor: {item.author}</Text>
                            <Text style={styles.bookRating}>
                                Bewertung: {item.rating ? `${item.rating}/5` : 'Bewertung ausstehend'}
                            </Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity onPress={() => openNoteModal(item)}>
                                    <Ionicons name="document-text-outline" size={24} color="blue" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openRatingModal(item)}>
                                    <Ionicons name="star-outline" size={24} color="gold" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => openDeleteModal(item.id)}>
                                    <Ionicons name="trash-outline" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
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
                visible={ratingModalVisible}
                onRequestClose={closeRatingModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Bewerte dieses Buch</Text>
                        <Picker
                            selectedValue={rating}
                            onValueChange={(itemValue) => setRating(itemValue)}
                            style={styles.picker}>
                            <Picker.Item label="1 Stern" value={1} />
                            <Picker.Item label="2 Sterne" value={2} />
                            <Picker.Item label="3 Sterne" value={3} />
                            <Picker.Item label="4 Sterne" value={4} />
                            <Picker.Item label="5 Sterne" value={5} />
                        </Picker>
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Speichern" onPress={saveRating} />
                            <CustomButton title="Abbrechen" onPress={closeRatingModal} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={closeFilterModal}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Nach Bewertung filtern</Text>
                        <Picker
                            selectedValue={selectedRatingFilter}
                            onValueChange={(itemValue) => {
                                setSelectedRatingFilter(itemValue);
                                closeFilterModal();
                            }}
                            style={styles.picker}>
                            <Picker.Item label="Alle Bücher" value={null} />
                            <Picker.Item label="Bewertung ausstehend" value={0} />
                            <Picker.Item label="1 Stern" value={1} />
                            <Picker.Item label="2 Sterne" value={2} />
                            <Picker.Item label="3 Sterne" value={3} />
                            <Picker.Item label="4 Sterne" value={4} />
                            <Picker.Item label="5 Sterne" value={5} />
                        </Picker>
                        <View style={styles.modalButtonContainer}>
                            <CustomButton title="Schließen" onPress={closeFilterModal} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteModalVisible}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginRight: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 5,
    },
    bookCover: {
        width: 80,
        height: 130,
        resizeMode: 'contain',
        marginRight: 10,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 4,
    },
    bookRating: {
        fontSize: 14,
        color: 'green',
        marginBottom: 4,
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
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: 300,
        alignSelf: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    noteInput: {
        width: '100%',
        minHeight: 200,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        textAlignVertical: 'top',
    },
    picker: {
        height: 50,
        width: 300,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: 300,
    },
});
