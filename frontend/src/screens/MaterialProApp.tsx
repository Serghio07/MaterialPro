import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactElement, ReactNode, SetStateAction } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Camera,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Filter,
  Fuel,
  Home,
  Menu,
  MoreHorizontal,
  Package,
  LogOut,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Tag,
  Utensils,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest, clearSession, getToken, setSession } from "../services/api";

type ScreenName =
  | "Login"
  | "Register"
  | "VerifyEmail"
  | "Dashboard"
  | "Materiales"
  | "TiposGasto"
  | "Clientes"
  | "Oro"
  | "NuevoOro"
  | "Equipo"
  | "DetalleGrupo"
  | "EditarGrupo"
  | "NuevoIntegrante"
  | "Ventas"
  | "NuevaVenta"
  | "Gastos"
  | "NuevoGasto"
  | "Historial"
  | "ReporteSemanal"
  | "Configuracion"
  | "Mas";

type Option = { label: string; value: string };
type AnyRow = Record<string, any>;

const today = () => new Date().toISOString().slice(0, 10);
const isGmail = (email: string) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

const weekRange = () => {
  const date = new Date();
  const day = date.getDay() || 7;
  const start = new Date(date);
  start.setDate(date.getDate() - day + 1);
  return { desde: start.toISOString().slice(0, 10), hasta: today() };
};

async function pickImageUri(onPicked: (uri: string) => void) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.75,
  });

  if (!result.canceled && result.assets[0]?.uri) {
    onPicked(result.assets[0].uri);
  }
}

export default function MaterialProApp() {
  const [screen, setScreen] = useState<ScreenName>("Login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [checking, setChecking] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    getToken()
      .then(async (token) => {
        if (!token) {
          setScreen("Login");
          return;
        }
        try {
          await apiRequest("/auth/perfil");
          setScreen("Dashboard");
        } catch {
          await clearSession();
          setScreen("Login");
        }
      })
      .finally(() => setChecking(false));
  }, []);

  const go = (next: ScreenName, email?: string) => {
    if (email) setPendingEmail(email);
    setScreen(next);
  };
  const refresh = () => setRefreshKey((key) => key + 1);

  const logout = async () => {
    await clearSession();
    setScreen("Login");
  };

  if (checking) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const props = { go, refreshKey, refresh, logout };
  const content = (
    <>
      {screen === "Dashboard" && <DashboardScreen {...props} />}
      {screen === "Materiales" && <MaterialesScreen {...props} />}
      {screen === "TiposGasto" && <TiposGastoScreen {...props} />}
      {screen === "Clientes" && <ClientesScreen {...props} />}
      {screen === "Oro" && <OroScreen {...props} />}
      {screen === "NuevoOro" && <NuevoOroScreen {...props} />}
      {screen === "Equipo" && <EquipoScreen {...props} />}
      {screen === "DetalleGrupo" && <DetalleGrupoScreen {...props} />}
      {screen === "EditarGrupo" && <EditarGrupoScreen {...props} />}
      {screen === "NuevoIntegrante" && <NuevoIntegranteScreen {...props} />}
      {screen === "Ventas" && <VentasScreen {...props} />}
      {screen === "NuevaVenta" && <NuevaVentaScreen {...props} />}
      {screen === "Gastos" && <GastosScreen {...props} />}
      {screen === "NuevoGasto" && <NuevoGastoScreen {...props} />}
      {screen === "Historial" && <HistorialScreen {...props} />}
      {screen === "ReporteSemanal" && <ReporteSemanalScreen {...props} />}
      {screen === "Configuracion" && <ConfiguracionScreen {...props} />}
      {screen === "Mas" && <MasScreen {...props} />}
    </>
  );

  return (
    <SafeAreaView style={styles.app}>
      {screen === "Login" && <LoginScreen go={go} />}
      {screen === "Register" && <RegisterScreen go={go} />}
      {screen === "VerifyEmail" && <VerifyEmailScreen go={go} email={pendingEmail} />}
      {screen !== "Login" && screen !== "Register" && screen !== "VerifyEmail" && (
        <AppShell
          active={screen}
          compact={width < 900}
          go={go}
          logout={logout}
        >
          {content}
        </AppShell>
      )}
    </SafeAreaView>
  );
}

