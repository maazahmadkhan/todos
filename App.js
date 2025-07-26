import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

const STORAGE_KEY = "@todos";

const App = () => {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState("");

  // Load from AsyncStorage
  useEffect(() => {
    const loadTodos = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTodos(JSON.parse(saved));
      }
    };
    loadTodos();
  }, []);

  // Save to AsyncStorage
  const saveTodos = async (newTodos) => {
    setTodos(newTodos);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos));
  };

  const addTodo = () => {
    if (inputText.trim() === "") return;
    const newTodo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      urgent: false,
      important: false,
    };
    const updated = [...todos, newTodo];
    saveTodos(updated);
    setInputText("");
  };

  const toggleUrgent = (id) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, urgent: !t.urgent } : t
    );
    saveTodos(updated);
  };

  const toggleImportant = (id) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, important: !t.important } : t
    );
    saveTodos(updated);
  };

  const confirmDelete = (todo) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete "${todo.text}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTodo(todo.id),
        },
      ],
      { cancelable: true }
    );
  };

  const deleteTodo = (id) => {
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  const sortedTodos = [...todos].sort((a, b) => {
    const getPriority = (t) => {
      if (t.urgent && t.important) return 3;
      if (t.urgent) return 2;
      if (t.important) return 1;
      return 0;
    };
    return getPriority(b) - getPriority(a);
  });

  const renderItem = ({ item }) => (
    <View style={styles.todoItem}>
      <Text style={styles.todoText}>{item.text}</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => toggleUrgent(item.id)}>
          <Icon
            name="hourglass-half"
            size={20}
            color={item.urgent ? "orange" : "gray"}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleImportant(item.id)}>
          <Icon
            name="star"
            size={20}
            color={item.important ? "gold" : "gray"}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item)}>
          <Icon name="trash" size={20} color="red" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Enter todo"
            onSubmitEditing={addTodo}
            returnKeyType="done"
            blurOnSubmit={true}
            style={styles.input}
          />
          <Button title="Add Todo" onPress={addTodo} />
        </View>
        <FlatList
          data={sortedTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No todos yet</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fefefe",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    height: 40,
  },
  todoItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoText: {
    flex: 1,
    fontSize: 16,
  },
  iconContainer: {
    flexDirection: "row",
    marginLeft: 10,
  },
  icon: {
    marginHorizontal: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    fontSize: 16,
  },
});
