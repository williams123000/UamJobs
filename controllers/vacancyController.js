const Vacancy = require("../models/Vacancy");
const User = require("../models/User");

exports.createVacancy = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.user.role !== "company") {
      return res.status(403).send("Acceso denegado");
    }
    const vacancy = new Vacancy({
      ...req.body,
      company: user.name,
    });
    await vacancy.save();
    res.redirect("/company-vacancies");
  } catch (error) {
    console.error("Error al crear vacante:", error.message);
    res.render("company-post-vacancy", {
      user: res.locals.user,
      error: "Error al crear la vacante: " + error.message,
    });
  }
};

exports.getStudentAppliedVacancies = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    const vacancies = await Vacancy.find({
      applicants: student.userId, 
    });

    res.json(vacancies);
  } catch (err) {
    next(err);
  }
};

exports.getFilteredVacancies = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send("Estudiante no encontrado");
    }
    const vacancies = await Vacancy.find({
      minAverage:     { $lte: student.average },
      requiredCareer: student.career,
      minQuarters:    { $lte: student.quarters },
      applicants:     { $ne: student.userId }    //excluye aplicadas
    });
    const user = await User.findById(req.user.id);
    const success = req.query.success;
    res.render('student-vacancies', { user, vacancies, success });
  } catch (error) {
    res.status(500).send("Error interno del servidor");
  }
};

exports.getEditVacancy = async (req, res, next) => {
  try {
    let companyName = req.user.name;
    if (!companyName) {
      const user = await User.findById(req.user.id);
      companyName = user.name;
    }

    const vacancy = await Vacancy.findOne({
      _id: req.params.id,
      company: companyName,
    });

    if (!vacancy) {
      return res.status(404).render("404", { title: "Vacante no encontrada" });
    }

    res.render("company-edit-vacancy", {
      vacancy,
      title: "Editar Vacante",
    });
  } catch (err) {
    next(err);
  }
};

exports.postEditVacancy = async (req, res, next) => {
  try {
    // Obtener nombre de la empresa
    let companyName = req.user.name;
    if (!companyName) {
      const user = await User.findById(req.user.id);
      companyName = user.name;
    }

    const updates = {
      title: req.body.title,
      description: req.body.description,
      minAverage: parseFloat(req.body.minAverage),
      requiredCareer: req.body.requiredCareer,
      minQuarters: parseInt(req.body.minQuarters, 10),
    };

    const vacancy = await Vacancy.findOneAndUpdate(
      { _id: req.params.id, company: companyName },
      updates,
      { new: true, runValidators: true }
    );

    if (!vacancy) {
      return res.status(404).render("404", { title: "Vacante no encontrada" });
    }

    res.redirect("/company-vacancies");
  } catch (err) {
    next(err);
  }
};

exports.deleteVacancy = async (req, res, next) => {
  try {
    await Vacancy.findByIdAndDelete({
      _id: req.params.id,
      company: req.user.id,
    });
    res.redirect("/company-vacancies");
  } catch (err) {
    console.log("no se borró por:" + err);
  }
};