function AppShell({
  active,
  compact,
  go,
  logout,
  children,
}: {
  active: ScreenName;
  compact: boolean;
  go: (screen: ScreenName) => void;
  logout: () => void;
  children: ReactNode;
}) {
  const tabs: { title: string; screen: ScreenName; mark: string }[] = [
    { title: "Inicio", screen: "Dashboard", mark: "home" },
    { title: "Ventas", screen: "Ventas", mark: "cart" },
    { title: "Gastos", screen: "Gastos", mark: "briefcase" },
    { title: "Oro", screen: "Oro", mark: "gold" },
    { title: "Mas", screen: "Mas", mark: "more" },
  ];

  return (
    <View style={styles.shell}>
      <View style={styles.mainPanel}>
        {children}
      </View>
      <View style={styles.bottomNav}>
        {tabs.map((item) => {
          const selected =
            active === item.screen ||
            (item.screen === "Ventas" && active === "NuevaVenta") ||
            (item.screen === "Gastos" && active === "NuevoGasto");
          return (
            <Pressable
              key={item.screen}
              onPress={() => go(item.screen)}
              style={styles.tabItem}
            >
              <AppIcon name={item.mark} color={selected ? "#fff" : "#8ca6c2"} size={21} />
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>{item.title}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LoginScreen({ go }: { go: (screen: ScreenName, email?: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return Alert.alert("Login", "El Gmail es obligatorio");
    if (!isGmail(cleanEmail)) return Alert.alert("Login", "El Gmail debe terminar en @gmail.com");
    if (!password) return Alert.alert("Login", "La contrasena es obligatoria");

    try {
      setLoading(true);
      const data = await apiRequest<{ token: string; usuario: AnyRow }>("/auth/login", {
        method: "POST",
        body: { email: cleanEmail, password },
      });
      await setSession(data.token, data.usuario);
      go("Dashboard");
    } catch (error: any) {
      if (String(error.message).includes("verificar tu Gmail")) {
        Alert.alert("Verifica tu Gmail", error.message);
        go("VerifyEmail", cleanEmail);
        return;
      }
      Alert.alert("Login", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.auth}>
      <View style={styles.authBackdrop} />
      <View style={styles.loginLogo}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoIconText}>MP</Text>
        </View>
        <Text style={styles.loginBrand}>
          <Text style={styles.brandGold}>Material</Text>Pro
        </Text>
      </View>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>Iniciar Sesion</Text>
        <Text style={styles.authSubtitle}>Bienvenido de nuevo</Text>
        <AuthInput icon="@" placeholder="Gmail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <AuthInput
          icon="L"
          placeholder="Contrasena"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          right={
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#64748b"
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        <Button title={loading ? "Ingresando..." : "Iniciar sesion"} onPress={submit} tone="blue" />
        <Pressable onPress={() => go("Register")} style={styles.authSwitch}>
          <Text style={styles.authSwitchText}>No tienes cuenta? <Text style={styles.authSwitchLink}>Crear cuenta</Text></Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function RegisterScreen({ go }: { go: (screen: ScreenName, email?: string) => void }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmarPassword: "",
    imagen_url: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const cleanEmail = form.email.trim().toLowerCase();
    if (!form.nombre.trim()) return Alert.alert("Registro", "El nombre es obligatorio");
    if (!cleanEmail) return Alert.alert("Registro", "El Gmail es obligatorio");
    if (!isGmail(cleanEmail)) return Alert.alert("Registro", "El Gmail debe terminar en @gmail.com");
    if (form.password.length < 6) return Alert.alert("Registro", "La contrasena debe tener minimo 6 caracteres");
    if (form.password !== form.confirmarPassword) return Alert.alert("Registro", "Las contrasenas no coinciden");

    try {
      setLoading(true);
      const data = await apiRequest<{ message: string; email: string }>("/auth/register", {
        method: "POST",
        body: { ...form, email: cleanEmail },
      });
      Alert.alert("Registro", data.message);
      go("VerifyEmail", data.email);
    } catch (error: any) {
      Alert.alert("Registro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.registerAuth}>
      <View style={styles.registerHeader}>
        <Pressable onPress={() => go("Login")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.registerTitle}>Crear Cuenta</Text>
        <View style={styles.backButton} />
      </View>
      <View style={styles.registerBody}>
        <Pressable style={styles.avatarPicker} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
          {form.imagen_url ? (
            <Image source={{ uri: form.imagen_url }} style={styles.avatarPreview} />
          ) : (
            <Ionicons name="camera" size={30} color="#1f2937" />
          )}
        </Pressable>
        <AuthInput icon="N" placeholder="Nombre completo" value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
        <AuthInput icon="@" placeholder="Gmail" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} autoCapitalize="none" keyboardType="email-address" />
        <AuthInput
          icon="L"
          placeholder="Contrasena"
          value={form.password}
          onChangeText={(v) => setForm({ ...form, password: v })}
          secureTextEntry={!showPassword}
          right={<Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#64748b" onPress={() => setShowPassword(!showPassword)} />}
        />
        <AuthInput
          icon="L"
          placeholder="Confirmar contrasena"
          value={form.confirmarPassword}
          onChangeText={(v) => setForm({ ...form, confirmarPassword: v })}
          secureTextEntry={!showConfirmPassword}
          right={<Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#64748b" onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
        />
        <Button title={loading ? "Creando..." : "Crear cuenta"} onPress={submit} tone="blue" />
        <Pressable onPress={() => go("Login")} style={styles.authSwitch}>
          <Text style={styles.authSwitchText}>Ya tienes cuenta? <Text style={styles.authSwitchLink}>Inicia sesion</Text></Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function VerifyEmailScreen({ go, email }: { go: (screen: ScreenName, email?: string) => void; email: string }) {
  const [gmail, setGmail] = useState(email || "");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const verificar = async () => {
    const cleanEmail = gmail.trim().toLowerCase();
    if (!cleanEmail) return Alert.alert("Verificacion", "El Gmail es obligatorio");
    if (!isGmail(cleanEmail)) return Alert.alert("Verificacion", "El Gmail debe terminar en @gmail.com");
    if (!/^\d{6}$/.test(codigo)) return Alert.alert("Verificacion", "El codigo debe tener 6 digitos");

    try {
      setLoading(true);
      const data = await apiRequest<{ message: string }>("/auth/verificar-email", {
        method: "POST",
        body: { email: cleanEmail, codigo },
      });
      Alert.alert("Verificacion", data.message);
      go("Login");
    } catch (error: any) {
      Alert.alert("Verificacion", error.message);
    } finally {
      setLoading(false);
    }
  };

  const reenviar = async () => {
    const cleanEmail = gmail.trim().toLowerCase();
    if (!cleanEmail) return Alert.alert("Reenviar codigo", "El Gmail es obligatorio");
    if (!isGmail(cleanEmail)) return Alert.alert("Reenviar codigo", "El Gmail debe terminar en @gmail.com");

    try {
      setResending(true);
      const data = await apiRequest<{ message: string }>("/auth/reenviar-codigo", {
        method: "POST",
        body: { email: cleanEmail },
      });
      Alert.alert("Reenviar codigo", data.message);
    } catch (error: any) {
      Alert.alert("Reenviar codigo", error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.verifyAuth}>
      <View style={styles.registerHeader}>
        <Pressable onPress={() => go("Login")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.registerTitle}>Verificar Gmail</Text>
        <View style={styles.backButton} />
      </View>
      <View style={styles.verifyBody}>
        <View style={styles.verifyIcon}>
          <Ionicons name="mail" size={34} color="#ffb000" />
        </View>
        <Text style={styles.verifyTitle}>Codigo de verificacion</Text>
        <Text style={styles.verifyText}>Te enviamos un codigo de 6 digitos a:</Text>
        <Text style={styles.verifyEmail}>{gmail || "usuario@gmail.com"}</Text>
        <AuthInput icon="@" placeholder="Gmail" value={gmail} onChangeText={setGmail} autoCapitalize="none" keyboardType="email-address" />
        <AuthInput
          icon="#"
          placeholder="Codigo de 6 digitos"
          value={codigo}
          onChangeText={(v) => setCodigo(v.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          maxLength={6}
        />
        <Button title={loading ? "Verificando..." : "Verificar codigo"} onPress={verificar} tone="blue" />
        <Pressable onPress={reenviar} style={styles.authSwitch}>
          <Text style={styles.authSwitchLink}>{resending ? "Reenviando..." : "Reenviar codigo"}</Text>
        </Pressable>
        <Pressable onPress={() => go("Register")} style={styles.authSwitch}>
          <Text style={styles.authSwitchText}>Cambiar correo</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function DashboardScreen({ go, logout, refreshKey }: AppProps) {
  const [data, setData] = useState({
    ventasDia: 0,
    gastosDia: 0,
    gananciaDia: 0,
    total_ventas: 0,
    total_gastos: 0,
    ganancia_semanal: 0,
    total_gramos: 0,
    total_oro_semanal: 0,
  });
  const [equipo, setEquipo] = useState<AnyRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const range = weekRange();
      const [ventas, gastos, semanal, oro, equipoRows] = await Promise.all([
        apiRequest<AnyRow[]>("/ventas"),
        apiRequest<AnyRow[]>("/gastos"),
        apiRequest<AnyRow>(`/reportes/semanal?desde=${range.desde}&hasta=${range.hasta}`),
        apiRequest<AnyRow>(`/oro/resumen/semanal?desde=${range.desde}&hasta=${range.hasta}`).catch(() => ({ total_oro_semanal: 0 })),
        apiRequest<AnyRow[]>("/equipo").catch(() => []),
      ]);
      const ventasDia = ventas.filter((v) => String(v.fecha).slice(0, 10) === today()).reduce((s, v) => s + Number(v.total_venta), 0);
      const gastosDia = gastos.filter((g) => String(g.fecha).slice(0, 10) === today()).reduce((s, g) => s + Number(g.monto), 0);
      setData({
        ventasDia,
        gastosDia,
        gananciaDia: ventasDia - gastosDia,
        total_ventas: Number(semanal.total_ventas || 0),
        total_gastos: Number(semanal.total_gastos || 0),
        ganancia_semanal: Number(semanal.ganancia_semanal || 0),
        total_gramos: Number(semanal.total_gramos || 0),
        total_oro_semanal: Number(oro.total_oro_semanal || 0),
      });
      setEquipo(equipoRows);
    };
    load().catch((e) => Alert.alert("Dashboard", e.message));
  }, [refreshKey]);

  return (
    <Screen title="Dashboard" white right={<Pressable onPress={logout}><AppIcon name="bell" color="#fff" size={22} /></Pressable>}>
      <View style={styles.whiteSectionHeader}>
        <Text style={styles.whiteSectionTitle}>Resumen del dia</Text>
        <Text style={styles.whiteDate}>19 de Junio, 2026</Text>
      </View>
      <View style={styles.daySummary}>
        <DayCard label="Ventas del dia" value={data.ventasDia} tone="green" />
        <DayCard label="Gastos del dia" value={data.gastosDia} tone="red" />
        <DayCard label="Ganancia del dia" value={data.gananciaDia} tone="amber" />
      </View>
      <View style={styles.whiteSectionHeader}>
        <Text style={styles.whiteSectionTitle}>Resumen semanal</Text>
        <Text style={styles.whiteDate}>12 Jun - 18 Jun</Text>
      </View>
      <View style={styles.weekPanel}>
        <WeekRow icon="cart" label="Ventas semanales" value={`Bs ${data.total_ventas.toFixed(2)}`} tone="green" />
        <WeekRow icon="briefcase" label="Gastos semanales" value={`Bs ${data.total_gastos.toFixed(2)}`} tone="red" />
        <WeekRow icon="chart" label="Ganancia semanal" value={`Bs ${data.ganancia_semanal.toFixed(2)}`} tone="blue" />
        <WeekRow icon="materials" label="Total gramos ganados" value={`${data.total_gramos.toFixed(2)} g`} tone="gray" />
        <WeekRow icon="gold" label="Oro encontrado" value={`${data.total_oro_semanal.toFixed(2)} g`} tone="blue" />
      </View>
      <View style={styles.whiteSectionHeader}>
        <Text style={styles.whiteSectionTitle}>Equipo</Text>
        <Pressable onPress={() => go("Equipo")}>
          <Text style={styles.seeAllText}>Ver todos</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.teamCarousel}>
        {equipo.length === 0 ? (
          <Pressable style={styles.teamCarouselEmpty} onPress={() => go("NuevoIntegrante")}>
            <AppIcon name="users" color="#1468d8" size={28} />
            <Text style={styles.managementTitle}>Agregar integrante</Text>
          </Pressable>
        ) : (
          equipo.map((item) => (
            <Pressable key={item.id_equipo} style={styles.teamCarouselCard} onPress={() => go("Equipo")}>
              <Image source={{ uri: item.imagen_url || avatarImage(item.nombre) }} style={styles.teamCarouselPhoto} />
              <Text style={styles.teamCarouselName}>{item.nombre}</Text>
              <Text style={styles.teamCarouselRole}>{item.cargo || "Sin cargo"}</Text>
              <Text style={[styles.whiteBadge, item.estado === "activo" && styles.activeBadge]}>{item.estado || "activo"}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
      <Text style={styles.whiteSectionTitle}>Atajos</Text>
      <View style={styles.shortcutGrid}>
        <Shortcut title="Materiales" icon="materials" onPress={() => go("Materiales")} tone="blue" />
        <Shortcut title="Ventas" icon="cart" onPress={() => go("Ventas")} tone="blue" />
        <Shortcut title="Gastos" icon="briefcase" onPress={() => go("Gastos")} tone="red" />
        <Shortcut title="Oro" icon="gold" onPress={() => go("Oro")} tone="blue" />
        <Shortcut title="Historial" icon="history" onPress={() => go("Historial")} tone="blue" />
        <Shortcut title="Reporte" icon="chart" onPress={() => go("ReporteSemanal")} tone="blue" />
      </View>
      <Text style={styles.whiteSectionTitle}>Gestion</Text>
      <View style={styles.managementGrid}>
        <ManagementCard
          title="Equipo"
          subtitle="Personas que trabajan contigo"
          icon="users"
          onPress={() => go("Equipo")}
          tone="blue"
        />
        <ManagementCard
          title="Detalle del grupo"
          subtitle="Responsable e informacion general"
          icon="team"
          onPress={() => go("DetalleGrupo")}
          tone="blue"
        />
        <ManagementCard
          title="Tipos gasto"
          subtitle="Categorias de egresos"
          icon="tag"
          onPress={() => go("TiposGasto")}
          tone="red"
        />
        <ManagementCard
          title="Configuracion"
          subtitle="Negocio, moneda y gramo"
          icon="settings"
          onPress={() => go("Configuracion")}
          tone="blue"
        />
      </View>
    </Screen>
  );
}

function MaterialesScreen(props: AppProps) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [form, setForm] = useState<AnyRow>({
    nombre: "",
    descripcion: "",
    unidad_medida: "cubo",
    precio_referencia: "",
    imagen_url: "",
    estado: "activo",
  });

  const load = () => {
    apiRequest<AnyRow[]>("/materiales")
      .then(setRows)
      .catch((e) => Alert.alert("Materiales", e.message));
  };

  useEffect(load, [props.refreshKey]);

  const filtered = rows.filter((item) =>
    String(item.nombre || "").toLowerCase().includes(query.toLowerCase())
  );

  const openDetail = (item?: AnyRow) => {
    const selected = item || {
      nombre: "",
      descripcion: "",
      unidad_medida: "cubo",
      precio_referencia: "",
      imagen_url: "",
      estado: "activo",
    };
    setEditing(item || {});
    setForm({
      nombre: selected.nombre || "",
      descripcion: selected.descripcion || "",
      unidad_medida: selected.unidad_medida || "cubo",
      precio_referencia: String(selected.precio_referencia || ""),
      imagen_url: selected.imagen_url || "",
      estado: selected.estado || "activo",
    });
  };

  const save = async () => {
    try {
      const isNew = !editing?.id_material;
      await apiRequest(isNew ? "/materiales" : `/materiales/${editing.id_material}`, {
        method: isNew ? "POST" : "PUT",
        body: form,
      });
      setEditing(null);
      load();
    } catch (e: any) {
      Alert.alert("Material", e.message);
    }
  };

  const remove = async () => {
    if (!editing?.id_material) return;
    try {
      await apiRequest(`/materiales/${editing.id_material}`, { method: "DELETE" });
      setEditing(null);
      load();
    } catch (e: any) {
      Alert.alert("Material", e.message);
    }
  };

  if (editing) {
    return (
      <Screen
        title={editing.id_material ? "Detalle de Material" : "Nuevo Material"}
        white
        backAction={() => setEditing(null)}
      >
        <View style={styles.materialDetail}>
          <Image source={{ uri: form.imagen_url || materialImage(form.nombre) }} style={styles.materialHero} />
          <Pressable style={styles.cameraBadge} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
            <AppIcon name="camera" color="#0b2f57" size={19} />
          </Pressable>
        </View>
        <WhiteLabel text="Imagen" />
        <WhiteInput value={form.imagen_url} onChangeText={(v) => setForm({ ...form, imagen_url: v })} placeholder="URL de imagen" />
        <WhiteLabel text="Nombre" />
        <WhiteInput value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
        <WhiteLabel text="Descripcion" />
        <WhiteInput value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} />
        <WhiteLabel text="Unidad de medida" />
        <WhiteInput value={form.unidad_medida} onChangeText={(v) => setForm({ ...form, unidad_medida: v })} />
        <WhiteLabel text="Precio de referencia (Bs)" />
        <WhiteInput value={form.precio_referencia} onChangeText={(v) => setForm({ ...form, precio_referencia: v })} keyboardType="numeric" />
        <View style={styles.statusRow}>
          <Text style={styles.whiteFieldLabel}>Estado</Text>
          <Text style={styles.statusText}>{form.estado === "activo" ? "Activo" : "Inactivo"}</Text>
          <Pressable
            onPress={() => setForm({ ...form, estado: form.estado === "activo" ? "inactivo" : "activo" })}
            style={[styles.switchTrack, form.estado === "activo" && styles.switchTrackOn]}
          >
            <View style={[styles.switchKnob, form.estado === "activo" && styles.switchKnobOn]} />
          </Pressable>
        </View>
        <Button title="Guardar Cambios" onPress={save} tone="blue" />
        {editing.id_material && <Button title="Eliminar" onPress={remove} tone="red" />}
      </Screen>
    );
  }

  return (
    <Screen title="Materiales" white right={<Pressable onPress={() => openDetail()}><AppIcon name="plus" color="#fff" size={27} /></Pressable>}>
      <View style={styles.searchBox}>
        <AppIcon name="search" color="#7b8794" size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar material..."
          placeholderTextColor="#9aa4b2"
          style={styles.searchInput}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id_material)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => openDetail(item)} style={styles.materialRow}>
            <Image source={{ uri: item.imagen_url || materialImage(item.nombre) }} style={styles.materialThumb} />
            <View style={styles.materialInfo}>
              <Text style={styles.materialName}>{item.nombre}</Text>
              <Text style={styles.materialUnit}>{item.unidad_medida || "cubo"}</Text>
            </View>
            <Text style={styles.materialPrice}>Bs {Number(item.precio_referencia || 0).toFixed(2)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState title="Sin materiales" />}
      />
    </Screen>
  );
}

function TiposGastoScreen(props: AppProps) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", imagen_url: "", estado: "activo" });

  const load = () => {
    apiRequest<AnyRow[]>("/tipos-gasto")
      .then(setRows)
      .catch((e) => Alert.alert("Tipos de gasto", e.message));
  };

  useEffect(load, [props.refreshKey]);

  const openDetail = (item?: AnyRow) => {
    const selected = item || { nombre: "", descripcion: "", imagen_url: "", estado: "activo" };
    setEditing(item || {});
    setForm({
      nombre: selected.nombre || "",
      descripcion: selected.descripcion || "",
      imagen_url: selected.imagen_url || "",
      estado: selected.estado || "activo",
    });
  };

  const save = async () => {
    try {
      const isNew = !editing?.id_tipo_gasto;
      await apiRequest(isNew ? "/tipos-gasto" : `/tipos-gasto/${editing.id_tipo_gasto}`, {
        method: isNew ? "POST" : "PUT",
        body: form,
      });
      setEditing(null);
      load();
    } catch (e: any) {
      Alert.alert("Tipo de gasto", e.message);
    }
  };

  const remove = async () => {
    if (!editing?.id_tipo_gasto) return;
    await apiRequest(`/tipos-gasto/${editing.id_tipo_gasto}`, { method: "DELETE" });
    setEditing(null);
    load();
  };

  const filtered = rows.filter((item) =>
    `${item.nombre || ""} ${item.descripcion || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  if (editing) {
    return (
      <Screen title={editing.id_tipo_gasto ? "Detalle de Gasto" : "Nuevo Tipo"} white backAction={() => setEditing(null)}>
        <View style={styles.detailIconHero}>
          <View style={[styles.detailIconCircle, styles.redShortcut]}>
            <AppIcon name="tag" color="#ef3340" size={34} />
          </View>
        </View>
        <WhiteLabel text="Nombre" />
        <WhiteInput value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
        <WhiteLabel text="Descripcion" />
        <WhiteInput value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} />
        <WhiteLabel text="Imagen" />
        <WhiteInput value={form.imagen_url} onChangeText={(v) => setForm({ ...form, imagen_url: v })} placeholder="URL de imagen" />
        <View style={styles.statusRow}>
          <Text style={styles.whiteFieldLabel}>Estado</Text>
          <Text style={styles.statusText}>{form.estado === "activo" ? "Activo" : "Inactivo"}</Text>
          <Pressable
            onPress={() => setForm({ ...form, estado: form.estado === "activo" ? "inactivo" : "activo" })}
            style={[styles.switchTrack, form.estado === "activo" && styles.switchTrackOn]}
          >
            <View style={[styles.switchKnob, form.estado === "activo" && styles.switchKnobOn]} />
          </Pressable>
        </View>
        <Button title="Guardar Cambios" onPress={save} tone="blue" />
        {editing.id_tipo_gasto && <Button title="Eliminar" onPress={remove} tone="red" />}
      </Screen>
    );
  }

  return (
    <Screen title="Tipos de gasto" white right={<Pressable onPress={() => openDetail()}><AppIcon name="plus" color="#fff" size={27} /></Pressable>}>
      <View style={styles.searchBox}>
        <AppIcon name="search" color="#7b8794" size={18} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Buscar tipo de gasto..." placeholderTextColor="#9aa4b2" style={styles.searchInput} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id_tipo_gasto)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => openDetail(item)} style={styles.managementListRow}>
            <View style={[styles.managementIcon, expenseIconStyle(item.nombre)]}>
              <AppIcon name={expenseIconName(item.nombre)} color="#fff" size={21} />
            </View>
            <View style={styles.managementText}>
              <Text style={styles.managementTitle}>{item.nombre}</Text>
              <Text style={styles.managementSubtitle}>{item.descripcion || "Sin descripcion"}</Text>
            </View>
            <AppIcon name="chevron" color="#94a3b8" size={18} />
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState title="Sin tipos de gasto" />}
      />
    </Screen>
  );
}

function ClientesScreen(props: AppProps) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [form, setForm] = useState({ nombre: "", telefono: "", direccion: "", estado: "activo" });

  const load = () => {
    apiRequest<AnyRow[]>("/clientes")
      .then(setRows)
      .catch((e) => Alert.alert("Clientes", e.message));
  };

  useEffect(load, [props.refreshKey]);

  const openDetail = (item?: AnyRow) => {
    const selected = item || { nombre: "", telefono: "", direccion: "", estado: "activo" };
    setEditing(item || {});
    setForm({
      nombre: selected.nombre || "",
      telefono: selected.telefono || "",
      direccion: selected.direccion || "",
      estado: selected.estado || "activo",
    });
  };

  const save = async () => {
    try {
      const isNew = !editing?.id_cliente;
      await apiRequest(isNew ? "/clientes" : `/clientes/${editing.id_cliente}`, {
        method: isNew ? "POST" : "PUT",
        body: form,
      });
      setEditing(null);
      load();
    } catch (e: any) {
      Alert.alert("Cliente", e.message);
    }
  };

  const remove = async () => {
    if (!editing?.id_cliente) return;
    await apiRequest(`/clientes/${editing.id_cliente}`, { method: "DELETE" });
    setEditing(null);
    load();
  };

  const filtered = rows.filter((item) =>
    `${item.nombre || ""} ${item.telefono || ""} ${item.direccion || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  if (editing) {
    return (
      <Screen title={editing.id_cliente ? "Detalle de Cliente" : "Nuevo Cliente"} white backAction={() => setEditing(null)}>
        <View style={styles.detailIconHero}>
          <View style={[styles.detailIconCircle, styles.blueShortcut]}>
            <AppIcon name="user" color="#1468d8" size={34} />
          </View>
        </View>
        <WhiteLabel text="Nombre" />
        <WhiteInput value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
        <WhiteLabel text="Telefono" />
        <WhiteInput value={form.telefono} onChangeText={(v) => setForm({ ...form, telefono: v })} keyboardType="phone-pad" />
        <WhiteLabel text="Direccion" />
        <WhiteInput value={form.direccion} onChangeText={(v) => setForm({ ...form, direccion: v })} />
        <View style={styles.statusRow}>
          <Text style={styles.whiteFieldLabel}>Estado</Text>
          <Text style={styles.statusText}>{form.estado === "activo" ? "Activo" : "Inactivo"}</Text>
          <Pressable
            onPress={() => setForm({ ...form, estado: form.estado === "activo" ? "inactivo" : "activo" })}
            style={[styles.switchTrack, form.estado === "activo" && styles.switchTrackOn]}
          >
            <View style={[styles.switchKnob, form.estado === "activo" && styles.switchKnobOn]} />
          </Pressable>
        </View>
        <Button title="Guardar Cambios" onPress={save} tone="blue" />
        {editing.id_cliente && <Button title="Eliminar" onPress={remove} tone="red" />}
      </Screen>
    );
  }

  return (
    <Screen title="Clientes" white right={<Pressable onPress={() => openDetail()}><AppIcon name="plus" color="#fff" size={27} /></Pressable>}>
      <View style={styles.searchBox}>
        <AppIcon name="search" color="#7b8794" size={18} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Buscar cliente..." placeholderTextColor="#9aa4b2" style={styles.searchInput} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id_cliente)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => openDetail(item)} style={styles.managementListRow}>
            <View style={[styles.managementIcon, styles.blueShortcut]}>
              <AppIcon name="user" color="#1468d8" size={21} />
            </View>
            <View style={styles.managementText}>
              <Text style={styles.managementTitle}>{item.nombre}</Text>
              <Text style={styles.managementSubtitle}>{item.telefono || "Sin telefono"} · {item.direccion || "Sin direccion"}</Text>
            </View>
            <AppIcon name="chevron" color="#94a3b8" size={18} />
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState title="Sin clientes" />}
      />
    </Screen>
  );
}

function OroScreen({ go, refreshKey }: AppProps) {
  const range = weekRange();
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [filters, setFilters] = useState({ desde: range.desde, hasta: range.hasta });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.desde) params.set("desde", filters.desde);
    if (filters.hasta) params.set("hasta", filters.hasta);
    apiRequest<AnyRow[]>(`/oro?${params.toString()}`)
      .then(setRows)
      .catch((e) => Alert.alert("Oro", e.message));
  }, [refreshKey, filters]);

  const total = rows.reduce((sum, item) => sum + Number(item.gramos || 0), 0);

  return (
    <Screen title="Oro Encontrado" white right={<Pressable onPress={() => go("NuevoOro")}><AppIcon name="plus" color="#fff" size={27} /></Pressable>}>
      <View style={styles.twoCols}>
        <View style={styles.col}>
          <WhiteLabel text="Desde" />
          <WhiteInput value={filters.desde} onChangeText={(v) => setFilters({ ...filters, desde: v })} />
        </View>
        <View style={styles.col}>
          <WhiteLabel text="Hasta" />
          <WhiteInput value={filters.hasta} onChangeText={(v) => setFilters({ ...filters, hasta: v })} />
        </View>
      </View>
      <View style={styles.goldTotalCard}>
        <Text style={styles.reportLabel}>Total encontrado</Text>
        <Text style={styles.goldTotalValue}>{total.toFixed(2)} g</Text>
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id_registro_oro)}
        scrollEnabled={false}
        renderItem={({ item }) => <GoldRow item={item} />}
        ListEmptyComponent={<EmptyState title="Sin registros de oro" action={<Button title="Nuevo registro" onPress={() => go("NuevoOro")} tone="blue" />} />}
      />
    </Screen>
  );
}

function NuevoOroScreen({ go, refresh }: AppProps) {
  const [form, setForm] = useState({ fecha: today(), gramos: "", dia_trabajo: true, imagen_url: "", observacion: "" });

  const save = async () => {
    try {
      await apiRequest("/oro", { method: "POST", body: form });
      refresh();
      go("Oro");
    } catch (e: any) {
      Alert.alert("Oro", e.message);
    }
  };

  return (
    <Screen title="Nuevo Registro de Oro" white backAction={() => go("Oro")}>
      <Pressable style={styles.goldImageBox} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
        <AppIcon name="camera" color="#b78103" size={34} />
        <Text style={styles.goldImageText}>Imagen del oro / lugar</Text>
      </Pressable>
      <WhiteLabel text="Fecha" />
      <WhiteInput value={form.fecha} onChangeText={(v) => setForm({ ...form, fecha: v })} />
      <WhiteLabel text="Gramos encontrados" />
      <WhiteInput value={form.gramos} onChangeText={(v) => setForm({ ...form, gramos: v })} keyboardType="numeric" placeholder="5.75" />
      <ToggleRow label="Dia de trabajo" value={form.dia_trabajo} onChange={(v) => setForm({ ...form, dia_trabajo: v })} />
      <WhiteLabel text="Imagen opcional" />
      <View style={styles.imageInputRow}>
        <WhiteInput value={form.imagen_url} onChangeText={(v) => setForm({ ...form, imagen_url: v })} placeholder="URL de imagen" />
        <Pressable style={styles.squareCamera} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
          <AppIcon name="camera" color="#0b2f57" size={19} />
        </Pressable>
      </View>
      <WhiteLabel text="Observacion" />
      <WhiteInput value={form.observacion} onChangeText={(v) => setForm({ ...form, observacion: v })} />
      <Button title="Guardar Registro" onPress={save} tone="blue" />
    </Screen>
  );
}

function EquipoScreen({ go, refreshKey }: AppProps) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    const qs = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";
    apiRequest<AnyRow[]>(`/equipo${qs}`)
      .then(setRows)
      .catch((e) => Alert.alert("Equipo", e.message));
  }, [buscar, refreshKey]);

  const total = rows.length;
  const activos = rows.filter((item) => item.estado === "activo").length;
  const inactivos = total - activos;

  const deactivate = async (id: number) => {
    await apiRequest(`/equipo/${id}`, { method: "DELETE" });
    const qs = buscar ? `?buscar=${encodeURIComponent(buscar)}` : "";
    setRows(await apiRequest<AnyRow[]>(`/equipo${qs}`));
  };

  return (
    <Screen title="Equipo" white right={<Pressable onPress={() => go("NuevoIntegrante")}><AppIcon name="plus" color="#fff" size={27} /></Pressable>}>
      <View style={styles.searchBox}>
        <AppIcon name="search" color="#7b8794" size={18} />
        <TextInput value={buscar} onChangeText={setBuscar} placeholder="Buscar integrante..." placeholderTextColor="#9aa4b2" style={styles.searchInput} />
      </View>
      <View style={styles.teamSummary}>
        <Text style={styles.configTitle}>Resumen</Text>
        <View style={styles.teamSummaryGrid}>
          <SummaryPill label="Total integrantes" value={total} />
          <SummaryPill label="Activos" value={activos} />
          <SummaryPill label="Inactivos" value={inactivos} />
        </View>
      </View>
      <Text style={styles.whiteSectionTitle}>Integrantes</Text>
      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id_equipo)}
        scrollEnabled={false}
        renderItem={({ item }) => <TeamRow item={item} onDeactivate={() => deactivate(item.id_equipo)} />}
        ListEmptyComponent={<EmptyState title="Sin integrantes" action={<Button title="Nuevo integrante" onPress={() => go("NuevoIntegrante")} tone="blue" />} />}
      />
      <Button title="Agregar integrante" onPress={() => go("NuevoIntegrante")} tone="blue" />
      <Button title="Ver detalle del grupo" onPress={() => go("DetalleGrupo")} variant="ghost" />
    </Screen>
  );
}

function DetalleGrupoScreen({ go }: AppProps) {
  const [grupo, setGrupo] = useState<AnyRow | null>(null);
  const [equipo, setEquipo] = useState<AnyRow[]>([]);

  useEffect(() => {
    Promise.all([apiRequest<AnyRow>("/grupo"), apiRequest<AnyRow[]>("/equipo")])
      .then(([g, e]) => {
        setGrupo(g);
        setEquipo(e);
      })
      .catch((e) => Alert.alert("Grupo", e.message));
  }, []);

  const total = equipo.length;
  const activos = equipo.filter((item) => item.estado === "activo").length;
  const inactivos = total - activos;

  return (
    <Screen title="Detalle del Grupo" white backAction={() => go("Equipo")}>
      <View style={styles.groupHero}>
        <Image source={{ uri: grupo?.imagen_url || avatarImage(grupo?.nombre_grupo || "MaterialPro Team") }} style={styles.groupLogo} />
        <Text style={styles.groupName}>{grupo?.nombre_grupo || "MaterialPro Team"}</Text>
      </View>
      <View style={styles.teamSummary}>
        <View style={styles.teamSummaryGrid}>
          <SummaryPill label="Integrantes" value={total} />
          <SummaryPill label="Activos" value={activos} />
          <SummaryPill label="Inactivos" value={inactivos} />
        </View>
      </View>
      <ConfigSection title="Informacion general">
        <InfoLine label="Responsable" value={grupo?.responsable || "Sergio Ticona"} />
        <InfoLine label="Contacto principal" value={grupo?.telefono_principal || "Sin telefono"} />
        <InfoLine label="Descripcion" value={grupo?.descripcion || "Equipo encargado del registro de ventas, gastos, materiales y control de oro encontrado."} />
      </ConfigSection>
      <Text style={styles.whiteSectionTitle}>Integrantes del equipo</Text>
      <FlatList
        data={equipo}
        keyExtractor={(item) => String(item.id_equipo)}
        scrollEnabled={false}
        renderItem={({ item }) => <TeamMiniRow item={item} />}
      />
      <Button title="Agregar integrante" onPress={() => go("NuevoIntegrante")} tone="blue" />
      <Button title="Editar datos del grupo" onPress={() => go("EditarGrupo")} variant="ghost" />
    </Screen>
  );
}

function EditarGrupoScreen({ go, refresh }: AppProps) {
  const [form, setForm] = useState({
    nombre_grupo: "MaterialPro Team",
    responsable: "Sergio Ticona",
    telefono_principal: "",
    descripcion: "Equipo encargado del registro de ventas, gastos, materiales y control de oro encontrado.",
    imagen_url: "",
  });

  useEffect(() => {
    apiRequest<AnyRow>("/grupo").then((g) =>
      setForm({
        nombre_grupo: g.nombre_grupo || "MaterialPro Team",
        responsable: g.responsable || "",
        telefono_principal: g.telefono_principal || "",
        descripcion: g.descripcion || "",
        imagen_url: g.imagen_url || "",
      })
    );
  }, []);

  const save = async () => {
    await apiRequest("/grupo", { method: "PUT", body: form });
    refresh();
    go("DetalleGrupo");
  };

  return (
    <Screen title="Editar Grupo" white backAction={() => go("DetalleGrupo")}>
      <Pressable style={styles.goldImageBox} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
        <AppIcon name="camera" color="#1468d8" size={34} />
        <Text style={styles.goldImageText}>Logo del grupo</Text>
      </Pressable>
      <WhiteLabel text="Nombre del grupo" />
      <WhiteInput value={form.nombre_grupo} onChangeText={(v) => setForm({ ...form, nombre_grupo: v })} />
      <WhiteLabel text="Responsable" />
      <WhiteInput value={form.responsable} onChangeText={(v) => setForm({ ...form, responsable: v })} />
      <WhiteLabel text="Telefono principal" />
      <WhiteInput value={form.telefono_principal} onChangeText={(v) => setForm({ ...form, telefono_principal: v })} keyboardType="phone-pad" />
      <WhiteLabel text="Descripcion" />
      <WhiteInput value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} />
      <Button title="Guardar cambios" onPress={save} tone="blue" />
    </Screen>
  );
}

function NuevoIntegranteScreen({ go, refresh }: AppProps) {
  const [form, setForm] = useState({ nombre: "", celular: "", cargo: "", imagen_url: "", observacion: "", estado: "activo" });

  const save = async () => {
    try {
      await apiRequest("/equipo", { method: "POST", body: form });
      refresh();
      go("Equipo");
    } catch (e: any) {
      Alert.alert("Equipo", e.message);
    }
  };

  return (
    <Screen title="Nuevo Integrante" white backAction={() => go("Equipo")}>
      <View style={styles.detailIconHero}>
        <View style={[styles.detailIconCircle, styles.blueShortcut]}>
          <AppIcon name="camera" color="#1468d8" size={32} />
        </View>
      </View>
      <WhiteLabel text="Foto del integrante" />
      <View style={styles.imageInputRow}>
        <WhiteInput value={form.imagen_url} onChangeText={(v) => setForm({ ...form, imagen_url: v })} placeholder="URL de imagen" />
        <Pressable style={styles.squareCamera} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
          <AppIcon name="camera" color="#0b2f57" size={19} />
        </Pressable>
      </View>
      <WhiteLabel text="Nombre completo" />
      <WhiteInput value={form.nombre} onChangeText={(v) => setForm({ ...form, nombre: v })} />
      <WhiteLabel text="Numero de celular" />
      <WhiteInput value={form.celular} onChangeText={(v) => setForm({ ...form, celular: v })} keyboardType="phone-pad" />
      <WhiteLabel text="Cargo / funcion" />
      <WhiteSelect
        value={form.cargo}
        options={["Ayudante", "Chofer", "Cargador", "Operador", "Administrador", "Otro"].map((x) => ({ label: x, value: x }))}
        onChange={(v) => setForm({ ...form, cargo: v })}
      />
      <WhiteLabel text="Observacion" />
      <WhiteInput value={form.observacion} onChangeText={(v) => setForm({ ...form, observacion: v })} />
      <View style={styles.statusRow}>
        <Text style={styles.whiteFieldLabel}>Estado</Text>
        <Text style={styles.statusText}>{form.estado === "activo" ? "Activo" : "Inactivo"}</Text>
        <Pressable onPress={() => setForm({ ...form, estado: form.estado === "activo" ? "inactivo" : "activo" })} style={[styles.switchTrack, form.estado === "activo" && styles.switchTrackOn]}>
          <View style={[styles.switchKnob, form.estado === "activo" && styles.switchKnobOn]} />
        </Pressable>
      </View>
      <Button title="Guardar Integrante" onPress={save} tone="blue" />
    </Screen>
  );
}

function VentasScreen({ go, refreshKey }: AppProps) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState("");
  const [ascending, setAscending] = useState(false);

  useEffect(() => {
    apiRequest<AnyRow[]>("/ventas")
      .then(setRows)
      .catch((e) => Alert.alert("Ventas", e.message));
  }, [refreshKey]);

  const filtered = rows
    .filter((item) => {
      const text = `${item.material || ""} ${item.cliente || ""} ${item.observacion || ""}`.toLowerCase();
      return text.includes(query.toLowerCase());
    })
    .sort((a, b) => {
      const left = new Date(a.fecha).getTime();
      const right = new Date(b.fecha).getTime();
      return ascending ? left - right : right - left;
    });

  return (
    <Screen
      title="Ventas"
      white
      right={<Pressable onPress={() => go("NuevaVenta")}><AppIcon name="plus" color="#fff" size={27} /></Pressable>}
    >
      <View style={styles.salesToolbar}>
        <View style={[styles.searchBox, styles.salesSearch]}>
          <AppIcon name="search" color="#7b8794" size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar venta..."
            placeholderTextColor="#9aa4b2"
            style={styles.searchInput}
          />
        </View>
        <Pressable onPress={() => setAscending((value) => !value)} style={styles.filterButton}>
          <AppIcon name={ascending ? "sortUp" : "sortDown"} color="#0b2f57" size={20} />
        </Pressable>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id_venta)}
        scrollEnabled={false}
        renderItem={({ item }) => <WhiteSaleRow item={item} />}
        ListEmptyComponent={<EmptyState title="Sin ventas" action={<Button title="Registrar primera venta" onPress={() => go("NuevaVenta")} tone="blue" />} />}
      />
    </Screen>
  );
}

function NuevaVentaScreen({ go, refresh }: AppProps) {
  const [materiales, setMateriales] = useState<Option[]>([]);
  const [form, setForm] = useState({ fecha: today(), id_material: "", cliente_nombre: "", cantidad: "", unidad_medida: "cubo", precio_unitario: "", metodo_pago: "Efectivo", imagen_url: "", observacion: "" });

  useEffect(() => {
    apiRequest<AnyRow[]>("/materiales").then((m) => {
      setMateriales(m.map((x) => ({ label: x.nombre, value: String(x.id_material) })));
    });
  }, []);

  const submit = async () => {
    try {
      await apiRequest("/ventas", { method: "POST", body: form });
      refresh();
      go("Ventas");
    } catch (e: any) {
      Alert.alert("Venta", e.message);
    }
  };

  const total = Number(form.cantidad || 0) * Number(form.precio_unitario || 0);

  return (
    <Screen title="Nueva Venta" white backAction={() => go("Ventas")}>
      <WhiteLabel text="Fecha" />
      <WhiteInput value={form.fecha} onChangeText={(v) => setForm({ ...form, fecha: v })} />
      <WhiteLabel text="Cliente (opcional)" />
      <WhiteInput value={form.cliente_nombre} onChangeText={(v) => setForm({ ...form, cliente_nombre: v })} placeholder="Nombre del cliente" />
      <WhiteLabel text="Material" />
      <WhiteSelect value={form.id_material} options={materiales} onChange={(v) => setForm({ ...form, id_material: v })} />
      <View style={styles.twoCols}>
        <View style={styles.col}>
          <WhiteLabel text="Cantidad" />
          <WhiteInput value={form.cantidad} onChangeText={(v) => setForm({ ...form, cantidad: v })} keyboardType="numeric" />
        </View>
        <View style={styles.col}>
          <WhiteLabel text="Unidad" />
          <WhiteInput value={form.unidad_medida} onChangeText={(v) => setForm({ ...form, unidad_medida: v })} />
        </View>
      </View>
      <View style={styles.twoCols}>
        <View style={styles.col}>
          <WhiteLabel text="Precio unitario (Bs)" />
          <WhiteInput value={form.precio_unitario} onChangeText={(v) => setForm({ ...form, precio_unitario: v })} keyboardType="numeric" />
        </View>
        <View style={styles.col}>
          <WhiteLabel text="Total" />
          <Text style={styles.totalBox}>{total.toFixed(2)}</Text>
        </View>
      </View>
      <WhiteLabel text="Metodo de pago" />
      <WhiteInput value={form.metodo_pago} onChangeText={(v) => setForm({ ...form, metodo_pago: v })} />
      <WhiteLabel text="Observacion / imagen (opcional)" />
      <View style={styles.imageInputRow}>
        <WhiteInput value={form.imagen_url} onChangeText={(v) => setForm({ ...form, imagen_url: v })} placeholder="URL de imagen" />
        <Pressable style={styles.squareCamera} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
          <AppIcon name="camera" color="#0b2f57" size={19} />
        </Pressable>
      </View>
      <WhiteLabel text="Observacion" />
      <WhiteInput value={form.observacion} onChangeText={(v) => setForm({ ...form, observacion: v })} placeholder="Venta de prueba" />
      <Button title="Guardar Venta" onPress={submit} tone="blue" />
    </Screen>
  );
}

function GastosScreen({ go, refreshKey }: AppProps) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [query, setQuery] = useState("");
  const [ascending, setAscending] = useState(false);

  useEffect(() => {
    apiRequest<AnyRow[]>("/gastos")
      .then(setRows)
      .catch((e) => Alert.alert("Gastos", e.message));
  }, [refreshKey]);

  const filtered = rows
    .filter((item) => {
      const text = `${item.tipo_gasto || ""} ${item.descripcion || ""} ${item.observacion || ""}`.toLowerCase();
      return text.includes(query.toLowerCase());
    })
    .sort((a, b) => {
      const left = new Date(a.fecha).getTime();
      const right = new Date(b.fecha).getTime();
      return ascending ? left - right : right - left;
    });

  return (
    <Screen
      title="Gastos"
      white
      right={<Pressable onPress={() => go("NuevoGasto")}><AppIcon name="plus" color="#fff" size={27} /></Pressable>}
    >
      <View style={styles.salesToolbar}>
        <View style={[styles.searchBox, styles.salesSearch]}>
          <AppIcon name="search" color="#7b8794" size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar gasto..."
            placeholderTextColor="#9aa4b2"
            style={styles.searchInput}
          />
        </View>
        <Pressable onPress={() => setAscending((value) => !value)} style={styles.filterButton}>
          <AppIcon name={ascending ? "sortUp" : "sortDown"} color="#0b2f57" size={20} />
        </Pressable>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id_gasto)}
        scrollEnabled={false}
        renderItem={({ item }) => <WhiteExpenseRow item={item} />}
        ListEmptyComponent={<EmptyState title="Sin gastos" action={<Button title="Registrar primer gasto" onPress={() => go("NuevoGasto")} tone="red" />} />}
      />
    </Screen>
  );
}

