import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoListApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");

  const loadTodos = async () => {
    const saved = await AsyncStorage.getItem("todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  };

  const saveTodos = async (todosToSave: Todo[]) => {
    await AsyncStorage.setItem("todos", JSON.stringify(todosToSave));
  };

  const addTodo = () => {
    if (inputText.trim() === "") return;

    const newTodo = {
      id: Date.now().toString(),
      text: inputText,
      completed: false,
    };

    const updated = [...todos, newTodo];
    setTodos(updated);
    saveTodos(updated);
    setInputText("");
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodos(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter((todo) => todo.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const renderTodo = ({ item }: { item: Todo }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <TouchableOpacity
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
        onPress={() => toggleTodo(item.id)}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: item.completed ? "#6C63FF" : "#ccc",
            backgroundColor: item.completed ? "#6C63FF" : "transparent",
            marginRight: 12,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {item.completed && (
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
              ✓
            </Text>
          )}
        </View>
        <Text
          style={{
            fontSize: 16,
            color: item.completed ? "#aaa" : "#333",
            flex: 1,
            textDecorationLine: item.completed ? "line-through" : "none",
          }}
        >
          {item.text}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => deleteTodo(item.id)}
        style={{
          backgroundColor: "#FFE5E5",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#FF4757", fontSize: 13, fontWeight: "600" }}>
          Hapus
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#2C3E50",
              marginBottom: 8,
            }}
          >
            📝 Todo App
          </Text>
          <Text style={{ fontSize: 15, color: "#7F8C8D" }}>
            {todos.filter((t) => !t.completed).length} tugas belum selesai
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 20, gap: 10 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: "#fff",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 15,
              borderWidth: 1,
              borderColor: "#E8E8E8",
            }}
            placeholder="Tambah tugas baru..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#6C63FF",
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 12,
              justifyContent: "center",
            }}
            onPress={addTodo}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
              Tambah
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        ListEmptyComponent={
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
            <Text style={{ fontSize: 16, color: "#999", textAlign: "center" }}>
              Belum ada tugas.{"\n"}tambahkan sesuatu
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
