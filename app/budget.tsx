import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  List,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
} from "react-native-paper";
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";

export default function Budget() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [formType, setFormType] = useState("out");
  const [formAmount, setFormAmount] = useState("0");
  const [formDescription, setFormDescription] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);

  async function fetchTransactions() {
    const { data, error } = await supabase
      .from("transaction")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Gagal mengambil transaksi", error.message);
    } else {
      setTransactions(data);
    }
  }

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function handleAdd() {
    if (!formAmount || formAmount <= "0") {
      return Alert.alert("Jumlah harus lebih besar dari 0");
    }

    if (!formDescription) {
      return Alert.alert("Deskripsi Tidak boleh kosong");
    }

    const { error } = await supabase.from("transaction").insert({
      type: formType,
      amount: parseInt(formAmount),
      description: formDescription,
    });

    if (error) {
      Alert.alert("Gagal menambahkan transaksi", error.message);
    }

    setFormAmount("0");
    setFormDescription("");
    setFormType("out");
    setDialogVisible(false);
  }

  return (
    <View>
      <Appbar.Header>
        <Appbar.Content title="Budget" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            setDialogVisible(true);
          }}
        />
      </Appbar.Header>

      <Card style={{ margin: 16 }}>
        <Card.Content>
          <Card.Content>
            <Text variant="labelSmall">Sisa Saldo</Text>
            <Text variant="displaySmall" style={{ color: "green" }}>
              Rp 1.000.000
            </Text>
            <Divider style={{ marginVertical: 12 }} />
            <View
              style={{ flexDirection: "row", justifyContent: "space-around" }}
            >
              <Text variant="labelSmall">Pemasukan</Text>
              <Text variant="titleSmall" style={{ color: "green" }}>
                + Rp 2.000.000
              </Text>
            </View>
            <View>
              <Text variant="labelSmall">Pengeluaran</Text>
              <Text variant="titleSmall" style={{ color: "red" }}>
                - Rp 2.000.000
              </Text>
            </View>
          </Card.Content>
        </Card.Content>
      </Card>

      <View style={{ marginHorizontal: 16 }}>
        <FlatList
          data={transactions}
          keyExtractor={(Item) => Item.id.toString()}
          renderItem={({ item }) => (
            <List.Item
              title="makan"
                  left={() => <List.Icon icon={item.type === "in" ? "arrow-up-circle" : "arrow-down-circle"
                  
              } color={item.type === "in" ? "green" : "red"} />}
              right={() => (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text variant="labelLarge" style={{ color: "red" }}>
                    - Rp 1.000.000
                  </Text>
                  <IconButton
                    icon="delete-outline"
                    size={18}
                    onPress={() => {}}
                  />
                </View>
              )}
            />
          )}
        />
      </View>
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => {
            setDialogVisible(false);
          }}
        >
          <Dialog.Title>Tambah Transaksi</Dialog.Title>
          <Dialog.Content>
            <SegmentedButtons
              value={formType}
              onValueChange={(v) => {
                setFormType(v);
              }}
              buttons={[
                {
                  value: "in",
                  label: "Pemasukan",
                  icon: "arrow-up-circle",
                },

                {
                  value: "in",
                  label: "Pengeluaran",
                  icon: "arrow-down-circle",
                },
              ]}
              style={{ marginBottom: 16 }}
            />
            <TextInput
              label={"Jumlah (Rp)"}
              keyboardType="numeric"
              value={formAmount}
              onChangeText={(v) => {
                setFormAmount(v);
              }}
              mode="outlined"
              style={{ marginBottom: 12 }}
            />

            <TextInput
              label={"Deskripsi"}
              value={formDescription}
              onChangeText={(v) => {
                setFormDescription(v);
              }}
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setDialogVisible(false);
              }}
            >
              Batal
            </Button>
            <Button
              onPress={() => {
                handleAdd();
              }}
              mode="contained"
            >
              Simpan
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