function NuevoGastoScreen({ go, refresh }: AppProps) {
  const [tipos, setTipos] = useState<Option[]>([]);
  const [form, setForm] = useState({ fecha: today(), id_tipo_gasto: "", descripcion: "", cantidad: "1", monto: "", metodo_pago: "Efectivo", imagen_url: "", observacion: "" });

  useEffect(() => {
    apiRequest<AnyRow[]>("/tipos-gasto").then((rows) => setTipos(rows.map((x) => ({ label: x.nombre, value: String(x.id_tipo_gasto) }))));
  }, []);

  const submit = async () => {
    try {
      await apiRequest("/gastos", { method: "POST", body: form });
      refresh();
      go("Gastos");
    } catch (e: any) {
      Alert.alert("Gasto", e.message);
    }
  };

  return (
    <Screen title="Nuevo Gasto" white backAction={() => go("Gastos")}>
      <WhiteLabel text="Fecha" />
      <WhiteInput value={form.fecha} onChangeText={(v) => setForm({ ...form, fecha: v })} />
      <WhiteLabel text="Tipo de gasto" />
      <TypeGrid value={form.id_tipo_gasto} options={tipos} onChange={(v) => setForm({ ...form, id_tipo_gasto: v })} />
      <WhiteLabel text="Descripcion" />
      <WhiteInput value={form.descripcion} onChangeText={(v) => setForm({ ...form, descripcion: v })} />
      <View style={styles.twoCols}>
        <View style={styles.col}>
          <WhiteLabel text="Cantidad" />
          <WhiteInput value={form.cantidad} onChangeText={(v) => setForm({ ...form, cantidad: v })} keyboardType="numeric" />
        </View>
        <View style={styles.col}>
          <WhiteLabel text="Monto unitario (Bs)" />
          <WhiteInput value={form.monto} onChangeText={(v) => setForm({ ...form, monto: v })} keyboardType="numeric" />
        </View>
      </View>
      <Text style={styles.totalPreview}>Total: Bs {(Number(form.cantidad || 0) * Number(form.monto || 0)).toFixed(2)}</Text>
      <WhiteLabel text="Metodo de pago" />
      <WhiteInput value={form.metodo_pago} onChangeText={(v) => setForm({ ...form, metodo_pago: v })} />
      <WhiteLabel text="Imagen (opcional)" />
      <View style={styles.imageInputRow}>
        <WhiteInput value={form.imagen_url} onChangeText={(v) => setForm({ ...form, imagen_url: v })} placeholder="URL de imagen" />
        <Pressable style={styles.squareCamera} onPress={() => pickImageUri((uri) => setForm({ ...form, imagen_url: uri }))}>
          <AppIcon name="camera" color="#0b2f57" size={19} />
        </Pressable>
      </View>
      <WhiteLabel text="Observacion (opcional)" />
      <WhiteInput value={form.observacion} onChangeText={(v) => setForm({ ...form, observacion: v })} placeholder="Gasto del dia" />
      <Button title="Guardar Gasto" onPress={submit} tone="blue" />
    </Screen>
  );
}

