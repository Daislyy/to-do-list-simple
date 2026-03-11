import { Alert, FlatList, Image, Text, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Dialog,
  Portal,
  TextInput,
  IconButton,
} from "react-native-paper";
import { useEffect, useState } from "react";

import * as ImagePicker from "expo-image-picker";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("products.db", {
  useNewConnection: true,
});

export default function ProductsPage() {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "0",
    image: "",
  });

  const [products, setProducts] = useState<any[]>([]);
  const [editProductId, setEditProductId] = useState(null);

  async function initDatabase() {
    try {
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price TEXT,
        category TEXT,
        description TEXT,
        stock INTEGER DEFAULT 0,
        image TEXT
      );`,
      );
    } catch (e) {
      console.log(e);
    }
  }

  async function loadProducts() {
    try {
      const result = await db.getAllAsync(
        `SELECT * FROM products ORDER BY id DESC`,
      );
      setProducts(result);
    } catch (error) {
      Alert.alert("Error", "Gagal Memuat Produk");
      console.error(error);
    }
  }

  useEffect(() => {
    initDatabase();
    loadProducts();
  }, []);

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (e) {
      console.log(e);
      alert("Failed to pick image.");
    }
  }

  async function addProduct() {
    try {
      await db.runAsync(
        `INSERT INTO products (name, price, category, description, stock, image) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          formData.name,
          formData.price,
          formData.category,
          formData.description,
          parseInt(formData.stock) || 0,
          formData.image,
        ],
      );

      const newProduct = {
        id: Date.now(),
        name: formData.name,
        price: formData.price,
        category: formData.category,
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
        image: formData.image,
      };

      setProducts([newProduct, ...products]);
      setVisible(false);
      resetForm();
    } catch (error) {
      Alert.alert("Error", "Gagal Menambahkan Produk");
      console.error(error);
    }
  }

  async function deleteProduct(id: string) {
    try {
      await db.runAsync(`DELETE FROM products WHERE id = ?`, [id]);
      const updatedProducts = products.filter((product) => product.id !== id);
      setProducts(updatedProducts);
    } catch (error) {
      Alert.alert("Error", "Gagal Menghapus Produk");
      console.error(error);
    }
  }

  async function updateProduct() {
    try {
      await db.runAsync(
        `UPDATE products SET name = ?, price = ?, category = ?, description = ?, stock = ?, image = ? WHERE id = ?`,
        [
          formData.name,
          formData.price,
          formData.category,
          formData.description,
          parseInt(formData.stock) || 0,
          formData.image,
          editProductId,
        ],
      );

      const updatedProducts = products.map((product) => {
        if (product.id === editProductId) {
          return {
            ...product,
            name: formData.name,
            price: formData.price,
            category: formData.category,
            description: formData.description,
            stock: parseInt(formData.stock) || 0,
            image: formData.image,
          };
        }
        return product;
      });
      setProducts(updatedProducts);
      setVisible(false);
      setEditProductId(null);
      resetForm();
    } catch (error) {
      Alert.alert("Error", "Gagal Mengupdate Produk");
      console.error(error);
    }
  }

  async function updateStock(productId: string, newStock: number) {
    try {
      await db.runAsync(`UPDATE products SET stock = ? WHERE id = ?`, [
        newStock,
        productId,
      ]);

      const updatedProducts = products.map((product) => {
        if (product.id === productId) {
          return { ...product, stock: newStock };
        }
        return product;
      });
      setProducts(updatedProducts);
    } catch (error) {
      Alert.alert("Error", "Gagal Mengupdate Stok");
      console.error(error);
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      stock: "0",
      image: "",
    });
  }

  const increaseStock = (product: any) => {
    const newStock = (product.stock || 0) + 1;
    updateStock(product.id, newStock);
  };

  const decreaseStock = (product: any) => {
    if (product.stock > 0) {
      const newStock = product.stock - 1;
      updateStock(product.id, newStock);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Products" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            setEditProductId(null);
            resetForm();
            setVisible(true);
          }}
        />
      </Appbar.Header>

      <View style={{ padding: 8, flex: 1 }}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <Card style={{ width: "48%", marginBottom: 12 }}>
              <Card.Cover
                source={{
                  uri: item.image || "https://via.placeholder.com/150",
                }}
                style={{ height: 150 }}
              />
              <Card.Content style={{ padding: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: "green" }}>
                  Rp {parseInt(item.price).toLocaleString("id-ID")}
                </Text>
                <Text style={{ fontSize: 12, color: "gray" }}>
                  {item.category}
                </Text>
                <Text style={{ fontSize: 12, color: "gray" }} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Quantity Section */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 8,
                    backgroundColor: "#f5f5f5",
                    padding: 4,
                    borderRadius: 4,
                  }}
                >
                  <IconButton
                    icon="minus"
                    size={16}
                    onPress={() => decreaseStock(item)}
                    disabled={item.stock <= 0}
                  />
                  <Text style={{ fontSize: 14, fontWeight: "bold" }}>
                    Stok: {item.stock || 0}
                  </Text>
                  <IconButton
                    icon="plus"
                    size={16}
                    onPress={() => increaseStock(item)}
                  />
                </View>

                {/* Action Buttons */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 8,
                  }}
                >
                  <Button
                    mode="contained"
                    compact
                    onPress={() => {
                      setEditProductId(item.id);
                      setFormData({
                        name: item.name,
                        price: item.price.toString(),
                        category: item.category,
                        description: item.description,
                        stock: item.stock.toString(),
                        image: item.image || "",
                      });
                      setVisible(true);
                    }}
                    style={{ flex: 0.48 }}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="contained"
                    compact
                    buttonColor="red"
                    onPress={() => deleteProduct(item.id)}
                    style={{ flex: 0.48 }}
                  >
                    Hapus
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", padding: 20 }}>
              <Text>Belum ada produk</Text>
            </View>
          }
        />
      </View>

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            setEditProductId(null);
            resetForm();
          }}
        >
          <Dialog.Title>
            {editProductId ? "Edit Produk" : "Tambah Produk"}
          </Dialog.Title>
          <Dialog.Content>
            <View style={{ marginBottom: 16 }}>
              {/* Image Picker */}
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                {formData.image ? (
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                      overflow: "hidden",
                      marginBottom: 8,
                    }}
                  >
                    <Image
                      source={{ uri: formData.image }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      width: 120,
                      height: 120,
                      backgroundColor: "#f0f0f0",
                      borderRadius: 8,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ textAlign: "center" }}>No Image</Text>
                  </View>
                )}
                <Button onPress={pickImage} mode="outlined" compact>
                  Pilih Gambar
                </Button>
              </View>

              {/* Form Inputs */}
              <TextInput
                mode="outlined"
                label="Nama Produk"
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                }}
                style={{ marginBottom: 12 }}
              />

              <TextInput
                mode="outlined"
                label="Harga"
                value={formData.price}
                onChangeText={(text) => {
                  setFormData({ ...formData, price: text });
                }}
                keyboardType="number-pad"
                style={{ marginBottom: 12 }}
              />

              <TextInput
                mode="outlined"
                label="Kategori"
                value={formData.category}
                onChangeText={(text) => {
                  setFormData({ ...formData, category: text });
                }}
                style={{ marginBottom: 12 }}
              />

              <TextInput
                mode="outlined"
                label="Stok Awal"
                value={formData.stock}
                onChangeText={(text) => {
                  setFormData({ ...formData, stock: text });
                }}
                keyboardType="number-pad"
                style={{ marginBottom: 12 }}
              />

              <TextInput
                mode="outlined"
                label="Deskripsi"
                value={formData.description}
                onChangeText={(text) => {
                  setFormData({ ...formData, description: text });
                }}
                multiline
                numberOfLines={3}
                style={{ marginBottom: 12 }}
              />
            </View>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() => {
                setVisible(false);
                setEditProductId(null);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button
              onPress={() => {
                if (editProductId) {
                  updateProduct();
                } else {
                  addProduct();
                }
              }}
            >
              {editProductId ? "Update" : "Tambah"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
