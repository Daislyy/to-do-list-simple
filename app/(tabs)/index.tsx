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

// Tambahkan type untuk props navigation
type TodoListAppProps = {
  navigation: any; // atau gunakan type yang lebih spesifik dari @react-navigation/native
};

export default function TodoListApp({ navigation }: TodoListAppProps) {
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
        backgroundColor: "#F5F5F5",
        padding: 16,
        marginVertical: 4,
        borderRadius: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => toggleTodo(item.id)}
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
      >
        {item.completed && (
          <Text style={{ marginRight: 8, color: "#4CAF50" }}>✓</Text>
        )}
        <Text
          style={{
            textDecorationLine: item.completed ? "line-through" : "none",
            color: item.completed ? "#999" : "#000",
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
        <Text style={{ color: "#F44336" }}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
          Todo List appp tesftiy
        </Text>
        <Text style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
          {todos.filter((t) => !t.completed).length} tugas belum selesai
        </Text>

        {/* Button untuk pindah ke book.tsx */}
        <TouchableOpacity
          onPress={() => navigation.navigate("books")}
          style={{
            backgroundColor: "#2196F3",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
            Ke Halaman Book
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", marginBottom: 20, gap: 10 }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#DDD",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Tambahkan tugas baru..."
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity
            onPress={addTodo}
            style={{
              backgroundColor: "#4CAF50",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={{ fontSize: 16, color: "#999", textAlign: "center" }}>
              Belum ada tugas.{"\n"}tambahkan sesuatu
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