function HistorialScreen({ go, refreshKey }: AppProps) {
  const [filters, setFilters] = useState({ desde: "", hasta: "", tipo: "", buscar: "" });
  const query = useMemo(() => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    return `/historial?${params.toString()}`;
  }, [filters]);

  return (
    <Screen title="Historial" white right={<AppIcon name="filter" color="#fff" size={22} />}>
      <View style={styles.twoCols}>
        <View style={styles.col}>
          <WhiteLabel text="Desde" />
          <WhiteInput value={filters.desde} onChangeText={(v) => setFilters({ ...filters, desde: v })} placeholder="01/06/2026" />
        </View>
        <View style={styles.col}>
          <WhiteLabel text="Hasta" />
          <WhiteInput value={filters.hasta} onChangeText={(v) => setFilters({ ...filters, hasta: v })} placeholder="18/06/2026" />
        </View>
      </View>
      <WhiteLabel text="Tipo" />
      <WhiteSelect
        value={filters.tipo}
        options={[
          { label: "Todos", value: "" },
          { label: "Venta", value: "Venta" },
          { label: "Gasto", value: "Gasto" },
        ]}
        onChange={(v) => setFilters({ ...filters, tipo: v })}
      />
      <View style={[styles.searchBox, styles.historySearch]}>
        <AppIcon name="search" color="#7b8794" size={18} />
        <TextInput
          value={filters.buscar}
          onChangeText={(v) => setFilters({ ...filters, buscar: v })}
          placeholder="Buscar por material, cliente u observacion..."
          placeholderTextColor="#9aa4b2"
          style={styles.searchInput}
        />
      </View>
      <ListScreen title="" path={query} refreshKey={`${refreshKey}-${query}`} embedded render={(item) => <HistoryRow item={item} />} />
    </Screen>
  );
}

