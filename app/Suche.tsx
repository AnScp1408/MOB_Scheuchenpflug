import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, FlatList, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import { useState } from 'react';
import CustomButton from '@/components/Buttons';

// Definiert die Hauptfunktionskomponente für den Suchbildschirm
export default function ModalScreen() {
    // Zustand, um die vom Benutzer eingegebene Suchanfrage zu speichern
    const [searchQuery, setSearchQuery] = useState('');

    // Zustand, um die Liste der Bücher zu speichern, die von der API abgeholt wurden
    const [books, setBooks] = useState([]);

    // Asynchrone Funktion, um Bücher mit der Open Library API zu suchen
    const searchBooks = async () => {
        try {
            // Ruft Daten von der Open Library API basierend auf der Suchanfrage ab
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}`);

            // Parsen der JSON-Daten aus der Antwort
            const data = await response.json();

            // Aktualisiert den Zustand der Bücher mit den abgeholten Daten
            setBooks(data.docs);
        } catch (error) {
            // Protokolliert alle Fehler, die während der Abrufoperation auftreten
            console.error(error);
        }
    };

    // Rendert die Benutzeroberfläche
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Suche</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Buchtitel suchen..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <CustomButton title="Suchen" onPress={searchBooks} />

            {/* FlatList zur Anzeige der Bücherliste */}
            <FlatList
                data={books}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    // Link-Komponente zur Navigation zum Buchdetailbildschirm mit den ausgewählten Buchdaten
                    <Link
                        href={{
                            pathname: "/BookDetailScreen",
                            params: { book: JSON.stringify(item) }
                        }}
                        asChild
                    >
                        <TouchableOpacity style={styles.bookItem}>
                            {/* Anzeige des Buchcover-Bildes, falls verfügbar */}
                            {item.cover_i && (
                                <Image
                                    source={{ uri: `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` }}
                                    style={styles.bookCover}
                                />
                            )}
                            <View style={styles.bookInfo}>
                                <Text style={styles.bookTitle}>{item.title}</Text>
                                <Text style={styles.bookAuthor}>Autor: {item.author_name ? item.author_name.join(', ') : 'Unbekannt'}</Text>
                            </View>
                        </TouchableOpacity>
                    </Link>
                )}
            />
        </View>
    );
}

// Definiert die Stile für die Komponenten mit StyleSheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchBar: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingLeft: 8,
        marginBottom: 8,
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 4,
    },
    bookCover: {
        width: 50,
        height: 75,
        marginRight: 8,
    },
    bookInfo: {
        flexDirection: 'column',
    },
    bookTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 14,
        color: 'gray',
    },
});
