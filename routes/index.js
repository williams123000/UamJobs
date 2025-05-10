const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const studentController = require("../controllers/studentController");
const vacancyController = require("../controllers/vacancyController");
const messageController = require("../controllers/messageController");
const Vacancy = require("../models/Vacancy");
const Student = require("../models/Student");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const auth = require('../middleware/auth');


// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten archivos PDF, PNG o JPG"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB
});

const validCareers = [
  "Ingeniería",
  "Medicina",
  "Derecho",
  "Administración",
  "Arquitectura",
  "Psicología",
  "Contabilidad",
];

// Página principal
router.get("/", async (req, res) => {
  if (res.locals.user) {
    if (res.locals.user.role === "student") {
      return res.redirect("/student-home");
    } else {
      return res.redirect("/company-home");
    }
  }
  res.render("home");
});

// Rutas de Autenticación
router.get("/login", (req, res) => res.render("login", { user: null }));
router.post("/login", authController.login);
router.get("/register", (req, res) => res.render("register", { user: null }));
router.post("/register", authController.register);
router.get("/logout", authController.logout);
// Por Hacer
router.get("/recovery", (req, resp) => {
  resp.render("recovery");
});


// Dashboard de Estudiante
router.get("/student-home", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser estudiante");
    }
    const student = await Student.findOne({ userId: req.user.id });
    let vacancies = [];
    if (student) {
      vacancies = await Vacancy.find({
        minAverage:     { $lte: student.average },
        requiredCareer: student.career,
        minQuarters:    { $lte: student.quarters },
        applicants:     { $ne: student.userId }    // excluye aplicadas
      });
    }
    const user = await User.findById(req.user.id);
    res.render("student-home", { user, student, vacancies });
  } catch (error) {
    console.error("Error en student-home:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});

// Perfil de Estudiante
router.get("/student-profile", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser estudiante");
    }
    const student = await Student.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id);
    res.render("student-profile", { user, student, error: null });
  } catch (error) {
    console.error("Error en student-profile:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});

// Vacantes de Estudiante
router.get("/student-vacancies", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser estudiante");
    }
    const student = await Student.findOne({ userId: req.user.id });
    let vacancies = [];
    if (student) {
      vacancies = await Vacancy.find({
        minAverage: { $lte: student.average },
        requiredCareer: student.career,
        minQuarters: { $lte: student.quarters },
        applicants:     { $ne: student.userId }    //excluye aplicadas
      });
    }
    const user = await User.findById(req.user.id);
    const success = req.query.success;
    res.render("student-vacancies", { user, vacancies, success });
  } catch (error) {
    console.error("Error en student-vacancies:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});

// Vacantes de Estudiante
router.get("/student-vacancies-applied", auth, async (req, res) => {
  try {
    // Solo estudiantes
    if (req.user.role !== "student") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser estudiante");
    }

    // Encuentra al estudiante
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      console.log("Estudiante no encontrado para", req.user.id);
      return res.status(404).send("Estudiante no encontrado");
    }

    // Busca únicamente las vacantes donde esté en el array applicants
    const vacancies = await Vacancy.find({
      applicants: student.userId   // filtrar por aplicantes
    });

    // Renderiza la vista de vacantes aplicadas
    const user = await User.findById(req.user.id);
    const success = req.query.success;
    res.render("student-vacancies-applied", {
      user,
      vacancies,
      success
    });
  } catch (error) {
    console.error("Error en student-applied-vacancies:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});


// Rutas de Estudiantes
router.post("/student", auth, (req, res, next) => {
    upload.fields([
      { name: "cv", maxCount: 1 },
      { name: "profilePhoto", maxCount: 1 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        let errorMessage = "Error al subir archivos: ";
        if (err.code === "LIMIT_FILE_SIZE") {
          errorMessage += "El archivo es demasiado grande. Máximo 5MB.";
        } else if (err.message.includes("Solo se permiten")) {
          errorMessage += err.message;
        } else {
          errorMessage += err.message;
        }
        console.error("MulterError:", err.message);
        return res.render("student-profile", {
          user: res.locals.user,
          student: null,
          error: errorMessage,
        });
      } else if (err) {
        console.error("Error desconocido:", err.message);
        return res.render("student-profile", {
          user: res.locals.user,
          student: null,
          error: "Error al procesar la solicitud.",
        });
      }
      next();
    });
  },
  studentController.createOrUpdateStudent
);

// Ruta para aplicar a una vacante
router.get("/withdraw-application/:vacancyId", auth, async (req, res) => {
    try {
      // 1Solo estudiantes
      if (req.user.role !== "student") {
        console.log("Acceso denegado: Rol incorrecto", req.user.role);
        return res.status(403).send("Acceso denegado: Debes ser estudiante");
      }

      const vacancyId = req.params.vacancyId;

      // 2Actualiza la vacante quitando tu ID del array applicants
      const vacancy = await Vacancy.findByIdAndUpdate(
        vacancyId,
        { $pull: { applicants: req.user.id } },
        { new: true }
      );

      if (!vacancy) {
        return res.status(404).send("Vacante no encontrada.");
      }

      // Redirige a tus vacantes aplicadas con un mensaje de éxito
      res.redirect("/student-home");
    } catch (error) {
      console.error("Error al retirar aplicación:", error.message);
      res.status(500).send("Error interno del servidor");
    }
  }
);


// Dashboard de Empresa
router.get("/company-home", auth, async (req, res) => {
  try {
    if (req.user.role !== "company") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser empresa");
    }
    const user = await User.findById(req.user.id);
    const vacancies = await Vacancy.find({ company: user.name });
    res.render("company-home", { user, vacancies });
  } catch (error) {
    console.error("Error en company-home:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});

// Publicar Vacante
router.get("/company-post-vacancy", auth, async (req, res) => {
  try {
    if (req.user.role !== "company") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser empresa");
    }
    const user = await User.findById(req.user.id);
    res.render("company-post-vacancy", { user, error: null });
  } catch (error) {
    console.error("Error en company-post-vacancy:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/company-post-vacancy", auth, async (req, res) => {
  try {
    if (req.user.role !== "company") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser empresa");
    }
    const minAverage = parseFloat(req.body.minAverage);
    if (isNaN(minAverage) || minAverage < 0 || minAverage > 10) {
      return res.render("company-post-vacancy", {
        user: res.locals.user,
        error: "El promedio mínimo debe estar entre 0 y 10.",
      });
    }
    if (!validCareers.includes(req.body.requiredCareer)) {
      return res.render("company-post-vacancy", {
        user: res.locals.user,
        error: " allusion to validCareers.",
      });
    }
    await vacancyController.createVacancy(req, res);
  } catch (error) {
    console.error("Error en POST company-post-vacancy:", error.message);
    res.render("company-post-vacancy", {
      user: res.locals.user,
      error: "Error al procesar la solicitud: " + error.message,
    });
  }
});

// Mis Vacantes
router.get("/company-vacancies", auth, async (req, res) => {
  try {
    if (req.user.role !== "company") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser empresa");
    }
    const user = await User.findById(req.user.id);
    const vacancies = await Vacancy.find({ company: user.name });
    res.render("company-vacancies", { user, vacancies });
  } catch (error) {
    console.error("Error en company-vacancies:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});

// Contactar Empresa
router.get("/contact-company/:vacancyId", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      console.log("Acceso denegado: Rol incorrecto", req.user.role);
      return res.status(403).send("Acceso denegado: Debes ser estudiante");
    }
    const vacancy = await Vacancy.findById(req.params.vacancyId);
    if (!vacancy) {
      return res.status(404).send("Vacante no encontrada.");
    }
    const user = await User.findById(req.user.id);
    res.render("contact-company", { user, vacancy, error: null });
  } catch (error) {
    console.error("Error en contact-company:", error.message);
    res.status(500).send("Error interno del servidor");
  }
});

router.post("/contact-company", auth, 
  messageController.createMessage);

// Mis Mensajes (Empresa)
router.get("/company-messages", auth, 
  messageController.getCompanyMessages);

// Rutas de Vacantes
router.get("/vacancies/:studentId", auth, 
  vacancyController.getFilteredVacancies
);

// 1️⃣ Formulario de edición
router.get("/company-vacancies/:id/edit", auth, 
  vacancyController.getEditVacancy
);

// 2️⃣ Procesar cambios
router.post("/company-vacancies/:id/edit", auth, 
  vacancyController.postEditVacancy
);

// 3️⃣ Borrar vacante
router.post("/company-vacancies/:id/delete", auth,
  vacancyController.deleteVacancy
);

module.exports = router;