function ReporteSemanalScreen({ go }: AppProps) {
  const range = weekRange();
  const [desde, setDesde] = useState(range.desde);
  const [hasta, setHasta] = useState(range.hasta);
  const [reporte, setReporte] = useState<AnyRow | null>(null);

  const load = async () => {
    try {
      setReporte(await apiRequest(`/reportes/semanal?desde=${desde}&hasta=${hasta}`));
    } catch (e: any) {
      Alert.alert("Reporte", e.message);
    }
  };

  const save = async () => {
    await apiRequest("/reportes/semanal", { method: "POST", body: { desde, hasta } });
    Alert.alert("Reporte", "Reporte guardado");
  };

  useEffect(() => { load(); }, []);

  return (
    <Screen title="Reporte Semanal" white backAction={() => go("Dashboard")}>
      <View style={styles.twoCols}>
        <View style={styles.col}>
          <WhiteLabel text="Desde" />
          <WhiteInput placeholder="12/06/2026" value={desde} onChangeText={setDesde} />
        </View>
        <View style={styles.col}>
          <WhiteLabel text="Hasta" />
          <WhiteInput placeholder="18/06/2026" value={hasta} onChangeText={setHasta} />
        </View>
      </View>
      <Button title="Generar Reporte" onPress={load} tone="blue" />
      {reporte && (
        <View style={styles.reportGrid}>
          <ReportCard label="Total ventas" value={`Bs ${Number(reporte.total_ventas || 0).toFixed(2)}`} tone="green" />
          <ReportCard label="Total gastos" value={`Bs ${Number(reporte.total_gastos || 0).toFixed(2)}`} tone="red" />
          <ReportCard label="Ganancia semanal" value={`Bs ${Number(reporte.ganancia_semanal || 0).toFixed(2)}`} tone="blue" />
          <ReportCard label="Valor del gramo" value={`Bs ${Number(reporte.valor_gramo || 0).toFixed(2)}`} tone="amber" />
        <ReportCard label="Total gramos ganados" value={`${Number(reporte.total_gramos || 0).toFixed(2)} g`} tone="purple" wide />
        </View>
      )}
      <Button title="Guardar Reporte en PDF" onPress={save} tone="blue" />
    </Screen>
  );
}

function ConfiguracionScreen({ go, logout }: AppProps) {
  const [form, setForm] = useState({
    nombre_negocio: "MaterialPro",
    valor_gramo: "",
    moneda: "Bs",
    telefono: "",
    direccion: "",
    unidad_oro: "gramos",
    decimales_oro: "2",
    mostrar_oro_inicio: true,
    inicio_semana: "Lunes",
    formato_reporte: "PDF",
    incluir_imagenes: true,
    mostrar_oro_reporte: true,
  });

  useEffect(() => {
    apiRequest<AnyRow>("/configuracion").then((data) =>
      setForm({
        nombre_negocio: data.nombre_negocio || "MaterialPro",
        valor_gramo: String(data.valor_gramo || ""),
        moneda: data.moneda || "Bs",
        telefono: data.telefono || "",
        direccion: data.direccion || "",
        unidad_oro: data.unidad_oro || "gramos",
        decimales_oro: String(data.decimales_oro || 2),
        mostrar_oro_inicio: data.mostrar_oro_inicio !== false,
        inicio_semana: data.inicio_semana || "Lunes",
        formato_reporte: data.formato_reporte || "PDF",
        incluir_imagenes: data.incluir_imagenes !== false,
        mostrar_oro_reporte: data.mostrar_oro_reporte !== false,
      })
    );
  }, []);

  const submit = async () => {
    await apiRequest("/configuracion", {
      method: "PUT",
      body: { ...form, decimales_oro: Number(form.decimales_oro || 2) },
    });
    Alert.alert("Configuracion", "Datos actualizados");
  };

  return (
    <Screen title="Configuracion" white backAction={() => go("Mas")}>
      <ConfigSection title="Perfil de usuario">
        <View style={styles.profileRow}>
          <View style={[styles.detailIconCircle, styles.blueShortcut]}>
            <AppIcon name="user" color="#1468d8" size={30} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.managementTitle}>Sergio Ticona</Text>
            <Text style={styles.managementSubtitle}>sergio@gmail.com</Text>
          </View>
        </View>
        <Button title="Editar perfil" onPress={() => Alert.alert("Perfil", "Editar perfil")} tone="blue" />
        <Button title="Cambiar contraseña" onPress={() => Alert.alert("Seguridad", "Cambiar contraseña")} variant="ghost" />
      </ConfigSection>

      <ConfigSection title="Datos del negocio">
        <WhiteLabel text="Nombre negocio" />
        <WhiteInput value={form.nombre_negocio} onChangeText={(v) => setForm({ ...form, nombre_negocio: v })} />
        <WhiteLabel text="Moneda" />
        <WhiteInput value={form.moneda} onChangeText={(v) => setForm({ ...form, moneda: v })} />
        <WhiteLabel text="Telefono" />
        <WhiteInput value={form.telefono} onChangeText={(v) => setForm({ ...form, telefono: v })} />
        <WhiteLabel text="Direccion" />
        <WhiteInput value={form.direccion} onChangeText={(v) => setForm({ ...form, direccion: v })} />
        <WhiteLabel text="Valor del gramo" />
        <WhiteInput value={form.valor_gramo} onChangeText={(v) => setForm({ ...form, valor_gramo: v })} keyboardType="numeric" />
      </ConfigSection>

      <ConfigSection title="Catalogos">
        <ConfigLink title="Materiales" onPress={() => go("Materiales")} />
        <ConfigLink title="Tipos de gasto" onPress={() => go("TiposGasto")} />
        <ConfigLink title="Equipo" onPress={() => go("Equipo")} />
      </ConfigSection>

      <ConfigSection title="Configuracion de oro">
        <WhiteLabel text="Unidad" />
        <WhiteInput value={form.unidad_oro} onChangeText={(v) => setForm({ ...form, unidad_oro: v })} />
        <WhiteLabel text="Decimales" />
        <WhiteInput value={form.decimales_oro} onChangeText={(v) => setForm({ ...form, decimales_oro: v })} keyboardType="numeric" />
        <ToggleRow label="Mostrar en inicio" value={form.mostrar_oro_inicio} onChange={(v) => setForm({ ...form, mostrar_oro_inicio: v })} />
      </ConfigSection>

      <ConfigSection title="Reportes">
        <WhiteLabel text="Inicio de semana" />
        <WhiteInput value={form.inicio_semana} onChangeText={(v) => setForm({ ...form, inicio_semana: v })} />
        <WhiteLabel text="Formato" />
        <WhiteInput value={form.formato_reporte} onChangeText={(v) => setForm({ ...form, formato_reporte: v })} />
        <ToggleRow label="Incluir imagenes" value={form.incluir_imagenes} onChange={(v) => setForm({ ...form, incluir_imagenes: v })} />
        <ToggleRow label="Mostrar oro encontrado" value={form.mostrar_oro_reporte} onChange={(v) => setForm({ ...form, mostrar_oro_reporte: v })} />
      </ConfigSection>

      <Button title="Guardar configuracion" onPress={submit} tone="blue" />
      <Button title="Cerrar sesion" onPress={logout} tone="red" />
    </Screen>
  );
}

type AppProps = { go: (screen: ScreenName, email?: string) => void; refreshKey: any; refresh: () => void; logout: () => void };

