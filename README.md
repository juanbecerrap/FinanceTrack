# FinanceTrack — Gestor de finanzas personales

FinanceTrack es una aplicación web para llevar el control de ingresos, gastos y presupuestos personales en **pesos colombianos (COP)**. Cada usuario tiene su propia cuenta y solo puede ver y modificar sus datos. Es un proyecto de portafolio construido con React, Firebase y Recharts.

## Funcionalidades principales

- **Autenticación:** registro, inicio y cierre de sesión con correo y contraseña, recuperación de contraseña, validación de formularios, sesión persistente y rutas protegidas.
- **Dashboard:** saldo total, ingresos y gastos del mes, diferencia mensual, gráfico de gastos por categoría, gráfico de ingresos vs. gastos (6 meses), transacciones recientes y selector de período. Todo se calcula con los datos reales del usuario y se actualiza en tiempo real.
- **Transacciones:** crear, consultar, editar y eliminar (con confirmación). Búsqueda por descripción, filtros por tipo, categoría y período, orden por fecha y paginación.
- **Categorías:** listas iniciales para gastos e ingresos; cada transacción exige una categoría coherente con su tipo.
- **Presupuestos mensuales:** límite por categoría y mes, gasto acumulado, saldo disponible, barra de progreso y alertas visuales al acercarse, alcanzar o superar el límite. No permite duplicados para la misma categoría y mes.
- **Perfil:** correo del usuario, moneda utilizada, accesos rápidos y cierre de sesión.
- **Diseño:** interfaz en español, sidebar en escritorio, barra de navegación inferior en móviles, estados de carga, vacíos, mensajes de éxito y de error.

## Tecnologías utilizadas

React 18 · JavaScript · Vite · HTML5 y CSS3 · Firebase Authentication · Cloud Firestore · Recharts · Lucide React · React Router · Vitest (pruebas) · Git y GitHub · Firebase Hosting.

## Requisitos previos

- Node.js 18 o superior (recomendado 20+) y npm.
- Una cuenta de Google para usar Firebase.
- Firebase CLI: `npm install -g firebase-tools`.
- Git (opcional, para el control de versiones).

## Instalación

```bash
cd financetrack
npm install
```

## Configuración de Firebase

1. Entra a la [consola de Firebase](https://console.firebase.google.com/) y crea un proyecto.
2. En **Configuración del proyecto → Tus apps**, registra una **app web** (icono `</>`). Firebase te mostrará un objeto `firebaseConfig`.
3. **Activa Authentication:** *Compilación → Authentication → Comenzar → Método de acceso* y habilita **Correo electrónico/contraseña**.
4. **Activa Firestore:** *Compilación → Firestore Database → Crear base de datos*. Elige una ubicación (por ejemplo `us-east1` o `southamerica-east1`). Puedes iniciar en modo producción: las reglas del proyecto se aplican en el paso siguiente.
5. Inicia sesión en la CLI y vincula el proyecto:

   ```bash
   firebase login
   firebase use --add      # selecciona tu proyecto y asígnale un alias, por ejemplo "default"
   ```

   Esto crea el archivo `.firebaserc` con **tu** ID de proyecto (no se incluye en este repositorio).

## Variables de entorno

Copia el archivo de ejemplo y completa **cada valor con los de tu propio proyecto Firebase** (los de `firebaseConfig`):

```bash
cp .env.example .env
```

| Variable | Dónde encontrarla en `firebaseConfig` |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

El archivo `.env` está en `.gitignore` y no debe subirse a GitHub. La configuración web de Firebase no es un secreto: la seguridad real de tus datos depende de las **reglas de Firestore** y de la configuración de Authentication. Nunca guardes contraseñas ni claves privadas (por ejemplo, cuentas de servicio) en este proyecto.

Si ejecutas la app sin `.env`, verás una pantalla que indica qué variables faltan.

## Reglas de seguridad de Firestore

El archivo [`firestore.rules`](./firestore.rules) establece que:

- Solo usuarios autenticados acceden a los datos, y únicamente a los suyos (`users/{userId}/...` con `request.auth.uid == userId`).
- Las transacciones deben tener los campos esperados, con tipos correctos: descripción (texto de hasta 100 caracteres), tipo (`income` o `expense`), importe numérico mayor que cero, categoría válida para ese tipo, fecha `AAAA-MM-DD`, y método de pago y nota opcionales con longitud máxima.
- Los presupuestos tienen categoría de gasto válida, límite mayor que cero y período `AAAA-MM`. El ID del documento debe ser `<período>_<categoría>`, lo que impide duplicados en la base de datos.
- Cualquier otra ruta queda denegada.

Para desplegarlas:

```bash
firebase deploy --only firestore:rules
```

También puedes pegar el contenido del archivo en *Firestore Database → Reglas* de la consola y pulsar **Publicar**.

> Si cambias las listas de categorías en `src/utils/categories.js`, actualiza también las listas dentro de `firestore.rules`.

## Estructura de datos

```
users/{userId}/transactions/{transactionId}
users/{userId}/budgets/{period}_{category}
```

## Ejecución local

```bash
npm run dev
```

Abre la dirección que muestra Vite (normalmente http://localhost:5173), crea una cuenta y registra tu primer movimiento.

## Pruebas

```bash
npm test
```

Ejecuta las pruebas de los cálculos financieros y las validaciones (`src/utils/finance.test.js`).

## Compilación de producción

```bash
npm run build      # genera la carpeta dist/
npm run preview    # (opcional) sirve la compilación localmente
```

## Publicación en Firebase Hosting

`firebase.json` ya apunta a `dist` y redirige todas las rutas a `index.html` (necesario para React Router, así recargar una página como `/presupuestos` funciona).

```bash
npm run build
firebase deploy --only hosting
```

Para publicar hosting y reglas a la vez: `firebase deploy`. Al terminar, la CLI muestra la URL pública (`https://<tu-proyecto>.web.app`).

Después del primer despliegue, en *Authentication → Configuración → Dominios autorizados* verifica que tu dominio de Hosting esté en la lista (Firebase suele agregarlo automáticamente).

## Control de versiones (Git y GitHub)

```bash
git init
git add .
git commit -m "Versión inicial de FinanceTrack"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/financetrack.git
git push -u origin main
```

Antes de subir, comprueba con `git status` que `.env` **no** aparece en la lista.

## Estructura del proyecto

```
src/
├── components/   Componentes reutilizables (formularios, gráficos, modal, tarjetas…)
├── context/      AuthContext, FinanceContext (datos en tiempo real), ToastContext
├── hooks/        Hooks de acceso a los contextos y utilidades
├── layouts/      AppLayout (sidebar / navegación móvil) y AuthLayout
├── pages/        Login, Registro, Recuperar, Dashboard, Movimientos, Presupuestos, Perfil
├── services/     Firebase, autenticación y operaciones de Firestore
├── utils/        Formato COP y fechas, cálculos, validaciones, categorías, errores
├── App.jsx       Rutas (públicas y protegidas)
├── main.jsx      Punto de entrada
└── index.css     Estilos globales
```

## Notas y limitaciones de la primera versión

- Los importes se manejan como enteros en COP (sin centavos).
- La paginación y los filtros se aplican en el navegador sobre los movimientos del usuario, que se cargan en tiempo real. Para historiales muy grandes convendría paginar desde Firestore con `limit` y cursores.
- Los presupuestos se definen por mes; no se copian automáticamente al mes siguiente.
