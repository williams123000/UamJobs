# 🌐 UAMJobs

**Portal de ofertas de empleo para estudiantes y egresados de la UAM**

## ✍️ Descripción
Este proyecto, UAMJobs, es un portal web de ofertas laborales diseñado para conectar a estudiantes y egresados de la Universidad Autónoma Metropolitana (UAM) con empresas que buscan talento joven. Está construido con Node.js, Express, MongoDB y EJS, siguiendo el patrón MVC (Modelo-Vista-Controlador) para una arquitectura limpia y escalable.

---

## 🗂️ Estructura del Proyecto
```bash
UamJobs-main/
├── controllers/                # Lógica de negocio y manejo de peticiones
│   ├── authController.js       # Registro, login, logout
│   ├── studentController.js    # CRUD y perfil estudiante
│   ├── vacancyController.js    # Gestión de vacantes
│   └── messageController.js    # Envío de mensajes entre usuarios
├── middleware/
│   └── auth.js                 # Protección de rutas, extracción de usuario JWT
├── models/                     # Esquemas Mongoose
│   ├── User.js                 # Usuario (student | company)
│   ├── Student.js              # Perfil y documentación de estudiante
│   ├── Vacancy.js              # Vacantes y detalles
│   └── Message.js              # Mensajes internos
├── public/                     # Archivos estáticos
│   ├── css/                    # Estilos
│   ├── js/                     # Scripts front-end
│   └── media/                  # Imágenes y logos
├── routes/
│   └── index.js                # Ruteo principal (MVC)
├── views/                      # Plantillas EJS
│   ├── partials/               # Header, footer, navbar, sidebar
│   └── *.ejs                   # Vistas principales (login, home, perfiles, etc.)
├── seedVacancy.js              # Script para poblar vacantes de ejemplo
├── server.js                   # Configuración Express & MongoDB
├── package.json                # Dependencias y scripts
└── .gitignore                  # Archivos ignorados por Git
```

---

## ⚙️ Instalación y Configuración

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd UamJobs-main

# 2. Instalar dependencias
npm install

# 3. Variables de entorno (archivo .env)
Añadir en la raíz del proyecto:
MONGODB_URI=<tu_uri_de_mongo>
PORT=3000
JWT_SECRET=<secreto_para_tokens>
```
# 🚀 Ejecución
```bash
Vacantes de prueba
- node seedVacancy.js

Iniciar servidor
- npm run dev

Abre tu navegador en http://localhost:3000
```
# 🔁 Flujo de Peticiones (MVC)
```bash
Cliente ➔ Llamada HTTP

Middleware (auth.js) valida o descarta según JWT

Rutas (routes/index.js) despachan a controladores

Controladores procesan y usan Modelos (Mongoose)

Vistas (EJS) renderizan respuesta al cliente
```

# 📋 Rutas Clave

| Ruta                          | Verbo | Descripción                                              |
|------------------------------|-------|----------------------------------------------------------|
| `/login`                     | GET   | Muestra formulario de acceso                             |
| `/login`                     | POST  | Autentica usuario y genera JWT en cookie                 |
| `/register`                  | GET   | Muestra formulario de registro                           |
| `/register`                  | POST  | Crea nuevo usuario                                       |
| `/student-vacancies`         | GET   | Lista vacantes disponibles para estudiantes              |
| `/student-vacancies-applied`| GET   | Vacantes en las que ya aplicó el estudiante              |
| `/company-vacancies`         | GET   | Lista y gestión de vacantes por empresa                  |
| `/apply/:vacancyId`          | POST  | Postulación del estudiante a una vacante                 |
| `/logout`                    | GET   | Cierra sesión y borra cookie                             |

# 🌱 Poblado de Datos
```bash
Para crear vacantes de ejemplo para una empresa (TechCorp):

node seedVacancy.js
```

# 📸 Capturas de Pantalla
A continuación algunas vistas del sistema (agrega aquí imágenes reales cuando tengas):

- Página de inicio de sesión

- Dashboard de estudiante con vacantes disponibles

- Perfil de empresa con gestión de vacantes

- Detalle de una vacante

## 📄 Licencia
Este proyecto está bajo la [licencia MIT](./LICENSE).