function MasScreen({ go, logout }: AppProps) {
  const items: { title: string; icon: string; screen?: ScreenName; danger?: boolean }[] = [
    { title: "Materiales", icon: "materials", screen: "Materiales" },
    { title: "Tipos gasto", icon: "tag", screen: "TiposGasto" },
    { title: "Equipo", icon: "users", screen: "Equipo" },
    { title: "Grupo", icon: "team", screen: "DetalleGrupo" },
    { title: "Historial", icon: "history", screen: "Historial" },
    { title: "Reportes", icon: "chart", screen: "ReporteSemanal" },
    { title: "Config", icon: "settings", screen: "Configuracion" },
    { title: "Perfil", icon: "user", screen: "Configuracion" },
    { title: "Salir", icon: "logout", danger: true },
  ];

  return (
    <Screen title="Mas" white>
      <View style={styles.moreGrid}>
        {items.map((item) => (
          <Pressable
            key={item.title}
            style={styles.moreTile}
            onPress={() => (item.danger ? logout() : item.screen && go(item.screen))}
          >
            <View style={[styles.moreIcon, item.danger ? styles.redShortcut : styles.blueShortcut]}>
              <AppIcon name={item.icon} color={item.danger ? "#ef3340" : "#1468d8"} size={26} />
            </View>
            <Text style={styles.moreTileText}>{item.title}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const menuItems: { title: string; screen: ScreenName }[] = [
  { title: "Materiales", screen: "Materiales" },
  { title: "Tipos gasto", screen: "TiposGasto" },
  { title: "Clientes", screen: "Clientes" },
  { title: "Ventas", screen: "Ventas" },
  { title: "Gastos", screen: "Gastos" },
  { title: "Historial", screen: "Historial" },
  { title: "Reporte", screen: "ReporteSemanal" },
  { title: "Config", screen: "Configuracion" },
];

function CrudScreen({ title, path, idKey, fields, go, refreshKey }: AppProps & { title: string; path: string; idKey: string; fields: string[] }) {
  const blank = Object.fromEntries(fields.map((field) => [field, ""]));
  const [form, setForm] = useState<AnyRow>(blank);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [reload, setReload] = useState(0);

  const submit = async () => {
    try {
      const target = editing ? `${path}/${editing[idKey]}` : path;
      await apiRequest(target, { method: editing ? "PUT" : "POST", body: form });
      setForm(blank);
      setEditing(null);
      setReload((v) => v + 1);
    } catch (e: any) {
      Alert.alert(title, e.message);
    }
  };

  const remove = async (item: AnyRow) => {
    await apiRequest(`${path}/${item[idKey]}`, { method: "DELETE" });
    setReload((v) => v + 1);
  };

  return (
    <Screen title={title} onBack={() => go("Dashboard")}>
      <View style={styles.card}>
        {fields.map((field) => <Field key={field} placeholder={field} value={String(form[field] || "")} onChangeText={(v) => setForm({ ...form, [field]: v })} />)}
        <Button title={editing ? "Actualizar" : "Crear"} onPress={submit} />
      </View>
      <ListScreen
        title=""
        embedded
        path={path}
        refreshKey={`${refreshKey}-${reload}`}
        render={(item) => (
          <Pressable onPress={() => { setEditing(item); setForm(Object.fromEntries(fields.map((f) => [f, String(item[f] || "")]))); }}>
            <Row title={item.nombre} subtitle={item.descripcion || item.telefono || item.unidad_medida || "Activo"} amount={item.precio_referencia} />
            <Button title="Desactivar" variant="ghost" onPress={() => remove(item)} />
          </Pressable>
        )}
      />
    </Screen>
  );
}

function ListScreen({ title, path, render, refreshKey, action, emptyAction, embedded, onBack }: { title: string; path: string; render: (item: AnyRow) => ReactElement; refreshKey: any; action?: ReactElement; emptyAction?: ReactElement; embedded?: boolean; onBack?: () => void }) {
  const [rows, setRows] = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest<AnyRow[]>(path).then(setRows).catch((e) => Alert.alert(title || "Lista", e.message)).finally(() => setLoading(false));
  }, [path, refreshKey]);

  const content = loading ? (
    <ActivityIndicator color="#ffb000" />
  ) : (
    <FlatList
      data={rows}
      keyExtractor={(item, index) => String(item.id || item.id_venta || item.id_gasto || item.id_material || item.id_cliente || item.id_tipo_gasto || index)}
      renderItem={({ item }) => render(item)}
      ListEmptyComponent={<EmptyState title="Sin registros" action={emptyAction} />}
      scrollEnabled={false}
    />
  );

  if (embedded) return <View>{content}</View>;

  return (
    <Screen title={title} onBack={onBack} right={action}>
      {content}
    </Screen>
  );
}

function FormScreen({ title, form, setForm, fields, selects = [], onSubmit, onBack }: { title: string; form: AnyRow; setForm: Dispatch<SetStateAction<any>>; fields: string[]; selects?: [string, Option[]][]; onSubmit: () => void; onBack: () => void }) {
  return (
    <Screen title={title} onBack={onBack}>
      {selects.map(([key, options]) => <Select key={key} label={key} value={form[key]} options={options} onChange={(v) => setForm({ ...form, [key]: v })} />)}
      {fields.map((field) => <Field key={field} placeholder={field} value={String(form[field] || "")} onChangeText={(v) => setForm({ ...form, [field]: v })} />)}
      <Button title="Guardar" onPress={onSubmit} />
    </Screen>
  );
}

function Screen({ title, children, onBack, right, eyebrow, white, backAction }: { title: string; children: ReactNode; onBack?: () => void; right?: ReactNode; eyebrow?: string; white?: boolean; backAction?: () => void }) {
  return (
    <ScrollView contentContainerStyle={[styles.screen, white && styles.whiteScreen]}>
      <View style={[styles.header, white && styles.whiteHeader]}>
        {white && (
          <Pressable onPress={backAction}>
            <AppIcon name={backAction ? "back" : "menu"} color="#fff" size={24} />
          </Pressable>
        )}
        <View>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          <Text style={[styles.title, white && styles.whiteHeaderTitle]}>{title}</Text>
        </View>
        {right || <View />}
      </View>
      {children}
    </ScrollView>
  );
}

function Field(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} placeholderTextColor="#7c8594" style={styles.input} />;
}

function WhiteLabel({ text }: { text: string }) {
  return <Text style={styles.whiteFieldLabel}>{text}</Text>;
}

function WhiteInput(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} placeholderTextColor="#9aa4b2" style={styles.whiteInput} />;
}

function ReportCard({ label, value, tone, wide }: { label: string; value: string; tone: "green" | "red" | "blue" | "amber" | "purple"; wide?: boolean }) {
  return (
    <View style={[styles.reportCard, styles[`${tone}ReportCard`], wide && styles.reportCardWide]}>
      <Text style={[styles.reportLabel, styles[`${tone}ReportText`]]}>{label}</Text>
      <Text style={[styles.reportValue, styles[`${tone}ReportText`]]}>{value}</Text>
    </View>
  );
}

function ConfigSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.configSection}>
      <Text style={styles.configTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ConfigLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.configLink}>
      <Text style={styles.configLinkText}>{title}</Text>
      <AppIcon name="chevron" color="#94a3b8" size={18} />
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.configLinkText}>{label}</Text>
      <Pressable onPress={() => onChange(!value)} style={[styles.switchTrack, value && styles.switchTrackOn]}>
        <View style={[styles.switchKnob, value && styles.switchKnobOn]} />
      </Pressable>
    </View>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function WhiteSelect({ value, options, onChange }: { value: string; options: Option[]; onChange: (value: string) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.whiteSelect}>
      {options.map((option) => (
        <Pressable
          key={`${option.value}-${option.label}`}
          onPress={() => onChange(option.value)}
          style={[styles.whiteSelectChip, option.value === value && styles.whiteSelectChipActive]}
        >
          <Text style={[styles.whiteSelectText, option.value === value && styles.whiteSelectTextActive]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
      {options.length === 0 && <Text style={styles.whiteSelectText}>Sin opciones</Text>}
    </ScrollView>
  );
}

function TypeGrid({ value, options, onChange }: { value: string; options: Option[]; onChange: (value: string) => void }) {
  return (
    <View style={styles.typeGrid}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.typeOption, option.value === value && styles.typeOptionActive]}
        >
          <AppIcon
            name={expenseIconName(option.label)}
            color={option.value === value ? "#fff" : "#0b2f57"}
            size={18}
          />
          <Text style={[styles.typeOptionText, option.value === value && styles.typeOptionTextActive]}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function AuthInput({
  icon,
  rightText,
  right,
  ...props
}: React.ComponentProps<typeof TextInput> & { icon: string; rightText?: string; right?: ReactNode }) {
  return (
    <View style={styles.authInputWrap}>
      <Text style={styles.authInputIcon}>{icon}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#8a94a6"
        style={styles.authInput}
      />
      {right && <View style={styles.authInputRightIcon}>{right}</View>}
      {rightText && <Text style={styles.authInputRight}>{rightText}</Text>}
    </View>
  );
}

function Button({ title, onPress, variant = "primary", tone = "green" }: { title: string; onPress: () => void; variant?: "primary" | "ghost"; tone?: "green" | "blue" | "red" | "amber" }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, styles[`${tone}Button`], variant === "ghost" && styles.ghost]}>
      <Text style={[styles.buttonText, variant === "ghost" && styles.ghostText]}>{title}</Text>
    </Pressable>
  );
}

function RoundButton({ title, onPress, tone }: { title: string; onPress: () => void; tone: "red" | "amber" }) {
  return (
    <Pressable onPress={onPress} style={[styles.roundButton, tone === "red" ? styles.redButton : styles.amberButton]}>
      <Text style={styles.roundButtonText}>{title}</Text>
    </Pressable>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Option[]; onChange: (value: string) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => (
          <Pressable key={option.value} onPress={() => onChange(option.value)} style={[styles.chip, value === option.value && styles.chipActive]}>
            <Text style={[styles.chipText, value === option.value && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function Metric({ label, value, suffix = "", tone = "green", wide }: { label: string; value: number; suffix?: string; tone?: "green" | "blue" | "red" | "amber"; wide?: boolean }) {
  return (
    <View style={[styles.metric, wide && styles.metricWide, styles[`${tone}Card`]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, styles[`${tone}Text`]]}>
        {suffix.includes("gr") ? "" : "Bs. "}{Number(value || 0).toFixed(2)}{suffix}
      </Text>
    </View>
  );
}

function Row({ title, subtitle, amount, tone = "blue" }: { title: string; subtitle?: string; amount?: number; tone?: "blue" | "red" }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title || "Registro"}</Text>
        <Text style={styles.muted}>{subtitle}</Text>
      </View>
      {amount !== undefined && <Text style={[styles.amount, tone === "red" ? styles.redText : styles.blueText]}>Bs. {Number(amount || 0).toFixed(2)}</Text>}
    </View>
  );
}

function DayCard({ label, value, tone }: { label: string; value: number; tone: "green" | "red" | "amber" }) {
  return (
    <View style={[styles.dayCard, styles[`${tone}DayCard`]]}>
      <Text style={[styles.dayLabel, styles[`${tone}Text`]]}>{label}</Text>
      <Text style={[styles.dayValue, styles[`${tone}Text`]]}>Bs {Number(value || 0).toFixed(2)}</Text>
    </View>
  );
}

function WeekRow({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: "green" | "red" | "blue" | "gray" }) {
  const color =
    tone === "green" ? "#16a34a" : tone === "red" ? "#ef3340" : tone === "blue" ? "#1468d8" : "#64748b";

  return (
    <View style={styles.weekRow}>
      <View style={styles.weekIcon}>
        <AppIcon name={icon} color={color} size={17} />
      </View>
      <Text style={styles.weekLabel}>{label}</Text>
      <Text style={styles.weekValue}>{value}</Text>
    </View>
  );
}

function Shortcut({ title, icon, onPress, tone }: { title: string; icon: string; onPress: () => void; tone: "blue" | "red" }) {
  return (
    <Pressable onPress={onPress} style={styles.shortcut}>
      <View style={[styles.shortcutIcon, tone === "red" ? styles.redShortcut : styles.blueShortcut]}>
        <AppIcon name={icon} color={tone === "red" ? "#ef3340" : "#1468d8"} size={20} />
      </View>
      <Text style={styles.shortcutText}>{title}</Text>
    </Pressable>
  );
}

function ManagementCard({
  title,
  subtitle,
  icon,
  onPress,
  tone,
}: {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  tone: "blue" | "red";
}) {
  return (
    <Pressable onPress={onPress} style={styles.managementCard}>
      <View style={[styles.managementIcon, tone === "red" ? styles.redShortcut : styles.blueShortcut]}>
        <AppIcon name={icon} color={tone === "red" ? "#ef3340" : "#1468d8"} size={24} />
      </View>
      <View style={styles.managementText}>
        <Text style={styles.managementTitle}>{title}</Text>
        <Text style={styles.managementSubtitle}>{subtitle}</Text>
      </View>
      <AppIcon name="chevron" color="#94a3b8" size={18} />
    </Pressable>
  );
}

function AppIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const icons = {
    back: ArrowLeft,
    bell: Bell,
    briefcase: BriefcaseBusiness,
    camera: Camera,
    chevron: ChevronRight,
    cart: ShoppingCart,
    chart: BarChart3,
    comida: Utensils,
    filter: Filter,
    fuel: Fuel,
    gold: CircleDollarSign,
    history: FileText,
    home: Home,
    logout: LogOut,
    materials: Package,
    menu: Menu,
    more: MoreHorizontal,
    plus: Plus,
    search: Search,
    settings: Settings,
    sortDown: ArrowDownUp,
    sortUp: CalendarDays,
    tag: Tag,
    team: UsersRound,
    user: UserRound,
    users: UsersRound,
    wrench: Wrench,
  };
  const LucideIcon = icons[name as keyof typeof icons] || Package;

  return (
    <LucideIcon color={color} size={size} strokeWidth={2.4} />
  );
}

function Icon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const icons: Record<string, string> = {
    back: "‹",
    bell: "◖",
    briefcase: "▣",
    camera: "▣",
    cart: "▱",
    chart: "▥",
    history: "↺",
    home: "⌂",
    materials: "▤",
    menu: "≡",
    more: "•••",
    plus: "+",
    search: "⌕",
    settings: "⚙",
    tag: "▧",
    user: "◉",
  };

  return (
    <Text style={{ color, fontSize: size, fontWeight: "900", lineHeight: size + 4 }}>
      {icons[name] || name}
    </Text>
  );
}

function materialImage(name = "") {
  const key = name.toLowerCase();
  if (key.includes("arena")) return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500&q=70";
  if (key.includes("grava")) return "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&q=70";
  if (key.includes("cascaj")) return "https://images.unsplash.com/photo-1603918512258-07987f2f87ef?w=500&q=70";
  return "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=70";
}

function goldImage() {
  return "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=500&q=70";
}

function avatarImage(name = "") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Equipo")}&background=e9f2ff&color=1468d8`;
}

function expenseIconName(name = "") {
  const value = name.toLowerCase();
  if (value.includes("comida")) return "comida";
  if (value.includes("combustible")) return "fuel";
  if (value.includes("ayudante")) return "users";
  if (value.includes("mantenimiento")) return "wrench";
  return "briefcase";
}

function expenseIconStyle(name = "") {
  const value = name.toLowerCase();
  if (value.includes("comida")) return styles.expenseIconOrange;
  if (value.includes("combustible")) return styles.expenseIconGreen;
  if (value.includes("ayudante")) return styles.expenseIconBlue;
  if (value.includes("mantenimiento")) return styles.expenseIconRed;
  return styles.expenseIconBlue;
}

