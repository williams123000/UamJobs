require('dotenv').config();
const mongoose = require('mongoose');
const Vacancy = require('./models/Vacancy');

async function seedCompanyVacancies() {
  try {
    // Conexión a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado a MongoDB para seed de vacantes de una sola empresa');

    // Elimina vacantes existentes de esta empresa
    const companyName = 'TechCorp';
    await Vacancy.deleteMany({ company: companyName });
    console.log(`🗑️  Vacantes antiguas de ${companyName} eliminadas`);

    // Vacantes de ejemplo para TechCorp en distintas carreras y áreas de concentración
    const vacancies = [
      {
        title: 'Ingeniero de Software (Backend)',
        description: 'Diseño e implementación de microservicios en Node.js y MongoDB',
        minAverage: 8.5,
        requiredCareer: 'Ingeniería',
        minQuarters: 5,
        company: companyName
      },
      {
        title: 'Ingeniero de Software (Frontend)',
        description: 'Desarrollo de interfaces reactivas con React y Bootstrap',
        minAverage: 8.0,
        requiredCareer: 'Ingeniería',
        minQuarters: 5,
        company: companyName
      },
      {
        title: 'Ingeniero de Redes',
        description: 'Configuración y mantenimiento de infraestructuras Cisco y Juniper',
        minAverage: 7.5,
        requiredCareer: 'Ingeniería',
        minQuarters: 6,
        company: companyName
      },
      {
        title: 'Desarrollador Full-Stack',
        description: 'Trabajo en proyectos Node.js, Express, MongoDB y Angular',
        minAverage: 8.2,
        requiredCareer: 'Ingeniería',
        minQuarters: 6,
        company: companyName
      },
      {
        title: 'Investigador Clínico (Cardiología)',
        description: 'Apoyo en estudios de protocolos y análisis de datos cardiológicos',
        minAverage: 7.8,
        requiredCareer: 'Medicina',
        minQuarters: 7,
        company: companyName
      },
      {
        title: 'Practicante de Derecho Corporativo',
        description: 'Elaboración de contratos y asesoría legal en fusiones y adquisiciones',
        minAverage: 8.5,
        requiredCareer: 'Derecho',
        minQuarters: 6,
        company: companyName
      },
      {
        title: 'Analista Financiero',
        description: 'Análisis de estados financieros y modelado de presupuestos',
        minAverage: 7.0,
        requiredCareer: 'Administración',
        minQuarters: 4,
        company: companyName
      },
      {
        title: 'Diseñador de Proyectos (Arquitectura)',
        description: 'Modelado 3D y colaboración en diseño de espacios corporativos',
        minAverage: 8.0,
        requiredCareer: 'Arquitectura',
        minQuarters: 6,
        company: companyName
      },
      {
        title: 'Asistente de Psicología Organizacional',
        description: 'Realización de dinámicas y evaluaciones de clima laboral',
        minAverage: 7.5,
        requiredCareer: 'Psicología',
        minQuarters: 5,
        company: companyName
      },
      {
        title: 'Auxiliar Contable',
        description: 'Registro contable y conciliación de cuentas bancarias',
        minAverage: 7.2,
        requiredCareer: 'Contabilidad',
        minQuarters: 4,
        company: companyName
      }
    ];

    // Inserta las nuevas vacantes
    const inserted = await Vacancy.insertMany(vacancies);
    console.log(`✅ ${inserted.length} vacantes de ${companyName} creadas con éxito`);

    // Cierra la conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seedCompanyVacancies:', error);
    process.exit(1);
  }
}

seedCompanyVacancies();