function SaleRow({ item }: { item: AnyRow }) {
  return (
    <View style={styles.saleCard}>
      <View style={styles.saleTop}>
        <View>
          <Text style={styles.rowTitle}>{item.material || "Venta"}</Text>
          <Text style={styles.muted}>{String(item.fecha || "").slice(0, 10)}</Text>
          <Text style={styles.saleDetail}>{item.cantidad} {item.unidad_medida} x Bs. {Number(item.precio_unitario || 0).toFixed(2)}</Text>
        </View>
        <Text style={[styles.amount, styles.blueText]}>Bs. {Number(item.total_venta || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.saleActions}>
        <Text style={styles.editText}>Editar</Text>
        <Text style={styles.deleteText}>Eliminar</Text>
      </View>
    </View>
  );
}

function WhiteSaleRow({ item }: { item: AnyRow }) {
  const code = `#V-${String(item.id_venta || 0).padStart(5, "0")}`;
  return (
    <View style={styles.whiteSaleCard}>
      <View style={styles.whiteSaleTop}>
        <Text style={styles.whiteSaleCode}>{code}</Text>
        <Text style={styles.whiteBadge}>Efectivo</Text>
      </View>
      <View style={styles.whiteSaleMiddle}>
        <View style={{ flex: 1 }}>
          <Text style={styles.whiteSaleDate}>{String(item.fecha || "").slice(0, 10)}</Text>
          <Text style={styles.whiteSaleClient}>{item.cliente || "Sin cliente"}</Text>
          <Text style={styles.whiteSaleDetail}>{item.material} · {item.cantidad} {item.unidad_medida}</Text>
        </View>
        <View style={styles.whiteSaleAmountBox}>
          <Text style={styles.whiteSaleAmount}>Bs {Number(item.total_venta || 0).toFixed(2)}</Text>
          <Text style={styles.whiteBadge}>{item.metodo_pago || "Efectivo"}</Text>
        </View>
      </View>
    </View>
  );
}

function GoldRow({ item }: { item: AnyRow }) {
  return (
    <View style={styles.goldRow}>
      <Image source={{ uri: item.imagen_url || goldImage() }} style={styles.goldThumb} />
      <View style={styles.goldInfo}>
        <Text style={styles.whiteSaleDate}>{String(item.fecha || "").slice(0, 10)}</Text>
        <Text style={styles.materialName}>{item.dia_trabajo ? "Dia trabajado" : "Sin trabajo"}</Text>
        <Text style={styles.managementSubtitle}>{item.observacion || "Sin observacion"}</Text>
      </View>
      <Text style={styles.goldGrams}>{Number(item.gramos || 0).toFixed(2)} g</Text>
    </View>
  );
}

function TeamRow({ item, onDeactivate }: { item: AnyRow; onDeactivate?: () => void }) {
  return (
    <View style={styles.teamRow}>
      <Image source={{ uri: item.imagen_url || avatarImage(item.nombre) }} style={styles.teamPhoto} />
      <View style={styles.goldInfo}>
        <Text style={styles.materialName}>{item.nombre}</Text>
        <Text style={styles.managementSubtitle}>Cel: {item.celular}</Text>
        <Text style={styles.managementSubtitle}>Cargo: {item.cargo || "Sin cargo"}</Text>
      </View>
      <View style={styles.teamActions}>
        <Text style={[styles.whiteBadge, item.estado === "activo" && styles.activeBadge]}>{item.estado || "activo"}</Text>
        {item.estado === "activo" && onDeactivate && (
          <Pressable onPress={onDeactivate}>
            <Text style={styles.deactivateText}>Desactivar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function TeamMiniRow({ item }: { item: AnyRow }) {
  return (
    <View style={styles.teamMiniRow}>
      <Image source={{ uri: item.imagen_url || avatarImage(item.nombre) }} style={styles.teamMiniPhoto} />
      <View style={{ flex: 1 }}>
        <Text style={styles.materialName}>{item.nombre}</Text>
        <Text style={styles.managementSubtitle}>{item.cargo || "Sin cargo"}</Text>
      </View>
      <Text style={styles.managementSubtitle}>{item.celular}</Text>
    </View>
  );
}

function WhiteExpenseRow({ item }: { item: AnyRow }) {
  const tone = Number(item.monto || 0) >= 300 ? "red" : "green";
  return (
    <View style={styles.expenseRow}>
      <View style={[styles.expenseIcon, expenseIconStyle(item.tipo_gasto)]}>
        <AppIcon name={expenseIconName(item.tipo_gasto)} color="#fff" size={20} />
      </View>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseTitle}>{item.descripcion || item.tipo_gasto}</Text>
        <Text style={styles.expenseDate}>{String(item.fecha || "").slice(0, 10)}</Text>
        <Text style={styles.expenseType}>{item.tipo_gasto}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={[styles.expenseAmount, tone === "red" ? styles.redText : styles.greenText]}>Bs {Number(item.monto || 0).toFixed(2)}</Text>
        <Text style={styles.whiteBadge}>{item.metodo_pago || "Efectivo"}</Text>
      </View>
    </View>
  );
}

function HistoryRow({ item }: { item: AnyRow }) {
  const isVenta = item.tipo_registro === "Venta";
  return (
    <View style={styles.historyRow}>
      <View style={[styles.historyIcon, isVenta ? styles.historySaleIcon : styles.historyExpenseIcon]}>
        <AppIcon name={isVenta ? "cart" : "briefcase"} color={isVenta ? "#16a34a" : "#ef3340"} size={18} />
      </View>
      <View style={styles.historyInfo}>
        <View style={styles.historyTop}>
          <Text style={styles.historyType}>{item.tipo_registro}</Text>
          <Text style={styles.historyDate}>{String(item.fecha || "").slice(0, 10)}</Text>
        </View>
        <Text style={styles.historyDetail}>{item.detalle}</Text>
        <Text style={styles.historySub}>{item.cliente || item.observacion || ""}</Text>
      </View>
      <Text style={[styles.historyAmount, isVenta ? styles.greenText : styles.redText]}>Bs {Number(item.monto || 0).toFixed(2)}</Text>
    </View>
  );
}

function EmptyState({ title, action }: { title: string; action?: ReactElement }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>$</Text>
      <Text style={styles.emptyText}>{title}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#050910" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#050910" },
  auth: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#061b36", position: "relative", overflow: "hidden" },
  authBackdrop: { position: "absolute", left: 0, right: 0, bottom: 0, height: 170, backgroundColor: "#031123", opacity: 0.9, borderTopLeftRadius: 80, borderTopRightRadius: 80 },
  loginLogo: { alignItems: "center", marginBottom: 26 },
  logoIcon: { width: 76, height: 56, borderRadius: 8, borderWidth: 3, borderColor: "#ffc83d", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  logoIconText: { color: "#ffc83d", fontWeight: "900", fontSize: 20 },
  loginBrand: { color: "#fff", fontSize: 31, fontWeight: "900" },
  brandGold: { color: "#ffc83d" },
  authCard: { width: "100%", maxWidth: 430, backgroundColor: "#fff", borderRadius: 8, padding: 24, borderWidth: 1, borderColor: "#e8edf5" },
  authTitle: { color: "#1e293b", fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 6 },
  authSubtitle: { color: "#3f4b5f", fontSize: 15, fontWeight: "700", textAlign: "center", marginBottom: 22 },
  authInputWrap: { minHeight: 52, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "#fff", flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 },
  authInputIcon: { width: 24, color: "#8a94a6", fontWeight: "900", fontSize: 13, textAlign: "center", marginRight: 8 },
  authInput: { flex: 1, color: "#1f2937", fontSize: 14, fontWeight: "700", minHeight: 48 },
  authInputRightIcon: { width: 30, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  authInputRight: { color: "#8a94a6", fontSize: 12, fontWeight: "800", marginLeft: 8 },
  authSwitch: { alignItems: "center", paddingTop: 8 },
  authSwitchText: { color: "#6b7280", fontWeight: "800", fontSize: 13 },
  authSwitchLink: { color: "#1d8bff", fontWeight: "900" },
  registerAuth: { flexGrow: 1, alignItems: "center", backgroundColor: "#fff" },
  registerHeader: { width: "100%", minHeight: 76, backgroundColor: "#061b36", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 10 },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  backButtonText: { color: "#fff", fontSize: 32, fontWeight: "700", lineHeight: 36 },
  registerTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  registerBody: { width: "100%", maxWidth: 480, padding: 24, paddingTop: 20, alignItems: "stretch" },
  avatarPicker: { width: 84, height: 84, borderRadius: 42, backgroundColor: "#f0f1f3", alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  avatarPreview: { width: 84, height: 84, borderRadius: 42 },
  avatarIcon: { color: "#1f2937", fontWeight: "900", fontSize: 13 },
  verifyAuth: { flexGrow: 1, alignItems: "center", backgroundColor: "#f8fafc" },
  verifyBody: { width: "100%", maxWidth: 480, padding: 24, paddingTop: 26, alignItems: "stretch" },
  verifyIcon: { width: 74, height: 74, borderRadius: 37, backgroundColor: "#062447", alignSelf: "center", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  verifyTitle: { color: "#0f172a", fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 8 },
  verifyText: { color: "#64748b", fontSize: 14, fontWeight: "700", textAlign: "center" },
  verifyEmail: { color: "#0b68d8", fontSize: 15, fontWeight: "900", textAlign: "center", marginBottom: 20 },
  brand: { fontSize: 38, fontWeight: "900", color: "#f8fafc", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#6f8ab3", marginBottom: 28 },
  shell: { flex: 1, backgroundColor: "#050910" },
  mainPanel: { flex: 1, minWidth: 0 },
  bottomNav: { height: 72, borderTopWidth: 1, borderTopColor: "#08294e", backgroundColor: "#062447", flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 8 },
  tabItem: { minWidth: 62, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  tabText: { color: "#526985", fontSize: 12, fontWeight: "800" },
  tabTextActive: { color: "#fff" },
  screen: { width: "100%", maxWidth: 520, alignSelf: "center", padding: 18, paddingBottom: 24 },
  whiteScreen: { backgroundColor: "#fff", minHeight: "100%", padding: 0, paddingBottom: 20 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#1d3150", paddingBottom: 14 },
  whiteHeader: { minHeight: 74, backgroundColor: "#062447", borderBottomWidth: 0, paddingHorizontal: 18, paddingBottom: 0, marginBottom: 14 },
  whiteHeaderTitle: { color: "#fff", fontSize: 18 },
  whiteHeaderIcon: { color: "#fff", fontSize: 22, fontWeight: "900", minWidth: 24, textAlign: "center" },
  eyebrow: { color: "#ff9700", fontSize: 13, fontWeight: "900", letterSpacing: 0, textTransform: "uppercase", marginBottom: 8 },
  title: { fontSize: 23, fontWeight: "900", color: "#f8fafc" },
  link: { color: "#ffbd00", fontWeight: "800" },
  input: { minHeight: 58, borderWidth: 1, borderColor: "#1d3150", borderRadius: 8, paddingHorizontal: 18, marginBottom: 12, backgroundColor: "#0d1522", color: "#f8fafc", fontSize: 16, fontWeight: "700" },
  button: { minHeight: 56, minWidth: 160, borderRadius: 8, alignItems: "center", justifyContent: "center", paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: "transparent" },
  greenButton: { backgroundColor: "#05c988" },
  blueButton: { backgroundColor: "#0d3a78", borderColor: "#1c62d1" },
  redButton: { backgroundColor: "#ff3045" },
  amberButton: { backgroundColor: "#ffa300" },
  ghost: { backgroundColor: "#0d1522", borderColor: "#1d3150" },
  buttonText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  ghostText: { color: "#8eacd5" },
  roundButton: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  roundButtonText: { color: "#06101c", fontWeight: "900", fontSize: 28, lineHeight: 30 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 18 },
  metric: { flexGrow: 1, flexBasis: 210, minHeight: 98, backgroundColor: "#0d1522", borderRadius: 8, padding: 20, borderWidth: 1, borderColor: "#1d3150" },
  metricWide: { flexBasis: "100%", minHeight: 106 },
  metricLabel: { color: "#6f8ab3", fontSize: 13, fontWeight: "800", marginBottom: 10 },
  metricValue: { fontSize: 26, fontWeight: "900" },
  blueCard: { borderColor: "#1d3150" },
  redCard: { borderColor: "#351421" },
  greenCard: { borderColor: "#063d39" },
  amberCard: { borderColor: "#5a2e0a", backgroundColor: "#1d1719" },
  blueText: { color: "#4093ff" },
  redText: { color: "#ff5c67" },
  greenText: { color: "#05d99c" },
  amberText: { color: "#ffbd00" },
  grayText: { color: "#6b7280" },
  whiteSectionHeader: { paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  whiteSectionTitle: { color: "#1f2937", fontSize: 16, fontWeight: "900", paddingHorizontal: 18, marginBottom: 12 },
  whiteDate: { color: "#9ca3af", fontSize: 13, fontWeight: "800" },
  daySummary: { paddingHorizontal: 18, flexDirection: "row", gap: 10, marginBottom: 18 },
  dayCard: { flex: 1, minHeight: 84, borderRadius: 8, padding: 12, alignItems: "center", justifyContent: "center" },
  greenDayCard: { backgroundColor: "#eaf8ed" },
  redDayCard: { backgroundColor: "#fdeced" },
  amberDayCard: { backgroundColor: "#fff2e4" },
  dayLabel: { fontSize: 11, fontWeight: "900", marginBottom: 8, textAlign: "center" },
  dayValue: { fontSize: 17, fontWeight: "900", textAlign: "center" },
  weekPanel: { marginHorizontal: 18, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#eef2f7", paddingVertical: 6, marginBottom: 18 },
  weekRow: { minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  weekIcon: { width: 28, alignItems: "center" },
  weekLabel: { flex: 1, color: "#374151", fontSize: 13, fontWeight: "800" },
  weekValue: { color: "#15533a", fontSize: 13, fontWeight: "900" },
  shortcutGrid: { paddingHorizontal: 18, flexDirection: "row", gap: 12 },
  shortcut: { flex: 1, minHeight: 86, borderRadius: 8, backgroundColor: "#f5f7fb", alignItems: "center", justifyContent: "center", gap: 8 },
  shortcutIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  blueShortcut: { backgroundColor: "#e9f2ff" },
  redShortcut: { backgroundColor: "#ffecee" },
  shortcutIconText: { fontWeight: "900", fontSize: 13 },
  shortcutText: { color: "#1f2937", fontWeight: "900", fontSize: 12 },
  managementGrid: { paddingHorizontal: 18, gap: 12, marginBottom: 18 },
  managementCard: { minHeight: 82, borderRadius: 8, backgroundColor: "#f5f7fb", borderWidth: 1, borderColor: "#edf1f7", flexDirection: "row", alignItems: "center", paddingHorizontal: 16 },
  managementIcon: { width: 46, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 14 },
  managementText: { flex: 1 },
  managementTitle: { color: "#111827", fontSize: 15, fontWeight: "900", marginBottom: 4 },
  managementSubtitle: { color: "#64748b", fontSize: 12, fontWeight: "700" },
  managementListRow: { minHeight: 78, marginHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#eef2f7", flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  detailIconHero: { alignItems: "center", paddingVertical: 22 },
  detailIconCircle: { width: 86, height: 86, borderRadius: 43, alignItems: "center", justifyContent: "center" },
  searchBox: { marginHorizontal: 18, minHeight: 46, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 14, backgroundColor: "#fff" },
  searchInput: { flex: 1, minHeight: 44, marginLeft: 8, color: "#1f2937", fontWeight: "700" },
  materialRow: { minHeight: 64, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", marginBottom: 6 },
  materialThumb: { width: 46, height: 46, borderRadius: 7, backgroundColor: "#e5e7eb", marginRight: 12 },
  materialInfo: { flex: 1 },
  materialName: { color: "#1f2937", fontSize: 15, fontWeight: "900", marginBottom: 4 },
  materialUnit: { color: "#6b7280", fontSize: 12, fontWeight: "800" },
  materialPrice: { color: "#1f2937", fontSize: 13, fontWeight: "900" },
  materialDetail: { marginHorizontal: 18, marginBottom: 12, position: "relative" },
  materialHero: { width: "100%", height: 130, borderRadius: 8, backgroundColor: "#e5e7eb" },
  cameraBadge: { position: "absolute", right: 12, bottom: 12, width: 42, height: 42, borderRadius: 21, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  whiteFieldLabel: { color: "#374151", fontSize: 12, fontWeight: "900", marginHorizontal: 18, marginBottom: 6 },
  whiteInput: { marginHorizontal: 18, minHeight: 46, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, color: "#111827", fontWeight: "700", backgroundColor: "#fff" },
  statusRow: { marginHorizontal: 18, minHeight: 44, flexDirection: "row", alignItems: "center", marginBottom: 12 },
  statusText: { marginLeft: "auto", marginRight: 8, color: "#374151", fontSize: 12, fontWeight: "800" },
  switchTrack: { width: 44, height: 24, borderRadius: 12, backgroundColor: "#d1d5db", padding: 2 },
  switchTrackOn: { backgroundColor: "#22c55e" },
  switchKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff" },
  switchKnobOn: { marginLeft: 20 },
  salesToolbar: { paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  salesSearch: { flex: 1, marginHorizontal: 0, marginBottom: 0 },
  filterButton: { width: 44, height: 44, borderRadius: 8, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  whiteSaleCard: { marginHorizontal: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eef2f7", borderRadius: 8, padding: 14, marginBottom: 10 },
  whiteSaleTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  whiteSaleMiddle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  whiteSaleCode: { color: "#1f2937", fontSize: 13, fontWeight: "900" },
  whiteBadge: { color: "#6b7280", backgroundColor: "#f3f4f6", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: "900", overflow: "hidden" },
  whiteSaleDate: { color: "#374151", fontSize: 13, fontWeight: "800", marginBottom: 6 },
  whiteSaleClient: { color: "#1f2937", fontSize: 15, fontWeight: "900", marginBottom: 6 },
  whiteSaleDetail: { color: "#4b5563", fontSize: 13, fontWeight: "800" },
  whiteSaleAmountBox: { alignItems: "flex-end", gap: 8 },
  whiteSaleAmount: { color: "#16a34a", fontSize: 15, fontWeight: "900" },
  whiteSelect: { marginHorizontal: 18, minHeight: 46, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, paddingHorizontal: 8, alignItems: "center", marginBottom: 12, backgroundColor: "#fff" },
  whiteSelectChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 7, marginRight: 8, backgroundColor: "#f3f4f6" },
  whiteSelectChipActive: { backgroundColor: "#062447" },
  whiteSelectText: { color: "#4b5563", fontSize: 13, fontWeight: "800" },
  whiteSelectTextActive: { color: "#fff" },
  typeGrid: { marginHorizontal: 18, flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  typeOption: { width: "31.5%", minHeight: 70, borderRadius: 8, backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", justifyContent: "center", padding: 8 },
  typeOptionActive: { backgroundColor: "#062447", borderColor: "#062447" },
  typeOptionText: { color: "#334155", fontSize: 11, fontWeight: "900", textAlign: "center", marginTop: 6 },
  typeOptionTextActive: { color: "#fff" },
  twoCols: { flexDirection: "row", gap: 0 },
  col: { flex: 1 },
  totalBox: { marginHorizontal: 18, minHeight: 46, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, color: "#6b7280", fontWeight: "900", backgroundColor: "#eef0f4", textAlignVertical: "center", paddingTop: 13 },
  totalPreview: { marginHorizontal: 18, color: "#0b2f57", fontSize: 16, fontWeight: "900", marginBottom: 12, textAlign: "right" },
  imageInputRow: { flexDirection: "row", alignItems: "flex-start" },
  squareCamera: { width: 48, height: 46, borderRadius: 8, backgroundColor: "#eef0f4", alignItems: "center", justifyContent: "center", marginRight: 18 },
  expenseRow: { minHeight: 92, marginHorizontal: 18, flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eef2f7" },
  expenseIcon: { width: 38, height: 38, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 14 },
  expenseIconOrange: { backgroundColor: "#f26b2f" },
  expenseIconGreen: { backgroundColor: "#61ad42" },
  expenseIconBlue: { backgroundColor: "#4f83d9" },
  expenseIconRed: { backgroundColor: "#ef3340" },
  expenseInfo: { flex: 1 },
  expenseTitle: { color: "#1f2937", fontSize: 15, fontWeight: "900", marginBottom: 5 },
  expenseDate: { color: "#4b5563", fontSize: 12, fontWeight: "800", marginBottom: 5 },
  expenseType: { color: "#374151", fontSize: 12, fontWeight: "800" },
  expenseRight: { alignItems: "flex-end", gap: 8 },
  expenseAmount: { fontSize: 14, fontWeight: "900" },
  historySearch: { marginTop: 0 },
  historyRow: { marginHorizontal: 18, minHeight: 88, flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eef2f7" },
  historyIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 12 },
  historySaleIcon: { backgroundColor: "#e9f8ef" },
  historyExpenseIcon: { backgroundColor: "#fff0f1" },
  historyInfo: { flex: 1 },
  historyTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  historyType: { color: "#1f2937", fontSize: 13, fontWeight: "900" },
  historyDate: { color: "#9ca3af", fontSize: 12, fontWeight: "800" },
  historyDetail: { color: "#111827", fontSize: 13, fontWeight: "900", marginBottom: 3 },
  historySub: { color: "#4b5563", fontSize: 12, fontWeight: "800" },
  historyAmount: { marginLeft: 8, fontSize: 12, fontWeight: "900" },
  reportGrid: { paddingHorizontal: 18, flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4, marginBottom: 22 },
  reportCard: { flexGrow: 1, flexBasis: "47%", minHeight: 88, borderRadius: 8, padding: 18, justifyContent: "center" },
  reportCardWide: { flexBasis: "100%", minHeight: 92 },
  greenReportCard: { backgroundColor: "#eaf8ed" },
  redReportCard: { backgroundColor: "#fdeced" },
  blueReportCard: { backgroundColor: "#eaf4ff" },
  amberReportCard: { backgroundColor: "#fff2e4" },
  purpleReportCard: { backgroundColor: "#f2eaff" },
  greenReportText: { color: "#16a34a" },
  redReportText: { color: "#ef3340" },
  blueReportText: { color: "#1468d8" },
  amberReportText: { color: "#f97316" },
  purpleReportText: { color: "#6d3bd1" },
  reportLabel: { fontSize: 12, fontWeight: "900", marginBottom: 10 },
  reportValue: { fontSize: 22, fontWeight: "900" },
  configSection: { marginHorizontal: 18, marginBottom: 16, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#eef2f7", paddingVertical: 14 },
  configTitle: { color: "#0f172a", fontSize: 16, fontWeight: "900", paddingHorizontal: 14, marginBottom: 12 },
  configLink: { minHeight: 48, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  configLinkText: { color: "#1f2937", fontSize: 14, fontWeight: "900" },
  toggleRow: { minHeight: 48, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, marginBottom: 12 },
  goldTotalCard: { marginHorizontal: 18, marginBottom: 12, backgroundColor: "#fff8e5", borderRadius: 8, padding: 18, borderWidth: 1, borderColor: "#f4d47a" },
  goldTotalValue: { color: "#b78103", fontSize: 26, fontWeight: "900" },
  goldRow: { marginHorizontal: 18, minHeight: 88, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#eef2f7", paddingVertical: 10 },
  goldThumb: { width: 58, height: 58, borderRadius: 8, backgroundColor: "#f1f5f9", marginRight: 12 },
  goldInfo: { flex: 1 },
  goldGrams: { color: "#b78103", fontSize: 17, fontWeight: "900", marginLeft: 10 },
  goldImageBox: { marginHorizontal: 18, minHeight: 130, borderRadius: 8, backgroundColor: "#fff8e5", borderWidth: 1, borderColor: "#f4d47a", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  goldImageText: { color: "#b78103", fontWeight: "900", marginTop: 8 },
  teamRow: { marginHorizontal: 18, minHeight: 86, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#eef2f7", paddingVertical: 10 },
  teamPhoto: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#e9f2ff", marginRight: 12 },
  teamActions: { alignItems: "flex-end", gap: 8 },
  deactivateText: { color: "#ef3340", fontSize: 11, fontWeight: "900" },
  activeBadge: { color: "#16a34a", backgroundColor: "#e9f8ef" },
  teamSummary: { marginHorizontal: 18, marginBottom: 14, backgroundColor: "#f8fafc", borderRadius: 8, borderWidth: 1, borderColor: "#eef2f7", padding: 14 },
  teamSummaryGrid: { flexDirection: "row", gap: 8 },
  summaryPill: { flex: 1, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#eef2f7", padding: 10, alignItems: "center" },
  summaryValue: { color: "#0b2f57", fontSize: 20, fontWeight: "900" },
  summaryLabel: { color: "#64748b", fontSize: 10, fontWeight: "800", textAlign: "center" },
  groupHero: { alignItems: "center", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12 },
  groupLogo: { width: 112, height: 112, borderRadius: 18, backgroundColor: "#e9f2ff", marginBottom: 12 },
  groupName: { color: "#0f172a", fontSize: 22, fontWeight: "900" },
  infoLine: { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  infoLabel: { color: "#64748b", fontSize: 12, fontWeight: "900", marginBottom: 4 },
  infoValue: { color: "#1f2937", fontSize: 14, fontWeight: "800" },
  teamMiniRow: { marginHorizontal: 18, minHeight: 68, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#eef2f7", paddingVertical: 8 },
  teamMiniPhoto: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#e9f2ff", marginRight: 12 },
  teamCarousel: { paddingHorizontal: 18, paddingBottom: 14, gap: 12 },
  teamCarouselCard: { width: 128, minHeight: 156, borderRadius: 8, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#eef2f7", alignItems: "center", padding: 12 },
  teamCarouselPhoto: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#e9f2ff", marginBottom: 10 },
  teamCarouselName: { color: "#111827", fontSize: 13, fontWeight: "900", textAlign: "center", marginBottom: 3 },
  teamCarouselRole: { color: "#64748b", fontSize: 11, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  teamCarouselEmpty: { width: 180, minHeight: 120, borderRadius: 8, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#eef2f7", alignItems: "center", justifyContent: "center", gap: 8 },
  seeAllText: { color: "#1468d8", fontSize: 12, fontWeight: "900", paddingRight: 18 },
  moreGrid: { paddingHorizontal: 18, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  moreTile: { width: "30.8%", minHeight: 116, borderRadius: 8, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#eef2f7", alignItems: "center", justifyContent: "center", padding: 10 },
  moreIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  moreTileText: { color: "#111827", fontSize: 12, fontWeight: "900", textAlign: "center" },
  sectionTitle: { color: "#ff9700", textTransform: "uppercase", fontWeight: "900", fontSize: 14, letterSpacing: 0, marginTop: 10, marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 6 },
  formGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  card: { backgroundColor: "#0d1522", borderRadius: 8, padding: 18, borderWidth: 1, borderColor: "#1d3150", marginBottom: 16 },
  row: { minHeight: 82, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#0d1522", borderWidth: 1, borderColor: "#1d3150", borderRadius: 8, padding: 16, marginBottom: 10 },
  rowTitle: { fontSize: 20, fontWeight: "900", color: "#f8fafc", marginBottom: 6 },
  muted: { color: "#6f8ab3", fontWeight: "700" },
  amount: { fontWeight: "900", fontSize: 20, marginLeft: 12 },
  label: { fontWeight: "900", color: "#8eacd5", marginBottom: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#101c2d", borderRadius: 8, marginRight: 8, borderWidth: 1, borderColor: "#1d3150" },
  chipActive: { backgroundColor: "#ffbd00", borderColor: "#ffbd00" },
  chipText: { color: "#8eacd5", fontWeight: "800" },
  chipTextActive: { color: "#06101c" },
  saleCard: { backgroundColor: "#0d1522", borderWidth: 1, borderColor: "#1d3150", borderRadius: 8, marginBottom: 12, overflow: "hidden" },
  saleTop: { flexDirection: "row", justifyContent: "space-between", gap: 12, padding: 20 },
  saleDetail: { color: "#8eacd5", fontSize: 16, fontWeight: "800", marginTop: 12 },
  saleActions: { borderTopWidth: 1, borderTopColor: "#1d3150", flexDirection: "row" },
  editText: { flex: 1, textAlign: "center", color: "#ffbd00", fontWeight: "900", paddingVertical: 14, borderRightWidth: 1, borderRightColor: "#1d3150" },
  deleteText: { flex: 1, textAlign: "center", color: "#ff3045", fontWeight: "900", paddingVertical: 14 },
  empty: { minHeight: 420, alignItems: "center", justifyContent: "center", gap: 18 },
  emptyIcon: { color: "#233554", fontSize: 58, fontWeight: "900" },
  emptyText: { color: "#526985", fontSize: 18, fontWeight: "800" },
});
